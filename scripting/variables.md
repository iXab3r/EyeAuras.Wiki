---
title: Variables
description: Using variables in scripts
published: true
date: 2026-11-06T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T11:24:15.492Z
---
# Script Variables in EyeAuras

## Why use variables outside your code

A regular script is short-lived: it starts, does its job, and exits. But sometimes you need to keep settings or results around longer — between runs in the same context, or even share them with other scripts. For that, EyeAuras provides external variables at the script, aura, and folder levels.

Common use cases:

- storing settings that rarely change
- sharing data between scripts, for example config in one script and logic in another
- viewing values in the UI on the **Variables** tab of an aura or folder

## Where data can live

- Local variables live inside a method. This is the usual case:
  ```csharp
  var x = 123;
  ```
- Sandbox properties are fields or properties of your script class. They are preserved when the same context runs again. Changing the dependent project version or recreating the context resets the state:
  ```csharp
  int MyCounter { get; set; }
  // ...
  MyCounter = 16;
  Log.Info($"Counter: {MyCounter}");
  ```
- Script/Aura/Folder variables are stored under a selected owner, visible in the UI, and accessible to other scripts through that owner. That is what this article focuses on.

## Read and increment a counter

All examples below are for `Script.csx`. `Variables` and `AuraTree` are provided by the host. In a regular class, pass `IVariablesScriptingApi` from `EyeAuras.Scripting.Api` or a ready-made `ScriptVariable<T>` from `EyeAuras.Scripting.UserSpace`. Getting a handle does not create a record and does not require `Dispose`; the caller owns any `Listen()` subscription. This is not a guarantee that arbitrary objects will survive an application restart.

In raw form, variables can be read and written through a string-keyed indexer:

```csharp
Variables["myCounter"] = 1;
Log.Info($"Counter: {Variables["myCounter"]}");
```

The downside is that you lose type safety and have to cast manually. In C#, that is inconvenient and error-prone.

The usual solution is `ScriptVariable<T>`: you define the name and type once, then work with it safely.

```csharp
var myCounter = Variables.Get<int>("myCounter");
myCounter.Value = myCounter.Value + 1;
Log.Info($"Counter value: {myCounter.Value}"); // 2 после записи 1 выше; затем 3, 4, ...
```

From the outside, it behaves like a normal variable: you can read it, write it, and log it. Internally, the value is stored in a shared variable store that other scripts can also access.

## Getting a variable

- Variable of the current script:
  ```csharp
  var v = Variables.Get<float>("speed");
  v.Value = 1.5f;
  ```
- Variable of another aura or folder by path:
  ```csharp
  // В дереве должна существовать аура/папка по этому пути.
  var auraVar = Variables.Get<int>(@".\Gameplay\Bosses\Shaper", "attempts");
  auraVar.Value++;
  ```
