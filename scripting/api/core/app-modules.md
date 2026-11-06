---
title: AI Core: App Modules
description: AI-first map of module loading, module paths, and application extensibility.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, modules
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# App Modules Discovery Map

Reference map for Prism modules, dynamic app modules, module loading, and
module-private assets.

## User Intents

- Find where services or aura entities are registered.
- Load or inspect application modules.
- Resolve module-private file paths.
- Understand why a package/module contributes APIs only when loaded.

## Concept Model

- Modules register services, aura entities, editors, package integrations, and
  runtime infrastructure.
- Aura packs register user-facing actions, triggers, overlays, variable editors,
  and behavior-tree nodes.
- Optional SDK packages may contribute module/container extensions.
- Module loading is controlled by an app-wide `IEyeAurasModuleLoadPlan`.
  EyeAuras and EyePad register the default load-all plan; embedded hosts replace
  it with an explicit list of requested module names.
- `modules.config` is a signed inventory connecting names, paths, Prism
  dependencies and assembly identities to candidate payloads. Generated hash/size
  fields do not by themselves prove runtime integrity checking of each payload.
- Inventory and load intent are separate. The active plan selects modules;
  available payloads and licensing determine how their bytes are loaded.

## Wait for modules and locate their files

In app infrastructure, acquire `IAppModuleLoader` through DI and observe `IsLoaded`
or `WhenLoaded`. The host starts loading. Do not call `LoadModules()` again from a
script: the loader rejects repeated initialization. `WhenLoaded` replays one ready
signal to late subscribers; `LoadModules()` has no cancellation parameter.

For a registered Prism module's files, inject `IAppModulePathResolver` and call
`ResolvePath<TModule>()`. It returns a `DirectoryInfo` derived from the catalog
entry's `Ref`, not the process working directory. A missing entry or directory
throws. Referencing an SDK does not register these services in an arbitrary host.

## Select modules before host startup

`EyeAurasModuleLoadPlan.LoadAll` selects all configured modules.
`EyeAurasModuleLoadPlan.Only(moduleNames)` selects explicit names, removing empty
and duplicate entries with case-insensitive comparison. Configure the plan before
loading; it does not unload an already running application. For a ready-made
embedded host use [capability configuration](/en/scripting/api/nuget/embedded-sdk).

## API Details

- `Prism.Modularity.IModule` - module implementation contract.
- `IAppModuleLoader` - loads app modules and exposes loaded state.
- `IModuleLoader` - shared loaded-state contract.
- `IEyeAurasModuleLoadPlan` - mandatory module-selection plan.
- `IEyeAurasModuleLoadResolver` - resolves the active plan against
  `modules.config` and blacklist rules.
- `IAppModulePathResolver` - resolves directories for module-private assets.
- `IAuraRegistrator` - registers aura entities during module initialization.

## Prefer

- Start from module registrations to discover user-facing entities.
- Use [auras/entities.md](/en/scripting/api/auras/entities) for registration/factory semantics.
- Use package maps in `nuget/` for optional SDK package registrations.

## Avoid

- Avoid assuming module classes contain runtime behavior; they often only wire
  types together.
- Avoid hardcoding module asset paths when a resolver exists.

## Search Synonyms

- Prism module
- app module
- module loader
- module path
- module assets
- aura pack
- registration module

## Related Maps

- [auras/entities.md](/en/scripting/api/auras/entities)
- [auras/overview.md](/en/scripting/api/auras/overview)
- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [core/configuration-persistence.md](/en/scripting/api/core/configuration-persistence)

## Loader completion and payload verification

At source revision `c8b2304`, `AppModuleConfigurator` verifies the inventory
signature. Payload hashes and sizes remain inventory metadata. The licensed
loader filters authentication-provided keys through the selected inventory and
blacklist, and loads encrypted payloads unless lazy mode is enabled. Its ready
signal also occurs after an empty selection or individually logged load errors;
it is not proof that every requested assembly loaded. Embedded `EnsureReadyAsync`
checks payload status and initialized Prism module states separately. Primary
loader exceptions propagate through `LoadModules()`; its completion observable
alone is not an error channel.

[AppModuleConfigurator](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Prism/Modularity/AppModuleConfigurator.cs),
[LicensedModuleLoader](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Loader/Services/LicensedModuleLoader.cs).
