---
title: AI NuGet: Embedded SDK
description: AI-first map for standalone apps and plugin hosts using EyeAuras.SDK.Embedded.
published: true
date: 2026-06-16T00:00:00.000Z
tags: scripting, api, ai, nuget, embedded, sdk
editor: markdown
dateCreated: 2026-06-16T00:00:00.000Z
---
# Embedded SDK Discovery Map

## User Intents

- Use `EyeAuras.SDK.Runtime` with feature packages for a standalone app, or
  `EyeAuras.SDK.Embedded` as a compatibility bundle.
- Host EyeAuras services, Blazor windows, input, memory, or CV inside another
  app/plugin.
- Choose which EyeAuras modules should load in an embedded process.
- Avoid treating embedded host code as a script sandbox.

## Concept Model

- `EyeAuras.SDK` is the compile/reference package for code that runs inside
  EyeAuras.
- `EyeAuras.SDK.Runtime` is the standalone host package. The app owns process
  startup, creates a bootstrapper, declares capabilities, and waits for
  readiness.
- `EyeAuras.SDK.Embedded` bundles Runtime and feature dependencies;
  `EyeAuras.SDK.WebApp` supplies only Blazor window/WebView hosting.
- Runtime implementation modules stay package-owned under `modules/**`.
  Public metadata/shared assemblies provide compile-time APIs and capability
  extension methods.
- Embedded module selection is explicit. This stage does not load modules
  on-demand from synchronous APIs such as `LocalProcess`.

## API Details

- `EyeAurasRuntimeBootstrapper` - base class for host-owned standalone startup.
- `EyeAurasEmbeddedBootstrapper` - compatible subclass from the Embedded package.
- `ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)` - declare
  requested capabilities once in the bootstrapper subclass.
- `EnsureReadyAsync(CancellationToken)` - initializes static web assets,
  requested Prism modules, module payload loading, and application readiness.
- `IEyeAurasModuleSetBuilder` - collects requested module names.
- `IEyeAurasModuleSetBuilder.UseModule(string)` - adds one requested module
  name.
- `IEyeAurasModuleSetBuilder.UseModules(params string[])` - adds multiple
  requested module names.
- `IEyeAurasModuleLoadPlan` - app-wide selection plan. Normal EyeAuras/EyePad
  use a load-all plan; embedded hosts use the explicit module names collected
  by `ConfigureEmbeddedModules(...)`.
- `UseUiCore()` - core UI/runtime services.
- `UseBehaviorTree()` - Behavior Tree runtime/editor capability.
- `UseMemory()` - protected Memory module capability.
- `UseOpenCVAuras()` - protected OpenCVAuras/CV module capability.
- `UseRoxy()` - protected Roxy input automation capability.

## Add local memory to an existing WPF host

Use a Windows host with WPF/Prism startup and a live UI dispatcher. Reference
matching versions of `EyeAuras.SDK.Runtime` and `EyeAuras.Memory`, including their
runtime payloads. The existing host startup creates the Unity container and calls
`Run(runWithDefaultConfiguration: true)` on the bootstrapper. This class selects
capabilities; it does not replace the application's entry point:

```csharp
using EyeAuras.Memory;
using EyeAuras.SDK.Runtime;
using Unity;

public sealed class AppBootstrapper : EyeAurasRuntimeBootstrapper
{
    public AppBootstrapper(IUnityContainer container) : base(container) { }

    protected override void ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)
    {
        modules.UseMemory();
    }
}
```

`UseMemory()` adds UiCore, `PlusLoaderModule` and `MemoryModule`. After `Run`,
the host can await readiness and enumerate local processes. `bootstrapper` below
is the same host-owned instance, and the caller supplies `cancellationToken`:

```csharp
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.Memory;

static async Task<IReadOnlyList<ProcessInformation>> GetReadyProcesses(
    AppBootstrapper bootstrapper, CancellationToken cancellationToken)
{
    await bootstrapper.EnsureReadyAsync(cancellationToken);
    return LocalProcess.GetProcesses();
}
```

The result contains process descriptors with `Id` and `ProcessName`. The static
`LocalProcess` facade uses the builder registered by `MemoryModule`; it does not
need a universal `GetService<T>`. Choose a PID and follow the
[owned reader operation](/en/scripting/api/memory/processes).

The module set is configured once, with case-insensitive name deduplication.
Readiness configures assets and the resolver, loads modules, reports app loading,
and checks requested module initialization. Failure is a startup failure, not an
empty successful process list. Cancellation affects checks/waits but does not roll
back loaded modules or interrupt every synchronous loader operation. Call readiness
as part of startup, not repeatedly before each memory operation.

The host owns bootstrapper, container and dispatcher. Keep them alive while
consumers use the services. Bootstrapper disposal releases its registered anchors;
it is not an automatic shutdown of the caller's container or dispatcher.
This is not a complete arbitrary console `Program.cs` and does not create script
globals such as `Log`, `AuraTree` or `Variables`.

## Packages and version boundary

- Host: `EyeAuras.SDK.Runtime`; compatibility bundle: `EyeAuras.SDK.Embedded`.
- Blazor-window hosting only: `EyeAuras.SDK.WebApp`.
- Features: `EyeAuras.BehaviorTree`, `EyeAuras.Memory`, `EyeAuras.OpenCVAuras`,
  `EyeAuras.Roxy`.
- Module declaration namespace: `EyeAuras.SDK.Runtime`; capability extensions use
  feature namespaces such as `EyeAuras.Memory` and `EyeAuras.Roxy`.
- `modules.config` is the signed inventory, separate from the selected load plan.
  Generated payload hashes are not a guarantee of runtime integrity checking.

The source contract is checked at `c8b2304`. Project/nuspec versions do not prove
published package availability or native compatibility. Match target frameworks,
payloads and SDK/XML from one release. This example has not been executed in a
Windows host.

## Prefer

- Put embedded startup glue in `Program.cs` and a bootstrapper subclass.
- Keep exported/generated script files unchanged when converting to standalone.
- Use `UseX()` capability methods instead of direct Prism module class names in
  consumer code.
- Treat readiness failure as startup failure when a requested module
  cannot be loaded.

## Avoid

- Manually scanning static web asset manifests from the consumer app.
- Calling `IDynamicModule.RegisterTypes` / `OnInitialized` directly from the
  consumer app.
- Manually resolving `IApplicationAccessor.ReportIsLoaded()` from the consumer.
- Assuming REPL or scripting services exist unless a requested module registered
  them.
- Referencing runtime implementation modules directly.

## Search Synonyms

- embedded SDK
- standalone SDK
- bootstrapper readiness
- module-name selection
- module load plan
- package capabilities
- `UseMemory`
- `UseRoxy`
- `UseOpenCVAuras`

## Related Maps

- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [core/app-modules.md](/en/scripting/api/core/app-modules)
- [core/login-and-licensing.md](/en/scripting/api/core/login-and-licensing)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [recipes/tool-embedded-eyeauras-host.md](/en/scripting/api/recipes/tool-embedded-eyeauras-host)

[Runtime bootstrapper](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.SDK.Runtime/EyeAurasRuntimeBootstrapper.cs).
