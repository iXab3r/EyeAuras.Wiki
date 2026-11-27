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

Draw a green `10 × 10` frame around the mouse position. The script reads ImGui's mouse point and draws in its background layer; it does not move the pointer or send clicks.

1. Use desktop EyeAuras compatible with **EyeAuras.ImGuiSdk 0.1.47**. Create a **C# Script** action in your own aura. Do not load the independent older CTO library below into the same process alongside this SDK.
2. Put this complete program in top-level `Script.csx`:

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

3. After compilation, click **Run** and move the mouse normally. The frame follows the point reported by ImGui.
4. Click **Stop**: the render registration is removed, the previous `NoActivate` value is restored, then the API share is released.

| Setting | Meaning |
| --- | --- |
| `ImGui.GetMousePos()` | Mouse position in ImGui's draw-list coordinate domain, not another window's client coordinates. |
| `cursor ± Vector2(5, 5)` | Corners of the 10 × 10 frame around its centre. |
| `Vector4(0, 1, 0, 1)` | Opaque green RGBA, converted through `GetColorU32`. |
| Final `1f` | Border thickness; `0f` before the flags means no corner rounding. |
| `NoActivate = true` | Requests non-activating interaction with shared Main. Run without other scripts changing this setting; the example restores its previous value. |

Each frame describes the rectangle again; it creates no retained OSD object or per-point event subscription. Keep ImGui calls on the frame thread and wait for Stop outside it. Removing a subscription does not interrupt a callback already running. Main may serve other scripts; releasing your share does not close theirs. Monitor origins, clipping and DPI are not fixed by adding an arbitrary desktop offset. See [ImGui operations](/en/scripting/api/IImGuiExperimentalApi) or the different [Blazor OSD example](/en/scripting/examples/basic/osd-cursor).

<details>
<summary>Historical standalone CTO 10.2.0 alternative</summary>

This separate project creates its own primary-monitor window and render loop. It is retained for reading older scripts, not for loading another native ImGui version alongside the SDK. It requires its own compatible host.

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

[CTO 10.2.0 source](https://github.com/zaafar/ClickableTransparentOverlay/blob/6a343a2af63b7af0cfa9ab41e9b7cc95b88452b9/ClickableTransparentOverlay/Overlay.cs) shows `Run` calling `Start` before waiting for closure; this path needs no separate `Init` call from the script. The width/height constructor uses `DPIAware = false`. The script token is passed explicitly to the ordinary subclass and checked in `Render`; it does not cancel library initialisation and cannot run that check after the frame loop fails.

[Dear ImGui](https://github.com/ocornut/imgui) provides the immediate-mode UI; [ClickableTransparentOverlay](https://github.com/zaafar/ClickableTransparentOverlay) supplies the native transparent window. `GetBackgroundDrawList` draws behind ImGui windows; `AddRect` uses its coordinate system and the converted RGBA colour. Labels and other shapes can use that same frame context. Interaction and application data need their own contracts; drawing does not provide game data.

</details>
