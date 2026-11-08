---
title: Embedded Resources
description: 
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:42:12.071Z
---

# What is it and why you need it
Embedded Resources is a mechanism in scripts that lets you “carry along” any files right next to the script — images, videos, ML models, executables, and even DLLs.
Images can be used in your custom UI, videos may contain training materials, and DLLs — additional code that for some reason is inconvenient to ship as a [NuGet](/scripting/nuget) package.

## NuGet
Please note: when a library exists on [NuGet](https://nuget.org/), it is far more reliable to use [#r "nuget:"](/scripting/nuget) and reference the package rather than a raw DLL file.

## How to add
Right-click the script’s file tree (the Show Files button toggles it) -> Add Existing File...
![Add Existing File...](https://s3.eyeauras.net/media/2025/10/EyeAuras_hFvtxUlceb.png)
Or via the New button.

After you add a file, it will appear in the list and can be selected.
![Select file](https://s3.eyeauras.net/media/2025/10/EyeAuras_1Yr73UevIj.png)

## How to remove
To remove a resource, just delete the file from the list.

## How to use
Files are included in the compiled script assembly. Reading their bytes does not automatically initialize a model, font or executable library.

### Read text through IScriptFileProvider

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

### Via Blazor
When building UI via Blazor, you can also use files directly. For example, if you added `Image 12.jpg` to the script, to display it you just write:
```html
<img src="Image 12.jpg" />
```
This markup belongs in a Razor component whose [Blazor window](/en/scripting/blazor-windows/getting-started) exposes script files. An external HTML page does not automatically have access to these resources.

### As a referenced DLL
Similar to NuGet packages, you can include a needed DLL directly in the script and still have code completion, type discovery, etc.
All you need to do is:
- add the required .NET assembly to the script, for example, "MyDll.dll"
- in `Script.csx` write
```csharp
#r "assemblyPath: MyDll.dll"
```
That’s it. When compiling the script, EyeAuras will look for a matching DLL among the project’s resources and use it. And when the script runs — it will load it from resources. No loose files lying around.

## Export/Import C# Solution
EyeAuras can export a script as a full C# `.sln` and then you can open it in JetBrains Rider or Visual Studio.

Embedded resources (files) are exported too and marked as `Embedded Resource`.
For example, in the case of `Image 12.jpg`, first, the file itself will be exported into the target folder, and second, the exported project file will contain:
```xml
<ItemGroup>
   <EmbeddedResource Include="Image 12.jpg" />
   <None Remove="Image 12.jpg" />
</ItemGroup>
```
This tells the C# compiler to include `Image 12.jpg` as an embedded resource inside the final DLL.

When importing the `.sln` back, EyeAuras reads `Embedded Resource` items and you will see them as files in the list.

In Visual Studio/Rider this is Build Action = EmbeddedResource. If you opened the exported project, you can:
- add/remove files right in the project folder
- in the .csproj specify <EmbeddedResource Include="..."/> for each resource
- optionally add <None Remove="..."/>, so the file does not get copied as ordinary content into the output folder

On import back, EyeAuras will scan the .csproj, find all EmbeddedResource items, and show them in the script’s file list. Names and relative paths are preserved — this is important for correct access from code/Blazor. Use explicit `Include` items: import is not a complete execution of arbitrary MSBuild targets or wildcard rules.
![Marking as embedded resource in Rider](https://s3.eyeauras.net/media/2025/10/rider64_24V6ZnFu8u.png)

## Under the hood
When building scripts, EyeAuras follows the official compiler’s logic as closely as possible — the files you added will be included as Embedded Resources in the final DLL, visible and accessible via Assembly.GetManifestResourceNames and Assembly.GetManifestResourceStream.

A quick refresher on .NET methods:
- Assembly.GetManifestResourceNames() — returns the full list of resource names like "DefaultNamespace.folder.file.ext".
- Assembly.GetManifestResourceStream(fullName) — opens a stream to read a resource by its FULL name.

To list exact names, run this in `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

`Script` is the generated submission type, not a global type for ordinary libraries.
`GetManifestResourceStream` needs an exact name from this list, and its caller must
close the returned stream. Usually the file-provider example is simpler.

### Naming
One peculiarity of C# Embedded Resources is that when resources are included in a DLL, the relative path is “folded” and turns into namespace.folder.filename.

How the full resource name is formed during build:
- Take the project’s DefaultNamespace (if not set — the project name)
- Replace slashes in the file’s relative path with dots
- Result: FullName = DefaultNamespace + "." + relative/path/with/dots
  Example: project with namespace MyScript and file Images/logo.png → resource: MyScript.Images.logo.png

Use the full manifest name or its full slash form; both are case-insensitive.
A folder-qualified path such as `Images/logo.png` allows boundary-matched suffix
lookup, including `wwwroot` variants. A leaf name such as `logo.png` is not a
universal alias. Multiple matching resources return `Exists == false` and log a
warning; the provider does not choose an arbitrary first match.

For `MyScript.Images.logo.png`, use that full name or `MyScript/Images/logo.png`.
`Images/logo.png` also works when unambiguous. Do not assume arbitrary dotted
partial names behave like slash paths. `GetDirectoryContents` exposes a tree of
manifest names, which need not reproduce the original project folders.

## Read a large resource without an additional whole-file array

Add `video/tutorial.mp4` through `Show Files`. This script counts bytes; it does
not play the video. Run it in `Script.csx`:

```csharp
using System.IO;
using EyeAuras.Repl;

{
    var file = GetService<IScriptFileProvider>().GetFileInfo("video/tutorial.mp4");
    if (!file.Exists) { Log.Warn("Video not found"); return; }
    using var stream = file.CreateReadStream();
    var buffer = new byte[8192];
    long total = 0;
    int count;
    while ((count = stream.Read(buffer, 0, buffer.Length)) > 0)
    {
        cancellationToken.ThrowIfCancellationRequested();
        total += count;
    }
    Log.Info($"Read {total} bytes");
}
```

JSON, fonts and models need their own configuration type or consuming library API.
Reading bytes is only the first step. Use `ReadAllBytes` when the consumer requires
an entire array.

## Loading a DLL from resources — how it works

- At compile time
  - In Script.csx, add the directive:
    ```csharp
    #r "assemblyPath: MyLib.dll"
    ```
  - EyeAuras will find the MyLib.dll file in resources and add it as a reference. This enables code completion, type discovery, and successful compilation.

- At runtime
  - EyeAuras subscribes to AssemblyLoadContext.Resolving and tries to load the assembly from embedded resources.

After adding a compatible `Newtonsoft.Json.dll` to the script files, test its API:
```csharp
#r "assemblyPath: Newtonsoft.Json.dll"
using Newtonsoft.Json;
Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

## How to list all available names

- Via .NET API (full names):
```csharp
var asm = typeof(Script).Assembly;
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}
```

- Via file provider (IFileProvider):
```csharp
var files = GetService<IScriptFileProvider>();
foreach (var fi in files.GetDirectoryContents("/"))
{
    Log.Info($"Found: {fi.Name} ({fi.Length} b)");
}
```

`GetService<IScriptFileProvider>()` may return a `CompositeScriptFileProvider`.
The first provider containing a file has priority, but ambiguous lookup inside
the embedded provider remains not found. Casting the service to
`ScriptEmbeddedResourceFileProvider` is not guaranteed; use the assembly example
above to list manifest names.

## FAQ and nuances

- File is not found
  - Make sure it’s added to the script’s file list
  - Try specifying a subfolder: instead of "logo.png" → "Images/logo.png"
  - Check the complete manifest name or folder-qualified path

- Duplicate names
  - If there are two files with the same tail (a/logo.png and b/logo.png), an ambiguous query returns not found. Disambiguate with a subfolder or full manifest name.

- Large files
  - Read as a stream via CreateReadStream() — don’t keep everything in memory

- I changed the file but don’t see updates
  - Embedded resources are baked into the DLL. Update the resource and recompile the script. Embedded `Watch` returns `NullChangeToken`; it does not watch an existing assembly for new bytes.

- DLL does not load
  - Check that `#r "assemblyPath: ..."` points to the correct file.

- Dots or slashes in paths?
  - Use the full manifest name or a slash path; arbitrary dotted partial names do not have the same suffix-lookup guarantee.

For source-backed DLL resolution and its disk/resource distinction, see [references and resources](/en/scripting/api/scripting/references-and-resources).
