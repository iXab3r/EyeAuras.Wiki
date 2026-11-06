---
title: Среда выполнения AI-скриптов
description: Карта основных понятий и ограничений среды выполнения скриптов EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, runtime, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта возможностей scripting runtime

Справочная карта по C#-проектам скриптов, возможностям script host, обычным helper-классам, доступу к зависимостям, аксесcорам, переменным, макросам и метаданным hotkey.

## Что обычно хотят сделать

- Использовать API скриптов, чтобы читать или менять ауры, папки, макросы и переменные.
- Понять, какая aura или folder сейчас является текущим контекстом.
- Вынести код из верхнего уровня скрипта в helper-классы.
- Зарегистрировать сервисы, принадлежащие самому скрипту.
- Привязать методы скрипта к hotkey.
- Открыть UI, принадлежащий скрипту, или использовать дополнительные SDK-пакеты.
- Организовать большой проект скрипта как систему, похожую на приложение.

## Модель

- Верхнеуровневый код скрипта получает возможности от host.
- В верхнеуровневом коде скрипта можно напрямую использовать `Log` для диагностики.
- `ExecutionAnchors` — это контейнер освобождения ресурсов на один запуск; всё, что туда добавлено, будет освобождено при завершении текущего выполнения скрипта.
- Долгоживущие ресурсы, которые должны переживать отдельные запуски скрипта, нужно хранить на уровне sandbox/времени жизни скрипта (`Anchors`) или в явных app-сервисах.
- Обычные C#-файлы рядом со скриптом — это обычные классы.
- Helper-классам зависимости нужно передавать через конструкторы, явные параметры или DI, принадлежащий скрипту.
- Helper-классы не получают `Log` автоматически; передавайте `IFluentLog` явно или создавайте обычный type logger, если это уместно.
- Accessors — это безопасные для скрипта объекты-доступа к объектам дерева аур.
- Actions/triggers в объектном стиле используют базовые классы executor, а не члены верхнего уровня скрипта.
- Небольшие mini-apps можно оставлять в одном файле `Script.cs` / `Script.csx`, если код остаётся удобным для чтения. Файл на 300–500 строк с локальными helper-методами часто лучше, чем искусственно усложнённый граф сервисов.
- В больших проектах верхнеуровневый скрипт лучше рассматривать как composition root, а orchestration выносить в обычные сервисы.

## Как обычно выглядит проект или solution

- Проекты скриптов, экспортированные для работы в IDE, должны быть валидными обычными .NET-проектами.
- Основной проект скрипта должен собираться обычной командой `dotnet build`, если только сгенерированные host-файлы проекта не устарели и не являются неполными.
- Сгенерированные host stubs могут выбрасывать исключения при runtime вне EyeAuras, но они всё равно должны давать достаточно символов для обычной компиляции, навигации в IDE и статического анализа.
- В solution может быть несколько независимых проектов рядом с основным проектом скрипта.
- Дополнительные проекты могут быть helper-библиотеками, тестами, генераторами, инструментами, прототипами или экспериментами.
- Import/live-import в EyeAuras должен подтягивать только те проекты и файлы, которые входят в payload скрипта; не считайте, что каждый проект в solution участвует в runtime-скрипте.

## Область жизни disposable-ресурсов в верхнеуровневых скриптах

Директивы `using` для namespace размещайте в начале файлов скрипта. Для одноразовых disposable-ресурсов в примерах ниже используйте явный блок: он показывает, в какой момент текущего запуска ресурс освобождается.

Безопасные варианты:

- Обернуть исполняемое тело скрипта в `{ ... }` и размещать `using var` внутри этого блока.
- Вынести disposable-код в метод или локальную функцию и вызвать её из верхнеуровневого скрипта.
- Для одноразовых ресурсов, которыми владеет конкретный запуск скрипта, можно не использовать `using`, а прикрепить disposable к `ExecutionAnchors`.

Для маленьких скриптов один блок `{ ... }` обычно является самым простым и понятным вариантом. Компиляция экспортированного проекта для IDE не проверяет исполнение и время жизни ресурсов в script host. Рекомендация явного блока здесь задаёт форму примеров, а не утверждает запрет других форм синтаксиса компилятором.

