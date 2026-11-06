---
title: AI Core: App Runtime Contexts
description: AI-first map of runtime contexts used by scripts, modules, and application services.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, core, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# App Runtime Contexts Discovery Map

Reference map for separating EyeAuras host code, SDK-only code, top-level
scripts, ordinary C# helper classes, object-style executors, and Razor
components.

## User Intents

- Understand where dependency access is available.
- Move code from a script file into a helper class.
- Decide whether a service must be passed explicitly.
- Distinguish app/plugin module code from script project code.

## Concept Model

- Top-level script code runs with host-provided capabilities.
- Ordinary C# files next to a script compile as normal classes and do not
  automatically inherit script host members.
- Object-style action/trigger executors receive context through their base
  classes.
- Razor components use Blazor `[Inject]` and component lifecycle rules.
- App/plugin code uses the application DI/module system.
- SDK-only code can reference contracts but cannot assume a live host.

## Pass a host capability to a helper

Pass the current script's `IFluentLog` explicitly. Put the call in `Script.csx`;
the class can live in an ordinary `.cs` file in that project:

```csharp
var worker = new Worker(Log);
worker.Run();

public sealed class Worker
{
    private readonly PoeShared.Logging.IFluentLog log;
    public Worker(PoeShared.Logging.IFluentLog log) => this.log = log;
    public void Run() => log.Info("Worker started");
}
```

The script log receives `Worker started`. The class does not look up a global
`Log`; another caller can supply a different logger. Pass variable/tree APIs
and cancellation tokens in the same way.

## Choose service acquisition by runtime

| Context | Acquisition | Boundary |
| --- | --- | --- |
| Top-level script | Sandbox member or `GetService<T>()` | Registered containers and loaded extensions only |
| Ordinary C# class | Constructor or method argument | No implicit sandbox members |
| Razor component | `[Inject]` / `@inject` | Blazor host services; `DataContext` is passed separately |
| Application module | Application DI and Prism registration | The host initializes modules |
| Standalone SDK app | Explicit host/DI setup | Assembly references provide types, not running services |

`AuraScriptSandbox` resolves through its Unity container and registered related
contexts. This does not make every application service available to every script.
Check ownership for the actual registration; do not replace explicit cleanup
with an assumption that all resolved objects are automatically disposed.

## API Details

- `AuraScriptSandbox` / `IAuraScriptSandbox` - top-level script capability
  surface.
- `ScriptContainerExtension` - script-owned DI registration hook.
- `CsharpScriptActionExecutor` - object-style action entry point.
- `CsharpScriptTriggerExecutor` - object-style trigger entry point.
- `Prism.Modularity.IModule` - app/plugin module contract.
- `[Inject]` - Blazor component dependency injection attribute.
- `[Dependency]` - Unity property injection attribute used in some runtime
  classes.

## Prefer

- Pass dependencies into helper classes through constructors or parameters.
- Keep package-specific APIs documented in `nuget/`.
- Use app modules for app/plugin registrations.

## Avoid

- Avoid assuming `Log`, `AuraTree`, `Variables`, or `cancellationToken` are
  available in ordinary helper classes.
- Avoid using script-only dependency access patterns from Razor components.

## Search Synonyms

- top-level script
- helper class
- ordinary C# class
- script globals
- app module
- plugin module
- Blazor component injection
- object-style action
- object-style trigger

## Related Maps

- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [core/app-modules.md](/en/scripting/api/core/app-modules)
- [core/eyeauras-structure.md](/en/scripting/api/core/eyeauras-structure)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)


## Choose a context for an operation

Use [JS/DOM](blazor-js-operations) through an injected Razor service after the
DOM exists. For [serialization](configuration-operations), top-level C# Actions
resolve `IConfigSerializer` with `GetService`, while helpers accept it explicitly.
The [file provider](../scripting/file-provider-operations) distinguishes a
borrowed service from a stream owned by its caller.

[CsharpScriptActionExecutor](../auras/actions) and
[CsharpScriptTriggerExecutor](../auras/triggers) receive dependencies through
their base classes and container. This does not make `Variables` or `Log`
global identifiers in ordinary classes.
