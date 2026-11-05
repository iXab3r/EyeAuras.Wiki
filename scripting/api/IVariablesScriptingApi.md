---
title: Variables Scripting API
description: Access EyeAuras variables from scripts
published: true
date: 2026-11-06T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-28T13:04:44.376Z
---
# IVariablesScriptingApi

Read and modify variables from the current context through `Variables` in top-level EyeAuras code. For another aura, folder, or macro, specify the owner first. In a regular class, pass `IVariablesScriptingApi` through the constructor; the SDK does not create variable storage on its own.

## Write a value and read it back

This code runs in a top-level script with an active context:

```csharp
var counter = Variables.Get<int>("counter");
counter.Value = 10;
Log.Info($"counter = {counter.Value}");
```

The script log will show `counter = 10`, and the owner's storage will contain an entry named `counter`. `Get<T>` creates a small `ScriptVariable<T>` handle; **getting the handle itself does not create a stored entry**. Multiple handles with the same name for the same owner all point to the same variable.

On the handle, `HasValue` checks whether an entry exists, including an entry with `null`. `Value` returns `default(T)` if the value is missing, is `null`, or cannot be converted. If that distinction matters, use `counter.TryGetValue(out var value)` instead. `counter.Remove()` deletes the entry and returns `true` if the name was visible in the effective storage before the call. In a hierarchy, that includes a parent value: a repeated delete can still return `true` even if the local override is already gone and the value remains visible through inheritance. This case is covered in [owner operations and lifetime](scripting/variable-lifecycle-operations).

A `default` or `false` result does not mean every conversion is safe. In this version, JSON conversion of a structure from another load context does not catch serialization errors. This also applies to `Value`, because it calls `TryGetValue`.

## Read a variable from another item

First create a folder named `Farm` and an aura named `State` inside it, then give it an integer variable called `hp`:

```csharp
var hp = Variables.Get<int>("Farm/State", "hp");
if (hp.TryGetValue(out var value))
{
    Log.Info($"HP = {value}");
}
```

The path selects the owner, and the second argument is the variable name. If no item exists at that path, `Get<T>(path, name)` throws `ArgumentException` before reading the value. If you already have an `IHasVariables` object, use `Get<T>(source, name)` instead. Path rules are described in [tree navigation](IAuraTreeScriptingApi).

## Update a counter without a separate read

```csharp
Variables.AddOrUpdate("runs", 1, (int previous) => previous + 1);
Log.Info($"Runs = {Variables.GetValue<int>("runs")}");
```

The first call stores `1`. Later calls store the result of `updater`. The update happens inside the cache edit operation. The existing stored value must already be of a compatible type; this overload does not use `ScriptVariable<T>` conversion rules.

## Choose a read method

| Operation | Missing entry | Existing entry |
|---|---|---|
| `Variables.Contains(name)` | `false` | `true`, even for `null` |
| `Variables.TryGetValue<T>(name, out value)` | `false`, value is `default` | Direct cast to `T`, type error is possible |
| `Variables.GetValue(name, fallback)` | `fallback` | Same direct cast; fallback does not fix an incompatible type |
| `Variables.GetValue<T>(name)` | `KeyNotFoundException` | `null` becomes `default`; incompatible type throws `ArgumentException` |
| `handle.TryGetValue(out value)` | `false` | Validates the value, then tries conversion |
| `handle.GetOrThrow()` | `InvalidOperationException` | Requires a non-null compatible value |

In revision `1fd27eb`, the handle methods `GetOrThrow` and `TryGetValue` pass different objects to the helper converters. Do not assume that a conversion that succeeds in one method will necessarily succeed in the other.

## Watch for changes during the current run

```csharp
using System.Reactive.Linq;

{
    var status = Variables.Get<string>("status");
    using var subscription = status.Listen()
        .Subscribe(value => Log.Info($"Status = {value}"));
    status.Value = "Ready";
    await Task.Delay(1000, cancellationToken);
}
```

`Listen()` emits the current value and then future distinct values; a failed read produces `default`. The subscription stays active until the end of the `using` block. Do not assume notifications arrive on a UI thread; switching to the required scheduler is the consumer's responsibility. For more on long-lived subscriptions, see [script variables](scripting/variables).

## Contract and version

`EyeAuras.Scripting.Api.IVariablesScriptingApi` inherits from `EyeAuras.Scripting.UserSpace.IVariablesAccessor`. The interface itself declares two overloads: `Get<T>(itemPath, variableName)` and `Get<T>(source, variableName)`. `Count`, `Contains`, enumeration, the indexer, and local operations are inherited.

This description was checked against the declarations and implementations in EyeAuras revision `1fd27eb`; for the full reference, use the SDK/XML for your installed version.