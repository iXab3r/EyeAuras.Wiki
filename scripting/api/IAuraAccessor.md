---
title: IAuraAccessor
description: Definition of the IAuraAccessor interface in C#
published: true
date: 2026-04-21T00:00:00.000Z
tags: C#, Interface, Programming, ai-translated
editor: markdown
dateCreated: 2024-02-20T20:32:05.134Z
---

# IAuraAccessor

> AI-first navigation: see [AI Scripting Runtime](./scripting/runtime), [AI Auras Overview](./auras/overview), [AI Aura Actions](./auras/actions), and [AI Aura Triggers](./auras/triggers) for how aura accessors fit into script workflows.
{.is-info}

```csharp
public interface IAuraAccessor : IHasId, ICanBeLoaded, ICanBeArchived, IHasTimestamp, IHasVariables, IHasPath
{
    bool? IsActive { get; }
    
    /// <summary>
    /// Indicates whether this item is disabled (available for selection/edit) or not
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Contains a list of conditions which are required for this item to start "ticking"
    /// </summary>
    IObservableList<IAuraTrigger> EnablingConditions { get; }
    
    IObservableList<IAuraOverlay> Overlays { [NotNull] get; }
        
    IObservableList<IAuraTrigger> Triggers { [NotNull] get; }

    IObservableList<IAuraAction> OnEnterActions { [NotNull] get; }
        
    IObservableList<IAuraAction> WhileActiveActions { [NotNull] get; }

    IObservableList<IAuraAction> OnExitActions { [NotNull] get; }

}
```

## Read an aura's state

In an EyeAuras C# Script, create an aura named `TargetAura` beside the script:

```csharp
var aura = AuraTree.GetAuraByPath("./TargetAura");
Log.Info($"Active: {aura.IsActive}; loaded: {aura.IsLoaded}");
```

`IsActive` is `bool?`: true means active, false inactive, and null unknown.
`IsLoaded` is a separate state. `GetAuraByPath` throws `ArgumentException` for a
missing aura; use `FindAuraByPath` and a null check when absence is expected.
Pass `IAuraTreeScriptingApi` or the selected accessor explicitly to helper classes.

Although the interface declares `IsEnabled`, `AuraAccessor` at `c8b2304` does
not bind it to the aura. Its false value does not establish that the aura is disabled.

## Execute an aura's action lists

Configure actions on `TargetAura`, then run this from another C# Script:

```csharp
var aura = AuraTree.GetAuraByPath("./TargetAura");
await aura.ExecuteAsync(cancellationToken);
Log.Info("Actions completed");
```

This executes `OnEnterActions`, `WhileActiveActions`, and `OnExitActions` in
sequence. `WhileActiveActions` runs once; this is not a loop or an assignment
to `IsActive`. The token is checked before each action and passed to that action;
cancellation of an action already running depends on its implementation.
The optional token defaults to `default`. `Execute(cancellationToken)` blocks
synchronously; respect each action's thread requirements.

`EnablingConditions`, `Triggers`, `Overlays`, and the action lists are live
observable collections. Variables and paths come from inherited `IHasVariables`
and `IHasPath`. Collections and accessors belong to the aura tree.

[Implementation at c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Scripting/AuraAccessor.cs) · [AuraTree](./IAuraTreeScriptingApi) · [Aura model](./auras/overview)
