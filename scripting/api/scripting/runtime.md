---
title: AI Scripting Runtime
description: AI-first map of EyeAuras scripting runtime concepts and constraints.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, runtime
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Scripting Runtime Discovery Map

Reference map for C# script projects, script-host capabilities, ordinary helper
classes, dependency access, accessors, variables, macros, and keybind metadata.

## User Intents

- Use script APIs to read or change auras, folders, macros, and variables.
- Find current aura/folder context.
- Move code from top-level script into helper classes.
- Register script-owned services.
- Bind script methods to hotkeys.
- Open script-owned UI or use optional SDK packages.
- Structure a large script project as an app-like system.

## Concept Model

- Top-level script code has host-provided capabilities.
- Top-level script code can use `Log` directly for diagnostics.
- `ExecutionAnchors` is a per-run disposal bucket; resources added there are
  disposed when the current script execution ends.
- Long-lived resources that should survive across script executions belong to
  the sandbox/script lifetime (`Anchors`) or to explicit app services instead.
- Ordinary C# files next to the script are normal classes.
- Helper classes need dependencies through constructors, explicit parameters, or
  script-owned DI.
- Helper classes do not get `Log` automatically; pass `IFluentLog` explicitly
  or create an ordinary type logger when appropriate.
- Accessors are script-safe handles for aura-tree objects.
- Object-style actions/triggers use executor base classes rather than top-level
  script members.
- Small mini-apps may stay in one `Script.cs` / `Script.csx` file when the code
  remains easy to scan. A rough 300-500 line file with local helpers is often
  preferable to an artificial service graph.
- Large projects should treat the top-level script as a composition root and
  move orchestration into regular services.

## Project / Solution Shape

- Script projects exported for IDE work are expected to be valid normal .NET
  projects.
- The main script project should compile with ordinary `dotnet build` unless
  the host-generated project files are incomplete or stale.
- Generated host stubs may throw at runtime outside EyeAuras, but they should
  still provide enough symbols for normal compilation, IDE navigation, and
  static analysis.
- A solution may contain multiple unrelated projects alongside the main script
  project.
- Extra projects can be helper libraries, tests, generators, tools, prototypes,
  or experiments.
- EyeAuras import/live-import should only pull the projects/files that belong to
  the script payload; do not assume every project in the solution is part of the
  runtime script.

## Disposable Scope In Top-Level Scripts

Namespace `using` directives are fine at the top of script files. Disposable
`using` statements/declarations in the executable top-level script body need an
explicit scope in the scripting runtime.

Safe choices:

- Wrap the executable script body in `{ ... }` and put `using var` declarations
  inside that block.
- Move the disposable code into a method/local function and call it from the
  top-level script.
- For one-off resources owned by the script run, skip `using` and attach the
  disposable to `ExecutionAnchors`.

For small scripts, a single `{ ... }` block is usually the simplest and clearest
option. Do not leave `using var` declarations directly in the root executable
script body just because the exported IDE project compiles.

## API Details

- `AuraScriptSandbox` / `IAuraScriptSandbox` - top-level host capability object.
- `IFluentLog` - logging interface exposed as `Log` in top-level script code
  and passed explicitly into ordinary helper classes.
- `IAuraTreeScriptingApi` - tree navigation and lookup API.
- `IAuraAccessor` - aura handle with action lists and execution helpers.
- `IFolderAccessor` - folder handle.
- `IMacroAccessor` - macro execution handle.
- `IBehaviorTreeAccessor` - behavior-tree handle.
- `IVariablesScriptingApi` - typed script variable access.
- `ScriptVariable<T>` - typed variable handle.
- `ExecutionAnchors` - per-run `CompositeDisposable` for subscriptions,
  windows, trackers, and other resources that should die when the current run
  stops.
- `KeybindAttribute` - method-level hotkey metadata.
- `ScriptContainerExtension` - script-owned DI extension.
- `CsharpScriptActionExecutor` - object-style action base.
- `CsharpScriptTriggerExecutor` - object-style trigger base.
- `AuraScriptRunner<TSandbox>` - custom script runner with typed globals.
- `AuraScriptSandbox` - base class for custom script globals/sandbox APIs.
- `IHostedService` - useful coordinator contract for long-running script apps.

## Common Flows

- Use a service in a helper class:
  - obtain the service in top-level script or DI.
  - pass it into the helper constructor.
  - keep lifetime/disposal with the script owner.

- Execute an aura:
  - resolve `IAuraAccessor`.
  - call `Execute` or `ExecuteAsync`.
  - use `auras/actions.md` for action semantics.

- Bind a hotkey:
  - add `KeybindAttribute` to a script method.
  - use `windows-subsystems/input-hooks-hotkeys.md` for lower-level input.

- Attach a per-run subscription or helper:
  - create the disposable resource during the script run.
  - call `.AddTo(ExecutionAnchors)`.
  - use an explicit block or helper method when `using var` is clearer than
    `ExecutionAnchors`.
  - do not add `cancellationToken.WaitHandle.WaitOne()` only to keep a sample
    alive; long-running scripts should have a real loop, hosted service, window,
    or app lifecycle.

- Build a large script app:
  - keep `Script.cs` or `Script.csx` as a small composition root.
  - use `ScriptContainerExtension` for repeated DI setup.
  - create a child container for app-level services.
  - move lifecycle into an `IHostedService`-style coordinator.

- Add an AI assistant to a script editor or large script project:
  - create the AI session in the host UI/service layer.
  - choose only the context sources and tools the feature actually needs.

## Prefer

- Prefer accessors over internal model objects in scripts.
- Prefer explicit dependencies in helper classes.
- Prefer `ExecutionAnchors` for resources created by the current script run.
- Prefer an explicit `{ ... }` block or helper method when top-level script code
  needs disposable `using` statements/declarations.
- Prefer `ScriptContainerExtension` for script-owned shared services.
- Prefer simple one-file scripts for small tools and prototypes when splitting
  code would only add ceremony.
- Prefer useful diagnostic logging around setup, selections, validation,
  failures, and cleanup.
- Prefer `recipes/recipe.md` when looking for higher-level implementation
  recommendations that combine multiple API areas.

## Avoid

- Avoid assuming script host members exist in ordinary C# classes.
- Avoid adding fake waits such as `cancellationToken.WaitHandle.WaitOne()` to
  every demo script just to keep subscriptions alive.
- Avoid package-specific APIs without referencing the relevant optional package.
- Avoid `#r` directives outside top-level script files.
- Avoid root-level executable `using var` declarations without an explicit
  block/method scope in scripts.
- Avoid creating industrial-style layers, interfaces, and factories for small
  scripts that do not need them yet.

## Search Synonyms

- C# script
- scripting API
- script globals
- ExecutionAnchors
- per-run disposal
- script lifetime
- helper class
- constructor injection
- aura accessor
- folder accessor
- macro accessor
- script variable
- keybind
- script container extension

## Related Maps

- `core/eyeauras-structure.md`
- `core/app-runtime-contexts.md`
- `recipes/recipe.md`
- `scripting/container-extensions.md`
- `scripting/logging.md`
- `scripting/references-and-resources.md`
- `scripting/project-workflow.md`
- `scripting/variables.md`
- `auras/actions.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `windows-subsystems/blazor-windows.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `osd/screen-overlay.md`
- `nuget/imgui-sdk.md`
- `nuget/frida-sdk.md`
