---
title: AI Scripting - Variables
description: Reference map for script, aura, folder, and behavior tree variables in AI-first workflows.
published: true
date: 2026-11-06T00:00:00.000Z
tags: scripting, api, ai, variables, state, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# EyeAuras Variable Map

A reference map for variables available from scripts, typed variable access, the aura and folder variable hierarchy, `default.*` variables, and reactive subscriptions to changes.

If you need ready-made examples for inheritance, removing overrides, choosing a path, and running again, start with [variable owners and lifetimes](variable-lifecycle-operations).

## What this is for

- Store small settings outside local C# variables.
- Share values between scripts, auras, folders, and behavior logic.
- Safely read and write typed variable values.
- Track variable changes.
- Use folder values as defaults for nested auras.
- Understand why reading a variable returned a fallback value.
- Distinguish temporary script fields from persistent aura or folder variables.

## How the model works

- Local C# variables exist only within one method or one run.
- Script class fields and properties live until the script is recompiled or the sandbox is recreated.
- Aura, folder, and script variables are stored in EyeAuras variable containers.
- Variables can be visible in the UI of the aura or folder they belong to.
- `IVariablesScriptingApi` is the scripting-side variables API.
- `ScriptVariable<T>` provides typed access to a named variable.
- Auras and folders expose variable containers through `IHasVariables`.
- Folder variables can act as inherited defaults for nested items.
- Variables named like `default.*` are usually used to configure default subsystem behavior down the aura tree.

## What the API includes

- `IVariablesScriptingApi` — the main variables API for scripts.
- `Variables["name"]` — direct indexer access as `object`.
- `Variables.Get<T>("name")` — a typed variable for the current script or context.
- `Variables.Get<T>(path, "name")` — a typed variable from another aura or folder.
- `Variables.Get<T>(IHasVariables, "name")` — a typed variable from a known source.
- `ScriptVariable<T>` — typed access to a variable.
- `ScriptVariable<T>.Value` — safe read and write; returns `default(T)` if the value is missing, `null`, or incompatible with the requested type.
- `ScriptVariable<T>.HasValue` — `true` if a record exists in storage.
- `ScriptVariable<T>.TryGetValue(out T value)` — tries to read and convert the value.
- `ScriptVariable<T>.GetOrThrow()` — strict read that throws for required values.
- `ScriptVariable<T>.Set(value)` — convenient fluent-style write.
- `ScriptVariable<T>.Remove()` — removes the record.
- `ScriptVariable<T>.Listen()` — an observable stream of typed values.
- `IBindingValueConverterRepository` — conversion support used during typed reads.

## Value semantics

- Reading `Value` from a valid handle returns a fallback value if the record is missing or conversion fails.
- `Value` returns `default(T)` if the variable does not exist.
- `Value` returns `default(T)` if the stored value cannot be converted.
- `HasValue` means a record exists, even if the stored value is `null`.
- `TryGetValue` returns `false` if the value is missing, `null`, or incompatible with the requested type.
- `GetOrThrow` is for required values, when missing data or a type mismatch should be treated as an error.
- `Remove` deletes the local record. After that, a parent value may become visible; if there is no parent value, reading returns `default(T)`.
- `Listen` emits the current value first, then only emits distinct changes.

`ScriptVariable<T>.TryGetValue` and `Value` do not provide a universal no-exception guarantee: converting a structure from another load context uses JSON and does not catch serialization errors. A missing record and `null` produce the normal fallback result; a converter failure is a different case.

Also do not confuse the handle method with `Variables.TryGetValue<T>(name, out value)`: the latter casts the stored object directly to `T` and can throw a type error.

## Hierarchy

- Aura and folder variables form a tree-like settings hierarchy.
- A child item can read inherited values from parent folders.
- A child item can override a parent value locally.
- Folder-level variables are useful for target windows, input mode, shared profile names, delays, and other group settings.
- Names like `default.WindowSelector.TargetWindow` and other `default.*` values can affect subsystem defaults for nested items.

## Read a setting with a fallback

This example runs inside a C# Script in EyeAuras. `Variables` and `Log` are provided by `AuraScriptSandbox`; in a regular class, pass `IVariablesScriptingApi` through a constructor or method parameter.

