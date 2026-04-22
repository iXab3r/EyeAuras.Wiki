---
title: AI Auras: Entities
description: AI-first map of aura entities, registration, factories, evaluators, and logging.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, auras
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Aura Entities / Registration Discovery Map

Reference map for `IAuraRegistrator`, aura entity mappings, factories, proxies,
linked-aura evaluators, event logging, and lifecycle events.

## User Intents

- Register a new trigger, action, overlay, behavior-tree node, or variable
  editor.
- Understand what an aura entity is.
- Create runtime objects from persisted metadata.
- Preserve unknown entity metadata through proxies.
- Open linked-aura/folder selector UI.
- Log user-visible aura events.

## Concept Model

- Triggers, actions, overlays, and behavior-tree nodes are aura entities.
- Aura entities implement `IAuraObject` and are backed by `IAuraProperties`.
- Modules register mappings through `IAuraRegistrator`.
- `IAuraRepository` stores mappings and descriptors.
- `IAuraObjectFactory` creates runtime models, proxies, editors, and variable
  editors from registered mappings.
- `IEyeEntityFactory` is the persistence-to-runtime boundary.
- `IAuraListStateEvaluator` combines linked aura/folder state.

## API Details

- `IAuraRegistrator`
  - `Register<TAuraModel>()` registers a model and properties mapping.
  - `Register<TAuraModelEditor, TAuraModel>()` registers an editor.
  - `RegisterProxy<TAuraModel, TProxy>()` registers proxy implementation.
  - `RegisterVariableEditor<TAuraVariableEditor>()` registers variable editor.

- `IAuraRepository`
  - Runtime registry populated by registrations.
  - Resolves model types, editor types, descriptors, proxies, and defaults.

- `IAuraObjectFactory`
  - Creates runtime models and editors from already materialized properties.

- `IEyeEntityFactory`
  - Deserializes `PoeConfigMetadata<IAuraProperties>`.
  - Preserves unavailable entities as proxy metadata.
  - Sanitizes child ids when creating child runtime objects.

- `IAuraListStateEvaluator`
  - Owns linked aura/folder/item evaluators and combines state.

- `IAuraListEvaluator`, `IAuraListEvaluatorForAura`,
  `IAuraListEvaluatorForFolder`
  - Represent linked aura-tree targets.

- `IAuraEventLoggingService`, `AuraEvent`, `AuraEventCategory`
  - User-visible runtime event log contracts.

- `ILifecycleEventsProvider`, `LifecycleEventArgs`, `LifecycleEventType`
  - High-level application lifecycle event contracts.

## Common Flows

- Register an entity:
  - module receives `IAuraRegistrator`.
  - call `Register<TAuraModel>()`.
  - optionally register editor and proxy.

- Create from saved metadata:
  - use `IEyeEntityFactory`.
  - deserialize metadata.
  - create runtime model or proxy.

- Create from properties:
  - use `IAuraObjectFactory` when properties are already materialized.
  - use `IEyeEntityFactory` when parent/child identity handling matters.

## Prefer

- Prefer `IAuraRegistrator` for entity discovery and registration.
- Prefer `IEyeEntityFactory` for persisted metadata.
- Prefer `IAuraObjectFactory` for materialized properties.
- Prefer event-log APIs for user-visible runtime events.

## Avoid

- Avoid manually constructing runtime aura models from saved metadata.
- Avoid dropping unknown persisted entities.
- Avoid bypassing registered mappings for editors/models.

## Research Anchors

- `IAuraRegistrator`, `IAuraRepository`, `IAuraObjectFactory`,
  `IEyeEntityFactory`, `PoeConfigMetadata<IAuraProperties>`,
  `ProxyAuraProperties`, `IAuraListStateEvaluator`,
  `IAuraEventLoggingService`, `AuraEvent`, `ILifecycleEventsProvider`.

## Search Synonyms

- aura entity
- entity registration
- aura registrator
- aura repository
- aura object factory
- proxy properties
- linked aura
- event log
- lifecycle event

## Related Maps

- `auras/actions.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `auras/overview.md`
- `core/configuration-persistence.md`
- `core/app-modules.md`