## Детали API

- `AuraScriptSandbox` / `IAuraScriptSandbox` — объект верхнеуровневых возможностей, который предоставляет host.
- `IFluentLog` — интерфейс логирования, доступный как `Log` в верхнеуровневом коде скрипта и передаваемый явно в обычные helper-классы.
- `IAuraTreeScriptingApi` — API для навигации по дереву и поиска.
- `IAuraAccessor` — объект-доступа к aura со списками actions и вспомогательными методами выполнения.
- `IFolderAccessor` — объект-доступа к folder.
- `IMacroAccessor` — объект-доступа для выполнения macro.
- `IBehaviorTreeAccessor` — объект-доступа к behavior-tree.
- `IVariablesScriptingApi` — типизированный доступ к переменным скрипта.
- `ScriptVariable<T>` — типизированный объект-доступа к переменной.
- `ExecutionAnchors` — `CompositeDisposable` на один запуск для подписок, окон, tracker-ов и других ресурсов, которые должны завершаться вместе с текущим запуском.
- `KeybindAttribute` — метаданные hotkey на уровне метода.
- `ScriptContainerExtension` — расширение DI, принадлежащее скрипту.
- `CsharpScriptActionExecutor` — базовый класс action в объектном стиле.
- `CsharpScriptTriggerExecutor` — базовый класс trigger в объектном стиле.
- `AuraScriptRunner<TSandbox>` — кастомный runner скрипта с типизированными globals.
- `AuraScriptSandbox` — базовый класс для кастомных globals/sandbox API скрипта.
- `IHostedService` — полезный контракт-координатор для долгоживущих script apps.

## Выполнить работу в текущем запуске

Этот пример предназначен для тела `Script.csx` в C# Script. Он считает три
шага с паузой, выводит их в журнал и допускает остановку во время ожидания:

```csharp
using System.Threading.Tasks;

var runToken = cancellationToken;
for (var step = 1; step <= 3; step++)
{
    runToken.ThrowIfCancellationRequested();
    Log.Info($"Шаг {step}");
    await Task.Delay(250, runToken);
}
```

При обычном завершении появятся три записи. Отмена прерывает ожидаемую
операцию; это не токен на весь срок жизни песочницы. Runner устанавливает
`cancellationToken` и `ExecutionAnchors` перед Run и сбрасывает их после него.
Захватывайте токен до передачи в асинхронную работу и ожидайте её Task:
[асинхронность](async). Отдельный `Task.Run`, который никто не ожидает,
не продлевает Run автоматически.

Для синхронного ожидания верхний уровень предоставляет `Sleep(250)`, связанный
с текущим токеном. Обычному классу передайте `CancellationToken` явно и
используйте подходящий метод ожидания; `Sleep` не глобальная функция C#.

## Сохранить настройку и запросить перезапуск

`IScriptRestartController` запрашивает перезапуск **текущего host**. В срезе
`20fd3d4` штатная реализация подключена для C# Script Action; другой host
может предоставить `UnsupportedScriptRestartController` и бросить
`NotSupportedException`. Наличие интерфейса в SDK не гарантирует поддержку.
Action должен оставаться живым, иметь `Context` и быть разрешён к исполнению:
обычный путь `ExecuteAsync` отклоняет `IsIgnored`/отключённый action.

Пример верхнеуровневого C# Action: запишите переменную `NextTargetTitle`
владельца скрипта, затем запустите его. Текущее значение хранится в
`TargetTitle`. Если значения различаются, скрипт сохраняет новое и один раз
запрашивает перезапуск:

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.Scripting.Api;

