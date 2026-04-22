---
title: Логирование в AI Scripting
description: Карта по логированию скриптов, IFluentLog, логированию через helper-классы и диагностическим breadcrumb-сообщениям.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, logging, diagnostics, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Навигатор по логированию скриптов

Справочная карта по добавлению полезного диагностического логирования в скрипты и mini-app.

## Что обычно нужно пользователю

- Понять, почему скрипт что-то сделал или не сделал.
- Показать выбранные окна, процессы, области, readers и решения по конфигурации.
- Диагностировать отсутствие опциональной настройки SDK, недоступные сервисы и провалившуюся валидацию.
- Сделать так, чтобы вспомогательные классы писали в лог без привязки к глобальным переменным верхнего уровня.
- Избежать шумного спама в лог на каждом кадре или для каждой entity.

## Базовая модель

- У кода верхнего уровня в скрипте есть `Log`, который предоставляет host.
- `Log` — это не глобальный C# API. Обычные классы не получают его автоматически.
- Вспомогательным классам лучше передавать `IFluentLog` через конструктор, параметр метода, property injection или регистрацию в DI.
- Код приложения или библиотеки может создать независимый логгер через `typeof(MyType).PrepareLogger()`.
- Для helper-классов, принадлежащих скрипту, лучше передавать `Log` самого скрипта, чтобы диагностика оставалась привязанной к контексту скрипта и runtime.
- Хороший лог — это цепочка понятных следов о решениях и ошибках, а не стенограмма каждой итерации цикла.

## Детали API

- `IFluentLog` — интерфейс логирования, который используется в коде EyeAuras/PoeShared.
- `FluentLogLevel` — `Trace`, `Debug`, `Info`, `Warn`, `Error`.
- `Log.Debug(...)` — подробные сообщения, полезные при диагностике.
- `Log.Info(...)` — обычные этапы жизненного цикла и важные переходы состояния.
- `Log.Warn(...)` — проблемы, после которых можно продолжить работу, отсутствие опциональных данных, fallback-сценарий.
- `Log.Error(...)` — неудачная операция или исключение, которое мешает ожидаемой работе.
- `Log.Error(message, exception)` — сохраняет информацию об исключении вместе с записью лога.
- `Log.IsDebugEnabled`, `IsInfoEnabled`, `IsWarnEnabled`, `IsErrorEnabled` — позволяют защититься от дорогой сборки сообщений.
- `Log.Debug(() => expensiveText)` и похожие overload с `Func<string>` — ленивое построение сообщения.
- `Log.Write(level, () => message)` — запись, когда уровень задаётся динамически.
- `Log.IsEnabled(level)` — проверка динамического уровня.
- `Log.WithPrefix(...)` / `Log.WithSuffix(...)` — создают логгеры с контекстом для helper-классов, окон, process readers или выбранных целей.
- `Log.WithMaxLineLength(...)` / `WithoutMaxLineLength()` — управление длиной длинных строк в выводе.
- `Log.WithMinLogLevelOverride(...)` — переопределяет минимальный уровень для производного логгера.
- `Log.WithAction(...)` / `WithLogAction(...)` — дублируют записи лога в UI, списки в памяти или собственные sinks.
- `Log.CreateProfiler(...)` — создаёт `IDisposable`-таймер для замера именованной операции.
- `TypeExtensions.PrepareLogger()` — создаёт логгер из обычного C# типа.

## Типовые сценарии

### Логирование из верхнего уровня скрипта

```csharp
Log.Info("Starting window selection");

try
{
    var selectedWindow = await osd.PickWindow();
    Log.Info($"Selected window: {selectedWindow.Title} ({selectedWindow.ProcessId})");
}
catch (Exception ex)
{
    Log.Error("Failed to select a window", ex);
}
```

### Передача `Log` во вспомогательный класс

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

### Создание логгера в коде приложения или библиотеки

```csharp
public sealed class MyService
{
    private static readonly IFluentLog Log = typeof(MyService).PrepareLogger();

    public void Start()
    {
        Log.Info("Service started");
    }
}
```

### Как избежать дорогих `Debug`-сообщений

```csharp
Log.Debug(() => entities.DumpToNamedTable("Entities"));

if (Log.IsDebugEnabled)
{
    Log.Debug(BuildLargeDiagnosticsReport());
}
```

## Что имеет смысл логировать

- Запуск и остановку скрипта, запуск и остановку долгоживущих сервисов.
- Настройку опциональных SDK-пакетов и регистрацию container extensions.
- Выбор пользователя: заголовок окна/process id, region, point, color, путь к файлу.
- Выбор process/memory reader и результат валидации.
- Внешние ресурсы: загруженные DLL, модели, шрифты, скрипты, embedded resources.
- Значения конфигурации, которые влияют на поведение.
- Срабатывание fallback-сценариев и пропущенные действия.
- Исключения с контекстом о том, какая именно операция не удалась.
- Отмену операций и сценарии очистки.

## Что лучше делать

- Используйте `Info` для заметных пользователю этапов жизненного цикла.
- Используйте `Warn`, если скрипт может продолжить работу, но результат будет хуже ожидаемого.
- Используйте `Error(message, ex)` при перехвате исключений.
- Используйте префиксы для повторяющихся helper-классов или нескольких подключённых окон/процессов.
- Используйте ленивые сообщения для таблиц, дампов, скриншотов или memory scan.
- Передавайте `IFluentLog` в обычные helper-классы.
- В небольших скриптах лучше оставить несколько действительно полезных сообщений вокруг ветвлений и ошибок.

## Чего лучше избегать

- Не рассчитывайте, что `Log` существует вне тела верхнего уровня скрипта.
- Не делайте `catch` без лога; как минимум запишите операцию и сообщение исключения.
- Не логируйте внутри tight frame loops, memory scans или циклов по entity, если уровень не защищён проверкой или sampling не сделан намеренно.
- Не пишите в лог секреты, auth tokens, license keys и приватные данные пользователя.
- Не превращайте каждое изменение состояния в сообщение уровня `Info`.
- Не используйте `PrepareLogger()` внутри helper-классов скрипта, если передача логгера скрипта сохранит более полезный контекст.

## Основные API и точки входа

- `IFluentLog`
- `FluentLogLevel`
- `FluentLogExtensions`
- `PrepareLogger`
- `WithPrefix`
- `WithSuffix`
- `WithAction`
- `WithLogAction`
- `CreateProfiler`
- `AuraScriptSandbox.Log`
- `IAuraScriptSandbox.Log`

## Ключевые слова для поиска

- logging
- diagnostics
- debug log
- script log
- event log
- fluent log
- logger injection
- helper class logging
- log prefix
- log level
- exception logging
- diagnostic breadcrumbs

## Связанные карты

- `scripting/runtime.md`
- `scripting/container-extensions.md`
- `scripting/project-workflow.md`
- `computer-vision/profiling.md`
- `auras/entities.md`