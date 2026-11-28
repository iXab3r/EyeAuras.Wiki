---
title: "Show 50 known telemetry rows with your own font"
description: "Draw a fixed list of 50 values in an ImGui panel with ImGuiSdk 0.1.47 and your own TTF font, until Stop."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Show 50 known telemetry rows with your own font

A native ImGui panel shows 50 known sample values in your own font. The script creates the data itself.

You need desktop EyeAuras on Windows that is compatible with **EyeAuras.ImGuiSdk 0.1.47**, its **EyeAuras.ClickableTransparentOverlay 11.5.28** dependency and the required native graphics components. The package targets .NET 8 Windows. Do not load a second ImGui.NET/CTO version into the same process.

1. Take a real TTF font that you are allowed to use. It must contain Latin glyphs and any Cyrillic glyphs you need. Name your copy `RecipeSans.ttf`.
2. Create an aura `RecipeTelemetry` and add **Actions → On Enter → C# Script** for manual Run. In the script's file tree choose **Add → Existing File(s)...**, add the font as a resource and **Rename** it to `fonts/RecipeSans.ttf`. There must be only one such resource.
3. Replace the whole **Script.csx** with the program below. Keep one `#r` for version **0.1.47** from the [EyeAuras package source](/en/scripting/nuget). The container extension in the code registers the service before the script asks for it.
4. When the package is restored and the script compiles, click **Run**. The **Known telemetry** window shows rows from `Sample 01: 10` to `Sample 50: 500`. Scroll the panel to reach the last one. The 20 px font appears after the atlas is rebuilt, so the first frame may still be drawn in the previous font.
5. Click **Stop**. The next render callback removes this Run's font specification and confirms the removal. Only then does the script remove its rendering and release its share of the API. A new Run registers the font again. To change the data, replace `value * 10` with `value * 20`, recompile and click Run. The values become `20` through `1000`.

## Script.csx

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;

{
    var files = GetService<IScriptFileProvider>();
    var file = files.GetFileInfo("fonts/RecipeSans.ttf");
    if (!file.Exists) throw new FileNotFoundException("Add your own fonts/RecipeSans.ttf.");
    byte[] fontBytes;
    using (var input = file.CreateReadStream())
    using (var output = new MemoryStream())
    {
        await input.CopyToAsync(output, cancellationToken);
        fontBytes = output.ToArray();
    }
    var rows = Enumerable.Range(1, 50)
        .Select(value => $"Sample {value:00}: {value * 10}").ToArray();
    AddNewExtension<ImGuiContainerExtensions>();
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
                font = imgui.AddFont(fontBytes, 20, "RecipeSans", ImGuiFontRangeType.Cyrillic);
            ImGuiEx.PushFont(font);
            try
            {
                var visible = ImGui.Begin("Known telemetry##recipe-telemetry");
                try
                {
                    if (visible)
                        foreach (var row in rows) ImGui.TextUnformatted(row);
                }
                finally { ImGui.End(); }
            }
            finally { ImGuiEx.PopFont(font); }
        }
    });
    try { await Task.Delay(Timeout.Infinite, cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        lock (gate) stopping = true;
        await removed.Task;
    }
}
```


| Part | What it does |
| --- | --- |
| `rows` | An array of 50 rows, built once before rendering. |
| `AddFont(..., 20, "RecipeSans", Cyrillic)` | Copies the TTF bytes and registers the size and range on the render thread. |
| `ImGuiFontSpec` | A font specification for one Run. It is not a static native pointer that can be reused after the context is disposed. |
| `ImGuiEx.PushFont` / `PopFont` | Called as a pair. They select the font only around this drawing, within one frame. While the native font is not ready, both do nothing. |
| `Begin` / `End` | Called as a pair, even when the panel is collapsed. |
| `removed.Task` | Confirms that the font was removed from a live render callback before the API is released. |

The script only borrows the file provider from the host and does not dispose it. The input stream and the temporary memory stream are its own, and they are closed before rendering. `AddFont` makes its own native copy, so you need no `GCHandle` pin or unsafe pointer. The SDK deliberately keeps that native memory even after `RemoveFont`. So do not load the font on every frame, and do not switch fonts without a limit.

The atlas and the **Main** overlay are shared. The script does not change their default font, does not close the shared window directly and does not keep an `ImFontPtr` across an atlas rebuild. The wait runs outside the callback. Stop cleanup works only while the frame loop is running. If the native renderer fails, the confirmation may never arrive.

[ImGui setup](/en/scripting/imgui/getting-started) covers the host and registration. [Local font selection](/en/scripting/imgui/loading-font-static) explains font ownership. [Embedded resources](/en/scripting/embedded-resources) explains logical paths and manifest names.
