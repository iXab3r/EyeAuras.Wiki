---
title: AI Core: Reactivity
description: AI-first map of PropertyBinder, Rx/ReactiveUI, DynamicData, reactive collections, and object-level bindings used by EyeAuras-style code.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, reactivity, rx, reactiveui, dynamicdata
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---

# Reactivity Discovery Map

This map covers the shared reactivity layer used by application code, Blazor/WPF views, long-running services, and script mini-apps.

Use it when code needs derived properties, live collections, change tracking, UI updates from state, or subscriptions which must be disposed together with the owning object.

## User Intents

- Recompute one property when other properties change.
- Keep UI state synchronized with service/model state.
- Subscribe to events or value changes without leaking handlers.
- Maintain a live table/list/tree from changing data.
- Filter, sort, transform, or group a live collection.
- Bind values conditionally, including null/fallback cases.
- Move reactive updates onto a UI scheduler/dispatcher.
- Decide between `PropertyBinder`, Rx subscriptions, and DynamicData.

## Concept Model

- `DisposableReactiveObject` is the usual base for objects that need lifetime management and/or property notifications. Put subscriptions and owned resources into `Anchors`.
- Rx (`IObservable<T>`) is the stream layer. Use it for events, timers, async state, throttling, switching, combining, and one-off subscriptions.
- ReactiveUI provides property observation helpers such as `WhenAnyValue`, `WhenAnyProperty`, `ReactiveCommand`, and `ObservableAsPropertyHelper`.
- `PropertyBinder` is for declarative object-level bindings. It is commonly declared as a static `Binder<TContext>` and attached once from the instance constructor.
- DynamicData is the preferred layer for mutable live collections. `SourceList<T>` and `SourceCache<T, TKey>` emit change sets through `Connect()`.
- `SourceCache<T, TKey>` is usually better when items have stable IDs. `SourceList<T>` is better for ordered/list-like data without a key.
- `SourceListEx<T>` and `SourceCacheEx<T, TKey>` are PoeShared wrappers that own the DynamicData source and expose materialized read-only collections.
- UI code usually consumes materialized `IReadOnlyObservableCollection<T>` produced by `BindToCollection(...)` or equivalent helpers.
- UI-owned properties must be updated on the correct scheduler/dispatcher. Use scheduler-aware binder helpers or `ObserveOn(...)` where needed.

## Key APIs

- `PropertyBinder.Binder<TContext>` - owns declarative binding rules for a context type.
- `Binder.Attach(instance)` - activates all binder rules for a concrete object; dispose it with the object lifetime.
- `Binder.Bind(...)` - binds an expression to a target property.
- `Binder.BindIf(...).ElseIf(...).Else(...)` - conditional binding chain.
- `To(...)` - sets the target property or calls an assignment callback.
- `WithDependency(...)` - adds extra dependency signals which should trigger recalculation.
- `PropagateNullValues(...)` - controls null propagation behavior in property paths.
- `DoNotRunOnAttach()` - prevents initial binding evaluation during attach.
- `DoNotOverride()` / `OverrideKey(...)` - controls how binding rules override each other.
- `OnScheduler(...)` - schedules binder assignment on a selected scheduler.
- `WhenAnyValue(...)` - observes one or more property values.
- `WhenAnyProperty(...)` - observes property change notifications by property name/expression.
- `ReactiveCommand` - command abstraction with observable execution state.
- `ObservableAsPropertyHelper<T>` - stores a computed observable value as a property.
- `SourceList<T>` - mutable live list.
- `SourceCache<T, TKey>` - mutable live keyed collection.
- `Connect()` - opens a DynamicData change-set stream.
- `Preview()` - observes changes before they are applied.
- `Edit(...)` - batch-mutates a DynamicData source.
- `Watch(key)` - observes one item in a `SourceCache`.
- `Lookup(key)` / `GetOrDefault(...)` - reads keyed cache values.
- `CountChanged` - observes live collection count.
- `BindToCollection(out collection)` - materializes a change set into a read-only observable collection.
- `ToObservableChangeSet()` - adapts an observable sequence or collection into DynamicData change sets.
- `SourceListEx<T>` / `SourceCacheEx<T, TKey>` - PoeShared lifetime-aware wrappers around DynamicData sources.
- `BindableReactiveObject` / `ReactiveBinding` - property-path binding infrastructure for dynamic source/target binding cases.

## PropertyBinder Pattern

Use `Binder<T>` for stable object-level derived state. Do not create binders inside render loops, polling loops, or per-frame code.

