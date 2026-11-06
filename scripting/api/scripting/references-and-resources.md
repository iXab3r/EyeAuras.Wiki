---
title: AI Scripting: References And Resources
description: AI-first map for script references, NuGet packages, assembly references, and embedded resources.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, nuget, resources, references, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# References And Resources Discovery Map

Reference map for script project dependencies: NuGet references, assembly
references, embedded files, `IScriptFileProvider`, DLL/image/font/model assets,
and how those pieces behave during export/import.

## User Intents

- Add an external NuGet package to a mini-app.
- Reference an assembly by name or embedded DLL file.
- Ship images, fonts, JSON, ONNX models, scripts, or DLLs with the project.
- Read embedded files from C# code.
- Use embedded files from Blazor or ImGui.
- Keep exported projects buildable in a normal IDE.
- Decide whether a dependency should be NuGet, assembly reference, or resource.

## Concept Model

- `#r` directives are script-level reference declarations.
- `#r "nuget:..."` resolves a NuGet package and its compile/runtime assets.
- `#r "assemblyName:..."` references an already-loadable assembly by name.
- `#r "assemblyPath:..."` references a DLL file path or embedded DLL resource.
- `#r` directives belong in top-level script files, not arbitrary helper
  classes.
- Embedded resources are files carried with the script project and compiled into
  the script assembly.
- `IScriptFileProvider` exposes script files through `IFileProvider`.
- Blazor windows can serve script files directly to WebView content.
- Large binary assets should be streamed when possible instead of copied into
  large byte arrays.

## Reference Kinds

| Kind | Use for | Notes |
| --- | --- | --- |
| `#r "nuget:Package, Version"` | Public packages and optional SDKs | Preferred when the dependency exists as a package. |
| `#r "assemblyName:Name"` | Already loaded or otherwise resolvable assemblies | Useful for assemblies present in host/runtime but not in default references. |
| `#r "assemblyPath:File.dll"` | Local or embedded DLLs | Prefer relative project/resource paths for portable mini-apps. |
| Project reference | Helper libraries in exported solutions | Good for IDE/test projects; import should only include payload projects. |
| Embedded resource | Images, fonts, models, JSON, JS/CSS, DLLs | Access through `IScriptFileProvider` or Blazor resource paths. |

## Console Script NuGet

EyePad console execution (`inputFile`, `--run`, `--eval`, and `--run -`) uses
the same top-level script reference pipeline as editor execution. A console
script can place NuGet directives at the top of the source:

```csharp
#r "nuget: Humanizer, 2.14.1"
using Humanizer;

Console.WriteLine("script".Pluralize());
```

NuGet restore and resolver diagnostics are EyeAuras logs, not script stdout.
For deterministic offline hosts and E2E tests, the script NuGet resolver can be
pointed at alternate package sources with `EA_SCRIPT_NUGET_PRIMARY_SOURCE` and
`EA_SCRIPT_NUGET_EYEAURAS_SOURCE`. Normal app runs use nuget.org and the
EyeAuras package feed by default.

## Embedded Resource Details

- Resources are included in the script assembly as `EmbeddedResource` items.
- Exported project files should keep embedded resource items in the `.csproj`.
- Import/live-import scans project resource metadata and preserves relative
  paths.
- During import/live-import, paths declared as `EmbeddedResource` are owned by
  the resource pipeline, not imported again as ordinary text documents.
- `ScriptEmbeddedResourceFileProvider` resolves exact manifest names and
  deterministic path suffixes.
- Resource lookup supports full manifest names, full slash-form names, and
  folder-qualified suffix paths when they identify one distinct manifest.
- Resources under `wwwroot/` also resolve through Blazor-style web paths such
  as `css/site.css`.
- Ambiguous suffixes return not found and log a warning; leaf names are not
  generic aliases.
- `Watch(...)` on embedded resources is not a live file watcher; resources are
  baked into the compiled assembly.

## API Details

- `IScriptFileProvider` - script file provider interface, extends
  `IFileProvider`.
- `IFileProvider.GetFileInfo(...)` - returns file info/stream for one resource.
- `IFileProvider.GetDirectoryContents(...)` - enumerates folders/resources.
- `IFileInfo.CreateReadStream()` - stream large files.
- `ScriptEmbeddedResourceFileProvider` - embedded resource provider.
- `GetManifestNames()` - diagnostic list of raw manifest resource names.
- `CompositeScriptFileProvider` - combines multiple script file providers.
- `ExposeEmbeddedResourcesScriptRuntimeVisitor` - attaches embedded resource
  provider to runtime context.

## Add and use a library

Put an explicit package version at the start of `Script.csx`:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

var text = JsonConvert.SerializeObject(new { Name = "Example", Count = 3 });
Log.Info(text);
```

After successful restore and compilation, the log contains JSON with two fields.
The package must be available and compatible with the runtime; this is not a
promise to support every NuGet package. Export represents it as `PackageReference`.
Ordinary helper classes import namespaces, not their own `#r` directives.

