---
title: ImGui Drawing the cursor
description: 
published: true
date: 2025-06-13T21:46:14.167Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-03-31T17:49:10.631Z
---
# Draw a cursor frame with ImGui

The script draws a green `10 × 10` frame around the mouse position. It takes the point from ImGui and draws in ImGui's background layer.

1. You need desktop EyeAuras with a compatible **EyeAuras.ImGuiSdk 0.1.47**. Create a **C# Script** action in your own aura. Do not run the older standalone CTO library from the end of this page at the same time.
2. Paste the whole program into top-level `Script.csx`:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var previousNoActivate = imgui.NoActivate;
    try
    {
        imgui.NoActivate = true;
        using var rendering = imgui.AddRenderer(_ =>
        {
            if (cancellationToken.IsCancellationRequested) return;
            var cursor = ImGui.GetMousePos();
            ImGui.GetBackgroundDrawList().AddRect(
                cursor - new Vector2(5, 5), cursor + new Vector2(5, 5),
                ImGui.GetColorU32(new Vector4(0, 1, 0, 1)),
                0f, ImDrawFlags.None, 1f);
        });
        cancellationToken.WaitHandle.WaitOne();
    }
    finally { imgui.NoActivate = previousNoActivate; }
}
```

3. When the code has compiled, click **Run** and move the mouse as usual. The frame follows the point ImGui reports.
4. Click **Stop**. The rendering is removed, the previous `NoActivate` value comes back and the API instance is released.

| Setting | Meaning |
| --- | --- |
| `ImGui.GetMousePos()` | Mouse position in ImGui's draw-list coordinates. It is not converted to another window's client coordinates. |
| `cursor ± Vector2(5, 5)` | Corners of the 10 × 10 frame around its centre. |
| `Vector4(0, 1, 0, 1)` | Opaque green RGBA, converted through `GetColorU32`. |
| Final `1f` | Border thickness. `0f` before the flags means no corner rounding. |
| `NoActivate = true` | Asks the shared window not to activate on interaction. It is a setting of the shared Main window, so the example restores the previous value. Try the example without other scripts that change it. |

The frame is described again on every frame: no separate OSD object or per-point subscription is created. Do not call ImGui outside the frame thread, and do not block that thread waiting for Stop. The shared **Main** window may serve other scripts too. Releasing your share does not close theirs. See [ImGui operations](/en/scripting/api/IImGuiExperimentalApi) or the [Blazor OSD example](/en/scripting/examples/basic/osd-cursor).

<details>
<summary>Historical standalone CTO 10.2.0 alternative</summary>

This variant creates its own window on the primary monitor. It is kept for reading older scripts, not for running in one process with the SDK above: different native ImGui versions and independent contexts are not interchangeable.

```csharp
#r "nuget: ClickableTransparentOverlay, 10.2.0"

using System;
using ClickableTransparentOverlay;
using System.Threading.Tasks;
using System.Threading;
using PoeShared.Native;
using PoeShared.Scaffolding;
using ImGuiNET;

try
{
    Log.Info("Booting up ImGui OSD");

    using var overlay = new SampleOverlay(cancellationToken);
    await overlay.Run(); // Starts the overlay loop
}
catch (Exception ex)
{
    Log.Error("ImGui OSD encountered an error", ex);
    throw;
}
finally
{
    Log.Info("ImGui OSD was closed");
}

internal class SampleOverlay : Overlay
{
    private readonly CancellationToken cancellationToken;

    public SampleOverlay(CancellationToken cancellationToken)
        : base( // Fullscreen on primary monitor
            System.Windows.Forms.Screen.PrimaryScreen.Bounds.Width,
            System.Windows.Forms.Screen.PrimaryScreen.Bounds.Height)
    {
        this.cancellationToken = cancellationToken;
    }

    // Called every frame
    protected override void Render()
    {
        // Graceful shutdown if requested
        if (cancellationToken.IsCancellationRequested)
        {
            Close();
            return;
        }

        // Get the current ImGui draw list
        var drawList = ImGui.GetBackgroundDrawList();

        // Use the same coordinate system as the draw list
        var cursorPosition = ImGui.GetMousePos();

        // Draw a green 10x10 rectangle centered on the cursor
        drawList.AddRect(
            cursorPosition - new System.Numerics.Vector2(5, 5),
            cursorPosition + new System.Numerics.Vector2(5, 5),
            ImGui.GetColorU32(new System.Numerics.Vector4(0f, 1f, 0f, 1f)), // Green
            0f,                    // Corner rounding
            ImDrawFlags.None,     // No flags
            1f                    // Thickness
        );
    }
}
```

In the [CTO 10.2.0 source](https://github.com/zaafar/ClickableTransparentOverlay/blob/6a343a2af63b7af0cfa9ab41e9b7cc95b88452b9/ClickableTransparentOverlay/Overlay.cs), `Run` calls `Start` itself and then waits for the window to close. This path has no separate `Init` call. The width/height constructor uses `DPIAware = false`. The token is passed to our subclass and checked in `Render`. It does not cancel library initialisation, and the check does not run if the frame loop has stopped.

[Dear ImGui](https://github.com/ocornut/imgui) is the UI library. [ClickableTransparentOverlay](https://github.com/zaafar/ClickableTransparentOverlay) creates the native transparent window around it.

</details>
