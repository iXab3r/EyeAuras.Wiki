---
title: AI Auras: Actions
description: AI-first map of aura actions and action-related infrastructure.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, actions
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Aura Actions Discovery Map

Reference map for aura actions: executable units invoked from lifecycle lists,
scripts, behavior-tree nodes, macros, and user workflows.

## Concept Model

- Actions perform work.
- Actions are aura entities registered through `IAuraRegistrator`.
- Actions are backed by persisted properties and optional editors/metadata.
- Runtime behavior is usually near `ExecuteInternal`.
- Aura lifecycle lists commonly run actions on enter, while active, and on exit.

## API Details

- `AuraActionBase<TProperties>` - common action base.
- `ExecuteInternal` - usual action behavior method.
- `CsharpScriptAction` - script action entity.
- `CsharpScriptActionExecutor` - object-style script action base.
- `IAuraAccessor.Execute` / `ExecuteAsync` - script-side aura execution.

## Common Flows

- Find built-in action:
  - find module registration with `Register<SomeAction>`.
  - inspect action properties/metadata if UI settings matter.
  - inspect action runtime class and `ExecuteInternal`.

- Add action:
  - define properties.
  - define runtime model.
  - optionally define editor/metadata.
  - register through `IAuraRegistrator`.

## Prefer

- Prefer `ExecuteInternal` for runtime behavior.
- Prefer module registrations for user-facing discovery.
- Prefer `IAuraAccessor` for script-driven aura execution.

## Avoid

- Avoid treating actions as state watchers; use triggers for activation state.
- Avoid directly constructing action models from persisted metadata.

## Research Anchors

- `AuraActionBase`, `ExecuteInternal`, `CsharpScriptAction`,
  `CsharpScriptActionExecutor`, `IAuraAccessor`, `IAuraRegistrator`,
  `SendInputAction`, `DelayAction`, `PlaySoundAction`.

## Search Synonyms

- action
- aura action
- execute action
- lifecycle action
- on enter
- while active
- on exit
- script action

## Related Maps

- `auras/entities.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `scripting/runtime.md`
