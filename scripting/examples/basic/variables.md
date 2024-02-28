---
title: Variables
description: An overview of different types of variables in EyeAuras and how they are used for data storage and transfer between scripts.
published: true
date: 2024-02-20T23:15:47.075Z
tags: eyeauras, scripting, variables, data storage, C#
editor: markdown
dateCreated: 2024-02-20T22:05:21.584Z
---

# Why Variables?
Typically, your scripts will not run indefinitely; they are not full-fledged programs with long lifecycles. Usually, a script is launched, performs a task, and then terminates.

In EyeAuras, there is a variety of data storage options. Let's explore from short-lived to long-lasting.

# Local Variables
There's nothing complicated here - these variables exist only as long as the method/code block is running. There are no special features here.
```csharp
var test = 123;
```

# Sandbox Properties
Since your script is a class in C#, you can declare properties and assign values to them. The unique feature is that the values of these properties persist until the script changes. As soon as you make a change, the script will be recompiled, and all values stored in the properties will be lost. It's very convenient for storing things that need to be initialized only once and then used throughout the script's lifetime.

```csharp
int MyCounter { get; set; }

// lots of your code here

MyCounter = 16;

// more code here

Log.Info($"Counter: {MyCounter}");

```

# Script/Aura/Folder Variables
Here is where non-standard things begin, which are part of the EyeAuras architecture. For long-term storage (even between program runs in the near future), you can store data in auras, folders, and trees. To view the current variable values, select an aura or folder and open the `Variables` tab. There you can see the type, current value, last update time, etc. Editing is not possible yet, only deletion.
The main purpose of such variables is to transfer data from one script to another, store user configurations, etc.

![Variables](https://i.imgur.com/J9n7GkS.png)

# Script Variables - Variables API
A script can read and write variables that not only persist between script changes but are also accessible for **other scripts**. This is one way to transfer data and settings between scripts.
For example, one of your scripts can handle configuration, while another can perform tasks using that configuration.

So, your scripts running in the [sandbox](/ru/scripting/sandbox) environment, by default, have access to the [Variables](/ru/scripting/api/IVariablesScriptingApi) property.
```csharp
Log.Info($"Variables count: {Variables.Count}");
```
There are quite a few methods available, but we'll focus on two main ways. It's an associative array, meaning you can read and write using strings.

Let's start by writing something there.
```csharp
Variables["myCounter"] = 1; // write 1 to the variable named myCounter
Log.Info($"Counter value: {Variables["myCounter"]}"); // read the value of the myCounter variable, which will be 1
```

The downside of this approach is that if we need to know the data type we are working with, we need to cast it to the correct type because this information will be lost upon saving.
```csharp
Variables["myCounter"] = 1; // write 1 to the variable named myCounter
// Variables["myCounter"] = Variables["myCounter"] + 1; // won't work and will throw an error!

Variables["myCounter"] = (int)Variables["myCounter"] + 1; // this will work
Log.Info($"Counter value: {Variables["myCounter"]}"); // myCounter will be 2
```

**C#** is not **Python**; it's important for C# to know the data types it's working with. However, constantly casting to the correct type is inconvenient. Here, the helper class `ScriptVariable<T>` comes to the rescue, allowing you to specify the **name** and **type** of the variable once and then work with it directly.

```csharp
var myCounter = Variables.Get<int>("myCounter"); // initialize an int variable named myCounter
myCounter.Value = myCounter.Value + 1; // increase the value by 1
Log.Info($"Counter value: {myCounter}"); // myCounter will be 2, 3, etc.
```

In this approach, you only need to declare the variable once, similar to local variables, and then work with them without worrying about mixing up names or types.

# Aura/Folder Variables
Just like a script, each aura and folder also serve as containers for storing any variables. Knowing the path to an aura/folder allows you to access its variables. The [Variables](/ru/scripting/api/IVariablesScriptingApi) has two methods `ScriptVariable<T> Get<T>(string auraPath, string variableName);` and `ScriptVariable<T> Get<T>(IHasVariables source, string variableName);`, which can be used to read and write variables from any source.

## Option 1
```csharp
var auraVariable = Variables.Get<int>(@".\Something", "myCounter");
auraVariable.Value = 16;
```
Specify where to find the aura/folder/tree, and the program will handle the rest.

## Option 2
```csharp
var aura = AuraTree.GetAuraByPath(@".\Something");
var auraVariable = Variables.Get<int>(aura, "myCounter");
auraVariable.Value = 16;
```
First, find the aura/folder and then specify to read the variables from it.

# Hierarchy
All aura and folder variables follow a hierarchy. If you enter a value for a variable at the folder level, all child folders and auras will have access to that value. It also supports the ability to override values. The closest analogy to this structure is [CSS](https://en.wikipedia.org/wiki/CSS) in HTML.
This structure allows for flexible settings propagation to all child auras. EyeAuras uses this feature to pass default values deep into the tree, such as the window to attach to, the simulator to use for input, etc.
p.s. By overwriting, for example, `default.WindowSelector.TargetWindow`, you will affect how the default window is selected in all nested auras.

# Blackboard aka Tree Variables
> TBA
{.is-warning}