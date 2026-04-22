---
title: Интерфейс IAuraTreeScriptingApi
description: Справка по скриптовому интерфейсу `IAuraTreeScriptingApi`.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, triggers, behavior trees, actions, folders, aura tree, ai-translated
editor: markdown
dateCreated: 2024-02-20T20:28:29.069Z
---
> Навигация для AI-first сценариев: см. [AI Scripting Runtime](./scripting/runtime), [AI Auras Overview](./auras/overview) и [AI Aura Entities](./auras/entities). Там описаны навигация по дереву, сущности, регистрация и инфраструктура runtime.
{.is-info}

# IAuraTreeScriptingApi

`IAuraTreeScriptingApi` дает доступ к Aura Tree из скриптов. С его помощью можно работать с аурами, папками и деревьями поведения: либо безопасно искать их, либо получать напрямую и обрабатывать ошибки через исключения.

Интерфейс также предоставляет коллекции всех доступных аур, папок и behavior trees, а еще позволяет получать конкретные триггеры и действия из ауры по пути.

```csharp
public interface IAuraTreeScriptingApi : IScriptingApi
```

## Как работает поиск по пути

API поддерживает два варианта поиска:

- `Find...ByPath(...)` — возвращает `null`, если объект не найден
- `Get...ByPath(...)` — выбрасывает исключение, если объект не найден

Во всех случаях `path` может быть как абсолютным, так и относительным.

## Свойства

### Aura

Ссылка на ауру, в которой находится текущий скрипт, или `null`, если такой ауры нет.

```csharp
IAuraAccessor Aura { get; }
```

### Folder

Ссылка на папку, в которой находится текущий скрипт.

```csharp
IFolderAccessor Folder { get; }
```

### Folders

Содержит все папки в Aura Tree.

```csharp
IObservableList<IFolderAccessor> Folders { get; }
```

### Auras

Содержит все ауры в Aura Tree.

```csharp
IObservableList<IAuraAccessor> Auras { get; }
```

### BehaviorTrees

Содержит все деревья поведения в Aura Tree.

```csharp
IObservableList<IBehaviorTreeAccessor> BehaviorTrees { get; }
```

## Методы для аур

### FindAuraByPath(string path)

Ищет ауру по пути. Возвращает `null`, если ничего не найдено.

```csharp
IAuraAccessor FindAuraByPath(string path);
```

**Пример:**

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

### GetAuraByPath(string path)

Получает ауру по пути. Если ничего не найдено, выбрасывает исключение.

```csharp
IAuraAccessor GetAuraByPath(string path);
```

**Пример:**

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

## Методы для папок

### FindFolderByPath(string path)

Ищет папку по пути. Возвращает `null`, если ничего не найдено.

```csharp
IFolderAccessor FindFolderByPath(string path);
```

**Пример:**

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

### GetFolderByPath(string path)

Получает папку по пути. Если ничего не найдено, выбрасывает исключение.

```csharp
IFolderAccessor GetFolderByPath(string path);
```

**Пример:**

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

## Методы для behavior trees

### FindBehaviorTreeByPath(string path)

Ищет дерево поведения по пути. Возвращает `null`, если ничего не найдено.

```csharp
IBehaviorTreeAccessor FindBehaviorTreeByPath(string path);
```

**Пример:**

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

### GetBehaviorTreeByPath(string path)

Получает дерево поведения по пути. Если ничего не найдено, выбрасывает исключение.

```csharp
IBehaviorTreeAccessor GetBehaviorTreeByPath(string path);
```

**Пример:**

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

## Доступ к триггерам и действиям

Эти методы позволяют получить триггер или действие нужного типа из ауры по пути.

### GetTriggerByPath<TTrigger>(string path)

Получает триггер указанного типа.

Выбрасывает `ArgumentException`, если:

- триггер указанного типа не найден по заданному пути
- в ауре вообще нет триггеров

```csharp
public TTrigger GetTriggerByPath<TTrigger>(string path) where TTrigger : IAuraTrigger;
```

**Параметр типа:**

- `TTrigger` — тип триггера, который нужно получить

**Пример:**

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

### GetActionByPath<TAction>(string path)

Получает действие указанного типа.

Выбрасывает `ArgumentException`, если:

- действие указанного типа не найдено по заданному пути
- в ауре вообще нет действий

```csharp
public TAction GetActionByPath<TAction>(string path) where TAction : IAuraAction;
```

**Параметр типа:**

- `TAction` — тип действия, которое нужно получить

**Пример:**

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