- Variable when you already have an `IHasVariables`:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<string>(aura, "status");
  Log.Info($"Status: {auraVar.Value}");
  ```

## Choosing how to read a value

These rules are worth understanding once so you do not spend time debugging later.

- `Value`
  - If no value exists, it returns `default(T)`. This is not a universal guarantee against exceptions in custom conversions or serialization.
  - If the value is missing or the type does not fit, it returns `default(T)` (`0` for numbers, `false` for `bool`, `null` for reference types).
  - Assignment simply writes the value into storage.
  ```csharp
  var i = Variables.Get<int>("i");
  Log.Info(i.Value); // 0, если переменная не задана
  i.Value = 42;      // записали 42
  ```

- `HasValue`
  - `true` if a record is visible in the effective storage, including an inherited one, even if it is `null` for a reference type.
  - `false` if there is no record at all.
  ```csharp
  var s = Variables.Get<string>("name");
  Log.Info(s.HasValue); // зависит от того, была ли запись раньше
  s.Value = null;
  Log.Info(s.HasValue); // true, запись есть, но значение null
  ```

- `TryGetValue(out T value)`
  - Returns `true` only if a record exists, the value is not `null`, and it can be cast or converted to `T`.
  - Returns `false` if the record does not exist, the value is `null`, or the type is not compatible.
  ```csharp
  var f = Variables.Get<float>("ratio");
  if (f.TryGetValue(out var val))
  {
      Log.Info($"ratio = {val}");
  }
  else
  {
      Log.Info("ratio is not set or null or cannot be converted to float");
  }
  ```

- `GetOrThrow()`
  - Requires a defined value of the correct type.
  - Throws `InvalidOperationException` if the record does not exist, the value is `null`, or it cannot be cast or converted to `T`.
  ```csharp
  var required = Variables.Get<int>("port");
  var port = required.GetOrThrow(); // выбросит исключение, если нет записи, null или неверный тип
  ```

- `Remove()`
  - Removes the local override. It returns `true` if the name was visible before the call, including through an inherited value; `false` if the name was not found. Because of that, `true` does not prove that a local record was removed or that the effective value disappeared.
  - Only the local record is removed. If a parent has a value with the same name, it becomes visible again; otherwise `Value` returns `default(T)` and `HasValue` becomes `false`. `Listen()` receives the new effective value if it differs from the previous one.
  ```csharp
  var v = Variables.Get<int>("x").Set(10);
  v.Remove(); // локальное значение 10 удалено; при наличии родительского оно станет видимым
  Log.Info(v.Value);    // 0, если у родителя нет x
  Log.Info(v.HasValue); // false, если у родителя нет x
  ```

- Implicit conversion to `T`
  - You can write simply: `int i = myIntVar;`
  ```csharp
  var myIntVar = Variables.Get<int>("score").Set(5);
  int i = myIntVar; // 5
  var missing = Variables.Get<int>("missing");
  int j = missing;  // 0
  ```

- String representation
  - `v.ToString()` shows the name and current value, or `"<not set>"` if the record does not exist.
  ```csharp
  var a = Variables.Get<int>("a");
  Log.Info(a.ToString()); // "a = <not set>"
  a.Value = 10;
  Log.Info(a.ToString()); // "a = 10"
  ```

## Types and conversion

`ScriptVariable<T>` first tries to read the value as-is, then tries to convert it. Conversion is handled through the internal converter repository, `IBindingValueConverterRepository`.

- If the value already has type `T`, it is returned as-is.
- If it is a different type but there is a converter to `T`, the converted value is returned.
- When the target is a string (`T == string`), almost any type works — it returns `value.ToString()`.
- For `Nullable<T>`, conversion targets the underlying type.
- If the value is `null`, `TryGetValue` returns `false`, and `Value` returns `default(T)`.
- If no conversion is found for `TryGetValue`, it returns `false`, and `Value` returns `default(T)`.

**Implementation limitation:** in the version discussed here, after checking the exact type, `GetOrThrow()` passes an `AuraVariable` wrapper to the converter, while `TryGetValue()` and `Listen()` pass its `Value`. So you should not assume identical conversion behavior. For required parameters, store the correct type directly. Between `AssemblyLoadContext` instances, there is also a separate attempt to convert same-named value types through JSON; that can throw exceptions and is not intended for arbitrary classes.

The examples below assume you have not registered your own custom conversions for these names.

```csharp
// 1) Типы совпадают — всё просто
Variables.Get<int>("n").Set(123);
Log.Info(Variables.Get<int>("n").Value); // 123

// 2) Чтение как другого типа
((EyeAuras.Scripting.UserSpace.IScriptVariable)Variables.Get<int>("mix")).Value = "abc"; // записали строку в обход типобезопасности
var v = Variables.Get<int>("mix");
Log.Info(v.Value);                  // 0 — default(int)
Log.Info(v.TryGetValue(out var x)); // false
// v.GetOrThrow(); // throws InvalidOperationException

// 3) Почти всё можно превратить в string
((EyeAuras.Scripting.UserSpace.IScriptVariable)Variables.Get<string>("text")).Value = 42;
Log.Info(Variables.Get<string>("text").Value); // "42"
```

Tip: if you need a specific conversion, register a converter in `IBindingValueConverterRepository`. After that, `TryGetValue` and `Value` will return the type you expect.

## Watch for changes and dispose subscriptions

If you need to reactively track variable changes, use `Listen()`.

- Returns `IObservable<T>`.
- Immediately emits the current value, or `default(T)` if no record exists.
- Then emits only genuinely new values via `DistinctUntilChanged`.
- `Remove()` changes the effective value: it becomes the parent value, or `default(T)` if there is no parent value.

Example:

```csharp
using System.Collections.Generic;
using System.Reactive.Linq;

{
    var hp = Variables.Get<int>("batchExample.hp");
    var observed = new List<int>();
    using var sub = hp.Listen().Subscribe(x => {
        Log.Info($"HP: {x}");
        observed.Add(x);
    });

    hp.Value = 100; // HP: 100
    hp.Value = 100; // not emitted (distinct)
    hp.Value = 90;  // HP: 90
    hp.Remove();    // HP: 0, если у родителя нет batchExample.hp
}
```

Because of `using var`, the subscription stays active until the end of the block. If you want it to keep running until Stop, add a cancellable wait from the [async map](/scripting/api/scripting/async): a subscription by itself, or adding it to `ExecutionAnchors`, does not keep Run open. The initial value depends on the storage state; a missing record and an explicit `null` both produce `default(T)`. A parent value can also become visible again after removing the local one.

## Choosing an owner and understanding hierarchy

Every aura and folder is also a variable container. Variables follow the tree hierarchy: child items can see parent values and override them locally.

There are two ways to access them:

- By path:
  ```csharp
  var auraVar = Variables.Get<int>(@".\Something", "myCounter");
  auraVar.Value = 16;
  ```
- By object:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<int>(aura, "myCounter");
  auraVar.Value = 16;
  ```

