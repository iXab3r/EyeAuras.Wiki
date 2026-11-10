---
title: Embedded Resources
description: 
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:42:12.071Z
---
# Include a help file with your script

An embedded resource stores a file inside the compiled script assembly. Add **docs/help.txt** so the help travels with the project and can be read without a separate disk path. Images, videos, models, executables and DLLs can also be carried this way; including a file does not execute it or initialize a model.

You need an editable **C# Script** project. The examples run in its top-level **Script.csx**, where EyeAuras supplies **GetService**, **Log** and **cancellationToken**. Pass required dependencies explicitly to an ordinary helper class.

## Add the file and read its text

1. Prepare your own `help.txt` containing `Project help`.
2. Show **File Tree**. In its context menu, choose **Add → Existing File(s)...** and select the file. Older images call these **Show Files** and **Add Existing File...**.

![Adding an existing file in the older editor](https://s3.eyeauras.net/media/2025/10/EyeAuras_hFvtxUlceb.png)

3. Use **Rename...** to set its resource name to `docs/help.txt`. Selecting a binary resource shows its description, rather than an editor for its contents.

![Selected resource in the file tree](https://s3.eyeauras.net/media/2025/10/EyeAuras_1Yr73UevIj.png)

4. Replace **Script.csx** with this complete program:

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

5. Click **Run**. The log should show `Project help`. If it reports that the resource was not found, check the name against the lookup rules below.

The block closes the stream and StreamReader. The container's **IScriptFileProvider** is borrowed; do not dispose it. To remove a resource, delete it from the project list. To replace its bytes, remove it and add the changed file under the same final name, or import the change from the IDE, then recompile.

**New file** can instead create an editable text document, such as Markdown. The file service exposes that too, but its presence in the tree does not make it a binary embedded resource. The [README example](/en/scripting/examples/basic/file-provider) demonstrates that separate path.

## Choose a resource name and reader

Resource compilation uses the project's **DefaultNamespace**, or its project name when unset. Slashes become dots: namespace `MyScript` and file `Images/logo.png` produce `MyScript.Images.logo.png`.

| Access form | Lookup behaviour |
| --- | --- |
| IScriptFileProvider.GetFileInfo | Accepts a full manifest name, its full slash form, or an unambiguous boundary suffix. Full-name comparisons are case-insensitive. |
| `Images/logo.png` | Can match `MyScript.Images.logo.png`; `wwwroot` variants are also considered. Multiple candidates return Exists == false instead of selecting an arbitrary file. |
| Assembly.GetManifestResourceNames() | Lists the exact full resource names in that assembly. |
| Assembly.GetManifestResourceStream(fullName) | Opens a stream using the exact, case-sensitive manifest name. The caller must close it. |
| GetDirectoryContents | Shows a diagnostic tree projection of resource names, not necessarily the original folders with project prefixes removed. |

A leaf such as `logo.png` is not a universal alias. Arbitrary dotted partial names do not have the same guarantees as slash paths. When ambiguous, use a full name such as `MyScript.Images.logo.png` or `MyScript/Images/logo.png`.

List full names from **Script.csx**:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

**Script** here is the generated submission type, not a universal type available in ordinary libraries. An equivalent listing with a log prefix is:

```csharp
var asm = typeof(Script).Assembly;
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}
```

For the shared provider's directory listing, add `using EyeAuras.Repl;` at the top of **Script.csx**, then use this fragment:

```csharp
var files = GetService<IScriptFileProvider>();
foreach (var fi in files.GetDirectoryContents("/"))
{
    Log.Info($"Found: {fi.Name} ({fi.Length} b)");
}
```

The runtime can supply a composite provider: embedded assembly resources precede the earlier source of project files, and the first existing file wins. This does not resolve ambiguity inside one embedded source. Do not assume the returned service can be cast to ScriptEmbeddedResourceFileProvider.

## Keep resources when working in an IDE

[Project export](/en/scripting/ide-integration) writes resource files to disk and adds explicit **EmbeddedResource** items to `.csproj`. For `Image 12.jpg`:

```xml
<ItemGroup>
   <EmbeddedResource Include="Image 12.jpg" />
   <None Remove="Image 12.jpg" />
</ItemGroup>
```

In Rider or Visual Studio, the corresponding build action is **EmbeddedResource**.

![EmbeddedResource build action in Rider](https://s3.eyeauras.net/media/2025/10/rider64_24V6ZnFu8u.png)

Import reads explicit **Include** entries and their file bytes relative to the project. Declare resources explicitly; import does not execute arbitrary MSBuild targets or promise all wildcard rules. **None Remove** removes an item from the None set; it does not replace every output-copy setting.

<details>
<summary>Display an image or stream a large file</summary>

After adding `Image 12.jpg`, a **Razor component in a prepared window** can contain:

```html
<img src="Image 12.jpg" />
```

The window must expose project files, as described in [Blazor Windows](/en/scripting/blazor-windows/getting-started). An arbitrary external HTML page does not gain that access.

For a large file, read a stream instead of allocating another whole-file array. Add `video/tutorial.mp4`, then run this separate **Script.csx**. It counts bytes without playing the video; cancellation lets **Stop** end the loop:

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

JSON, fonts and models need their own configuration or consumer API after reading. Use a whole byte array only when that API requires one.

</details>

<details>
<summary>Reference a DLL stored as a resource</summary>

If a library is on [NuGet](https://nuget.org/), prefer its [package](/en/scripting/nuget) for version and dependency information. For your own compatible DLL, add it to the resources and put its reference at the start of **Script.csx**:

```csharp
#r "assemblyPath: MyDll.dll"
```

This is a reference declaration, not a complete program. For the alternate filename MyLib.dll, the directive is:

```csharp
#r "assemblyPath: MyLib.dll"
```

During compilation, resource metadata supplies the reference. At runtime, the assembly-load handler can resolve it from embedded bytes. Dependencies and runtime compatibility still need to be satisfied.

For example, **after adding a compatible Newtonsoft.Json.dll** to the project:

```csharp
#r "assemblyPath: Newtonsoft.Json.dll"
using Newtonsoft.Json;
Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

</details>

## When a file change is not visible

Resources are baked into the DLL. This provider's **Watch** returns **NullChangeToken**: changing a loose file does not rewrite a loaded assembly. Update the project resource or import it, wait for compilation, and run the new version.

For **Exists == false**, check project inclusion, full names and ambiguous endings such as `a/logo.png` and `b/logo.png`. For a DLL, also check its **assemblyPath** directive and dependency diagnostics. See [NuGet and assembly references](/en/scripting/nuget) for dependency declarations.
