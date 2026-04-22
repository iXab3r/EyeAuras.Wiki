---
title: AI Core: App Runtime Contexts
description: AI-first map of runtime contexts used by scripts, modules, and application services.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, core
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

- `scripting/runtime.md`
- `core/app-modules.md`
- `core/eyeauras-structure.md`
- `windows-subsystems/blazor-windows.md`
