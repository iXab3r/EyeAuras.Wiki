---
title: Логирование в AI Core
description: Карта API логирования EyeAuras и PoeShared, fluent-логи, мосты log4net и маршрутизация логов скриптов.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, logging, diagnostics, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта логирования

Справочная карта по логированию в EyeAuras/PoeShared: app logs, fluent-хелперы, интеграция с log4net, мосты для Microsoft logging, логирование событий скриптов и простые таймеры для диагностики.

## Что обычно нужно сделать

- Добавить полезную диагностику в сервисы, модули, скрипты и вспомогательные классы.
- Понять, должно ли сообщение идти в обычные app logs или в журнал событий скрипта.
- Добавить префиксы и суффиксы для multi-window, multi-session или helper-специфичного логирования.
- Логировать исключения без потери stack trace и контекста операции.
- Не собирать дорогие диагностические строки, если нужный уровень логирования отключен.
- Добавить простые замеры времени вокруг подозрительных операций.
- Связать `IFluentLog`, log4net и `Microsoft.Extensions.Logging`.

## Модель

- Логирование приложения в EyeAuras построено вокруг log4net и обернуто в `PoeShared.Logging.IFluentLog`.
- `IFluentLog` — основной интерфейс диагностики в коде EyeAuras/PoeShared.
  Он дает проверки уровней, перегрузки для строк и ленивых сообщений, перегрузки для исключений, а также производные логгеры с префиксами и суффиксами.
- `typeof(MyType).PrepareLogger()` создает обычный type logger на базе log4net. Такие сообщения идут через настроенные appender'ы приложения: файлы, trace listeners, observable appenders или console appenders.
- Верхнеуровневый Aura script получает отдельный script-level logger через `AuraScriptSandbox.Log`. `AuraScriptRunner<TSandbox>` регистрирует этот `IFluentLog` в дочернем контейнере скрипта и отправляет сообщения в `AuraEventCategory.Script`, поэтому они видны в EyeAuras event viewer.
- Обычные вспомогательные классы на C# не получают верхнеуровневые члены скрипта автоматически. Передавайте `IFluentLog` явно или получайте его из нужного DI-контейнера.
- `IFluentLog.WithPrefix(...)` и `WithSuffix(...)` создают дешевые производные логгеры с контекстом. Используйте их для session id, process id, окон, readers, modules или экземпляров сервисов.
- Ленивые перегрузки вроде `Debug(() => expensiveDump)` вычисляют сообщение только если соответствующий уровень реально включен.
- Фактическое включение зависит и от возможностей базового writer'а, и от fluent-настроек minimum level или override.
- `BenchmarkTimer` и `Log.CreateProfiler(...)` — это легкие таймеры на основе логов. Для структурированных деревьев профилирования используйте MiniProfiler, а этот таймер — для локальных диагностических breadcrumbs.

## Контексты хоста и рантайма

- Код приложения, модуля или сервиса: используйте type logger из `PrepareLogger()`, внедряйте `IFluentLog` через DI или наследуйтесь от `DisposableReactiveObjectWithLogger`, чтобы получить ленивое защищенное свойство `Log`.
- Верхнеуровневые Aura scripts: используйте предоставленный член `Log` для сообщений, которые должны появляться в event stream скрипта.
- Вспомогательные классы, принадлежащие скрипту: передавайте в них `Log`, `Log.WithPrefix(...)` или `IFluentLog` из контейнера скрипта, чтобы диагностика оставалась привязанной к маршруту скрипта и event viewer.
- Библиотечный или helper-код, не связанный со скриптом: создавайте type logger через `typeof(MyType).PrepareLogger()` и рассматривайте это как обычное app logging.
- Потребители ASP.NET Core или других `Microsoft.Extensions.Logging`: используйте `FluentLogger`, `Log4NetLoggerProvider` или `Log4NetLoggerFactory`, если нужен bridge.

## API

