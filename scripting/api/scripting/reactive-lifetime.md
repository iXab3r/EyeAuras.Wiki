---
title: AI Scripting: Reactive Lifetime
description: AI-first map for DisposableReactiveObject, Anchors, AddTo, and script property-change weaving.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, disposable, reactive, lifetime
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Reactive Lifetime Discovery Map

Reference map for classes that need disposal, property-change notifications, or
both in scripts and mini-apps.

Use `core/reactivity.md` for `PropertyBinder`, Rx/ReactiveUI, DynamicData, and
live collection patterns built on top of this lifetime model.

## User Intents

- Own subscriptions, windows, process readers, timers, and child services.
- Avoid hand-written `IDisposable` boilerplate.
- Make helper classes notify UI/bindings when properties change.
- Share the same lifetime style between script code and app/service code.

## Concept Model

- `DisposableReactiveObject` is the default base class when a class needs
  `IDisposable`, `INotifyPropertyChanged`, or both.
- `Anchors` is the object's lifetime bucket. Add owned disposables to it.
- `.AddTo(Anchors)` keeps resource ownership explicit and removes most manual
  `Dispose()` implementations.
- In normal EyeAuras projects, notify-property-changed support is usually added
  by `PropertyChanged.Fody`.
- In script projects, the scripting runtime has a custom code weaver that can
  inject notify-property-changed behavior at runtime.
- Top-level script `ExecutionAnchors` is per run. `DisposableReactiveObject`
  `Anchors` belong to the object instance.
- Use object anchors for mini-app windows, coordinators, readers, trackers, and
  services that have their own lifetime.

## API Details

- `PoeShared.Scaffolding.DisposableReactiveObject` - base class implementing
  `IDisposableReactiveObject`.
- `PoeShared.Scaffolding.IDisposableReactiveObject` - combines
  `IDisposable`, `INotifyPropertyChanged`, `Anchors`, and
  `RaisePropertyChanged`.
- `Anchors` - `CompositeDisposable` disposed when the object is disposed.
- `AddTo(Anchors)` - common extension pattern for attaching owned disposables.
- `RaisePropertyChanged(string)` - explicit property-change notification.
- `RaiseAndSetIfChanged(ref field, value)` - setter helper for manual
  properties.
- `DisposableReactiveObjectWithLogger` - same lifetime model plus a lazily
  created type logger.

## Common Flows

### Own Resources In A Helper Object

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

### Add Property State For UI Binding

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

With the script/runtime weaver or Fody in project code, simple auto-properties
may also get notification behavior. Use explicit setters when the code must be
obvious without knowing the weaver.

### Use Logger-Aware Base Carefully

```csharp
sealed class BackgroundReader : DisposableReactiveObjectWithLogger
{
    public void Start()
    {
        Log.Info("Reader started");
    }
}
```

For script-owned helpers, prefer passing the script `IFluentLog` when the log
should stay tied to the user's script session.

## Prefer

- Prefer `DisposableReactiveObject` over hand-written `IDisposable` for classes
  that own multiple disposables.
- Prefer `.AddTo(Anchors)` for subscriptions, windows, readers, timers,
  sessions, and child objects.
- Prefer explicit `RaiseAndSetIfChanged` when property notification behavior
  must be clear in plain C#.
- Prefer `DisposableReactiveObjectWithLogger` only when a type logger is the
  right diagnostic context.

## Avoid

- Avoid manual `Dispose()` methods that only dispose a list of fields.
- Avoid adding long-lived object resources to top-level `ExecutionAnchors` if
  the object has its own lifetime.
- Avoid assuming script globals such as `Log` exist inside classes inheriting
  from `DisposableReactiveObject`.
- Avoid relying on notify-property-changed weaving in code that must also work
  in a build/runtime where the weaver is not enabled.

## Research Anchors

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

## Search Synonyms

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

## Related Maps

- `core/reactivity.md`
- `scripting/runtime.md`
- `scripting/logging.md`
- `scripting/async.md`
- `core/app-runtime-contexts.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`
