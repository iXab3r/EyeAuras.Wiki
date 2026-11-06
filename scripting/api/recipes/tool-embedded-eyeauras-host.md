---
title: AI Recipe: Add EyeAuras Tools To Another App
description: Short recommendation recipe for adding EyeAuras-powered UI, automation, or OSD features inside another app/plugin host.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, embedded, blazor, behavior-tree
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Add EyeAuras Tools To Another App

| Field | Value |
| --- | --- |
| Complexity | Very High |
| Example | Plugin or host app that opens EyeAuras-powered windows and runs editable automation. |
| End Goal | The host app gains EyeAuras-powered windows, screen visuals, scripting, or automation. |
| Key Technologies | `EyeAuras.SDK.Embedded`, app modules, `IBlazorWindow`, Behavior Tree APIs, OSD APIs |

## Use When

- The feature runs inside another app or plugin host.
- The host supplies ticks, render callbacks, or domain events.
- The user needs EyeAuras-powered windows, screen visuals, scripting, or
  automation in that host.
- A normal EyeAuras script is not the entry point.

## Shape

- Reference `EyeAuras.SDK.Embedded` from the host app/plugin and create a
  host-owned `EyeAurasEmbeddedBootstrapper` subclass.
- Start the embedded SDK runtime explicitly from the host/plugin, usually on
  the UI-capable STA thread that owns EyeAuras UI work.
- Register host services in the host bootstrapper/container before running it.
- Declare only the embedded capabilities the host needs with
  `ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)`.
- Run the bootstrapper, then call `EnsureReadyAsync(...)` before using services
  from requested modules.
- The embedded base loads static web assets and requested modules. It does not
  register REPL or scripting services unless an opted-in module does that work.
- Bridge host events into EyeAuras-facing services.
- Show complex controls through Blazor windows.
- Draw visuals through host rendering or OSD APIs.
- Add Behavior Tree or hosted scripting only if users need editable automation.

## Add Memory API to an existing WPF host

The input is a Windows application with WPF startup, a live UI dispatcher,
Prism/Unity composition and its own shutdown order. An STA annotation alone does
not provide the dispatcher lifetime or full host composition.

Reference `EyeAuras.SDK.Runtime` and the memory feature package. Derive from
`EyeAurasRuntimeBootstrapper`, override `ConfigureEmbeddedModules`, and call
`modules.UseMemory()`. The compatible `EyeAurasEmbeddedBootstrapper` is an
alternative packaging surface, not an additional required bootstrap stage.
Register caller-owned services before modules use them.

Run the bootstrapper through the host's normal WPF/Prism startup, then await
`EnsureReadyAsync(cancellationToken)`. Only then call `LocalProcess.GetProcesses()`
and open an owned reader for the chosen PID. `UseMemory()` includes UiCore,
`PlusLoaderModule` and `MemoryModule`; the metadata facade alone has no registered
builder. The [complete capability and enumeration example](/en/scripting/api/nuget/embedded-sdk)
shows the required namespaces, inputs and result.

Readiness configures assets and validates requested modules; cancellation does not
undo startup. Keep UI creation on its dispatcher and do not block host tick/render
callbacks waiting for UI. At shutdown, stop consumers and dispose readers before
releasing the host-owned runtime/container. Scripting and BT services still need
their owning modules. Source `c8b2304` establishes these boundaries; compatible
published payloads and Windows execution must be checked for the chosen release.

## Choices

- How much of the SDK runtime to load.
- Which thread can safely create UI.
- Whether visuals should use host rendering, OSD, Blazor windows, or mixed UI.
- Whether automation belongs to host callbacks, Behavior Tree, scripts, or
  services.

## APIs To Look Up

- `EyeAuras.SDK.Embedded`
- `EyeAurasEmbeddedBootstrapper`
- `EyeAurasEmbeddedBootstrapper.ConfigureEmbeddedModules`
- `EyeAurasEmbeddedBootstrapper.EnsureReadyAsync`
- `IEyeAurasModuleSetBuilder`
- `IEyeAurasModuleSetBuilder.UseModule`
- `IEyeAurasModuleSetBuilder.UseModules`
- `IEyeAurasModuleLoadPlan`
- `UseUiCore()`
- `UseBehaviorTree()`
- `UseMemory()`
- `UseOpenCVAuras()`
- `UseRoxy()`
- `EyeAurasWebAppBootstrapper`
- `IBlazorWindow`
- `IBlazorWindowAccessor`
- `IOnScreenCanvas`
- `IBehaviorTreeRootNode`
- `IReactiveBehaviorTreeEditor`
- `IAuraScriptFactory`

## Avoid

- Treating embedded-host code like a normal script context.
- Expecting script globals such as `Log`, `AuraTree`, `Variables`, `Sleep`, or
  `cancellationToken` in ordinary embedded host classes.
- Adding sandbox-style wrapper APIs around the bootstrapper; embedded host code
  is app/plugin infrastructure, not script infrastructure.
- Manually editing generated script files to add host glue; put standalone
  initialization in `Program.cs` and the bootstrapper.
- Assuming REPL or scripting services exist before an opted-in module registers
  them.
- Manually scanning static web assets, loading Prism modules, loading module
  payload DLLs, or calling `IApplicationAccessor.ReportIsLoaded()` from the
  consumer app when `EnsureReadyAsync(...)` can own that lifecycle.
- Creating UI windows from the wrong thread.
- Blocking host tick/render callbacks with SDK or UI work.
- Exposing host-private objects directly to user scripts.
- Persisting volatile host handles, pointers, or session objects.

## Related Maps

- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [core/app-modules.md](/en/scripting/api/core/app-modules)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