The paths in these examples require that the tree item already exists. If it does not, `Get<T>(path, name)` throws an exception. `Get<T>(source, name)` uses the provided `IHasVariables` directly and does not search the tree.

Why this matters: you can define a default value on a folder, and all nested auras can read it. Where needed, you can override it locally. This is especially useful for shared settings such as the target window, input simulator, and similar values.

One detail worth knowing: variables with the `default.` prefix are often used as base values across the whole tree. For example, overriding `default.WindowSelector.TargetWindow` affects window selection in all nested items.

## Operators and small conveniences

For convenience, `ScriptVariable<T>` also supports operators and implicit conversions.

- Implicit conversion to `T`:
  ```csharp
  var score = Variables.Get<int>("score").Set(5);
  int current = score; // 5
  ```
- Value comparison:
  ```csharp
  var a = Variables.Get<int>("a").Set(3);
  var b = Variables.Get<int>("b").Set(3);
  if (a == b) { /* same values */ }
  if (a != b) { /* different values */ }
  ```
- For numeric comparisons, use `.Value`: the handle itself does not have `<` and `>` operators.
  ```csharp
  var x = Variables.Get<int>("x").Set(2);
  var y = Variables.Get<int>("y").Set(3);
  if (y.Value > x.Value) { /* yes, 3 > 2 */ }
  if (x.Value < 3) { /* yes */ }
  ```

## Typical scenarios

- A config script writes parameters, and a worker script reads them.
- Counters, delays, and intervals are preserved between runs.
- A cache of intermediate results is shared by several scripts.

Example of a `config -> worker` setup: create a `SharedConfig` folder in advance next to the contexts of both scripts, and use the same path in both. Calling `Variables.Get<T>(name)` without an owner works only with the current context and does not automatically connect two different scripts.

```csharp
// Config Script.csx — выполнить первым
var shared = AuraTree.GetFolderByPath(@".\SharedConfig");
Variables.Get<string>(shared, "target").Set("Shaper");
Variables.Get<int>(shared, "maxAttempts").Set(5);
```

```csharp
// Worker Script.csx — тот же владелец
var shared = AuraTree.GetFolderByPath(@".\SharedConfig");
var target = Variables.Get<string>(shared, "target").GetOrThrow();
var maxAttempts = Variables.Get<int>(shared, "maxAttempts").GetOrThrow();
for (var i = 0; i < maxAttempts; i++)
{
    Log.Info($"Try {i+1} on {target}");
}
```

## Common mistakes and how to avoid them

- “Why did `Value` return `0/false/null` instead of throwing?”
  - That is expected when the value is missing or conversion fails. If you need strict behavior, use `GetOrThrow()`.

- “`TryGetValue` returned `false` for `null` — is that a bug?”
  - No. For `TryGetValue`, `null` means “no usable value”. For reference types, `HasValue` is still `true` because the record exists, while `TryGetValue` is `false` because there is no actual value to return.

- “Why did `Listen()` not emit the same value a second time?”
  - Consecutive identical values are filtered out.

- “I removed a variable. What will `Listen()` emit?”
  - The parent value, or `default(T)` if there is no parent value. An event is sent only if the effective value actually changed.

## Recommendations

- Create a `ScriptVariable<T>` once and reuse it.
- For required parameters, read them through `GetOrThrow()`.
- For optional values, prefer `TryGetValue` over comparing with `default(T)`.
- Do not confuse `set null` with `Remove()`:
  - `set null` keeps the record (`HasValue == true`), but `TryGetValue == false`
  - `Remove()` deletes the local record; if a parent value exists, it becomes visible again
- For subscriptions, remember to call `Dispose()` on the returned `IDisposable` — usually with `using var ...`.
- Give variables clear names and stick to one naming style such as `snake_case` or `camelCase`.

## Quick API cheat sheet

```csharp
using System.Reactive.Linq;

{
    var v = Variables.Get<int>("n");

    // чтение/запись
    int x = v.Value;  // default, если значение отсутствует или преобразование не удалось
    v.Value = 10;     // запись

    // строгий сценарий
    var required = v.GetOrThrow(); // исключение, если нет значения/неверный тип/null

    // аккуратное чтение
    if (v.TryGetValue(out var val)) { /* ok */ } else { /* no value */ }

    // подписка на изменения
    using var sub = v.Listen().Subscribe(value => Log.Info($"n = {value}"));

    // удаление
    var removed = v.Remove();

    // прочее
    bool has = v.HasValue; // существует ли запись?
    string name = v.Name;
    var src = v.Source; // откуда читает/куда пишет
}
```

Do not confuse `v.TryGetValue(out value)` on the handle with `Variables.TryGetValue<T>(name, out value)` on the accessor. The second one performs a direct cast of the stored object and may throw if the type is incompatible. For the full overload list, see [IVariablesScriptingApi](/scripting/api/IVariablesScriptingApi), and for SDK/reference navigation see the [variables map](/scripting/api/scripting/variables).