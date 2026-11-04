---
title: Script Resource Loading and Priority
description: IScriptFileProvider and CompositeScriptFileProvider for reading, enumerating, and combining resource sources
published: true
date: 2026-11-03T00:00:00.000Z
tags: scripting, api, resources, file-provider, ai-translated
editor: markdown
dateCreated: 2026-11-03T00:00:00.000Z
---
# Reading script resources and resource precedence

`EyeAuras.Repl.IScriptFileProvider` exposes script files through `Microsoft.Extensions.FileProviders.IFileProvider`. You can use it to get a file, list a directory, or request change notifications. The path is relative to the resource source and does not have to exist as a normal disk path.

## Read a prepared text resource

Add `docs/help.txt` to your script project resources as described in [attaching assemblies and resources](references-and-resources). The following top-level C# Action assumes the selected provider already resolves this path:

```csharp
using System.IO;
using EyeAuras.Repl;

{
    var files = GetService<IScriptFileProvider>();
    var file = files.GetFileInfo("docs/help.txt");
    if (file.Exists && !file.IsDirectory)
    {
        using var stream = file.CreateReadStream();
        using var reader = new StreamReader(stream);
        Log.Info(reader.ReadToEnd());
    }
    else
    {
        Log.Info("Resource docs/help.txt was not found");
    }
}
```

If the resource exists, its text will be written to the log. The stream and reader are created by this execution and disposed in the shown block. The `files` service obtained from the host is borrowed. A resource may not have a `PhysicalPath`; use `CreateReadStream()` to read it.

If the name does not resolve, check the manifest name and how the resource was attached, not just the project name. The exact name and allowed shorthand depend on the provider. See [embedded resources](references-and-resources) for details.

## Set priority between two sources

In a regular C# helper, two already prepared `IScriptFileProvider` instances are passed explicitly. The first contains user overrides, and the second contains built-in defaults:

```csharp
using System.IO;
using EyeAuras.Repl;

public static class HelpResources
{
    public static string Read(IScriptFileProvider overrides, IScriptFileProvider defaults)
    {
        var files = new CompositeScriptFileProvider(overrides, defaults);
        var file = files.GetFileInfo("docs/help.txt");
        if (!file.Exists || file.IsDirectory)
        {
            throw new FileNotFoundException("Resource not found", "docs/help.txt");
        }

        using var stream = file.CreateReadStream();
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
```

Calling `HelpResources.Read(overrides, defaults)` returns the contents of the first existing file. If both providers contain the same path, `overrides` wins. If the first provider does not find the file, the lookup continues in `defaults`.

The method does not create the source providers and does not take ownership of them. `CompositeScriptFileProvider` does not implement `IDisposable`, so it does not dispose the sources you pass in. The created streams belong to the method.

Source order is not only for fallback. It is part of your resource contract, so keep that order when building the composition. Inside a single `ScriptEmbeddedResourceFileProvider`, ambiguous short names are a separate case. Composite order does not choose between two ambiguous resources from the same source.

## List a directory

Start by listing the provider root to see which directory names are available. In a C# Action with attached resources:

```csharp
using EyeAuras.Repl;
using PoeShared.Scaffolding;

var files = GetService<IScriptFileProvider>();
var directoryPath = "";
var directory = files.GetDirectoryContents(directoryPath);
if (directory.Exists)
{
    foreach (var entry in directory)
    {
        Log.Info($"{entry.GetSubpath()}, directory: {entry.IsDirectory}");
    }
}
else
{
    Log.Info($"Directory '{directoryPath}' was not found");
}
```

For `ScriptEmbeddedResourceFileProvider`, the directory structure is built from the full manifest name. For example, `Bot.docs.help.txt` is projected as `Bot/docs/help.txt`, and that file’s directory is `Bot/docs`. Put that path into `directoryPath` to list its contents. A short call like `GetFileInfo("docs/help.txt")` may still find the same file by a unique suffix, but that does not make `GetDirectoryContents("docs")` a valid directory. If you use multiple providers, consider the projection rules of each source.

`GetDirectoryContents` returns entries from one directory, not a recursive list of all files. In a composite provider, contents are merged; for duplicate `Name` values, the first entry in provider order is kept.

For recursive search, use `PoeShared.Scaffolding.FileProviderExtensions.GetFiles` and `GetDirectories`. The overloads accept `subpath`, a name pattern, and `SearchOption` or `EnumerationOptions`. The result is an `IFileInfo[]` array. These extensions may skip inaccessible entries, so an empty array does not prove that the source contains no files.

## Request change notifications

`Watch(string pattern)` returns an `IChangeToken`. Having a token does not mean the source can actually report changes. For example, `ScriptEmbeddedResourceFileProvider` returns `NullChangeToken`.

A composite provider collects tokens from all passed providers. If any one of them fires, it may notify about a change in the whole composition. The callback registration lifetime belongs to the consumer. Simply obtaining an `IChangeToken` does not create an infinite subscription and does not reread the file.

## Contract and useful extensions

| API | Purpose |
|---|---|
| `IScriptFileProvider : IFileProvider` | Inherits `GetFileInfo`, `GetDirectoryContents`, `Watch` |
| `CompositeScriptFileProvider(params IScriptFileProvider[]? fileProviders)` | Create a composition from ordered sources |
| Constructor with `IEnumerable<IScriptFileProvider>?` | Capture the provided source sequence |
| `FileProviders` | Get the configured sequence |
| `GetFileInfo(string subpath)` | First result with `Exists == true`, otherwise `NotFoundFileInfo`; exclude directories separately before reading |
| `GetDirectoryContents(string subpath)` | Merged directory entries with first-name-wins priority |
| `Watch(string pattern)` | Composite change token or a token with no notifications |
| `GetFileInfoOrThrow(path)` | Extension that returns an existing file or throws `FileNotFoundException` |
| `ReadAllText(path)`, `ReadAllBytes(path)` | Extensions that read contents and dispose created streams |
| `GetSubpath()` on `IFileInfo` | Normalized relative source path or a name-based representation |

To use the extensions, add `using PoeShared.Scaffolding;`. Details of the actual file system and change tracking depend on the `IFileProvider` implementation, so do not assume that embedded resources behave like a physical provider.

## Version and related operations

These contracts were checked against EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`: [IScriptFileProvider](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Repl/IScriptFileProvider.cs), [CompositeScriptFileProvider](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Repl/CompositeScriptFileProvider.cs). The extensions refer to PoeEye `0e02c98dcab4bff263684f1c0647eed120e2700f`.

- [Attaching assemblies and resources](references-and-resources)
- [Working with a project](project-workflow)
- [Blazor resources](../core/blazor)