---
title: Variables
description: Variable usage and reference
published: true
date: 2026-11-06T00:00:00.000Z
tags: eyeauras, scripting, variables, data storage, C#, ai-translated
editor: markdown
dateCreated: 2024-02-20T22:05:21.584Z
---
# Storing data in EyeAuras scripts

Most scripts are not meant to run forever. They are not full applications with a multi-hour lifecycle. Usually, a script starts, does its job, and exits.

EyeAuras gives you several ways to store data. Below, they are ordered from the shortest-lived to the longest-lived.

The examples below run inside an EyeAuras C# Script. `Variables`, `AuraTree`, and `Log` are provided by the host. In a regular C# class, you need to pass the corresponding services explicitly.

## Local variables

Nothing special here. These variables live only until the current method or code block finishes.

```csharp
var test = 123;
```

## Sandbox properties

Your script is a C# class, so you can declare properties and assign values to them.

These values persist between runs of the same [sandbox](/scripting/sandbox) instance. After a code change and recompilation, or after the sandbox is recreated for any other reason, the values are lost. This is useful for things that should be initialized once and then reused for the lifetime of that sandbox. No disk write happens here.

```csharp

int MyCounter { get; set; }

// здесь много-много вашего кода

MyCounter = 16;

// здесь еще больше кода

Log.Info($"Counter: {MyCounter}");

```

## Script, aura, and folder variables

This is where EyeAuras-specific behavior begins.

If you need to keep data beyond a single script run, you can store it in scripts, auras, folders, and trees. To inspect current variable values, select an aura or folder and open the `Variables` tab. There you can see the type, current value, last update time, and more. Editing is not available yet, but you can delete variables.

The main use cases for this kind of storage are passing data from one script to another, keeping user configuration, and similar tasks.

![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/variables/J9n7GkS.png)

## Script variables and the Variables API

A script can read and write variables that belong to its owner, and those variables survive script code changes. **Other scripts** can access them too, but only if they explicitly use the same owner. `Variables` without a path uses the current context, so the same variable name in two different scripts does not automatically mean shared storage.

For example, one script can manage configuration while another script uses that configuration to do the actual work.

Scripts running in the [sandbox](/scripting/sandbox) have access to the [Variables](/scripting/api/IVariablesScriptingApi) property by default:

```csharp
Log.Info($"Variables count: {Variables.Count}");
```

There are many methods there, but the two main approaches are the most important. At its core, this is a key-value store, so you can read and write values using string keys.

For example:

```csharp
Variables["myCounter"] = 1; // записываем 1 в переменную с именем myCounter
Log.Info($"Counter value: {Variables["myCounter"]}"); // считываем значение переменной myCounter, будет 1
```

The downside of this approach is that if you care about the data type, you need to cast it yourself. The indexer returns `object`, even if the stored value is actually an `int`.

```csharp
Variables["myCounter"] = 1; // записываем 1 в переменную с именем myCounter
// Variables["myCounter"] = Variables["myCounter"] + 1; // не сработает и выдаст ошибку!

Variables["myCounter"] = (int)Variables["myCounter"] + 1; // а вот это уже сработает
Log.Info($"Counter value: {Variables["myCounter"]}"); // в myCounter будет 2
```

**C#** is not **Python**. It needs to know what data types it is working with. Repeating casts all the time is inconvenient, so EyeAuras provides the helper class `ScriptVariable<T>`. It lets you define the **name** and **type** once, then work with the variable directly.

```csharp
var myCounter = Variables.Get<int>("myCounter"); // инициализируем переменную типа int с именем myCounter
myCounter.Value = myCounter.Value + 1; // увеличиваем значение на 1
Log.Info($"Counter value: {myCounter.Value}"); // в myCounter будет 2, 3 и т.п.
```

With this approach, you declare the variable once, almost like a local variable, and then keep using it without worrying as much about mixing up names or types later.

## Aura and folder variables

Just like a script, every aura and every folder can also store variables. If you know the path to an aura or folder, you can access its variables. [Variables](/scripting/api/IVariablesScriptingApi) provides two methods for this:

- `ScriptVariable<T> Get<T>(string auraPath, string variableName);`
- `ScriptVariable<T> Get<T>(IHasVariables source, string variableName);`

Using them, you can read and write variables from any supported source.

### Option 1

```csharp
// Создайте рядом со скриптом ауру Something.
var auraVariable = Variables.Get<int>(@".\Something", "myCounter");
auraVariable.Value = 16;
```

Specify where to find the aura, folder, or tree, and EyeAuras does the rest.

### Option 2 — through a resolved aura

```csharp
var aura = AuraTree.GetAuraByPath(@".\Something");
var auraVariable = Variables.Get<int>(aura, "myCounter");
auraVariable.Value = 16;
```

First find the aura or folder, then tell `Variables` to work with that source.

## Hierarchy

Aura and folder variables follow a hierarchy. If you set a variable at the folder level, all child folders and auras can read that value. At the same time, any child can override it with its own value. The closest analogy is [CSS](https://en.wikipedia.org/wiki/CSS) in HTML.

This makes it easy to pass settings down through the tree. EyeAuras uses this for default values such as the target window to attach to, the simulator to use for input, and similar settings.

p.s. If you override `default.WindowSelector.TargetWindow`, you also change which default window will be used by all nested auras.

## Blackboard aka tree variables

> TBA
{.is-warning}

If you need to distinguish between a missing entry, `null`, and a default value, or if you want to subscribe to changes, see [typed variable operations](/scripting/api/scripting/variables). The descriptor itself does not guarantee that an arbitrary object can be saved to disk.

For a complete example of inheritance, reverting to the folder value after `Remove()`, and comparing state across repeated `Run` calls, see the [owner and lifetime guide](/scripting/api/scripting/variable-lifecycle-operations).