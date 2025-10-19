---
title: Variables
description: usage in scripts
published: true
date: 2025-10-19T16:05:00.000Z
tags: 
editor: markdown
dateCreated: 2025-10-19T11:24:15.492Z
---

# Script variables in EyeAuras

## Why variables outside of code?
A typical script lives briefly: it starts, does the job, and exits. But sometimes you want to keep settings and results longer — across script restarts and even share them with other scripts. EyeAuras provides “external” variables — at the level of scripts, auras, and folders — for that.

Main use cases:
- store settings that rarely change
- exchange data between scripts (config in one, logic in another)
- see values in the UI on the Variables tab of an aura/folder

## Where the data can live
- Local variables — live within a method. The usual kind:
  ```csharp
  var x = 123;
  ```
- Sandbox properties — fields/properties of your script class. They persist until you change the code (after a change the script is recompiled and properties reset):
  ```csharp
  int MyCounter { get; set; }
  // ...
  MyCounter = 16;
  Log.Info($"Counter: {MyCounter}");
  ```
- Script/Aura/Folder variables — long-term storage, visible in the UI and available to other scripts. That’s what this article is about.

## How to work with script variables in general
In raw form, you can read/write variables via an indexer by string key:
```csharp
Variables["myCounter"] = 1;
Log.Info($"Counter: {Variables["myCounter"]}");
```
Cons: the type is lost, you need manual casting. In C#, that’s inconvenient and brittle.

Solution — ScriptVariable<T>: define name and type once, then work type-safely.
```csharp
var myCounter = Variables.Get<int>("myCounter");
myCounter.Value = myCounter.Value + 1;
Log.Info($"Counter value: {myCounter}"); // 2, 3, 4, ...
```
Looks like a regular variable: you read, write, log. But internally, the value is stored in a shared “variables store” accessible to other scripts.

## How to get a variable
- Variable of the current script:
  ```csharp
  var v = Variables.Get<float>("speed");
  v.Value = 1.5f;
  ```
- Variable of another aura/folder by path:
  ```csharp
  var auraVar = Variables.Get<int>(@".\Gameplay\Bosses\Shaper", "attempts");
  auraVar.Value++;
  ```
- Variable when you already have an IHasVariables:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<string>(aura, "status");
  Log.Info($"Status: {auraVar.Value}");
  ```

## The most important behavior of ScriptVariable<T>
Simple rules below — better to understand once than to debug for long.

- Value
  - Always safe to read: never throws.
  - If there’s no value or type doesn’t match — returns default(T) (0 for numbers, false for bool, null for reference types).
  - Assigning simply writes to the store.
  ```csharp
  var i = Variables.Get<int>("i");
  Log.Info(i.Value); // 0 if the variable is not set
  i.Value = 42;      // wrote 42
  ```

- HasValue
  - true if a record exists in the store (even if it’s null for a reference type).
  - false if there is no record at all.
  ```csharp
  var s = Variables.Get<string>("name");
  Log.Info(s.HasValue); // false, no record
  s.Value = null;
  Log.Info(s.HasValue); // true, record exists but value is null
  ```

- TryGetValue(out T value)
  - Returns true only if a record exists and the value is NOT null and can be cast/converted to T.
  - Returns false if the record is absent, the value is null, or the type doesn’t fit.
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

- GetOrThrow()
  - The only “unsafe” read.
  - Throws InvalidOperationException if the record is missing, value is null (for reference types), or cannot be cast/converted to T.
  ```csharp
  var required = Variables.Get<int>("port");
  var port = required.GetOrThrow(); // will throw if no record, null, or wrong type
  ```

- Remove()
  - Deletes the record from the store. Returns true if the record existed, false if it didn’t.
  - After Remove(), reading Value returns default(T), HasValue becomes false, and Listen() receives a “reset to default value”.
  ```csharp
  var v = Variables.Get<int>("x").Set(10);
  v.Remove(); // true
  Log.Info(v.Value);    // 0
  Log.Info(v.HasValue); // false
  ```

- Implicit conversion to T
  - You can write simply: int i = myIntVar;
  ```csharp
  var myIntVar = Variables.Get<int>("score").Set(5);
  int i = myIntVar; // 5
  var missing = Variables.Get<int>("missing");
  int j = missing;  // 0
  ```

- String representation
  - v.ToString() shows the name and current value, or "<not set>" if the record doesn’t exist.
  ```csharp
  var a = Variables.Get<int>("a");
  Log.Info(a.ToString()); // "a = <not set>"
  a.Value = 10;
  Log.Info(a.ToString()); // "a = 10"
  ```

## Types and conversions: what actually happens
ScriptVariable<T> first tries to read the value “as is”, then tries to convert it. Conversion is done via an internal converters repository (IBindingValueConverterRepository).

- If the value is already T — it’s returned as is.
- If it’s a different type but there’s a converter to T — it’s converted and returned.
- For string target (T == string) almost any type is acceptable — value.ToString() is returned.
- For Nullable<T> conversion goes to the underlying type.
- If the value is null, TryGetValue returns false, and Value returns default(T).
- If there’s no conversion — Value returns default(T), TryGetValue returns false, and GetOrThrow throws an exception.

Examples:
```csharp
// 1) Matching types — straightforward
Variables.Get<int>("n").Set(123);
Log.Info(Variables.Get<int>("n").Value); // 123

