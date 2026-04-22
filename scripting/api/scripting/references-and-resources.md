---
title: AI Scripting: References And Resources
description: AI-first map for script references, NuGet packages, assembly references, and embedded resources.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, nuget, resources, references
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

## Embedded Resource Details

- Resources are included in the script assembly as `EmbeddedResource` items.
- Exported project files should keep embedded resource items in the `.csproj`.
- Import/live-import scans project resource metadata and preserves relative
  paths.
- `ScriptEmbeddedResourceFileProvider` maps manifest names back to path-like
  names.
- Resource lookup supports full manifest names, relative paths, dotted paths,
  and leaf names when unambiguous.
- Duplicate file names can make short leaf-name lookup ambiguous.
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

## Common Flows

### Add Optional SDK Package

1. Add the NuGet reference in the top-level script or project file.
2. Import the SDK namespace.
3. Add the SDK's container extension when it requires explicit registration.
4. Resolve/use the capability through the context-appropriate access pattern.

### Read Embedded File

1. Add the file to the script project as an embedded resource.
2. Resolve `IScriptFileProvider` from the current script/app context.
3. Use `ReadAllText`, `ReadAllBytes`, `GetFileInfo`, or `CreateReadStream`.
4. Prefer subfolder-qualified names for files with common names.

### Use Resource In Blazor

1. Add CSS/JS/image/video as an embedded resource.
2. Reference it from Razor by relative path, or load CSS/JS through Blazor
   utilities.
3. Keep resource paths stable when exporting/importing.

### Use Resource In ImGui

1. Add image/font/markdown bytes as an embedded resource.
2. Read bytes through `IScriptFileProvider`.
3. Use `IImGuiExperimentalApi.AddFont`, `ReplaceFont`, `GetOrAddImage`, or
   `ImGuiEx.ImageRgba32`/`ImageFromUrl` depending on the asset.

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

- `scripting/container-extensions.md`
- `scripting/project-workflow.md`
- `nuget/imgui-sdk.md`
- `nuget/frida-sdk.md`
- `windows-subsystems/blazor-windows.md`
- `computer-vision/images.md`
- `ml/ai.md`
