---
title: AI Core: Configuration Persistence
description: AI-first map of config providers, serializers, and persistence helpers.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, configuration
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Configuration / Persistence Discovery Map

Reference map for typed configuration providers, config serialization,
polymorphic metadata, migrations, and type replacements.

## User Intents

- Persist settings for a service/module.
- Serialize and deserialize polymorphic aura properties.
- Migrate old config types to new config types.
- Preserve unknown aura entity metadata.
- Persist large script app settings, profiles, UI state, and process selection.

## Concept Model

- `IConfigProvider<TConfig>` owns typed persisted settings for a component.
- `IConfigSerializer` serializes config and metadata graphs.
- `PoeConfigMetadata` preserves concrete type identity for polymorphic configs.
- Config converters migrate old shapes to new shapes.
- Metadata replacement maps moved or renamed config types.

## API Details

- `IConfigProvider<TConfig>` - typed settings provider.
- `IConfigSerializer` - serializer facade for config graphs.
- `PoeConfigMetadata` - metadata wrapper carrying type identity and payload.
- `PoeConfigConverter` - converter infrastructure.
- `PoeConfigMetadata<T>` - typed metadata wrapper.
- `ConfigMetadataConverter<T1,T2>` - versioned migration helper.
- `MetadataReplacement` - moved/renamed type mapping.
- `ConfigSerializerReplacerScriptRuntimeVisitor` - script runtime visitor that
  installs serializer replacements.

## Prefer

- Prefer typed config providers over ad hoc file storage.
- Preserve polymorphic metadata instead of dropping unknown entities.
- Use converters/replacements for migrations.
- Use buffered saves for frequently changing UI or profile state.

## Avoid

- Avoid raw JSON persistence for host settings without checking config provider
  infrastructure.
- Avoid losing unknown aura properties when a module is unavailable.

## Search Synonyms

- config provider
- typed settings
- config serializer
- metadata wrapper
- polymorphic config
- migration
- config converter
- metadata replacement

## Related Maps

- `core/app-runtime-contexts.md`
- `recipes/bot-memory-imgui-interface.md`
- `auras/entities.md`
- `auras/overview.md`
- `scripting/runtime.md`
