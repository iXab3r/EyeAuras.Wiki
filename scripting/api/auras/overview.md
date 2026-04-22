---
title: AI Auras Overview
description: AI-first overview of aura entities, actions, triggers, overlays, and runtime infrastructure.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, auras
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Auras Overview Discovery Map

Reference map for the broad aura model: auras, folders, triggers, actions,
overlays, behavior trees, script entities, and built-in aura packs.

## Concept Model

- An aura is a user-facing automation unit.
- Enabling conditions gate whether an aura may activate.
- Triggers watch state and drive activation.
- Actions perform work in lifecycle lists.
- Overlays display UI/presentation.
- Behavior tree nodes are tick-based aura entities.
- Aura packs are registered by modules and described by metadata assemblies.

## API Details

- `DefaultAurasModule` - default triggers/actions/overlays/settings.
- `AdvancedAurasModule` - advanced integrations such as Telegram.
- `CsScriptAurasModule` - C# script triggers, actions, and overlays.
- `BehaviorTreeModule` - behavior-tree nodes and runtime integration.
- `IAuraRegistrator` - central entity registration service.
- `AuraActionBase<T>` - common action base; inspect `ExecuteInternal`.
- `AuraTriggerBase<T>` - common trigger base; inspect
  `CreateTriggerEventSource`.

## Prefer

- Use `auras/entities.md` for registration and factories.
- Use `auras/actions.md` for action execution.
- Use `auras/triggers.md` for activation/event sources.
- Use `auras/overlays.md` for overlay entities.

## Search Synonyms

- aura
- trigger
- action
- overlay
- aura pack
- behavior tree
- script action
- script trigger
- lifecycle action
- enabling condition

## Related Maps

- `core/eyeauras-structure.md`
- `auras/entities.md`
- `auras/actions.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `scripting/runtime.md`