- `IFluentLog` — fluent-интерфейс логирования, используемый в коде EyeAuras/PoeShared.
- `FluentLogLevel` — `Trace`, `Debug`, `Info`, `Warn`, `Error`; динамические записи уровня trace сейчас обрабатываются текущими fluent-хелперами и адаптерами как debug.
- `Log.Debug(...)`, `Info(...)`, `Warn(...)`, `Error(...)` — запись по уровням с перегрузками для строки, ленивого `Func<string>` и исключений.
- `Log.Error(message, exception)` — добавить данные исключения к упавшей операции.
- `Log.IsDebugEnabled`, `IsInfoEnabled`, `IsWarnEnabled`, `IsErrorEnabled` — проверки уровня для ручных guard'ов.
- `Log.IsEnabled(FluentLogLevel)` — динамическая проверка уровня.
- `Log.Write(level, () => message)` — динамическая запись с ленивым построением сообщения.
- `Log.WithPrefix(...)` / `WithSuffix(...)` — производные логгеры с контекстом в тексте сообщений.
- `Log.AddPrefix(...)` / `AddSuffix(...)` — изменяют текущие log data у логгера; если логгер делится между несколькими ветками кода, обычно безопаснее использовать производные логгеры.
- `Log.WithMaxLineLength(...)` / `WithoutMaxLineLength()` — управление обрезкой очень длинных сообщений.
- `Log.WithMinLogLevelOverride(...)` — задать эффективный минимальный уровень на производном логгере.
- `Log.WithAction(...)` / `WithLogAction(...)` — дублировать записи в UI, in-memory buffer, event stream или custom sink, не отключая запись в исходный writer.
- `Log.CreateChildCollectionLogWriter(...)` — добавлять отформатированные log messages в DynamicData source list.
- `Log.CreateProfiler(...)` — создать `BenchmarkTimer`, привязанный к логгеру.
- `BenchmarkTimer` — записывает именованные шаги, опциональные логи по шагам, опциональную сводку при disposal, выбор log level, условия и пороги по elapsed time.
- `TypeExtensions.PrepareLogger(Type, string name = default)` — создать fluent logger на базе log4net для assembly и имени типа.
- `Log4NetExtensions.ToFluent()` — обернуть log4net `ILog` в `IFluentLog`.
- `Log4NetAdapter` — пишет fluent log data в log4net и задает thread context metadata.
- `SharedLog` — bootstrap логирования приложения, dump информации о приложении, переключение log level, immediate flush, а также хелперы для trace appender, console appender и local file appender.
- `ObservableAppender` — appender для log4net, который отдает log events как observable stream.
- `FluentLogger` — адаптирует один `IFluentLog` к `Microsoft.Extensions.Logging.ILogger`.
- `Log4NetLoggerProvider` / `Log4NetLoggerFactory` — создают Microsoft loggers на базе категорий log4net.
- `AuraScriptRunner<TSandbox>` — создает logger событий скрипта и регистрирует его как `IFluentLog` контейнера скрипта.
- `AuraScriptSandbox.Log` / `IAuraScriptSandbox.Log` — script-level fluent log, доступный верхнеуровневому коду скрипта.

## Частые сценарии

### Создать type logger для сервиса

```csharp
public sealed class SessionManager
{
    private static readonly IFluentLog Log = typeof(SessionManager).PrepareLogger();

    public void Start()
    {
        Log.Info("Session manager started");
    }
}
```

Используйте это для обычной диагностики приложения или сервиса, которая должна проходить через настроенные appender'ы приложения.

### Передать логгер скрипта во вспомогательный класс

```csharp
var reader = new EntityReader(Log.WithPrefix("EntityReader"));
reader.Refresh();

public sealed class EntityReader
{
    private readonly IFluentLog log;

    public EntityReader(IFluentLog log)
    {
        this.log = log;
    }

    public void Refresh()
    {
        log.Debug("Refreshing entity list");
    }
}
```

Если передать верхнеуровневый script `Log`, сообщения helper-класса останутся в маршруте script event viewer. Если вместо этого создать `typeof(EntityReader).PrepareLogger()`, сообщения уйдут в обычное app logging.

### Получить логгер из контейнера скрипта

```csharp
var log = GetService<IFluentLog>().WithPrefix("Worker");
log.Info("Worker initialized");
```

В контексте Aura script это вернет логгер, зарегистрированный `AuraScriptRunner<TSandbox>`, поэтому он пойдет по тому же script-level event route, что и верхнеуровневый `Log`.

### Добавить контекст для multi-session диагностики

```csharp
var sessionLog = Log
    .WithPrefix($"Session {session.Id}")
    .WithSuffix(() => session.ProcessId?.ToString() ?? "no process");

sessionLog.Info("Attaching to selected window");
```

