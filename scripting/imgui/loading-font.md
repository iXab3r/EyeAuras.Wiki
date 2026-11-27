---
title: Loading Custom TTF Font from Resources
description: 
published: true
date: 2025-10-19T13:51:15.016Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-10-17T14:56:23.969Z
---
# Make your TTF the default ImGui font

Read a font from script resources and select it as the default. The demo window shows the new text shape and size. Run this exercise without other scripts changing the shared **Main** default font.

Use desktop EyeAuras compatible with **EyeAuras.ImGuiSdk 0.1.47**. [Getting started](/en/scripting/imgui/getting-started) explains package reference and service registration; do not mix ImGui versions in one process.

1. Add a real `Roboto-Regular.ttf` to your **C# Script** project as an [embedded resource](/en/scripting/embedded-resources). For Cyrillic text, the TTF itself must contain those glyphs; its filename does not establish coverage.
2. Find its full manifest name in preparation diagnostics, or temporarily use this `Script.csx` entry point:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. Substitute the actual name for `MyScript.Roboto-Regular.ttf` below. A `Fonts` folder can produce `MyScript.Fonts.Roboto-Regular.ttf`. This is a project resource name, not an arbitrary disk path or the helper class's namespace.

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

4. After compilation, click **Run**. The demo text should change to your selected font at size `20`. Stop removes its registration; if it is still the default, the SDK resets that selection to its standard font rather than restoring an unknown previous choice from another script.

The earlier screenshots show the resource and result. Their `AddFontFromMemoryTTF` code belongs to 0.1.17; the program above uses AddFont/ReplaceFont:

![TTF embedded in the earlier project](https://s3.eyeauras.net/media/2025/10/EyeAuras_nMZAqZ6YHR.png)
![Demo using a selected font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Parameter or operation | Meaning |
| --- | --- |
| `MyScript.Roboto-Regular.ttf` | Full name of your embedded TTF. For a physical file, first read its bytes with `File.ReadAllBytes` and its real path. |
| `20` | Font size; AddFont defaults to `16`. |
| `"Roboto"` | Diagnostic name, not a request to download or locate a font. |
| `Cyrillic` | Requested glyph range. It cannot create glyphs missing from the TTF. |
| `ReplaceFont(font)` | Selects the shared atlas default. For local selection use [PushFont/PopFont](/en/scripting/imgui/loading-font-static) instead. |

`AddFont` copies the TTF bytes and returns an `ImGuiFontSpec`, not a ready native `ImFontPtr`. `IsInitialized` means the specification was registered. The dirty atlas is rebuilt after frame handlers, so the first frame can still use the previous font.

On Stop, the program requests removal of **its own** specification on the render thread and waits for that callback's acknowledgement. It then removes rendering and releases the API. This requires a working frame loop. `RemoveFont` removes the specification, but this implementation intentionally retains the native byte copy. Do not register a font every frame or turn this into an unlimited font-switching loop. API disposal alone does not remove a registration.

`ReadAllBytes` finishes reading and closes its stream before rendering. Do not dispose the borrowed file service or retain `ImFontPtr` across atlas rebuilds. `AddFont` has no cancellation-token argument: this token stops the script's wait, not native font loading.

<details>
<summary>Other ranges and the historical import</summary>

| ImGuiFontRangeType | Character range |
| --- | --- |
| `Default` | The native ImGui default range. |
| `Cyrillic`, `Greek` | Cyrillic or Greek glyphs. |
| `Japanese`, `Korean`, `Thai`, `Vietnamese` | Corresponding character sets when present in the TTF. |
| `ChineseFull`, `ChineseSimplifiedCommon` | Full or common simplified Chinese sets. |

The [historical import](https://eyeauras.net/share/S20251017150828zhuomztM9lbi) referenced `EyeAuras.ImGuiSdk, 0.1.17` and its different `AddFontFromMemoryTTF` API. Do not keep that reference beside this program. AddFont/ReplaceFont/RemoveFont are already present in 0.1.42; this page consistently chooses 0.1.47 from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json). See [the operation contract](/en/scripting/api/IImGuiExperimentalApi) for version boundaries. Package availability does not establish native renderer compatibility in every installed host.

</details>
