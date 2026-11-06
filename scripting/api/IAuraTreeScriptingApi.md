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

Paths without `./` or `../` start at the Aura Tree root; do not add a leading
separator. Relative paths start at the current object's `Context.Path`.
Both `/` and `\` are accepted on the Windows desktop host. These are tree
paths, not filesystem paths. `.` specially returns the current aura or folder
for the corresponding lookup; in an aura context, `Folder` is its parent folder.
Neither accessor is guaranteed in every host context.

`Find` can still throw for malformed paths or an inconsistent accessor cache.
In source `c8b2304`, `Get` throws `ArgumentException` when the lookup returns
null; the older XML example naming `NotFoundException` does not match that implementation.

## Properties

### `Aura`

Reference to the aura that contains the current script, or `null` if there is no such aura.

```csharp
IAuraAccessor Aura { get; }
```

### `Folder`

The current folder in a folder context, or the parent folder in an aura context. It can be null in other contexts.

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
catch (ArgumentException)
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
catch (ArgumentException)
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
catch (ArgumentException)
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
## Run a configured macro

In an EyeAuras C# Action, `AuraTree`, `Log`, and `cancellationToken` come from
the script host. Ordinary helper classes receive `IAuraTreeScriptingApi`
explicitly. Create an `Automation` folder and a `DailyRoutine` macro, then run:

```csharp
var macro = AuraTree.FindMacroByPath("Automation/DailyRoutine");
if (macro == null)
{
    Log.Info("Macro not found");
    return;
}
var status = await macro.ExecuteAsync(cancellationToken);
Log.Info($"Macro result: {status}");
```

`ExecuteAsync(CancellationToken)` returns
`Task<EyeAuras.BehaviorTree.Nodes.NodeStatus>` and passes the token to the tree's
`Tick`. Interpret `Success`, `Failure`, or `Running` explicitly; `Running` is not
success and does not request an automatic repeat. Cancellation also depends on
the participating nodes. `GetMacroByPath` requires an existing path and throws
`ArgumentException` when absent. The lookup methods work independently of the
`Macros` property, which is not initialized in this implementation.

## Component order and ownership

`GetTriggerByPath<T>` and `GetActionByPath<T>` return the first compatible
component of an existing aura. Actions are searched in `OnEnterActions`,
`WhileActiveActions`, then `OnExitActions` order. Use the appropriate collection
on [IAuraAccessor](./IAuraAccessor) to choose another component of the same type.
Configure the image-search trigger or input-sequence action before using the
examples above. For a one-off key press, use [SendInput](./ISendInputScriptingApi).

The collections and accessors are borrowed live tree objects; do not dispose
them. Dispose subscriptions created by your code, for example with the current
Run's `ExecutionAnchors`. Do not retain an accessor after its tree item is removed.
`IsActive` is nullable: null means unknown, not false. `IsLoaded` is independent.

```csharp
foreach (var aura in AuraTree.Auras.Items.ToArray())
{
    Log.Info($"{aura.FullPath}: loaded={aura.IsLoaded}, active={aura.IsActive}");
}
```

Contract and path resolution: [AuraTreeScriptingApi](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Scripting/AuraTreeScriptingApi.cs),
[AuraTreeService](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Core/Services/AuraTreeService.cs).
