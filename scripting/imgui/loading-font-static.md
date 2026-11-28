---
title: Loading Custom TTF Font from Static Class
description: How to read a TTF font in an ordinary class and apply it only to your own ImGui content
published: true
date: 2025-10-19T13:51:25.693Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
# Read a TTF through a helper and select it locally

Here a static `FontData` class reads the font file, and the font is applied only to your own drawing. Unlike [replacing the default font](/en/scripting/imgui/loading-font), this approach does not call `ReplaceFont` and does not change the default font of the shared window.

You need desktop EyeAuras that is compatible with **EyeAuras.ImGuiSdk 0.1.47**. [Getting started](/en/scripting/imgui/getting-started) shows how to reference the package and register the service. Do not mix ImGui versions in one process.

1. Add a real `Roboto-Regular.ttf` to your **C# Script** project as an [embedded resource](/en/scripting/embedded-resources). For Cyrillic text, the file must contain Cyrillic glyphs.
2. Find the full resource name. It is shown in the project preparation diagnostics. Or run this temporarily in `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. In the main program, replace `MyScript.Roboto-Regular.ttf` with the full name you found. For example, a `Fonts` folder gives `MyScript.Fonts.Roboto-Regular.ttf`. This is a project resource name, not a path on disk and not the helper class's namespace.

In the same project, create `FontData.cs` with **New file → C# Class**. The class is given the file service explicitly: `GetService` and `cancellationToken` are not available inside it.

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

4. Wait for compilation and click **Run**. The demo window is drawn with your font. **Stop** removes its own font registration and the render subscription.

![Static TTF byte array in the old project](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)
![Result with the selected font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Part | Responsibility |
| --- | --- |
| `FontData.Load(files, manifestName)` | Reads the bytes through the file service passed to it. This is the example's own class, not an automatically generated `EmbeddedBinaryData`. |
| `byte[]` | Ordinary TTF data. You do not have to read a resource: you can pass a byte array with a real TTF that you already have. |
| `ImGuiFontSpec font` | The font registration local to this run. It is not a static pointer to a native font. |
| `PushFont(font)` / `PopFont(font)` | A pair of calls that select the font temporarily within one frame. Until the native font exists, both do nothing. |
| `20`, `Cyrillic` | Size and range. By default AddFont uses `16` and `Default`. Other ranges are listed in [default font loading](/en/scripting/imgui/loading-font). |

The static method does not create a context and does not cache an `ImFontPtr` or an `ImGuiFontSpec`. You can reuse the bytes you read. But the font must be registered and used for a live context on its render thread.

`AddFont` copies the TTF bytes and returns an `ImGuiFontSpec`, not a ready native `ImFontPtr`. `IsInitialized` means the font was registered. The atlas is rebuilt after the current frame's handlers, so the first frame may still show the previous font.

On Stop, the program asks to remove **its own** registration on the render thread and waits until a frame confirms it. Then the renderer is removed and the API is released. This needs a working frame loop. `RemoveFont` removes the registration, but this implementation deliberately keeps the native copy of the TTF bytes. So do not load the font again every frame, and do not use this example to switch fonts endlessly. Disposing the API alone does not remove the registration.

The bytes are read before rendering starts. `ReadAllBytes` closes the stream it opened. The file service is not yours, so do not dispose it. Do not keep an `ImFontPtr` across atlas rebuilds. `AddFont` has no cancellation argument: the token here stops the script's wait and does not interrupt native font loading.

<details>
<summary>Old project and package versions</summary>

The [old import](https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D) used 0.1.17 with a different font-loading API. Keep a single 0.1.47 reference in this project, as in the code above, and do not add the old version next to it. To check the version you chose, use the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json) and the [operation contract](/en/scripting/api/IImGuiExperimentalApi).

</details>