Используйте префиксы и суффиксы, а не добавляйте этот контекст вручную в каждое сообщение.

### Защитить дорогие dump'ы

```csharp
Log.Debug(() => entities.DumpToNamedTable("Entities"));

if (Log.IsDebugEnabled)
{
    Log.Debug(BuildLargeDiagnosticsReport());
}
```

Ленивая перегрузка — обычно лучший первый выбор. Ручные guard'ы полезны, если дорогая операция имеет side effects или возвращает сразу несколько сообщений.

### Замерить локальную операцию

```csharp
using var timer = Log.CreateProfiler("Attach session")
    .WithLoggingOnDisposal()
    .WithMinElapsedThreshold(TimeSpan.FromMilliseconds(100));

timer.Step("Selected window");
var process = processProvider.Open(window);
timer.Step(() => $"Opened process {process.Id}");
```

Используйте `BenchmarkTimer` для локальных диагностических breadcrumbs. Если нужно структурированное дерево таймингов или profiling report для пользователя, используйте MiniProfiler.

## Что стоит логировать

- Startup/shutdown и жизненный цикл долгоживущих сервисов.
- Действия пользователя: выбор окон, процессов, регионов, файлов и профилей.
- Внешние ресурсы: DLL, модели, скрипты, embedded files и шрифты.
- Выбор backend'а для process/memory и результаты проверок.
- Загрузку и сохранение конфигурации, миграции, fallback-решения и сбросы.
- Настройку optional SDK и регистрацию расширений контейнера.
- Решения по авторизации, лицензированию и permissions — но без секретных значений.
- Восстановимые fallback-сценарии и пропущенные действия.
- Перехваченные исключения вместе с контекстом операции.
- Отмену операций и cleanup paths.

## Что предпочесть

- Предпочитайте `IFluentLog`, а не случайные `Console.WriteLine` или `Debug.WriteLine`.
- Предпочитайте `Info` для важных checkpoint'ов жизненного цикла.
- Предпочитайте `Debug` для подробной диагностики, полезной во время расследования.
- Предпочитайте `Warn` для деградировавшего поведения, при котором работа все еще может продолжаться.
- Предпочитайте `Error(message, ex)`, когда ожидаемая операция завершилась ошибкой.
- Предпочитайте передавать логгер от вызывающего кода, если helper должен логировать в контекст вызывающей стороны.
- Предпочитайте type logger'ы для сервисов приложения с независимой диагностикой.
- Предпочитайте ленивые log messages для таблиц, dump'ов, скриншотов, чтения памяти и другого дорогого форматирования.
- Предпочитайте префиксы и суффиксы для повторяющихся helper'ов, сессий, окон и сервисов, привязанных к процессу.

## Чего избегать

- Не рассчитывайте, что верхнеуровневый script `Log` будет доступен в обычных C#-классах.
- Не используйте случайно `PrepareLogger()`, если сообщение должно попасть в script event viewer.
- Не делайте silent catch; логируйте и саму операцию, и исключение.
- Избегайте log spam в tight-loop, per-frame или per-entity сценариях без sampling или guard'ов по уровню.
- Не логируйте secrets, keys, auth tokens, passwords и private license data.
- Не меняйте общий логгер через `AddPrefix` / `AddSuffix`, если безопаснее создать производный через `WithPrefix` / `WithSuffix`.

## Исследовательские якоря

- `IFluentLog`
- `FluentLogLevel`
- `FluentLogExtensions`
- `FluentLogBuilder`
- `TypeExtensions.PrepareLogger`
- `Log4NetExtensions.ToFluent`
- `Log4NetAdapter`
- `SharedLog`
- `ObservableAppender`
- `FluentLogger`
- `Log4NetLoggerProvider`
- `Log4NetLoggerFactory`
- `BenchmarkTimer`
- `AuraScriptRunner<TSandbox>`
- `AuraScriptSandbox.Log`
- `IAuraScriptSandbox.Log`

## Поисковые синонимы

- logging
- diagnostics
- fluent log
- app log
- script log
- event viewer
- log4net
- logger injection
- log prefix
- log suffix
- log level
- exception logging
- benchmark timer
- diagnostic breadcrumbs

## Связанные карты

- `core/profiling.md`
- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `scripting/logging.md`
- `scripting/runtime.md`
- `scripting/container-extensions.md`
- `computer-vision/profiling.md`