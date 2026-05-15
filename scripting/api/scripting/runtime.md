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
- Request a controlled restart from a host that supports restart orchestration.

## Concept Model

- Top-level script code has host-provided capabilities.
- Top-level script code can use `async`/`await`; async safety and background
  work rules live in `scripting/async.md`.
- Top-level script code can use `Log` directly for diagnostics.
- `ExecutionAnchors` is a per-run disposal bucket; resources added there are
  disposed when the current script execution ends.
- Long-lived resources that should survive across script executions belong to
  the sandbox/script lifetime (`Anchors`) or to explicit app services instead.
- Helper objects that own resources or expose bindable state should usually
  inherit from `DisposableReactiveObject` and use `.AddTo(Anchors)` for owned
  disposables.
- Ordinary C# files next to the script are normal classes.
- Helper classes need dependencies through constructors, explicit parameters, or
  script-owned DI.
- Helper classes do not get `Log` automatically; pass `IFluentLog` explicitly
  or create an ordinary type logger when appropriate.
- Accessors are script-safe handles for aura-tree objects.
- Object-style actions/triggers use executor base classes rather than top-level
  script members.
- Every script container exposes `IScriptRestartController`; unsupported hosts
  provide `UnsupportedScriptRestartController`, which throws
  `NotSupportedException`.
- C# Script Action replaces the default restart controller with host-owned
  orchestration that cancels the current action execution and queues a new one.
- Restart requests carry durable metadata only. Scripts that need handover state
  must write it to variables, files, or host-owned services before requesting
  restart.
- Small mini-apps may stay in one `Script.cs` / `Script.csx` file when the code
  remains easy to scan. A rough 300-500 line file with local helpers is often
  preferable to an artificial service graph.
- Large projects should treat the top-level script as a composition root and
  move orchestration into regular services.

## EyePad Console Entry Points

EyePad console scripting uses one script source selector per process launch.
The legacy positional `inputFile` remains valid, and the console-focused
selectors make the source kind explicit:

- `EyeAuras.exe --pad path/to/Script.csx` runs the positional input file.
- `EyeAuras.exe --pad --run path/to/Script.csx` runs an explicit script file.
- `EyeAuras.exe --pad --eval "Console.WriteLine(\"hi\")"` runs inline source.
- `EyeAuras.exe --pad --run -` reads the script source from standard input.

Only one of positional `inputFile`, `--run`, or `--eval` should be present. A
conflict is a command-line validation failure and should exit with code `2`.

Use `--` to separate host arguments from script arguments. Tokens after the
separator are exposed to the script as `args`; tokens before it stay host
arguments and must not leak into script arguments:

```text
EyeAuras.exe --pad --eval "Console.WriteLine(string.Join(\"|\", args))" -- alpha --literal omega
```

Standard input has two distinct meanings:

- With `--run -`, stdin is the script source.
- With `--eval`, stdin remains data that the script can read through
  `Console.In`.

For machine-readable console scripts, write user output through
`Console.Write` / `Console.WriteLine` and errors through `Console.Error`.
Use `Log` for EyeAuras diagnostics and event-viewer breadcrumbs; it is not a
replacement for stdout/stderr protocol output.

When EyeAuras is started as a console-script host from an interactive Windows
console, it attaches to the parent console before installing the console tee.
Redirected pipelines keep their original pipe/file handles per stream, so
`Console.In` can remain stdin data while stdout/stderr attach to the terminal
when those streams are not redirected. This lets console helpers and TUI
libraries such as Spectre.Console use the normal `Console` surface, ANSI output,
width detection, and keyboard APIs when a real console is available, while
redirected stdout/stderr remain machine-readable protocol streams.

## Interactive Terminal From Normal Scripts

Top-level Aura scripts can request an interactive Windows terminal through the
opt-in terminal scripting API. The namespace is intentionally not connected as
a default global surface, so scripts that need a terminal should import it and
resolve the service explicitly:

```csharp
using EyeAuras.Scripting.Terminal;

var terminalApi = GetService<ITerminalScriptingApi>();
var terminal = terminalApi.EnsureConsole();
try
{
    Spectre.Console.AnsiConsole.MarkupLine("[green]Hello from EyeAuras[/]");
    var name = Spectre.Console.AnsiConsole.Ask<string>("Name:");
}
finally
{
    terminal.Dispose();
}
```

`ITerminalScriptingApi.EnsureConsole()` is intended for TUI frameworks such as
Spectre.Console when the script is started from normal EyeAuras/EyePad GUI mode.
It reuses an existing real console when one is already attached. Otherwise, in
normal GUI script sessions, EyeAuras allocates a fresh console, refreshes
`Console.In` / `Console.Out` / `Console.Error`, enables Windows VT output when
available, and keeps the console alive while any terminal lease is held. This
normal-mode request is explicit, so it can replace redirected-looking handles
created by a debugger, launcher, or test harness.

The terminal lease is session-owned and ref-counted. Multiple scripts can hold
leases at the same time; an EyeAuras-allocated console is released only after
the last lease is disposed. Keep the lease for the portion of the script that
needs interactive terminal behavior and dispose it in a `finally` block.

