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

## Load a saved component

A module registers the model through `IAuraRegistrator`, with separate editor and
optional proxy registrations. `Register<TAuraModel>()` schedules the registration
on the background scheduler; returning does not mean the registry is already updated.

`IEyeEntityFactory` deserializes `PoeConfigMetadata<IAuraProperties>`, retaining
unknown types as `ProxyAuraProperties`. It validates properties and applies the
container's child identity strategy. `IAuraObjectFactory` resolves the registered
runtime type through the existing host container and assigns its properties and
description. The result is a component or a proxy retaining the unavailable data.
A normal input script does not need these factories; a module uses the host's
registered services instead of constructing runtime models from metadata itself.

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
  - Validates and transforms child ids according to the container strategy.

- `IAuraListStateEvaluator`
  - Maintains linked aura/folder/item evaluators and combines state.

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

- [auras/actions.md](/en/scripting/api/auras/actions)
- [auras/triggers.md](/en/scripting/api/auras/triggers)
- [auras/overlays.md](/en/scripting/api/auras/overlays)
- [auras/overview.md](/en/scripting/api/auras/overview)
- [core/configuration-persistence.md](/en/scripting/api/core/configuration-persistence)
- [core/app-modules.md](/en/scripting/api/core/app-modules)


## Child identity and linked conditions

With `IndependentChildren`, an existing nonempty child ID is retained. With
`LinkedToContainer`, the parent needs an ID; a missing child ID, an ID without the
parent prefix, or a collision with a live non-proxy child causes regeneration.
An existing proxy or disposed child permits reusing that ID. The child creation
path can mutate the supplied properties; it does not promise a defensive copy.

The linked condition result is nullable. With no entries it is `true` unless
`IsRequired`, which produces `null`. `All` produces `null` if any entry is unknown;
otherwise all must be `true`. `Any` is `true` if at least one entry is `true`, and
`false` otherwise, including when all entries are unknown. Adding the same item ID
replaces the existing list entry. `Remove`/`Clear` change membership; do not treat
them as a documented disposal barrier for supplied evaluator objects.

[EyeEntityFactory](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Core/Models/EyeEntityFactory.cs),
[AuraListStateEvaluator](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/AuraListEvaluator/AuraListStateEvaluator.cs).