// 2) Reading as another type
((IScriptVariable)Variables.Get<int>("mix")).Value = "abc"; // write a string "bypassing" type safety
var v = Variables.Get<int>("mix");
Log.Info(v.Value);                  // 0 — default(int)
Log.Info(v.TryGetValue(out var x)); // false
// v.GetOrThrow(); // throws InvalidOperationException

// 3) Almost anything to string
((IScriptVariable)Variables.Get<string>("text")).Value = 42;
Log.Info(Variables.Get<string>("text").Value); // "42"
```

Tip: if you need a specific conversion, register a converter in `IBindingValueConverterRepository`. Then TryGetValue/Value will start returning your desired type.

## Subscriptions to changes: Listen()
Want to reactively respond to variable changes? Use Listen().
- Returns IObservable<T>.
- Emits the current value immediately (or default(T) if the record doesn’t exist).
- Then emits only truly new values (DistinctUntilChanged).
- Remove() emits a “reset” to default(T).

Example:
```csharp
var hp = Variables.Get<int>("hp");
var observed = new List<int>();
using var sub = hp.Listen().Subscribe(x => {
    Log.Info($"HP: {x}");
    observed.Add(x);
});

hp.Value = 100; // HP: 100
hp.Value = 100; // not emitted (distinct)
hp.Value = 90;  // HP: 90
hp.Remove();    // HP: 0 (default)
```

For reference types, the first value will be null, then new values, then null again on Remove() or if you set null.

## Aura and folder variables, value hierarchy
Each aura/folder is also a variables container. There’s a hierarchy: children “see” the parent’s values and can override them.

Two access methods:
- By path:
  ```csharp
  var auraVar = Variables.Get<int>(@".\Something", "myCounter");
  auraVar.Value = 16;
  ```
- Via object:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<int>(aura, "myCounter");
  auraVar.Value = 16;
  ```

Why this matters: set a “default” on a folder — all nested auras can read it. Where needed, override locally. Very convenient for shared settings (target window, input simulator, etc.).

Nuance: variables prefixed with `default.` are often used as “base values” across the tree. If you override, say, `default.WindowSelector.TargetWindow` — it will affect window selection in all nested items.

## Operators and niceties
For convenience there are operators and implicit conversions.

- Implicit conversion to T:
  ```csharp
  var score = Variables.Get<int>("score").Set(5);
  int current = score; // 5
  ```
- Value equality:
  ```csharp
  var a = Variables.Get<int>("a").Set(3);
  var b = Variables.Get<int>("b").Set(3);
  if (a == b) { /* same values */ }
  if (a != b) { /* different values */ }
  ```
- Numeric comparisons (when T is a comparable numeric type):
  ```csharp
  var x = Variables.Get<int>("x").Set(2);
  var y = Variables.Get<int>("y").Set(3);
  if (y > x) { /* yes, 3 > 2 */ }
  if (x < 3) { /* yes */ }
  ```

## Typical scenarios
- A “config script” writes parameters, a “worker script” reads them.
- Run counters, delays, intervals — persist between runs.
- Cache intermediate results needed by several scripts.

Example “config -> worker”:
```csharp
// Config script
Variables.Get<string>("target").Set("Shaper");
Variables.Get<int>("maxAttempts").Set(5);

// Worker script
var target = Variables.Get<string>("target").GetOrThrow();
var maxAttempts = Variables.Get<int>("maxAttempts").GetOrThrow();
for (var i = 0; i < maxAttempts; i++)
{
    Log.Info($"Try {i+1} on {target}");
}
```

## Common mistakes and how to avoid them
- “Why did Value return 0/false/null instead of throwing?”
  - By design: Value never throws. Use GetOrThrow() for strictness.

- “TryGetValue returned false for null — is that a bug?”
  - No. For TryGetValue, null means “value is absent”. For reference types HasValue will be true (record exists) while TryGetValue is false (because there’s no actual value).

- “Why didn’t Listen() emit the same value the second time?”
  - Consecutive identical values are filtered out.

- “I removed a variable, what will Listen() emit?”
  - default(T). For int — 0, for string — null, etc.

## Best practices
- Declare ScriptVariable<T> once and reuse it.
- For “required” parameters, read via GetOrThrow().
- For “optional” ones, prefer TryGetValue over checking against default(T).
- Don’t confuse set null and Remove():
  - set null — the record remains (HasValue == true), but TryGetValue == false.
  - Remove() — the record is gone (HasValue == false), Value returns default(T).
- For subscriptions, don’t forget to Dispose() the returned IDisposable (use using var ...).
- Give variables clear names and stick to a consistent format (e.g., snake_case or camelCase).

## Quick API “cheatsheet”
```csharp
var v = Variables.Get<int>("n");

// read/write
int x = v.Value;  // safe, default if no value/wrong type
v.Value = 10;     // write

// strict scenarios
var required = v.GetOrThrow(); // exception if missing/wrong type/null

// careful read
if (v.TryGetValue(out var val)) { /* ok */ } else { /* no value */ }

// subscribe to changes
using var sub = v.Listen().Subscribe(x => Log.Info($"n = {x}"));

// remove
var removed = v.Remove();

// misc
bool has = v.HasValue; // does the record exist?
string name = v.Name;
IHasVariables src = v.Source; // where it reads from/writes to
```