When EyeAuras is handling a CLI startup script source such as `--run`, `--eval`,
or positional input execution, redirected standard streams remain protected. If
no interactive console is already available in that CLI path,
`ITerminalScriptingApi.EnsureConsole()` fails instead of stealing or replacing
the caller pipe/file handles. Keep redirected CLI scripts on the normal
stdin/stdout/stderr protocol path.

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
- `EyeAuras.Scripting.Terminal.ITerminalScriptingApi` - opt-in interactive
  terminal access for normal-mode console and TUI scripts.
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
- `DisposableReactiveObject` - base class for helper objects that need
  `IDisposable`, `INotifyPropertyChanged`, or both.
- `Anchors` - object-level `CompositeDisposable` used by
  `DisposableReactiveObject`.
- `AddTo(Anchors)` - common pattern for attaching owned resources to an
  object-level lifetime.
- `KeybindAttribute` - method-level hotkey metadata.
- `ScriptContainerExtension` - script-owned DI extension.
- `IScriptRestartController` - script-facing host service for controlled restart
  requests.
- `ScriptRestartRequest` - restart metadata such as `Reason` and optional
  `Delay`.
- `UnsupportedScriptRestartController` - default controller registered by hosts
  that do not support restart orchestration.
- `CsharpScriptActionExecutor` - object-style action base.
- `CsharpScriptTriggerExecutor` - object-style trigger base.
- `AuraScriptRunner<TSandbox>` - custom script runner with typed globals.
- `AuraScriptSandbox` - base class for custom script globals/sandbox APIs.
- `ITerminalScriptingApi.EnsureConsole()` - acquire a session-owned interactive
  console lease for Spectre.Console or other TUI frameworks.
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

- Use async safely:
  - `await` one-shot operations directly from top-level script code.
  - pass `cancellationToken` into async APIs when available.
  - catch/log exceptions at every fire-and-forget boundary.
  - use `scripting/async.md` for background tasks and coroutine-style loops.

- Run from EyePad console:
  - choose exactly one source: positional `inputFile`, `--run`, or `--eval`.
  - pass script arguments after `--`.
  - use `--run -` only when stdin is the script source.
  - use `--eval` when stdin must remain data for `Console.In`.
  - keep protocol output on `Console`; keep diagnostics on `Log`.

- Attach a per-run subscription or helper:
  - create the disposable resource during the script run.
  - call `.AddTo(ExecutionAnchors)`.
  - use an explicit block or helper method when `using var` is clearer than
    `ExecutionAnchors`.
  - do not add `cancellationToken.WaitHandle.WaitOne()` only to keep a sample
    alive; long-running scripts should have a real loop, hosted service, window,
    or app lifecycle.

- Request a controlled script restart:
  - persist handover state first, usually through `IVariablesScriptingApi`, a
    script variable, a file, or a host-owned service.
  - resolve `IScriptRestartController` from `GetService<T>()`.
  - call `RequestRestartAsync(new ScriptRestartRequest { Reason = "...", Delay = ... }, cancellationToken)`.
  - handle `NotSupportedException` when the script may run in triggers,
    overlays, EyePad direct execution, or another unsupported host.
  - resolve host-bound services again after restart; do not keep controller or
    container references in static state.

- Build a large script app:
  - keep `Script.cs` or `Script.csx` as a small composition root.
  - use `ScriptContainerExtension` for repeated DI setup.
  - use `DisposableReactiveObject` for owned services/windows/readers.
  - create a child container for app-level services.
  - move lifecycle into an `IHostedService`-style coordinator.

- Add an AI assistant to a script editor or large script project:
  - create the AI session in the host UI/service layer.
  - choose only the context sources and tools the feature actually needs.

## Prefer

- Prefer accessors over internal model objects in scripts.
- Prefer explicit dependencies in helper classes.
- Prefer `ExecutionAnchors` for resources created by the current script run.
- Prefer `DisposableReactiveObject` and object `Anchors` for helper classes
  that own resources or expose bindable state.
- Prefer an explicit `{ ... }` block or helper method when top-level script code
  needs disposable `using` statements/declarations.
- Prefer `ScriptContainerExtension` for script-owned shared services.
- Prefer resolving `IScriptRestartController` only when a restart is needed.
- Prefer writing explicit handover state before requesting restart.
- Prefer simple one-file scripts for small tools and prototypes when splitting
  code would only add ceremony.
- Prefer useful diagnostic logging around setup, selections, validation,
  failures, and cleanup.
- Prefer `scripting/async.md` before adding background tasks, timers, or
  long-running async loops.
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
- Avoid fire-and-forget async work without cancellation, exception handling,
  and logging.
- Avoid storing `IScriptRestartController`, `IScriptingApiContext`, `IEyeContext`,
  or Unity containers in static fields; these are host/container-bound services.
- Avoid assuming restart support outside C# Script Action unless the current host
  or a script extension explicitly replaces `IScriptRestartController`.
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
- restart script
- reload script
- self restart
- IScriptRestartController
- ScriptRestartRequest
- script container extension
- async script
- coroutine
- EyePad console
- inputFile
- --run
- --eval
- stdin source
- script args
- ITerminalScriptingApi
- EnsureConsole
- Spectre.Console
- TUI
- DisposableReactiveObject
- INotifyPropertyChanged
- NPC
- AddTo Anchors

## Related Maps

- `core/eyeauras-structure.md`
- `core/app-runtime-contexts.md`
- `core/reactivity.md`
- `recipes/recipe.md`
- `scripting/async.md`
- `scripting/container-extensions.md`
- `scripting/logging.md`
- `scripting/reactive-lifetime.md`
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
