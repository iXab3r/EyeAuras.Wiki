---
title: IAuraTreeScriptingApi
description: Reference for the `IAuraTreeScriptingApi` scripting interface.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, triggers, behavior trees, actions, folders, aura tree, ai-translated
editor: markdown
dateCreated: 2024-02-28T13:04:40.818Z
---

> AI-first navigation: see [AI Scripting Runtime](./scripting/runtime), [AI Auras Overview](./auras/overview), and [AI Aura Entities](./auras/entities) for tree navigation, entities, registration, and runtime infrastructure.
{.is-info}
# IAuraTreeScriptingApi

`IAuraTreeScriptingApi` provides access to the Aura Tree from scripts. It lets you work with auras, folders, and behavior trees, either by safely searching for them or by retrieving them directly and handling errors through exceptions.

The interface also exposes collections of all available auras, folders, and behavior trees, and lets you get specific triggers and actions from an aura by path.

```csharp
public interface IAuraTreeScriptingApi : IScriptingApi
```

## How path lookup works

The API supports two lookup patterns:

- `Find...ByPath(...)` — returns `null` if the item is not found
- `Get...ByPath(...)` — throws an exception if the item is not found

In all cases, the `path` can be either absolute or relative.

## Properties

### `Aura`

Reference to the aura that contains the current script, or `null` if there is no such aura.

```csharp
IAuraAccessor Aura { get; }
```

### `Folder`

Reference to the folder that contains the current script.

```csharp
IFolderAccessor Folder { get; }
```

### `Folders`

Contains all folders in the Aura Tree.

```csharp
IObservableList<IFolderAccessor> Folders { get; }
```

### `Auras`

Contains all auras in the Aura Tree.

```csharp
IObservableList<IAuraAccessor> Auras { get; }
```

### `BehaviorTrees`

Contains all behavior trees in the Aura Tree.

```csharp
IObservableList<IBehaviorTreeAccessor> BehaviorTrees { get; }
```

## Aura methods

### `FindAuraByPath(string path)`

Finds an aura by path. Returns `null` if it is not found.

```csharp
IAuraAccessor FindAuraByPath(string path);
```

**Example:**

```csharp
var aura = AuraTree.FindAuraByPath("MyFolder/Aura1");
if (aura != null)
{
    Log.Info("Aura found!");
}
else
{
    Log.Info("Aura not found.");
}
```

### `GetAuraByPath(string path)`

Gets an aura by path. Throws an exception if it is not found.

```csharp
IAuraAccessor GetAuraByPath(string path);
```

**Example:**

```csharp
try
{
    var aura = AuraTree.GetAuraByPath("MyFolder/Aura1");
    Log.Info("Aura found!");
}
catch (NotFoundException)
{
    Log.Info("Aura not found.");
}
```

## Folder methods

### `FindFolderByPath(string path)`

Finds a folder by path. Returns `null` if it is not found.

```csharp
IFolderAccessor FindFolderByPath(string path);
```

**Example:**

```csharp
var folder = AuraTree.FindFolderByPath("MyProject/Folders/Folder1");
if (folder != null)
{
    Log.Info("Folder found!");
}
else
{
    Log.Info("Folder not found.");
}
```

### `GetFolderByPath(string path)`

Gets a folder by path. Throws an exception if it is not found.

```csharp
IFolderAccessor GetFolderByPath(string path);
```

**Example:**

```csharp
try
{
    var folder = AuraTree.GetFolderByPath("MyProject/Folders/Folder1");
    Log.Info("Folder found!");
}
catch (NotFoundException)
{
    Log.Info("Folder not found.");
}
```

## Behavior tree methods

### `FindBehaviorTreeByPath(string path)`

Finds a behavior tree by path. Returns `null` if it is not found.

```csharp
IBehaviorTreeAccessor FindBehaviorTreeByPath(string path);
```

**Example:**

```csharp
var behaviorTree = AuraTree.FindBehaviorTreeByPath("MyProject/BehaviorTrees/Tree1");
if (behaviorTree != null)
{
    Log.Info("Behavior tree found!");
}
else
{
    Log.Info("Behavior tree not found.");
}
```

### `GetBehaviorTreeByPath(string path)`

Gets a behavior tree by path. Throws an exception if it is not found.

```csharp
IBehaviorTreeAccessor GetBehaviorTreeByPath(string path);
```

**Example:**

```csharp
try
{
    var behaviorTree = AuraTree.GetBehaviorTreeByPath("MyProject/BehaviorTrees/Tree1");
    Log.Info("Behavior tree found!");
}
catch (NotFoundException)
{
    Log.Info("Behavior tree not found.");
}
```

## Trigger and action access

These methods let you retrieve a trigger or action of a specific type from an aura by path.

### `GetTriggerByPath<TTrigger>(string path)`

Gets a trigger of the specified type.

Throws an `ArgumentException` if:

- the trigger of the specified type cannot be found at the given path
- the aura does not contain any triggers at all

```csharp
public TTrigger GetTriggerByPath<TTrigger>(string path) where TTrigger : IAuraTrigger;
```

**Type parameter:**

- `TTrigger` — the trigger type to retrieve

**Example:**

```csharp
try
{
    var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>("MyAuraPath");
    Log.Info($"Trigger found: {trigger.Name}");
}
catch (ArgumentException ex)
{
    Log.Info(ex.Message);
}
```

### `GetActionByPath<TAction>(string path)`

Gets an action of the specified type.

Throws an `ArgumentException` if:

- the action of the specified type cannot be found at the given path
- the aura does not contain any actions at all

```csharp
public TAction GetActionByPath<TAction>(string path) where TAction : IAuraAction;
```

**Type parameter:**

- `TAction` — the action type to retrieve

**Example:**

```csharp
try
{
    var action = AuraTree.GetActionByPath<ISendSequenceAction>("MyAuraPath");
    Log.Info($"Action found: {action.Name}");
}
catch (ArgumentException ex)
{
    Log.Info(ex.Message);
}
```