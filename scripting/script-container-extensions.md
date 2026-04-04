---
title: Script Container Extensions
description: How to register custom services and connect modular libraries in EyeAuras scripts
published: true
date: 2026-04-02T15:30:00.000Z
tags: c#, scripting, dependency-injection, ai-translated
editor: markdown
dateCreated: 2026-04-02T15:30:00.000Z
---
# Script Container Extensions

`ScriptContainerExtension` is the way to register your own services, helper classes, and APIs in a script’s DI container.

Put simply:

- a regular `GetService<T>()` gives you a service that is already registered
- `ScriptContainerExtension` lets you **add new registrations**
- `AddNewExtension<T>()` is how you connect such an extension at script runtime

This is especially useful if you:

- move code into separate classes and libraries
- build your own mini-app or a larger pack
- use modular packages like ImGui or Frida
- want your helper classes to be created through DI instead of `new`

## Why you need it

EyeAuras already gives you a sandbox and a set of built-in services. But sometimes you want to add your own things to the container, for example:

- `IMyHelper -> MyHelper`
- `IBotState -> BotState`
- `IFridaExperimentalApi -> FridaExperimentalApi`
- `IImGuiExperimentalApi -> ImGuiExperimentalApi`

That is exactly what `ScriptContainerExtension` is for.

Without it, you usually run into one of two problems:

- you have to build the whole object graph manually with `new`
- or the container simply does not know about the service you need

## Where it fits in the architecture

Each script has its own sandbox and an associated DI container.

Inside that, there is also `IScriptingApiContext`. This is an internal context object that stores:

- the Roslyn `Solution`
- the container
- the workspace version
- `Anchors` for resources in that context

Normally, you do not create `IScriptingApiContext` manually. But the idea is useful to understand: container extensions extend this service layer, and `GetService<T>()` works on top of it.

## The key point: `Script.csx` and regular classes

Inside `Script.csx`, you can write things like this directly:

```csharp
Log.Info("Hello");
var helper = GetService<MyHelper>();
```

But `MyHelper` is just a regular C# class. It does not have direct access to `Log`, `AuraTree`, `GetService<T>()`, or other sandbox features unless you pass them in yourself.

That is why container extensions are especially useful for related classes: they let DI create those classes and automatically inject their constructor dependencies.

## A realistic example from a game bot

In a real bot, an extension usually registers more than just a simple “counter” service.

A typical example looks like this:

- `IEntityManager` stores all objects around the character, the current target, entity caches, and memory read results
- `IGeodataManager` handles geodata and navigation
- `IBotBrain` makes decisions based on ready-made services
- the UI can live in ImGui or Blazor and read the same data

A simplified extension might look like this:

```csharp
public sealed class BotContainerExtensions : ScriptContainerExtension
{
    protected override void Initialize()
    {
        Container.AddNewExtensionIfNotExists<ImGuiContainerExtensions>();
        Container.AddNewExtensionIfNotExists<FridaContainerExtensions>();

        Container.RegisterSingleton<IEntityManager, EntityManager>();
        Container.RegisterSingleton<IGeodataManager, GeodataManager>();

        Container.RegisterType<IBotBrain, BotBrain>();
        Container.RegisterType<ILoginForm, ImGuiLoginForm>();
    }
}
```

Why this is a good example:

- `IEntityManager` makes sense as a `Singleton`, because it is the single source of truth for the whole bot
- the UI, combat logic, pathing, and debug tools can all read the same data from the same manager
- `IBotBrain` is often more convenient to register with `RegisterType` if you want a separate instance for a specific task

### Why `IEntityManager` is a typical singleton

In game bot terms, `EntityManager` is usually responsible for things like:

- the list of objects around the character
- the current target
- the player
- caches for mobs, NPCs, and loot
- refreshing the world snapshot for other subsystems

In practice, you almost always want **one instance for the entire bot**, not a separate one in every helper class.

If you create multiple `EntityManager` instances, it is very easy to end up with:

- several inconsistent caches
- unnecessary memory reads
- different parts of the bot seeing different versions of the world

That is why registering it with `RegisterSingleton<IEntityManager, EntityManager>()` is usually the most logical choice.

The interface might look like this:

```csharp
public interface IEntityManager
{
    ImmutableArray<EntitySnapshot> EntitiesAround { get; }
    EntitySnapshot? Target { get; }
    void Refresh();
}
```

And then in `Script.csx`, usage becomes very simple:

```csharp
AddNewExtension<BotContainerExtensions>();

var entities = GetService<IEntityManager>();
var brain = GetService<IBotBrain>();

Log.Info($"Entities around: {entities.EntitiesAround.Length}");
brain.Tick();
```

After that, `GetService<IEntityManager>()` and `GetService<IBotBrain>()` start working because the container extension has already registered everything they need.

## What `AddNewExtension<T>()` does

`AddNewExtension<T>()` tells the sandbox to:

- find the extension of the requested type
- add it to the container
- run its `Initialize()`
- register the new services

Minimal example:

```csharp
AddNewExtension<BotContainerExtensions>();
```

