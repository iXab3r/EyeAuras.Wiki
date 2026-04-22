---
title: AI Core: EyeAuras Structure
description: AI-first map of the EyeAuras application structure and runtime containers.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, core
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# EyeAuras Structure Discovery Map

Reference map for the product model: Aura Tree, folders, auras, triggers,
actions, overlays, behavior trees, macros, variables, and script workspaces.

## User Intents

- Understand what kind of host a script is running inside.
- Find the current aura, folder, behavior tree, macro, trigger, action, or
  overlay context.
- Decide whether an API is product runtime, script runtime, SDK metadata, or
  optional package surface.
- Move code from top-level script into ordinary helper classes safely.

## Concept Model

- EyeAuras is an automation host, not only a C# library.
- The user-facing project is an Aura Tree made of folders and auras.
- Auras own enabling conditions, triggers, overlays, and action lists.
- Triggers determine active state; actions perform work; overlays display UI.
- Scripts run inside a host-owned context with live services and current aura
  metadata.
- SDK references expose symbols; live host services still depend on runtime
  context and loaded modules.

## API Details

- `IEyeContext` - broad runtime context for an EyeAuras object.
- `IAuraContext` - aura-specific runtime context.
- `IFolderContext` - folder-specific runtime context.
- `IEyeItem` - shared tree item shape.
- `IAuraTreeScriptingApi` - script-facing tree lookup/navigation API.
- `IAuraAccessor` - script handle for one aura.
- `IFolderAccessor` - script handle for one folder.
- `IMacroAccessor` - script handle for one macro.
- `IBehaviorTreeAccessor` - script handle for behavior trees.

## Prefer

- Identify the current product context before choosing APIs.
- Use accessors for script-facing aura/folder/macro work.
- Use `auras/entities.md` when researching how user-facing components are
  registered.
- Use `scripting/runtime.md` when top-level script vs helper-class behavior
  matters.

## Avoid

- Avoid treating top-level script helpers as global C# APIs.
- Avoid using UI/editor classes as the first source of runtime semantics.
- Avoid assuming SDK-only code can access live host services.

## Search Synonyms

- Aura Tree
- aura context
- folder context
- current aura
- current folder
- script workspace
- behavior tree
- macro
- action list
- overlay
- runtime context

## Related Maps

- `scripting/runtime.md`
- `auras/overview.md`
- `auras/entities.md`
- `core/app-runtime-contexts.md`
- `core/deployment.md`
