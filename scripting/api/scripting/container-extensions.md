---
title: AI Scripting: Container Extensions
description: AI-first map for script DI composition, container extensions, service registration, and capability access.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, dependency-injection, container
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Script Container Extensions Discovery Map

Reference map for script-owned dependency injection, `ScriptContainerExtension`,
optional SDK registration, and the boundary between top-level script code and
ordinary C# classes.

## User Intents

- Register mini-app services inside a script project.
- Enable optional SDK packages such as ImGui or Frida.
- Move logic from `Script.cs` / `Script.csx` into regular classes.
- Build a reusable service graph for bot/UI/tool code.
- Share managers, state, readers, and UI services across multiple panels.
- Avoid manually constructing a large object graph with `new`.

## Concept Model

- Each script runtime has a sandbox and a DI container.
- Top-level script code is the composition root for script-host features.
- Ordinary C# classes do not automatically receive top-level script members.
- `ScriptContainerExtension` adds registrations to the script container.
- `AddNewExtension<T>()` attaches an extension from top-level script code.
- `Container.AddNewExtensionIfNotExists<T>()` is used inside one extension to
  opt into another extension.
- Optional SDK packages may be referenced but not registered until their
  container extension is added.
- Mini-app projects usually have one script-level extension that wires all
  domain services and optional SDK extensions.
- A script does not need a custom extension just because it has several local
  helpers. For small 300-500 line tools, direct setup in `Script.cs` / `Script.csx`
  can be clearer than a container layer.

## Host / Runtime Contexts

- Top-level script code can access script-host capabilities provided by the
  sandbox.
- A helper class should receive services through constructor parameters,
  explicit method parameters, or framework injection.
- A Razor component uses Blazor/DI patterns, not top-level script globals.
- App/plugin code should use its own composition root and only reuse scripting
  extensions when the host context supports them.
- Object-style action/trigger executors have their own executor base classes and
  should not assume top-level script members.

## API Details

- `ScriptContainerExtension` - base class for script DI extensions.
- `Initialize()` - override where registrations are added.
- `AuraScriptSandbox.AddNewExtension<T>()` - script-level extension opt-in.
- `UnityContainerExtensions.AddNewExtensionIfNotExists<T>()` - extension-level
  dependency opt-in.
- `IScriptingApiContext` - runtime context containing container, solution,
  workspace version, and context anchors.
- `[Inject]` - property injection style commonly used by components/services.
- `[Dependency]` - Unity-style property dependency marker used by runtime wiring.
- `Container.RegisterSingleton<TInterface, TImplementation>()` - one shared
  instance per container.
- `Container.RegisterType<TInterface, TImplementation>()` - normal DI-created
  instances.
- `Container.AsServiceCollection()` - bridge when a package exposes
  Microsoft.Extensions.DependencyInjection registrations.

## Common Flows

### Register Mini-App Services

1. Create a class derived from `ScriptContainerExtension`.
2. Add optional SDK extensions needed by the mini-app.
3. Register shared state/managers as singletons.
4. Register short-lived coordinators/tools as normal types.
5. Attach the extension from the top-level script.
6. Resolve or inject the registered services according to the current context.

### Enable Optional SDK Package

1. Add the package reference in the top-level script or project file.
2. Import the package namespace.
3. Add the package's container extension.
4. Resolve/use the package capability through DI or explicit construction.

### Move Code Into Classes

1. Keep host setup in the top-level script.
2. Put domain logic into ordinary classes.
3. Register those classes in the container.
4. Pass script APIs into constructors instead of reading host members directly.
5. Keep disposal ownership with the script run, sandbox, or app service.

## Prefer

- Prefer one clear mini-app composition extension over scattered registrations.
- Prefer constructor dependencies in ordinary classes.
- Prefer singletons for shared state such as entity caches, process readers, or
  app-wide configuration managers.
- Prefer normal types for task coordinators that should be independent per run.
- Prefer explicit extension opt-in for optional SDKs.
- Prefer small top-level scripts that only compose and start the mini-app.
- Prefer no custom container extension for small scripts unless shared services,
  optional SDK registration, or repeated setup make it useful.

## Avoid

- Avoid assuming `Log`, `AuraTree`, `Variables`, `Sleep`, or host cancellation
  members exist in ordinary C# classes.
- Avoid registering the same optional SDK extension repeatedly without an
  idempotent helper.
- Avoid using container extensions as a dumping ground for unrelated globals.
- Avoid hiding package requirements; optional SDKs still need package/reference
  setup.
- Avoid forcing one service access pattern everywhere. Use the pattern that fits
  the current host context.
- Avoid turning every script into an app framework. Add DI boundaries only when
  they remove real duplication or make lifetime ownership clearer.

## Research Anchors

- `ScriptContainerExtension`
- `AuraScriptSandbox`
- `IAuraScriptSandbox`
- `IScriptingApiContext`
- `AuraScriptingApiContext<TGlobals>`
- `AddNewExtension`
- `AddNewExtensionIfNotExists`
- `ScriptContainerExtensionScriptVisitor`
- `ScriptContainerExtensionRuntimeVisitor`
- `ImGuiContainerExtensions`
- `FridaContainerExtensions`
- `UnityContainer`
- `RegisterSingleton`
- `RegisterType`
- `AsServiceCollection`
- `InjectAttribute`
- `DependencyAttribute`

## Search Synonyms

- script DI
- dependency injection
- container extension
- composition root
- service registration
- mini-app services
- optional SDK registration
- constructor injection
- property injection
- Unity container
- script service graph

## Related Maps

- `scripting/runtime.md`
- `scripting/references-and-resources.md`
- `scripting/project-workflow.md`
- `core/app-runtime-contexts.md`
- `nuget/imgui-sdk.md`
- `nuget/frida-sdk.md`
