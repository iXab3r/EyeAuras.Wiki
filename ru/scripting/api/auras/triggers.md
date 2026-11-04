---
title: AI Auras — триггеры
description: AI-ориентированная карта триггеров аур и связанной с ними инфраструктуры.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, triggers, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта триггеров аур

Справочная карта по триггерам аур — сущностям, которые отслеживают состояние или события и управляют активацией ауры.

## Модель

- Триггеры наблюдают за состоянием и создают события активации.
- Триггеры — это сущности аур, зарегистрированные через `IAuraRegistrator`.
- Логика триггера обычно находится рядом с `CreateTriggerEventSource`.
- Редакторы триггеров и их метаданные описывают пользовательские настройки.
- Actions выполняют работу после изменения состояния триггера.

## Разобрать состояние триггера

Начните с настроенного триггера в ауре, например `HotkeyIsActiveTrigger`. Найдите регистрацию, свойства и `CreateTriggerEventSource`: источник объясняет, какие события наблюдаются. Затем проверьте общую обработку в `AuraTriggerBase<TProperties>`, прежде чем делать вывод о конечном `IsActive`.

Базовый класс переключает подписку на выделенном `TriggerScheduler`, учитывает отключение, `IsInverted`, `ActivationTimeout` и `DeactivationTimeout`. Поэтому событие на входе ещё не означает немедленную активацию ауры. `IsActive` имеет тип `bool?`; при отключении возможно неизвестное состояние. Подписками базового класса владеет экземпляр триггера.

Результат этой проверки — связь «источник события → настройки задержки/инверсии → состояние», а не только найденный метод. Побочные эффекты размещайте в действиях. Для простого обработчика клавиши в C# Action удобнее [Keybind](../../keybinds), чем создавать триггер вручную.

## Вернуть условие из отдельного класса

`CsharpScriptTriggerExecutor` из `EyeAuras.CsScriptAuras.Triggers.CsharpScript` имеет точку выполнения `protected override Task<bool?> Execute(CancellationToken cancellationToken)`. Результат `true` означает выполненное условие, `false` — невыполненное, `null` — отсутствие определённого булева результата. Настройки самого триггера могут дополнительно применять инверсию и задержки.

Следующий класс проверяет уже подготовленные переменные текущего контекста: `ready` типа `bool` и `pending` типа `int`. Добавьте в проект триггера файл `ReadyTrigger.cs`:

```csharp
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.CsScriptAuras.Triggers.CsharpScript;

public sealed class ReadyTrigger : CsharpScriptTriggerExecutor
{
    protected override Task<bool?> Execute(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var ready = Variables.Get<bool>("ready").Value;
        var pending = Variables.Get<int>("pending").Value;
        return Task.FromResult<bool?>(ready && pending == 0);
    }
}
```

В `Script.csx` C# Trigger оставьте явную точку вызова:

```csharp
{
    using var trigger = GetService<ReadyTrigger>();
    return await trigger.Run(cancellationToken);
}
```

При `ready = true` и `pending = 0` текущая оценка возвращает `true`. Отсутствующее значение `ready` при таком default-чтении даст `false`; для обязательной конфигурации отдельно проверьте наличие и тип записи. Получайте исполнителя через контейнер, который внедряет `Variables`, `Context` и другие сервисы базового класса.

Одна оценка возвращается host без собственного бесконечного цикла. Для повторной оценки настройте период C# Trigger; при отключённом периоде host может не выполнять регулярные оценки. Длительная работа в `Execute` задержит возврат результата и подчиняется токену и ограничению времени выполнения триггера.

Контракт сверён с EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`: [CsharpScriptTriggerExecutor](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.CsScriptAuras/Triggers/CsharpScript/CsharpScriptTriggerExecutor.cs), [CsharpScriptTrigger](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.CsScriptAuras/Triggers/CsharpScript/CsharpScriptTrigger.cs).

## Детали API

- `AuraTriggerBase<TProperties>` — общая базовая реализация триггера.
- `CreateTriggerEventSource` — стандартный метод-источник событий триггера.
- `CsharpScriptTrigger` — сущность триггера на скрипте.
- `CsharpScriptTriggerExecutor` — базовый класс для скриптовых триггеров в object-style.
- `ILifecycleEventsProvider` — источник lifecycle-событий для lifecycle-триггеров.

## Типовые сценарии

- Найти встроенный триггер:
  - найдите регистрацию модуля через `Register<SomeTrigger>`.
  - проверьте properties и metadata для настроек в UI.
  - изучите runtime-класс и `CreateTriggerEventSource`.

- Добавить триггер:
  - определите properties.
  - определите runtime-модель триггера.
  - при необходимости добавьте editor/metadata.
  - зарегистрируйте через `IAuraRegistrator`.

## Что предпочесть

- Для семантики активации в первую очередь смотрите `CreateTriggerEventSource`.
- Для деталей по input/window/CV используйте карты соответствующих подсистем.
- Для скриптовых триггеров в object-style предпочитайте `CsharpScriptTriggerExecutor`.

## Чего избегать

- Не смешивайте побочные эффекты actions с исследованием триггеров.
- Не уходите в низкоуровневый polling, пока не проверили существующие триггеры и сервисы.

## Опорные точки для исследования

- `AuraTriggerBase`, `CreateTriggerEventSource`, `CsharpScriptTrigger`,
  `CsharpScriptTriggerExecutor`, `TimerTrigger`, `HotkeyIsActiveTrigger`,
  `WinActiveTrigger`, `WinExistsTrigger`, `ImageSearchTrigger`,
  `TextSearchTrigger`, `ColorSearchTrigger`, `MLSearchTrigger`.

## Синонимы для поиска

- trigger
- aura trigger
- activation
- active state
- event source
- script trigger
- hotkey trigger
- window trigger
- image trigger

## Связанные карты

- `auras/entities.md`
- `auras/actions.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `windows-subsystems/window-handles.md`
- `computer-vision/images.md`
