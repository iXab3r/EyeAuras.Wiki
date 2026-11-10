---
title: Loading Custom TTF Font from Static Class
description: 
published: true
date: 2025-10-19T13:51:25.693Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
# Read a TTF through a helper and select it locally

Move byte loading into an ordinary static `FontData` class, while selecting the font only during your own drawing. Unlike [changing the default](/en/scripting/imgui/loading-font), this example does not call `ReplaceFont` or change the shared default selection.

Use desktop EyeAuras compatible with **EyeAuras.ImGuiSdk 0.1.47**. [Getting started](/en/scripting/imgui/getting-started) explains package reference and service registration; do not mix ImGui versions in one process.

1. Add a real `Roboto-Regular.ttf` to your **C# Script** project as an [embedded resource](/en/scripting/embedded-resources). For Cyrillic text, the TTF itself must contain those glyphs; its filename does not establish coverage.
2. Find its full manifest name in preparation diagnostics, or temporarily use this `Script.csx` entry point:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. Substitute the actual name for `MyScript.Roboto-Regular.ttf` below. A `Fonts` folder can produce `MyScript.Fonts.Roboto-Regular.ttf`. This is a project resource name, not an arbitrary disk path or the helper class's namespace.

Create `FontData.cs` with **New file → C# Class** in the same project. The helper receives its file provider explicitly; it does not inherit `GetService` or `cancellationToken` from the script.

## FontData.cs

```csharp
using EyeAuras.Repl;
using PoeShared.Scaffolding;

namespace FontDemo;

public static class FontData
{
    public static byte[] Load(IScriptFileProvider files, string manifestName)
    {
        return files.ReadAllBytes(manifestName);
    }
}
```

## Script.csx

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;
using FontDemo;

{
    AddNewExtension<ImGuiContainerExtensions>();
    var files = GetService<IScriptFileProvider>();
    var fontData = FontData.Load(files, "MyScript.Roboto-Regular.ttf");
    using var imgui = GetService<IImGuiExperimentalApi>();
    var gate = new object();
    var stopping = false;
    ImGuiFontSpec font = default;
    var removed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    using var rendering = imgui.AddRenderer(_ =>
    {
        lock (gate)
        {
            if (stopping)
            {
                if (font.IsInitialized) imgui.RemoveFont(font);
                font = default;
                removed.TrySetResult(true);
                return;
            }
            if (!font.IsInitialized)
            {
                font = imgui.AddFont(fontData, 20, "Roboto", ImGuiFontRangeType.Cyrillic);
            }
            ImGuiEx.PushFont(font);
            try { ImGui.ShowDemoWindow(); }
            finally { ImGuiEx.PopFont(font); }
        }
    });
    try { await Task.Delay(System.Threading.Timeout.Infinite, cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        lock (gate) stopping = true;
        await removed.Task;
    }
}
```

4. After compilation, click **Run**. The demo uses your selected font while it is drawn, without assigning the default for other callbacks. Stop removes this registration and the render subscription.

The earlier resource screenshot shows a static `EmbeddedBinaryData` byte array. This `FontData` reads the embedded resource instead; manual `GCHandle` pinning is unnecessary because AddFont copies the bytes.

![Static TTF byte array in the historical project](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)
![Selected font result](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Part | Responsibility |
| --- | --- |
| `FontData.Load(files, manifestName)` | Reads through an explicit dependency. This is the example's helper, not an automatically generated `EmbeddedBinaryData` class. |
| `byte[]` | Ordinary TTF data. An existing genuine TTF byte array can replace resource reading. |
| `ImGuiFontSpec font` | Registration local to this Run, not a static native font pointer. |
| `PushFont(font)` / `PopFont(font)` | A paired temporary selection in the same frame. Both do nothing until the native font is available. |
| `20`, `Cyrillic` | Explicit size and range; defaults are `16`/`Default`. [Default font loading](/en/scripting/imgui/loading-font) lists other ranges. |

The static helper creates no context and caches no native pointer or specification. Prepared bytes can be reused; registration and use still belong to a live context on its render thread. `static` does not make a native font valid for every future context after its renderer closes.

`AddFont` copies the TTF bytes and returns an `ImGuiFontSpec`, not a ready native `ImFontPtr`. `IsInitialized` means the specification was registered. The dirty atlas is rebuilt after frame handlers, so the first frame can still use the previous font.

On Stop, the program requests removal of **its own** specification on the render thread and waits for that callback's acknowledgement. It then removes rendering and releases the API. This requires a working frame loop. `RemoveFont` removes the specification, but this implementation intentionally retains the native byte copy. Do not register a font every frame or turn this into an unlimited font-switching loop. API disposal alone does not remove a registration.

`ReadAllBytes` finishes reading and closes its stream before rendering. Do not dispose the borrowed file service or retain `ImFontPtr` across atlas rebuilds. `AddFont` has no cancellation-token argument: this token stops the script's wait, not native font loading.

<details>
<summary>Historical project and package versions</summary>

The [historical import](https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D) used 0.1.17 and a different font-loading API. Keep one 0.1.47 reference for this project. 0.1.42 also contains AddFont/ReplaceFont/RemoveFont; that is not a reason to load several versions together. Use the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json) and [operation contract](/en/scripting/api/IImGuiExperimentalApi) to select the matching version.

</details>
