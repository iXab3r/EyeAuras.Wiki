---
title: Configuration Serialization and Editing
description: Save view copy and transfer configuration through IConfigProvider and IConfigSerializer
published: true
date: 2026-11-03T00:00:00.000Z
tags: scripting, api, configuration, serialization, ai-translated
editor: markdown
dateCreated: 2026-11-03T00:00:00.000Z
---
# Serializing and Editing Settings

`IConfigProvider<TConfig>` is responsible for the current settings and saving them, while `IConfigSerializer` converts data to and from JSON. Use the serializer when you need an editable copy or a portable string representation; saving that copy is still a separate step.

Both interfaces are defined in `PoeShared.Modularity`. In a top-level EyeAuras C# Action, you can get the serializer through `GetService<IConfigSerializer>()`. In a regular class, receive it through the constructor. The host registers this service through the shared PoeShared infrastructure; creating your own `new JsonConfigSerializer()` is not a public integration path.

## Get a copy for editing

The following C# Script Action creates a simple object, clones it through the serializer, and changes only the copy:

```csharp
using PoeShared.Modularity;

var serializer = GetService<IConfigSerializer>();
var original = new PanelSettings { Caption = "Inventory", Limit = 10 };

var json = serializer.Serialize(original);
var edited = serializer.Deserialize<PanelSettings>(json);
edited.Caption = "Preview";
edited.Limit = 20;

Log.Info($"Исходный объект: {original.Caption}, {original.Limit}");
Log.Info($"Копия: {edited.Caption}, {edited.Limit}");

public sealed class PanelSettings
{
    public string Caption { get; set; }
    public int Limit { get; set; }
}
```

Expected output: the original object stays `Inventory, 10`, while the copy becomes `Preview, 20`. Deserialization creates an object from serializable data; it does not copy live subscriptions, the container, native handles, or other runtime infrastructure.

To edit an existing config, pass its value to `Serialize`, for example `provider.ActualConfig`, then call `Deserialize<TConfig>` with the same supported type. Work with the copy until the user confirms the changes. After confirmation, call `provider.Save(edited)`; plain serialization does not update the provider’s config file.

## Pass settings as a single string

In the same C# Action context:

```csharp
using PoeShared.Modularity;

var serializer = GetService<IConfigSerializer>();
var source = new TransferSettings { Caption = "Panel", Limit = 5 };

string packed = serializer.Compress(source);
var restored = serializer.Decompress<TransferSettings>(packed);
Log.Info($"Восстановлено: {restored.Caption}, {restored.Limit}");

public sealed class TransferSettings
{
    public string Caption { get; set; }
    public int Limit { get; set; }
}
```

`Compress(object)` first serializes the data, then compresses the resulting string. `Decompress<T>(string)` performs the reverse chain. If you want readable JSON, use `Serialize` and `Deserialize` directly. Compression is not encryption, and it does not guarantee compatibility across arbitrary type versions.

## Watch a single field and save a new instance

In the next example, the host already provides `IConfigProvider<PanelConfig>` for a regular C# class. It is created from the shared `IConfigProvider<>` registration and the main configuration provider registration. The type must implement `IPoeEyeConfig` and have a parameterless constructor; the host determines the path and write behavior.

```csharp
using System;
using System.Reactive.Linq;
using PoeShared.Modularity;

public sealed record PanelConfig : IPoeEyeConfig
{
    public string Caption { get; set; } = "Panel";
}

public sealed class PanelEditor : IDisposable
{
    private readonly IConfigProvider<PanelConfig> provider;
    private readonly IDisposable subscription;

    public PanelEditor(IConfigProvider<PanelConfig> provider, Action<string> changed)
    {
        this.provider = provider;
        subscription = provider.ListenTo(x => x.Caption).Subscribe(changed);
    }

    public void Rename(string caption)
    {
        provider.Save(provider.ActualConfig with { Caption = caption });
    }

    public void Dispose() => subscription.Dispose();
}
```

The caller creates `PanelEditor` with the provider and a string handler, then disposes it when the editor closes. The provider is borrowed; the class disposes only its own subscription.

