---
title: AI Core: Configuration Persistence
description: AI-first map of config providers, serializers, and persistence helpers.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, configuration, ai-translated
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

## Save a service's settings

The application module registers the configuration type and provides
`PoeShared.Modularity.IConfigProvider<TConfig>` through DI. `TConfig` implements
`IPoeEyeConfig` and has a parameterless constructor. This example assumes the
host already provides `IConfigProvider<PanelConfig>`:

```csharp
using PoeShared.Modularity;

public sealed record PanelConfig : IPoeEyeConfig
{
    public string Caption { get; set; } = "Panel";
}

public sealed class PanelSettings
{
    private readonly IConfigProvider<PanelConfig> provider;
    public PanelSettings(IConfigProvider<PanelConfig> provider) => this.provider = provider;

    public void Rename(string caption)
    {
        provider.Save(provider.ActualConfig with { Caption = caption });
    }
}
```

`Rename("Inventory")` submits a new configuration with the updated caption.
Do not mutate `ActualConfig` before saving: `GenericConfigProvider` skips values
that compare equal to its current configuration. The host determines the file
path and persistence setup. This is a DI service example, not a universal
top-level `GetService<IConfigProvider<PanelConfig>>()` registration.

Observe `ListenTo(x => x.Caption)` or `WhenChanged` and dispose subscriptions
with their owner. There is no separate `SaveBuffered` method on this interface.
Coalesce updates yourself if needed, and finish pending work before shutdown.

## Copy, edit, and transfer settings

[Configuration operations](configuration-operations) covers `IConfigSerializer`,
independent editing copies, compressed-string transfer, field observation, and
string/stream/file overloads. Serialization does not save the working settings;
submit a new instance with `Save` after editing.

## Change a format without resetting settings

Adding an ordinary property usually does not require changing `Version`.
In PoeEye `0e02c98`, a version mismatch triggers converter lookup. An older
configuration with no migration path is replaced by a default instance;
a newer-than-supported version throws. `Version` is a migration or intentional
reset boundary, not a schema-edit counter.

Use metadata replacements for moved types and converters for structural
changes. Retain `PoeConfigMetadata` when the defining module is unavailable;
it preserves type identity and payload.

## Script-scoped serializer

During one-time script setup, `ConfigSerializerReplacerScriptRuntimeVisitor`
captures the existing serializer and registers a script-scoped singleton wrapper
in the script container. The wrapper includes the script assembly and the
referenced assemblies it can resolve from its `AssemblyLoadContext` during
serialization/deserialization and compression. It delegates actual work to the
captured serializer; it does not migrate arbitrary objects between versions.
`RegisterConverter` and `DisablePooling` also delegate to that serializer.

[Visitor at c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting/Visitors/ConfigSerializerReplacerScriptRuntimeVisitor.cs).

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
- Coalesce frequent changes before calling `Save`, and finish pending saves before the owner closes.

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

- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [recipes/bot-memory-imgui-interface.md](/en/scripting/api/recipes/bot-memory-imgui-interface)
- [auras/entities.md](/en/scripting/api/auras/entities)
- [auras/overview.md](/en/scripting/api/auras/overview)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
