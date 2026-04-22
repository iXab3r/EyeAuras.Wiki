---
title: AI-скриптинг и реактивный жизненный цикл
description: Карта по DisposableReactiveObject, Anchors, AddTo и отслеживанию изменений свойств в скриптах.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, disposable, reactive, lifetime, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта по reactive lifetime

Справочная карта для классов, которым в скриптах и mini-apps нужны `IDisposable`, уведомления об изменении свойств или и то, и другое.

## Для чего это нужно

- Владеть подписками, окнами, readers процессов, таймерами и дочерними сервисами.
- Не писать вручную шаблонный код для `IDisposable`.
- Сделать так, чтобы вспомогательные классы уведомляли UI и bindings об изменении свойств.
- Использовать один и тот же подход к времени жизни и в скриптах, и в app/service-коде.

## Основная модель

- `DisposableReactiveObject` — базовый класс по умолчанию, если классу нужен `IDisposable`, `INotifyPropertyChanged` или оба интерфейса сразу.
- `Anchors` — контейнер времени жизни объекта. Добавляйте туда все owned disposable-ресурсы.
- `.AddTo(Anchors)` делает владение ресурсами явным и избавляет от большинства ручных реализаций `Dispose()`.
- В обычных проектах EyeAuras поддержка notify-property-changed обычно добавляется через `PropertyChanged.Fody`.
- В скриптовых проектах runtime использует собственный code weaver, который может внедрять поведение notify-property-changed во время выполнения.
- Верхнеуровневые script `ExecutionAnchors` создаются отдельно для каждого запуска. `Anchors` у `DisposableReactiveObject` принадлежат конкретному экземпляру объекта.
- Используйте anchors самого объекта для mini-app окон, coordinators, readers, trackers и сервисов с собственным временем жизни.

## Детали API

- `PoeShared.Scaffolding.DisposableReactiveObject` — базовый класс с реализацией `IDisposableReactiveObject`.
- `PoeShared.Scaffolding.IDisposableReactiveObject` — объединяет `IDisposable`, `INotifyPropertyChanged`, `Anchors` и `RaisePropertyChanged`.
- `Anchors` — `CompositeDisposable`, который очищается при dispose объекта.
- `AddTo(Anchors)` — стандартный extension-паттерн для привязки owned disposables.
- `RaisePropertyChanged(string)` — явное уведомление об изменении свойства.
- `RaiseAndSetIfChanged(ref field, value)` — helper для сеттера в ручных свойствах.
- `DisposableReactiveObjectWithLogger` — та же модель времени жизни плюс лениво создаваемый type logger.

## Типовые сценарии

### Владение ресурсами во вспомогательном объекте

```csharp
using PoeShared.Scaffolding;

sealed class AttachedWindow : DisposableReactiveObject
{
    private readonly ReProcess reProcess;

    public AttachedWindow(IProcess process, ReProcess reProcess, IWindowHandle window)
    {
        this.reProcess = reProcess;

        process.AddTo(Anchors);
        reProcess.AddTo(Anchors);
        window.AddTo(Anchors);
    }
}
```

### Добавление состояния для UI binding

```csharp
sealed class ReaderState : DisposableReactiveObject
{
    private bool isAttached;

    public bool IsAttached
    {
        get => isAttached;
        set => RaiseAndSetIfChanged(ref isAttached, value);
    }
}
```

Если в проекте используется weaver скриптового runtime или Fody, уведомления могут работать и для простых auto-properties. Но если поведение должно быть очевидно из обычного C# кода без знания про weaver, лучше использовать явные сеттеры.

### Осторожно с базовым классом, у которого есть logger

```csharp
sealed class BackgroundReader : DisposableReactiveObjectWithLogger
{
    public void Start()
    {
        Log.Info("Reader started");
    }
}
```

Для helper-классов, которыми владеет скрипт, чаще лучше передавать script `IFluentLog`, если лог должен оставаться привязанным к сессии пользовательского скрипта.

## Лучше использовать

- `DisposableReactiveObject` вместо ручного `IDisposable`, если класс владеет несколькими disposable-ресурсами.
- `.AddTo(Anchors)` для подписок, окон, readers, таймеров, сессий и дочерних объектов.
- Явный `RaiseAndSetIfChanged`, если поведение уведомлений должно быть понятно прямо по C# коду.
- `DisposableReactiveObjectWithLogger` только тогда, когда type logger действительно подходит для этой диагностической области.

## Чего избегать

- Ручных `Dispose()`-методов, которые только освобождают список полей.
- Добавления ресурсов долгоживущего объекта в верхнеуровневые `ExecutionAnchors`, если у объекта есть собственное время жизни.
- Предположения, что внутри классов, унаследованных от `DisposableReactiveObject`, доступны script globals вроде `Log`.
- Зависимости от notify-property-changed weaving в коде, который должен работать и в build/runtime-конфигурации без включенного weaver.

## Ключевые сущности для изучения

- `DisposableReactiveObject`
- `IDisposableReactiveObject`
- `DisposableReactiveObjectWithLogger`
- `Anchors`
- `CompositeDisposable`
- `AddTo`
- `RaisePropertyChanged`
- `RaiseAndSetIfChanged`
- `PropertyChanged.Fody`
- `AddNotifyPropertyChangedAssemblyWeaver`

## Что искать

- reactive object
- disposable reactive object
- anchors lifetime
- composite disposable
- AddTo anchors
- notify property changed
- NPC
- INotifyPropertyChanged
- property changed weaving
- Fody

## Связанные карты

- `scripting/runtime.md`
- `scripting/logging.md`
- `scripting/async.md`
- `core/app-runtime-contexts.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`