```csharp
var delay = Variables.Get<int>("delayMs");
var delayMs = delay.TryGetValue(out var savedDelay) ? savedDelay : 250;
Log.Info($"Delay: {delayMs} ms");
```

The log will show the saved value, or `250` if the record is missing, `null`, or could not be converted. In these cases, `Value` returns `default(int)`, which is `0`, so it does not distinguish between a missing setting and a saved zero. `HasValue` checks whether the record exists, not whether its value is usable for the selected type.

## Write a value and read it back

In a C# Script, use the same type and name:

```csharp
var count = Variables.Get<int>("operationCount");
count.Value = 7;
Log.Info($"Saved: {count.GetOrThrow()}");
```

The log will show `7`. `Get<T>` returns a small typed handle, not a copy of the value; another handle for the same source and name points to the same record. `GetOrThrow()` returns the required value or throws `InvalidOperationException` if it is missing, `null`, or cannot be read as the selected type.

Do not assume `GetOrThrow()` and `TryGetValue()` use identical conversion behavior for arbitrary objects — in the referenced version, their conversion paths differ.

For a variable from another aura or folder, use `Variables.Get<T>(itemPath, variableName)` or `Variables.Get<T>(source, variableName)`, where `source` implements `IHasVariables`. The path must point to an existing item; requesting a handle for a missing path throws `ArgumentException`.

## Watch for changes and remove a record

The following complete C# Script creates a subscription, changes the value, and removes the record. The `using` scope limits the subscription to this execution.

```csharp
using System.Reactive.Linq;

{
    var level = Variables.Get<int>("exampleLevel");
    level.Value = 1;
    using var subscription = level.Listen()
        .Subscribe(value => Log.Info($"Level: {value}"));
    level.Value = 2;
    var removed = level.Remove();
    Log.Info($"Record removed: {removed}");
}
```

If the parent does not have a variable with the same name, the subscriber receives the current value `1`, then `2`, then `0` after removal. If a parent value exists, it becomes visible again. Duplicate values are filtered through `DistinctUntilChanged`; removal does not guarantee a separate event if the effective value did not change.

`Remove()` returns `true` if the name was visible before the call, including through inheritance. This does not confirm that a local record was deleted or that the effective value disappeared. For a long-lived UI, tie the subscription to the owner's lifetime; `Listen()` itself does not choose a UI thread.

## Contract version

This description was verified against EyeAuras source commit `20fd3d424d886f6c99b979536a148774d289d110`: [IVariablesScriptingApi](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Scripting/Api/IVariablesScriptingApi.cs) and [ScriptVariable](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Scripting.Metadata/UserSpace/ScriptVariable.cs). The [interface reference](/scripting/api/IVariablesScriptingApi) also shows inherited `IVariablesAccessor` methods.

## What to prefer

- Prefer `ScriptVariable<T>` over direct indexer access as `object`.
- Prefer `TryGetValue` for optional values.
- Prefer `GetOrThrow` for required configuration.
- Prefer folder variables for shared settings across related auras.
- Use clear names and a consistent naming style or prefixes.
- Dispose `Listen()` subscriptions together with the owner's lifetime.

## What to avoid

- Do not treat `Value == default(T)` as proof that the variable is missing.
- Do not use direct indexer access where type safety matters.
- Do not store live handles, windows, processes, or disposable objects in variables.
- Do not overuse global or shared variables for values that belong in local state.
- Do not assume `default.*` names are harmless — they can affect nested systems.

## Reference points for further study

- `IVariablesScriptingApi`
- `ScriptVariable<T>`
- `IScriptVariable`
- `IHasVariables`
- `IBindingValueConverterRepository`
- `Variables.Get`
- `Variables.Item`
- `HasValue`
- `TryGetValue`
- `GetOrThrow`
- `Listen`
- `Remove`
- `default.WindowSelector.TargetWindow`

## Related search terms

- script variables
- aura variables
- folder variables
- tree variables
- blackboard
- shared state
- typed variable
- persistent setting
- default variable
- inherited variable
- variable hierarchy
- reactive variable

## Related maps

- [Runtime](runtime)
- [EyeAuras structure](../core/eyeauras-structure)
- [Aura entities](../auras/entities)
- [Window handles](../windows-subsystems/window-handles)
- [Input and hotkeys](../windows-subsystems/input-hooks-hotkeys)