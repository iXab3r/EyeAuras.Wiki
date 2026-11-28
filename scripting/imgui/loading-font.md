---
title: Loading Custom TTF Font from Resources
description: How to make your own TTF font from embedded resources the default ImGui font
published: true
date: 2025-10-19T13:51:15.016Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-10-17T14:56:23.969Z
---
# Make your TTF the default ImGui font

Here we read a font from the script's resources and make it the default. The demo window shows how the typeface and text size change. The example assumes that no other script is changing the default font of the shared **Main** window at the same time.

You need desktop EyeAuras that is compatible with **EyeAuras.ImGuiSdk 0.1.47**. [Getting started](/en/scripting/imgui/getting-started) shows how to reference the package and register the service. Do not mix ImGui versions in one process.

1. Add a real `Roboto-Regular.ttf` to your **C# Script** project as an [embedded resource](/en/scripting/embedded-resources). For Cyrillic text, the file must contain Cyrillic glyphs.
2. Find the full resource name. It is shown in the project preparation diagnostics. Or run this temporarily in `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. In the main program, replace `MyScript.Roboto-Regular.ttf` with the full name you found. For example, a `Fonts` folder gives `MyScript.Fonts.Roboto-Regular.ttf`. This is a project resource name, not a path on disk and not the helper class's namespace.

## Script.csx

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;

{
    AddNewExtension<ImGuiContainerExtensions>();
    var files = GetService<IScriptFileProvider>();
    var fontData = files.ReadAllBytes("MyScript.Roboto-Regular.ttf");
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
                imgui.ReplaceFont(font);
            }
            ImGui.ShowDemoWindow();
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

4. Wait for compilation and click **Run**. The text in the demo window should switch to your font at size `20`. **Stop** removes the registration. If it was still the default, the SDK goes back to its standard font. It does not restore an earlier choice made by another script, because it does not know it.

![TTF embedded in the project](https://s3.eyeauras.net/media/2025/10/EyeAuras_nMZAqZ6YHR.png)
![Demo window with the selected font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Parameter or operation | Meaning |
| --- | --- |
| `MyScript.Roboto-Regular.ttf` | Full name of your embedded TTF. If the font is a file on disk, first read its bytes with `File.ReadAllBytes` and the real path. |
| `20` | Font size. By default AddFont uses `16`. |
| `"Roboto"` | A name for diagnostics. The font is not downloaded or looked up by it. |
| `Cyrillic` | The glyph range to request. It does not add glyphs that are missing from the TTF. |
| `ReplaceFont(font)` | Sets the default font of the shared atlas. To change the font only in your own drawing, use [PushFont/PopFont](/en/scripting/imgui/loading-font-static). |

`AddFont` copies the TTF bytes and returns an `ImGuiFontSpec`, not a ready native `ImFontPtr`. `IsInitialized` means the font was registered. The atlas is rebuilt after the current frame's handlers, so the first frame may still show the previous font.

On Stop, the program asks to remove **its own** registration on the render thread and waits until a frame confirms it. Then the renderer is removed and the API is released. This needs a working frame loop. `RemoveFont` removes the registration, but this implementation deliberately keeps the native copy of the TTF bytes. So do not load the font again every frame, and do not use this example to switch fonts endlessly. Disposing the API alone does not remove the registration.

The bytes are read before rendering starts. `ReadAllBytes` closes the stream it opened. The file service is not yours, so do not dispose it. Do not keep an `ImFontPtr` across atlas rebuilds. `AddFont` has no cancellation argument: the token here stops the script's wait and does not interrupt native font loading.

<details>
<summary>Other ranges and the old import</summary>

| ImGuiFontRangeType | Character range |
| --- | --- |
| `Default` | The standard ImGui range. |
| `Cyrillic`, `Greek` | Cyrillic or Greek glyphs. |
| `Japanese`, `Korean`, `Thai`, `Vietnamese` | Corresponding character sets when present in the TTF. |
| `ChineseFull`, `ChineseSimplifiedCommon` | Full or common simplified Chinese sets. |

The [old import](https://eyeauras.net/share/S20251017150828zhuomztM9lbi) is still available. It references `EyeAuras.ImGuiSdk, 0.1.17` with the old `AddFontFromMemoryTTF` API, so do not keep that reference next to the program above. AddFont/ReplaceFont/RemoveFont already exist in 0.1.42, but this page uses 0.1.47 from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json) everywhere. Version differences are listed in [the operation contract](/en/scripting/api/IImGuiExperimentalApi).

</details>