```csharp
private sealed class CharacterState : DisposableReactiveObject
{
    private static readonly Binder<CharacterState> Binder = new();

    static CharacterState()
    {
        Binder.Bind(x => $"{x.Name} ({x.Level})")
            .To(x => x.DisplayName);

        Binder.BindIf(x => x.Target != null, x => x.Target.Name)
            .Else(x => "<no target>")
            .To(x => x.TargetName);
    }

    public CharacterState()
    {
        Binder.Attach(this).AddTo(Anchors);
    }

    public string Name { get; set; } = "";
    public int Level { get; set; }
    public TargetInfo? Target { get; set; }
    public string DisplayName { get; private set; } = "";
    public string TargetName { get; private set; } = "";
}
```

## Rx Subscription Pattern

Use Rx for streams and side effects. Always dispose subscriptions with the owner.

```csharp
this.WhenAnyValue(x => x.IsRunning)
    .DistinctUntilChanged()
    .Subscribe(isRunning => Log.Info($"Running: {isRunning}"), Log.HandleException)
    .AddTo(Anchors);
```

Common operators:

- `Select` - map a value.
- `Where` - filter events.
- `DistinctUntilChanged` - suppress duplicate values.
- `CombineLatest` - combine multiple latest values.
- `Switch` - use the latest inner observable and unsubscribe previous one.
- `Throttle` / `Sample` - reduce noisy event streams.
- `ObserveOn` - move downstream notifications to a scheduler.

## DynamicData Pattern

Use DynamicData when a collection changes over time. Prefer change-set pipelines over manual list diffing.

```csharp
private readonly SourceCache<ItemVm, string> items = new(x => x.Id);

public IReadOnlyObservableCollection<ItemVm> Items { get; }

public InventoryVm()
{
    items.Connect()
        .Filter(x => x.IsVisible)
        .BindToCollection(out var visibleItems)
        .Subscribe()
        .AddTo(Anchors);

    Items = visibleItems;
    items.AddTo(Anchors);
}
```

Use `Edit(...)` for batch changes:

```csharp
items.Edit(update =>
{
    update.Clear();
    update.AddOrUpdate(newItems);
});
```

## When To Use What

- Use `PropertyBinder` for long-lived derived properties and object state projections.
- Use `WhenAnyValue` / Rx for event streams, timers, subscriptions, debounce/throttle logic, async switching, and side effects.
- Use `DynamicData` for live collections, especially tables, trees, caches, and continuously refreshed data.
- Use plain properties for simple local state that does not need notification or derived updates.
- Use `ReactiveCommand` when UI actions need observable execution state, errors, or can-execute logic.
- Use `SourceCache<T, TKey>` for entity lists, process lists, windows, aura objects, files, or anything with stable IDs.
- Use `SourceList<T>` when order itself is the model and there is no natural key.

## Avoid

- Do not leave Rx subscriptions undisposed. Add them to `Anchors`.
- Do not mutate UI-bound properties from arbitrary background threads.
- Do not put `Binder.Attach(...)` outside the object lifetime owner.
- Do not create `Binder<T>` instances repeatedly for the same type.
- Do not manually diff `List<T>` when DynamicData can emit change sets.
- Do not rely on plain auto-properties if consumers expect property change notifications.
- Do not create circular reactive bindings unless guarded very carefully.
- Do not hide long-running work inside property getters or binding expressions.

## Search Synonyms

- reactivity, reactive state, property changed, INPC, notify property changed
- PropertyBinder, binder, derived property, computed property, conditional binding
- Rx, System.Reactive, observable, subscription, scheduler, ObserveOn
- ReactiveUI, WhenAnyValue, ReactiveCommand, ObservableAsPropertyHelper
- DynamicData, SourceList, SourceCache, change set, live collection
- BindToCollection, observable collection, filtered table, sorted list
- AddTo Anchors, lifetime, Dispose, DisposableReactiveObject

## Research Anchors

- `Binder<TContext>`
- `PropertyRuleBuilder`
- `Bind`
- `BindIf`
- `ElseIf`
- `Else`
- `To`
- `WithDependency`
- `PropagateNullValues`
- `OnScheduler`
- `WhenAnyValue`
- `WhenAnyProperty`
- `ReactiveCommand`
- `ObservableAsPropertyHelper`
- `SourceList<T>`
- `SourceCache<T, TKey>`
- `Connect`
- `Preview`
- `Edit`
- `Watch`
- `Lookup`
- `CountChanged`
- `BindToCollection`
- `ToObservableChangeSet`
- `SourceListEx<T>`
- `SourceCacheEx<T, TKey>`
- `BindableReactiveObject`
- `ReactiveBinding`
- `ReactiveTrackerList`
- `ReactiveSection`

## Related Maps

- [Blazor Foundation](blazor.md)
- [Reactive Lifetime](../scripting/reactive-lifetime.md)
- [Async Patterns](../scripting/async.md)
- [Scripting Runtime](../scripting/runtime.md)
- [Blazor Windows](../windows-subsystems/blazor-windows.md)
