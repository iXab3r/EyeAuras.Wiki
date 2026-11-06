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

## Choose the automation level

For “condition becomes true → press F1 → display a panel”, an aura connects
triggers, lifecycle action lists and overlays. Triggers report state; the aura
runtime applies enabling conditions, actions perform work and overlays display UI.
An unknown `bool?` state is not active.

For one F1 press from a C# Action, acquire `ISendInputScriptingApi` and call
`SendInput.KeyPress(System.Windows.Input.Key.F1)`; see the
[complete input operation](/en/scripting/api/ISendInputScriptingApi) for injection,
targeting and lifetime. For a user-configurable condition and action in the tree,
use aura entities. These paths have different state and lifetime owners.

Choose the [runtime context](/en/scripting/api/core/app-runtime-contexts) first,
then follow the domain maps. Module registration and the input call are traced in
source `c8b2304`; installed SDK/XML remains the exact version's contract.

## API Details

- `DefaultAurasModule` - default triggers/actions/overlays/settings.
- `AdvancedAurasModule` - advanced integrations such as Telegram.
- `CsScriptAurasModule` - C# script triggers, actions, and overlays.
- `BehaviorTreeModule` - behavior-tree nodes and runtime integration.
- `BehaviorTreeRootNode.IsLoaded` is desired load state, not an awaited drain receipt.
  Unload closes all root/node Tick entrypoints, cancels the root epoch, then waits
  for admitted calls before resetting structural node state and the session.
  A quick reload waits for that cleanup; graph/config/blackboard remain.
  Manual ticks on an unloaded or draining root return Failure without execution.
  Loaded but inactive/Disabled roots still permit manual ticks.
  Same-root SubTree uses exclusive containing-tree ownership keyed by entry/alias-chain/epoch.
  Running and live script iterators retain it, including a terminal yield.
  Another caller receives Failure until captured-owner cancel/drain/reset finishes.
  Retarget cleans the OLD target; the same owner can continue its terminal iterator.
  Ordinary IsTicking=false keeps Session-only maintenance; explicit status-reset/unload clears owned state.
  Foreign roots and whole-application disposal completion remain separate contracts.
- `IAuraRegistrator` - central entity registration service.
- `AuraActionBase<T>` - common action base; inspect `ExecuteInternal`.
- `AuraTriggerBase<T>` - common trigger base; inspect
  `CreateTriggerEventSource`.

## Prefer

- Use [auras/entities.md](/en/scripting/api/auras/entities) for registration and factories.
- Use [auras/actions.md](/en/scripting/api/auras/actions) for action execution.
- Use [auras/triggers.md](/en/scripting/api/auras/triggers) for activation/event sources.
- Use [auras/overlays.md](/en/scripting/api/auras/overlays) for overlay entities.

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

- [core/eyeauras-structure.md](/en/scripting/api/core/eyeauras-structure)
- [auras/entities.md](/en/scripting/api/auras/entities)
- [auras/actions.md](/en/scripting/api/auras/actions)
- [auras/triggers.md](/en/scripting/api/auras/triggers)
- [auras/overlays.md](/en/scripting/api/auras/overlays)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