var runToken = cancellationToken;
var target = Variables.Get<string>("TargetTitle");
Log.Info($"Настройка этого запуска: {target.Value}");
var proposed = Variables.Get<string>("NextTargetTitle");
if (proposed.TryGetValue(out var next) &&
    !string.Equals(target.Value, next, StringComparison.Ordinal))
{
    target.Value = next;
    await GetService<IScriptRestartController>().RequestRestartAsync(
        new ScriptRestartRequest
        {
            Reason = "Изменилась цель",
            Delay = TimeSpan.FromMilliseconds(500)
        }, runToken);
    Log.Info("Запрос принят; ожидаем отмену текущего запуска");
}
try
{
    await Task.Delay(Timeout.Infinite, runToken);
}
catch (OperationCanceledException) when (runToken.IsCancellationRequested)
{
}
```

Новый запуск прочитает сохранённое `TargetTitle`. Проверка равенства не даёт
этому примеру перезапускать себя бесконечно. Для изменения настройки во время
работы ту же последовательность «сохранить → запросить» вызывайте из своей
обработки UI или изменения конфигурации; пример выше проверяет её на старте.
Живые окна, подписки и Task через перезапуск не передаются.

`await RequestRestartAsync` ждёт принятия запроса, **не нового запуска**.
Coordinator сначала ждёт `Delay`, затем вызывает отмену текущего action и
ставит повторное выполнение в очередь. Это не гарантированный интервал между
двумя запусками. Текущий код должен дойти до отменяемого ожидания и освободить
ресурсы; синхронную бесконечную работу токен насильно не прерывает. Токен
метода отменяет принятие запроса до постановки, а не служит ручкой отмены уже
принятого перезапуска. Повторный запрос при уже ожидающем запросе игнорируется;
освобождение action отменяет ожидающую оркестрацию.

## Вынести вычисление в обычный класс

В `Totals.cs` проекта скрипта поместите класс:

```csharp
using PoeShared.Logging;

public sealed class Totals
{
    private readonly IFluentLog log;
    public Totals(IFluentLog log) { this.log = log; }

    public int Sum(int[] values)
    {
        var result = 0;
        foreach (var value in values) result += value;
        log.Info($"Сумма {result}");
        return result;
    }
}
```

В `Script.csx` вызовите `new Totals(Log).Sum(new[] { 2, 3, 5 });`.
Класс получит настоящий логгер скрипта, вернёт 10 и запишет сумму. Так же
передавайте API переменных, дерева и другие зависимости, которые нужны классу.
Если классов много, [зарегистрируйте их](container-extensions) и разрешайте
через DI. Ссылка на SDK не означает наличие любого сервиса в контейнере.

## Выбрать время жизни ресурса

`ExecutionAnchors` освобождается при завершении Run, в том числе при обычном
возврате тела скрипта. `Anchors` песочницы очищается при освобождении самой
песочницы; anchors helper-класса — при `Dispose` этого экземпляра. Пример с
настоящей подпиской и явным владельцем есть в [карте времени жизни](reactive-lifetime).

Для `using var` на верхнем уровне скрипта используйте явный блок `{ ... }`
или метод. Это сохраняет понятную область освобождения; обычная сборка
экспортированного проекта сама по себе не подтверждает поведение submission
в host. Не прикрепляйте заимствованные общие сервисы к очистке своего Run и
не рассчитывайте на универсальный auto-dispose после `GetService`.

## Выбрать API дерева, переменных или горячих клавиш

- [Переменные](/ru/scripting/api/scripting/variables) — создание типизированного
  handle, чтение, запись и наблюдение. `Value` и accessor имеют разные правила
  преобразования, поэтому выбирайте конкретный контракт.
- [Дерево аур](/ru/scripting/api/IAuraTreeScriptingApi) и
  [действия](/ru/scripting/api/auras/actions) — поиск объекта и явное выполнение.
  Наличие accessor не означает запуск actions.
- [Keybind](/ru/scripting/keybinds) — атрибут на методе скрипта и подключение
  обработчика на время выполнения. Для обычного класса атрибут сам по себе
  не создаёт глобальную горячую клавишу.
- [Контексты приложения](/ru/scripting/api/core/app-runtime-contexts) — Razor,
  плагины и объектные executors используют свои точки получения зависимостей.

Большому приложению можно выделить координатор `IHostedService`, но одно
объявление интерфейса не запускает сервис: нужны регистрация и владелец
Start/Stop. Для небольшой утилиты прямой вызов класса часто проще.

## Что предпочитать

- Предпочитайте accessors вместо внутренних model-объектов в скриптах.
- Предпочитайте явные зависимости в helper-классах.
- Предпочитайте `ExecutionAnchors` для ресурсов, созданных текущим запуском скрипта.
- Предпочитайте явный блок `{ ... }` или helper-метод, если верхнеуровневому коду скрипта нужны disposable `using` statements/declarations.
- Предпочитайте `ScriptContainerExtension` для общих сервисов, принадлежащих скрипту.
- Для небольших инструментов и прототипов предпочитайте простые однофайловые скрипты, если разбиение кода только добавит лишнюю сложность.
- Добавляйте полезное диагностическое логирование вокруг настройки, выбора, валидации, ошибок и очистки ресурсов.
- Используйте [recipes/recipe.md](/ru/scripting/api/recipes/recipe), если нужны более высокоуровневые рекомендации, которые объединяют несколько областей API.

## Чего избегать

- Не рассчитывайте, что члены script host будут доступны в обычных C#-классах.
- Не добавляйте фиктивные ожидания вроде `cancellationToken.WaitHandle.WaitOne()` в каждый demo-скрипт только ради того, чтобы подписки оставались живыми.
- Не используйте API конкретного пакета без подключения соответствующего optional package.
- Не используйте директивы `#r` вне верхнеуровневых файлов скрипта.
- Не оставляйте исполняемые `using var` в корне скрипта без явной области видимости через блок или метод.
- Не стройте «индустриальные» слои, интерфейсы и фабрики в маленьких скриптах, которым это пока не нужно.