Use `#r "assemblyName: AssemblyName"` for metadata already available to the host.
For your own DLL, add the compatible assembly as a script resource and use
`#r "assemblyPath: MyLib.dll"`. These are reference forms, not complete library
operations: you still need the library and its actual API. References do not
register services; see [container extensions](container-extensions).

## Read a text resource

Use `Show Files` → `Add Existing File...` to add `docs/help.txt` containing
`Project help`. In an IDE, declare `EmbeddedResource Include="docs/help.txt"`
in the project and import it. Run this in `Script.csx`:

```csharp
using System.IO;
using EyeAuras.Repl;

{
    var files = GetService<IScriptFileProvider>();
    var file = files.GetFileInfo("docs/help.txt");
    if (!file.Exists)
    {
        Log.Warn("Resource docs/help.txt was not found");
        return;
    }
    using var stream = file.CreateReadStream();
    using var reader = new StreamReader(stream);
    Log.Info(reader.ReadToEnd());
}
```

The log shows the file's contents. The stream and reader close when the block
ends; the provider is borrowed. Pass the provider and logger explicitly to helpers.

The provider retains original manifest names. Full names and their slash forms
are case-insensitive; folder-qualified paths allow a boundary-matched suffix lookup,
including `wwwroot` variants. All candidates participate in ambiguity checks.
A leaf name such as `help.txt` does not promise lookup in every folder; ambiguous
paths return `Exists == false`.

`GetDirectoryContents` exposes the manifest-name tree, which may differ from the
original project folders. `GetManifestNames()` belongs to the concrete
`ScriptEmbeddedResourceFileProvider`; the resolved service may be composite,
so a cast is not guaranteed. See [embedded resources](/en/scripting/embedded-resources).

## Pass resources to UI or a library

Add `Images/logo.png` and use `<img src="Images/logo.png" />` in a Razor component
whose [Blazor window](/en/scripting/blazor-windows/getting-started) exposes script files.
The same HTML outside that host cannot access an assembly resource automatically.

For ImGui, first install and register the SDK, then read the image/font and pass it
to the appropriate API. See the complete [ImGui setup](/en/scripting/imgui/getting-started).
Bytes alone do not create a texture or initialize an ML model.

A stream avoids additional whole-file copies in caller code; `ReadAllBytes` allocates
an array. Embedded `Watch` returns `NullChangeToken`: new bytes require updated
resources and recompilation, not observation of the old assembly.

## Prefer

- Prefer NuGet packages over raw DLL resources when a package exists.
- Prefer relative resource paths for portable mini-apps.
- Prefer `IScriptFileProvider` over manual manifest name parsing.
- Prefer streams for large assets.
- Prefer subfolder-qualified resource names when names may collide.
- Prefer project references for helper libraries during IDE work, and import
  only the intended payload back into the script.

## Avoid

- Avoid absolute `assemblyPath` references in portable/shared docs or mini-apps.
- Avoid placing `#r` directives inside ordinary C# helper classes.
- Avoid assuming embedded resources update without recompilation.
- Avoid reading large models/videos into memory unless the target library
  requires bytes.
- Avoid relying on leaf-name lookup when two resources share the same file name.

## Research Anchors

- `IScriptFileProvider`
- `ScriptEmbeddedResourceFileProvider`
- `CompositeScriptFileProvider`
- `ExposeEmbeddedResourcesScriptRuntimeVisitor`
- `EmbeddedResourcesScriptVisitor`
- `IFileProvider`
- `IFileInfo`
- `GetFileInfo`
- `GetDirectoryContents`
- `CreateReadStream`
- `GetManifestNames`
- `#r "nuget:"`
- `#r "assemblyName:"`
- `#r "assemblyPath:"`
- `EmbeddedResource`

## Search Synonyms

- NuGet reference
- assembly reference
- assembly path
- embedded resource
- script file provider
- resource file
- embedded DLL
- embedded image
- embedded font
- ONNX model resource
- Blazor static file
- ImGui font resource
- resource manifest

## Related Maps

- [scripting/container-extensions.md](/en/scripting/api/scripting/container-extensions)
- [scripting/project-workflow.md](/en/scripting/api/scripting/project-workflow)
- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)
- [nuget/frida-sdk.md](/en/scripting/api/nuget/frida-sdk)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [computer-vision/images.md](/en/scripting/api/computer-vision/images)
- [ml/ai.md](/en/scripting/api/ml/ai)

## How assemblyPath is resolved

At source revision `c8b2304`, a separate visitor resolves relative paths against
script resources. The file resolver probes an absolute path or a path relative to
`AppDomain.CurrentDomain.BaseDirectory`, then tries assembly-name resolution for
relative names. Pre-compilation directive processing also has a `FileInfo(path)`
branch. Do not assume one base folder for arbitrary relative disk DLL paths:
package portable DLLs as resources, or supply an explicit existing local path.

[File resolver source](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Repl/Visitors/FileReferencesScriptVisitor.cs), [resource visitor](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Repl/Visitors/EmbeddedResourcesScriptVisitor.cs).
