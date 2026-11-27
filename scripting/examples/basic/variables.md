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

Suppose every **Run** should increase a counter, and editing the script should not reset it. Store the value with **Variables** on its owner, instead of a local C# variable.

Use your own editable **C# Script**. These examples run in top-level **Script.csx**, where EyeAuras supplies **Variables**, **AuraTree** and **Log**. Ordinary helper classes receive the services explicitly.

1. Create a new C# Script action whose context and ancestors have no `myCounter` variable yet.
2. Replace its code with this typed counter:

```csharp
var myCounter = Variables.Get<int>("myCounter"); // get a typed handle to myCounter
myCounter.Value = myCounter.Value + 1; // increment its stored value
Log.Info($"Counter value: {myCounter.Value}"); // A fresh owner produces 1, then 2, then 3.
```

3. Click **Run**. A missing integer value reads as `0`; after the write, the log should show `Counter value: 1`.
4. Run again to get `Counter value: 2`. Add a comment, wait for compilation and run once more. It should keep increasing while the variable owner stays the same.
5. Open **Variables** for the selected owner to find the entry and value. Do not delete someone else's configuration variables to try this example.

The current editor also provides **Add variable...**, value editing with **Save**, and deletion with **Remove**. This example writes through the script; a manual edit can change the stored type.

## Choose the data lifetime

| Storage | Lifetime and scope |
| --- | --- |
| Local C# variable | Until its block or method finishes. |
| [Sandbox](/en/scripting/sandbox) field or property | Between runs of that instance. Recompilation or recreating the instance resets fields. |
| Variables in the current script context | An owner entry that survives recompilation. Another action using the same name need not use the same owner. |
| Aura or folder variable | Data on a selected tree item, with inheritance for descendants. Several scripts can explicitly select a common owner. |

Supported simple values participate in saved configuration. A typed handle does not make every arbitrary .NET object persistable. Writing a variable also does not automatically run every aura: consumers must actually read or bind to it.

<details>
<summary>Local values, sandbox properties and the indexer</summary>

A local value does not keep a counter across runs:

```csharp
var test = 123;
```

A sandbox property lasts longer, but only within that instance. This separate example assigns 16 every time rather than incrementing:

```csharp

int MyCounter { get; set; }

// other code can go here

MyCounter = 16;

// more code can go here

Log.Info($"Counter: {MyCounter}");

```

Count visible entries in the current context with:

```csharp
Log.Info($"Variables count: {Variables.Count}");
```

The indexer returns **object**. This independent fragment overwrites the value with 1 each time:

```csharp
Variables["myCounter"] = 1; // write 1 to myCounter
Log.Info($"Counter value: {Variables["myCounter"]}"); // read myCounter; this is 1
```

Arithmetic therefore needs a cast. This separate fragment writes 1, then produces 2:

```csharp
Variables["myCounter"] = 1; // write 1 to myCounter
// Variables["myCounter"] = Variables["myCounter"] + 1; // object arithmetic does not compile

Variables["myCounter"] = (int)Variables["myCounter"] + 1; // explicitly cast the stored value
Log.Info($"Counter value: {Variables["myCounter"]}"); // myCounter is now 2
```

The main example's `Variables.Get<int>` establishes the name and type once. Its **Value** reads and writes the store; the handle itself needs no Dispose.

</details>

## Share a value with another aura

Create your own aura **Something** beside the script. These **alternative fragments** write 16 to its `myCounter`; they do not continue incrementing the current script's counter.

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

The path is relative to the current tree context, not global across EyePad tabs. The variable name alone does not select a shared owner. See [Variables API](/en/scripting/api/IVariablesScriptingApi) for exact overloads.

To watch a shared value without rerunning the log inspection, use the [on-screen variables table](/en/scripting/examples/basic/print-variables-on-screen). Set the table’s source to the same aura owner as the writer and include the variable’s name in its rows; that table explicitly observes the selected container.

## Inherit a folder value

A folder's value is visible to descendants. A local entry with the same name overrides it; removing that local entry exposes the ancestor's value again. Like [CSS inheritance](https://en.wikipedia.org/wiki/CSS), the nearer setting takes precedence.

Defaults use this mechanism too: **default.WindowSelector.TargetWindow** affects nested auras' default window selection. Do not change these service names to test a counter.

See [typed operations](/en/scripting/api/scripting/variables) to distinguish a missing entry, null, a type fallback and change subscriptions. [Owner and lifetime examples](/en/scripting/api/scripting/variable-lifecycle-operations) cover shared owners, **Remove()** and repeated Run. Subscriptions need their own cleanup and do not select a UI thread; none is needed for this counter.

Behaviour-tree Blackboard variables have their own context. This example does not create or configure them.
