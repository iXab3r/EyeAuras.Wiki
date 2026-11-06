---
title: AI Scripting: Reactive Lifetime
description: AI-first map for DisposableReactiveObject, Anchors, AddTo, and script property-change weaving.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, disposable, reactive, lifetime, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Reactive Lifetime Discovery Map

Reference map for classes that need disposal, property-change notifications, or
both in scripts and mini-apps.

Use [core/reactivity.md](/en/scripting/api/core/reactivity) for `PropertyBinder`, Rx/ReactiveUI, DynamicData, and
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

### Dispose a subscription with its owner

Run this in `Script.csx`. Work happens when items are added; there is no timer
or background task. An ordinary helper class needs the same imports and PoeShared
reference, with the script logger passed explicitly.

```csharp
using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Reactive.Disposables;
using PoeShared.Logging;
using PoeShared.Scaffolding;

{
    var items = new ObservableCollection<string>();
    using var observer = new ItemObserver(items, Log);
    items.Add("First");
    items.Add("Second");
}

public sealed class ItemObserver : DisposableReactiveObject
{
    public ItemObserver(ObservableCollection<string> items, IFluentLog log)
    {
        NotifyCollectionChangedEventHandler handler = (_, _) =>
            log.Info($"Items: {items.Count}");
        items.CollectionChanged += handler;
        Disposable.Create(() => items.CollectionChanged -= handler).AddTo(Anchors);
    }
}
```

The log reports counts 1 and 2. Leaving the block disposes the observer;
its anchors remove the handler. The collection remains borrowed.
For a whole Run, `.AddTo(ExecutionAnchors)` is an alternative owner. Those
anchors are disposed when the script body returns, even without cancellation.
Sandbox `Anchors` live longer than a Run; a helper object's `Anchors` belong to
that instance. Choose one owner and do not add borrowed host services to it.

### Notify UI bindings about state

`DisposableReactiveObject` implements `INotifyPropertyChanged` but does not
rewrite setters by itself. With the script weaver or configured PropertyChanged.Fody,
use an auto-property for simple mutable state:

```csharp
using PoeShared.Scaffolding;

public sealed class ReaderState : DisposableReactiveObject
{
    public bool IsAttached { get; set; }
}
```

Create the model and bind it to your UI; this declaration does not create a
window. Without weaving, the auto-property does not notify. Use a custom setter
when assignment needs additional behavior. Notifications do not marshal work to
the UI thread; scheduling and component refresh remain separate responsibilities.
See [Blazor](../core/blazor).

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
- Prefer auto-properties for simple state with configured weaving; use custom setters for assignment-time behavior.
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

- [core/reactivity.md](/en/scripting/api/core/reactivity)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [scripting/logging.md](/en/scripting/api/scripting/logging)
- [scripting/async.md](/en/scripting/api/scripting/async)
- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)


## Script weaver boundary

`DefaultAuraScriptFactory` includes `NotifyPropertyChangedRewriterVisitor`,
which applies the assembly weaver after compilation. The weaver looks for a
compatible instance `RaiseAndSetIfChanged<T>(ref T, T, string)` on the type
or its base classes. Merely implementing `INotifyPropertyChanged` is not enough.
Recognized auto-property setters are rewritten through that helper;
`DoNotNotify` on a property or setter excludes it. This does not promise the
complete PropertyChanged.Fody feature set for arbitrary script classes.

[Weaver at c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Repl/Weavers/AddNotifyPropertyChangedWeaver.cs).