After that, you can resolve the services registered by that extension:

```csharp
var entities = GetService<IEntityManager>();
var brain = GetService<IBotBrain>();
```

## Why some libraries ask you to call `AddNewExtension<T>()` explicitly

Some packages use extensions as an **explicit opt-in**. In other words, the package is referenced, but its services are not registered until you ask for them.

That is how some modular SDKs work.

### ImGui

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"

using EyeAuras.ImGuiSdk;

AddNewExtension<ImGuiContainerExtensions>();

var imgui = GetService<IImGuiExperimentalApi>();
```

### Frida

```csharp
#r "nuget:EyeAuras.FridaSdk, 0.1.42"

using EyeAuras.FridaSdk;

AddNewExtension<FridaContainerExtensions>();

var frida = GetService<IFridaExperimentalApi>();
```

This is convenient because you only enable the subsystems your script actually needs.

Live examples:

- [Aim Trainer ML](/scripting/examples/advanced/aimtrainer-ml)
- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)

## `AddNewExtension<T>()` and `Container.AddNewExtensionIfNotExists<T>()` are not the same thing

The names are similar, but they are used in different places:

- `AddNewExtension<T>()` is called from `Script.csx` to connect an extension to the sandbox
- `Container.AddNewExtensionIfNotExists<T>()` is usually called **inside another extension** when one extension depends on another

So this:

```csharp
AddNewExtension<BotContainerExtensions>();
```

is script-level code.

And this:

```csharp
Container.AddNewExtensionIfNotExists<ImGuiContainerExtensions>();
```

is DI-container-level code inside the extension itself.

## How the runtime discovers `ScriptContainerExtension`

EyeAuras scans loaded assemblies and looks for classes that inherit from `ScriptContainerExtension`.

During script setup, the runtime can also:

- inspect properties on the script object
- fill properties marked with `[Dependency]`
- fill properties marked with `[Inject]`

So the extension is responsible for registering services, and the runtime helps you use those services inside the script.

## `[Inject]`, `[Dependency]`, and `GetService<T>()` alongside extensions

These mechanisms work well together.

But there is one practical detail to keep in mind:

- if a service is already registered by the time the script starts, it is convenient to use `[Inject]` or `[Dependency]`
- if you call `AddNewExtension<T>()` **directly inside `Script.csx`** and then want to get a newly registered service, the safest and clearest option is usually `GetService<T>()`

For example, this is correct and easy to understand:

```csharp
[Inject] public IAuraTreeScriptingApi AuraTree { get; init; } // built-in service

AddNewExtension<BotContainerExtensions>();

var entities = GetService<IEntityManager>();
Log.Info($"Entities around: {entities.EntitiesAround.Length}");
```

Practical rule of thumb:

- `[Inject]` and `[Dependency]` are great for services that are already available
- after a manual `AddNewExtension<T>()`, it is usually more convenient to call `GetService<T>()` right away

## Important detail: use the container, not `new`

If a class depends on other services, it is better not to write this:

```csharp
var entityManager = new EntityManager(game);
```

Sometimes that works, but it quickly turns into manual dependency wiring.

This is better:

```csharp
var entityManager = GetService<IEntityManager>();
```

Then DI can build the object for you and pass in its dependencies automatically.

## A more complete example

A larger extension can do more than just register its own services. It can also connect other extensions.

The simplified idea looks like this:

```csharp
public sealed class BotContainerExtensions : ScriptContainerExtension
{
    protected override void Initialize()
    {
        Container.AddNewExtensionIfNotExists<ImGuiContainerExtensions>();
        Container.AddNewExtensionIfNotExists<FridaContainerExtensions>();
        Container.AsServiceCollection().AddAiServices();

        Container.RegisterSingleton<IEntityManager, EntityManager>();
        Container.RegisterSingleton<IBotControllers, BotControllers>();
        Container.RegisterType<IBotBrain, BotBrain>();
        Container.RegisterType<IProfileManager, ProfileManager>();

        Container.AsServiceCollection().AddBzGui();
    }
}
```

So one extension can become the main entry point for a large set of libraries, bot services, and UI.

## When it is actually worth using

Container extensions are especially useful if:

- you already have several related classes
- you want proper DI-based object construction
- you are building your own SDK or reusable helper library
- you are creating a modular UI or an integration with an external engine

If you only have a tiny 20-line script, it is often simpler not to overcomplicate things and just use `GetService<T>()` directly in `Script.csx`.

## How this relates to packs and mini-apps

For larger solutions, container extensions are especially convenient because they help you:

- keep the code modular
- move logic out of a single file into proper classes
- connect SDKs on demand
- assemble the same set of services both in a regular script and in a mini-app

This is a good middle layer between a small `Script.csx` and a full application.

## What to read next

- [FAQ and best practices](/scripting/best-practices)
- [Dependency Injection](/scripting/dependency-injection)
- [Sandbox](/scripting/sandbox)
- [ImGui getting started](/scripting/imgui/getting-started)
- [Mini-app](/features/mini-app)