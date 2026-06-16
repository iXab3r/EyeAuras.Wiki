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

- Replace `EyeAuras.SDK` with `EyeAuras.SDK.Embedded` for a standalone app.
- Host EyeAuras services, Blazor windows, input, memory, or CV inside another
  app/plugin.
- Choose which EyeAuras modules should load in an embedded process.
- Avoid treating embedded host code as a script sandbox.

## Concept Model

- `EyeAuras.SDK` is the compile/reference package for code that runs inside
  EyeAuras.
- `EyeAuras.SDK.Embedded` is the standalone host package. The app owns process
  startup, creates a bootstrapper, declares capabilities, and waits for
  readiness.
- Runtime implementation modules stay package-owned under `modules/**`.
  Public metadata/shared assemblies provide compile-time APIs and capability
  extension methods.
- Embedded module selection is explicit. This stage does not load modules
  on-demand from synchronous APIs such as `LocalProcess`.

## API Details

- `EyeAurasEmbeddedBootstrapper` - base class for host-owned embedded startup.
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

## Common Flows

Minimal embedded host:

```csharp
public sealed class AppBootstrapper : EyeAurasEmbeddedBootstrapper
{
    public AppBootstrapper(IUnityContainer container) : base(container)
    {
    }

    protected override void ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)
    {
        modules.UseUiCore();
        modules.UseBehaviorTree();
        modules.UseMemory();
    }
}

var container = new UnityContainer();
var bootstrapper = new AppBootstrapper(container);
bootstrapper.Run(runWithDefaultConfiguration: true);
await bootstrapper.EnsureReadyAsync(cancellationToken);
```

## Assembly / Package Hints

- Package: `EyeAuras.SDK.Embedded`
- Future granular packages: `EyeAuras.SDK.WebApp`, `EyeAuras.BehaviorTree`,
  `EyeAuras.Memory`, `EyeAuras.OpenCVAuras`, `EyeAuras.Roxy`
- Namespace for embedded module declarations: `EyeAuras.SDK.Embedded`
- Runtime module compatibility map: `modules.config`

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

- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `core/login-and-licensing.md`
- `windows-subsystems/blazor-windows.md`
- `recipes/tool-embedded-eyeauras-host.md`