`ListenTo(x => x.Caption)` returns `IObservable<string>` and filters out repeated values of the selected field. The source is tied to `WhenChanged`, which replays the latest available change in the implementation. Do not use these notifications as a call counter for `Save`, and do not assume a UI thread: switching to the UI depends on the consumer.

Create a new instance before calling `Save`. `GenericConfigProvider` compares the config being saved with `ActualConfig` and skips equal values. If you mutate `ActualConfig` itself before saving, the difference may be hidden.

## Provider contract

| Member | Meaning |
|---|---|
| `IConfigProvider<TConfig>.ActualConfig` | Current strongly typed config |
| `WhenChanged` | `IObservable<TConfig>` of configuration changes |
| `Save(TConfig config)` | Submit a new config for saving |
| `ListenTo<T>(Expression<Func<TConfig,T>> fieldToMonitor)` | Watch a selected field and filter out equal values |
| `IConfigProvider.ConfigHasChanged` | General change signal without a specific config |
| `Configs` | `IObservableCache<IPoeEyeConfig,string>` of configurations |
| `Save()` | Save through the main provider |
| `Save(IPoeEyeConfig config)` | Submit a specific config to the main provider |
| `GetActualConfig<TConfig>()` | Get the current config of the specified type |

`IConfigProvider<TConfig>` does not have a `SaveBuffered` method. If you batch changes with a delay, that queue belongs to the caller; before it finishes, you need to decide whether to save or discard the pending changes.

## Serializer contract

| Operation | Call forms and result |
|---|---|
| `Serialize` | `string Serialize(object data)`; `void Serialize(object data, TextWriter textWriter)`; `void Serialize(object data, FileInfo file)` |
| `Deserialize<T>` | Accepts `string`, `TextReader`, or `FileInfo`; returns `T` |
| `Deserialize` | The same three input forms plus `Type`; returns `object` |
| `DeserializeSingleOrList<T>(string)` | Accepts JSON for a single object or an array, returns `T[]` |
| `DeserializeOrDefault<T>(PoeConfigMetadata<T>, Func<PoeConfigMetadata<T>,T>) where T : class` | Tries to restore the value from metadata; if the value is unavailable, uses the provided factory |
| `Compress(object)`, `Decompress<T>(string)` | Compressed string and restored strongly typed value |
| `RegisterConverter(JsonConverter)` | Adds a converter to this serializer instance |
| `DisablePooling()` | Returns an `IDisposable` that scopes pooling disablement; disposal is the caller’s responsibility |
| `MaxDepth` | Interface constant with the value `1024`, not a separate guarantee that arbitrary input is valid |

All serializer operations are synchronous; they do not require `await`. The `FileInfo` overload reads from or writes to the explicit file. In the implementation, writing creates the parent directory if it does not exist. Ownership of the provided reader or writer depends on the implementation: the work is done through internal `JsonReader/JsonWriter`, so do not assume ordinary file-method rules for an arbitrary stream without checking.

Converters change the behavior of that specific service instance. If you are using a borrowed host serializer, do not register converters just for a local example: the change will affect other consumers of the same instance. Serializer customization is meant for coordinated host-level integration.

## Versions and polymorphic data

`PoeConfigMetadata<T>` stores type information together with the data; this is important for aura and module configurations. Successful serialization of a simple DTO does not mean an arbitrary type can be moved safely between assemblies or application versions.

When a regular property changes, do not automatically bump `IPoeEyeConfigVersioned.Version`. The version is a migration or reset boundary; see [configuration and persistence](configuration-persistence) for details. Migration paths and the availability of matching types must be verified separately.

These contracts were checked against PoeEye `0e02c98dcab4bff263684f1c0647eed120e2700f`: [IConfigSerializer](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Modularity/IConfigSerializer.cs), [IConfigProvider](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Modularity/IConfigProvider.cs), [GenericConfigProvider](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Modularity/GenericConfigProvider.cs). The custom type examples refer to the script assembly where that type is declared.

- [Runtime contexts](app-runtime-contexts)
- [Script service registration](../scripting/container-extensions)
- [Reactivity](reactivity)