## Синонимы для поиска

- C# script
- scripting API
- script globals
- ExecutionAnchors
- per-run disposal
- script lifetime
- helper class
- constructor injection
- aura accessor
- folder accessor
- macro accessor
- script variable
- keybind
- script container extension

## Связанные карты

- [core/eyeauras-structure.md](/ru/scripting/api/core/eyeauras-structure)
- [core/app-runtime-contexts.md](/ru/scripting/api/core/app-runtime-contexts)
- [recipes/recipe.md](/ru/scripting/api/recipes/recipe)
- [scripting/container-extensions.md](/ru/scripting/api/scripting/container-extensions)
- [scripting/logging.md](/ru/scripting/api/scripting/logging)
- [scripting/references-and-resources.md](/ru/scripting/api/scripting/references-and-resources)
- [scripting/project-workflow.md](/ru/scripting/api/scripting/project-workflow)
- [scripting/variables.md](/ru/scripting/api/scripting/variables)
- [auras/actions.md](/ru/scripting/api/auras/actions)
- [auras/triggers.md](/ru/scripting/api/auras/triggers)
- [auras/overlays.md](/ru/scripting/api/auras/overlays)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [windows-subsystems/input-hooks-hotkeys.md](/ru/scripting/api/windows-subsystems/input-hooks-hotkeys)
- [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay)
- [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk)
- [nuget/frida-sdk.md](/ru/scripting/api/nuget/frida-sdk)
Контракты — EyeAuras `20fd3d4`, PoeEye `0e02c98`; точные сигнатуры и состав host сверяйте с SDK/XML своей версии.

## Объектный Action и Trigger

Класс с наследованием от `CsharpScriptActionExecutor` или `CsharpScriptTriggerExecutor` получает возможности через базовый класс и внедрение зависимостей. Обычный helper такого доступа не имеет.

- [Действие отдельным классом](../auras/actions) — `protected override Task Execute(CancellationToken)`, ожидаемый вызов `Run` и восстановление временного значения.
- [Условие отдельным классом](../auras/triggers) — `protected override Task<bool?> Execute(CancellationToken)`, возврат текущей оценки и повторные оценки со стороны host.

В этих примерах показаны оба файла: класс `.cs` и явный вызов из `Script.csx`. Наличие класса в проекте не заменяет описание точки входа и её времени жизни.
