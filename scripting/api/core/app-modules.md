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
- `modules.config` remains the compatibility map that translates module names,
  module paths, and Prism dependencies into the concrete payloads that loaders
  should consider.

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
- Use `auras/entities.md` for registration/factory semantics.
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

- `auras/entities.md`
- `auras/overview.md`
- `core/app-runtime-contexts.md`
- `core/configuration-persistence.md`
