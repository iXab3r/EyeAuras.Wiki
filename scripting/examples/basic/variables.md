---
title: Variables
description: Variable usage and reference
published: true
date: 2026-11-06T00:00:00.000Z
tags: eyeauras, scripting, variables, data storage, C#, ai-translated
editor: markdown
dateCreated: 2024-02-20T22:05:21.584Z
---
# Keep a counter between script runs

In this example every **Run** increases a counter, and editing the script code does not reset it. For that, the value is written through **Variables** to its owner's storage, not to a local C# variable.

You need your own editable **C# Script**. The examples run in its top-level **Script.csx**, where EyeAuras provides **Variables**, **AuraTree** and **Log**. Ordinary classes get the services they need passed in.

1. Create a new C# Script action. Neither it nor its ancestors should have a `myCounter` variable yet.
2. Replace its code with this typed counter:

```csharp
var myCounter = Variables.Get<int>("myCounter"); // get a typed handle to myCounter
myCounter.Value = myCounter.Value + 1; // increment its stored value
Log.Info($"Counter value: {myCounter.Value}"); // A fresh owner produces 1, then 2, then 3.
```

3. Click **Run**. The integer variable does not exist yet, so it reads as `0`. After the write, the log shows `Counter value: 1`.
4. Click **Run** again and you get `Counter value: 2`. Add a comment to the code, wait for it to compile and run it once more. The value keeps growing as long as the variable owner stays the same.
5. Open **Variables** for the selected owner and find the entry and its value there.

The current editor also has **Add variable...**, value editing with **Save**, and deletion with **Remove**. Editing a value by hand can change its type.

## Choose the data lifetime

| Storage | Lifetime and scope |
| --- | --- |
| Local C# variable | Lives only until its block or method ends. |
| [Sandbox](/en/scripting/sandbox) field or property | Lives between runs of one sandbox instance. Recompiling or recreating the instance resets the fields. |
| Variables in the current script context | An entry on the owner that survives recompilation. Another action that uses the same variable name does not necessarily use the same owner. |
| Aura or folder variable | Data on the selected tree item, inherited by its descendants. Several scripts can address a common owner explicitly. |

Simple supported values are saved with the configuration. That does not make an arbitrary .NET object fit for saving to disk.

<details>
<summary>Local values, sandbox properties and the indexer</summary>

A local variable cannot keep a counter between runs:

```csharp
var test = 123;
```

A property lives longer, but only within one sandbox instance. This separate example writes 16 every time instead of incrementing:

```csharp

int MyCounter { get; set; }

// other code can go here

MyCounter = 16;

// more code can go here

Log.Info($"Counter: {MyCounter}");

```

To log the number of entries in the current context:

```csharp
Log.Info($"Variables count: {Variables.Count}");
```

The indexer works with **object**. This fragment overwrites the value with 1 every time:

```csharp
Variables["myCounter"] = 1; // write 1 to myCounter
Log.Info($"Counter value: {Variables["myCounter"]}"); // read myCounter; this is 1
```

So arithmetic needs a cast. This standalone fragment first writes 1, then gets 2:

```csharp
Variables["myCounter"] = 1; // write 1 to myCounter
// Variables["myCounter"] = Variables["myCounter"] + 1; // object arithmetic does not compile

Variables["myCounter"] = (int)Variables["myCounter"] + 1; // explicitly cast the stored value
Log.Info($"Counter value: {Variables["myCounter"]}"); // myCounter is now 2
```

The typed `Variables.Get<int>` from the main example sets the name and type once. Its **Value** reads and writes the storage. You do not need to call Dispose on the handle.

</details>

## Share a value with another aura

Create your own aura **Something** next to the script. Below are two **alternative** fragments. Both write 16 to its `myCounter` and do not go on incrementing the current script's counter.

By relative path:

```csharp
// Create an aura named Something beside the script.
var auraVariable = Variables.Get<int>(@".\Something", "myCounter");
auraVariable.Value = 16;
```

Or through a resolved item:

```csharp
var aura = AuraTree.GetAuraByPath(@".\Something");
var auraVariable = Variables.Get<int>(aura, "myCounter");
auraVariable.Value = 16;
```

The path is counted from the current tree context. The exact overloads are in the [Variables API](/en/scripting/api/IVariablesScriptingApi).

To watch the shared value without rereading the log, use the [on-screen variables table](/en/scripting/examples/basic/print-variables-on-screen). Set its source to the same aura the script writes to and add the variable name to its rows.

## Inherit a folder value

A folder's value is available to its descendants. A local entry with the same name overrides the inherited one. Remove the local entry and the ancestor's value shows again. This is like [CSS inheritance](https://en.wikipedia.org/wiki/CSS): the nearer setting wins.

Default values spread the same way. For example, **default.WindowSelector.TargetWindow** affects window selection in nested auras. Do not change such service names just to test a counter.

[Typed operations](/en/scripting/api/scripting/variables) explain how a missing entry, null, a type fallback and a change subscription differ. A complete example with a shared owner, **Remove()** and repeated Run is in the [owner and lifetime guide](/en/scripting/api/scripting/variable-lifecycle-operations).

Behaviour-tree Blackboard variables have their own context.
