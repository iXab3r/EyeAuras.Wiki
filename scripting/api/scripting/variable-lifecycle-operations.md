---
title: Variable Owners and Lifetime
description: Inheritance, deletion, paths, and state persistence between C# Script runs
published: true
date: 2026-11-06T00:00:00.000Z
tags: scripting, api, variables, lifetime, ai-translated
editor: markdown
dateCreated: 2026-11-06T00:00:00.000Z
---
# Choose a variable owner and lifetime

Two descriptors with the same name point to the same entry only if they have the same owner. `Variables.Get<int>("count")` uses the current script context. The overload with a path lets you target a specific aura, folder, or another supported tree item. Neither overload creates that tree item for you.

The code below runs inside a C# Script in EyeAuras. `Variables`, `AuraTree`, `Log`, and `cancellationToken` are provided by the host. In a regular class, pass `IVariablesScriptingApi` or a ready-made `ScriptVariable<T>` explicitly. No extra NuGet packages are required for these operations.

## Inherit a value and remove a local override

Create a folder named `DocVariables` at the root of the Aura Tree, and inside it create an aura named `Probe`. Then run this example in a C# Script. It changes only the demo variable `doc.delayMs` for those two items.

```csharp
using System.Reactive.Linq;

{
    var folder = Variables.Get<int>("DocVariables", "doc.delayMs");
    var aura = Variables.Get<int>("DocVariables/Probe", "doc.delayMs");

    aura.Remove();
    folder.Value = 250;
    using var subscription = aura.Listen()
        .Subscribe(value => Log.Info($"Aura delay: {value}"));

    aura.Value = 500;
    aura.Remove();
    Log.Info($"Folder: {folder.Value}, aura: {aura.Value}");

    var result = aura.Remove();
    Log.Info($"Second Remove: {result}, value: {aura.Value}");
}
```

The subscriber receives `250`, then `500`, then `250` again. Writing to the aura creates a local override without changing the folder value. Removing that override restores the parent value. The subscription is disposed at the end of the block; the folder keeps `doc.delayMs = 250` in its current storage.

**`Remove()` has an implementation detail worth knowing:** in this example, calling it a second time still returns `true`, even though the local override is already gone. The method first looks for the name in the effective value set, including inherited values, but removes only the local entry. The parent entry stays in place. So a `true` result does not prove that a local entry was deleted or that the variable disappeared. Check the state you care about after the operation.

`HasValue`, `Variables.Contains(name)`, `Count`, and enumeration also work with the owner's effective value set, not just local entries. A local `null` overrides the parent value: `HasValue` still stays `true`, but a typed read returns `default(T)` or `false`.

`Listen()` reports changes in effective values. If removing an override or changing the parent leaves the effective value unchanged, you may not get a separate notification. Notifications are not guaranteed to be raised on the UI thread.

## Use the correct path

A path without `./` or `../` is resolved from the tree root. For example, `DocVariables/Probe` selects the aura created above no matter where the script is located. You do not need a leading separator. Both `/` and `\` are valid tree path separators.

The prefixes `./` and `../` are resolved relative to `Context.Path` of the current context. This is not the path to `Script.csx` on disk. Before using a relative path, make sure you know which object is actually running the script.

The special path `"."` in `AuraTree.GetAuraByPath` means the current aura. But `Variables.Get<T>(".", name)` goes through the general path lookup and does not use that special rule. Do not use it as a replacement for `Variables.Get<T>(name)`. If you already have the object, pass it explicitly:

```csharp
var owner = AuraTree.GetAuraByPath("DocVariables/Probe");
var count = Variables.Get<int>(owner, "doc.count");
count.Value = 3;
Log.Info($"Selected aura counter: {count.Value}");
```

If no item exists at the path, the `Get<T>(path, name)` overload throws `ArgumentException` before reading the variable. The returned descriptor is bound to the resolved object and does not re-run the string lookup on every read. Do not keep it beyond the owner's lifetime. Access to the owner is borrowed: do not call `Dispose()` on it just because you want to work with its variable.

## What survives a second Run

The next example compares three different storage locations. To observe the behavior, run the same script twice without changing the code or context. The name `doc.runs` should be new for that context.

```csharp
int InstanceRuns { get; set; }

var localRuns = 0;
localRuns++;
InstanceRuns++;
var ownerRuns = Variables.Get<int>("doc.runs");
ownerRuns.Value++;

Log.Info($"Local: {localRuns}, instance: {InstanceRuns}, owner: {ownerRuns.Value}");
```

If the same script instance is preserved, the first run gives `1, 1, 1`, and the second gives `1, 2, 2`. The local variable is recreated every time. The property lives on the compiled script instance. The `doc.runs` entry lives on whatever owner `Variables` currently points to.

The runner reuses the context while the project version stays unchanged. Simply editing some other part of the workspace does not necessarily recreate it. If a dependent project version changes, a new context is created, so you should not rely on `InstanceRuns` surviving an edit. Recreating the execution context does not by itself delete variables from an owner that still exists; replacing or unloading the owner is a different lifetime boundary.

`ExecutionAnchors` is created separately for each execution and disposed when that execution ends, including when it is stopped. For a subscription that should live only for the current Run, use `using` together with an awaited cancellable operation, as shown in the [async examples](/scripting/api/scripting/async). A subscription by itself does not keep a Run alive. Do not store it in an instance property expecting to reuse it on the next run.

## Editing, unloading and disposing a subscription

These are separate lifetime boundaries:

| Event | What changes |
| --- | --- |
| Next Run after the dependent project version changes | The runner creates a new sandbox and child container, disposing the previous context when it is replaced |
| Current Run finishes | Its `ExecutionAnchors` is disposed; variables of a surviving owner are not removed |
| Unload command | Changes the owner's `IsLoaded`; the command itself does not clear its `Variables` |
| Tree item removal | Removes the item from the index and schedules its `Dispose()` on a background scheduler; this is not a synchronous barrier stopping all callbacks |

`Listen()` builds a `WatchCurrentValue → Select → DistinctUntilChanged` chain.
It does not attach the returned subscription to Run or the Unload command.
The caller chooses its owner: `using` disposes it when that block exits;
adding it to `ExecutionAnchors` disposes it when the runner exits execution.
Token cancellation requests shutdown: if the script keeps running, end-of-Run
cleanup has not happened yet. Calling `Dispose()` does not interrupt a callback
that has already started.

The runner first clears the sandbox's `ExecutionAnchors` and `cancellationToken`
in `finally`, then the enclosing `using` disposes its local `CompositeDisposable`.
Replacing a context disposes its `Globals` and `Container`. The owning
`IEyeContext` is registered in that container as an external object: recreating
the sandbox does not create a new aura instance or clear that aura's variables.

Do not use a retained variable handle after its owner is removed, or rely on
Unload to dispose your subscription automatically. For a subscription scoped to
one Run, keep `using` inside the executed block and await work with
`cancellationToken` before leaving it.

## What happens after restarting the app

A normal owner variable is in-memory state, not a promise that any object will be written to disk. In the verified settings adapter, local non-empty `default.*` values are serialized, and the non-null value must be a string. This is a special mechanism for subsystem settings, not a general persistence layer for arbitrary script objects. Do not add the `default.` prefix to your own data just to make it persist.

For long-term settings, use an appropriate [configuration persistence provider](/scripting/api/core/configuration-persistence). It requires its own registration and save rules; a typed variable descriptor does not replace it.

## Contract and verification

The additional review of editing, Unload and subscriptions uses source at `c8b2304`: [runner](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting/AuraScriptRunner.cs), [context](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting/AuraScriptingApiContext.cs), [Unload](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/AuraTree/ViewModels/ReactiveAuraTreeItemViewModel.cs), [owner variables](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/AuraTree/ViewModels/EyeItemBase.cs), [tree removal](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Core/Services/AuraTreeService.cs).



This behavior was checked against EyeAuras
[`1fd27eb`](https://github.com/iXab3r/EyeAuras/tree/1fd27eb5308565d6ab2150c4392810ea52d0cc4f):
[variables API](https://github.com/iXab3r/EyeAuras/blob/1fd27eb5308565d6ab2150c4392810ea52d0cc4f/Sources/EyeAuras.UI/Scripting/VariablesScriptingApi.cs),
[ScriptVariable](https://github.com/iXab3r/EyeAuras/blob/1fd27eb5308565d6ab2150c4392810ea52d0cc4f/Sources/EyeAuras.Scripting.Metadata/UserSpace/ScriptVariable.cs),
[runner](https://github.com/iXab3r/EyeAuras/blob/1fd27eb5308565d6ab2150c4392810ea52d0cc4f/Sources/EyeAuras.Scripting/AuraScriptRunner.cs),
and the pinned implementations of the
[hierarchical cache](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Scaffolding/HierarchicalSourceCache.cs)
and [TryRemove](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Scaffolding/ChangeSetExtensions.cs).

All three examples on this page were run through the editor and the normal Run button in EyeAuras `1.9.10100` from the standard build `33044`. The inherited-value example confirmed the observed values and notifications, the selected-owner example confirmed writing to the chosen owner, and two Runs without code changes confirmed the counters `1/1/1 → 1/2/2`.

Context recreation after editing, owner unload, and the exact moment when the subscription is disposed were not verified separately in this run; those boundaries are described from the source code.

For the exact overloads and the differences between read patterns, see [IVariablesScriptingApi](/scripting/api/IVariablesScriptingApi).