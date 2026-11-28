---
title: "Keep a bounded trail of your own cursor"
description: "Read cursor positions in one ImGui context, retain at most 64 points and release the renderer on Stop."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Keep a bounded trail of your own cursor

The script draws a short cyan trail behind your cursor and shows a counter of up to 64 positions.

You need desktop EyeAuras on Windows with the host for the optional **EyeAuras.ImGuiSdk 0.1.47** and its compatible native dependencies. The SDK source uses ClickableTransparentOverlay 11.5.28. A NuGet reference alone is not enough: it does not install or register a native renderer. Start in your own session on the primary monitor with the renderer visible. See [ImGui setup](/en/scripting/imgui/getting-started).

1. Create an editable aura through **Add new → New Aura**, name it `RecipeTrail`, and add **C# Script** under **Actions → On Enter**. Do not use automatic activation or other input actions for this example.
2. Replace the whole top-level **Script.csx** with the file below. Wait for its pinned package to resolve, then click the action's **Run** by hand.
3. Move your cursor around the area covered by the renderer. The cyan line joins the recent positions. The **Owned cursor trail** panel shows `Stored positions: n/64`. Once the queue is full, new points push out the old ones.
4. Click **Clear** in the panel: the trail disappears and starts building again from the next frames. **Stop** in the script editor removes the renderer and the stored positions. A new Run starts with an empty trail.

| Choice | Effect |
| --- | --- |
| Queue limit `64` | At most 64 `Vector2` positions are kept, not the whole mouse history. |
| Sample interval `16` ms | The minimum interval between samples. It is checked during rendering. |
| `ImGui.GetMousePos()` and background draw list | Positions stay in the same live ImGui coordinate system. They are not another window's client coordinates. |

Do not multiply these points by a guessed DPI factor or add a captured window's desktop offset. On a different monitor or layout, first check where the renderer's area really is. Points outside it can be clipped. The example has no general mapping for several monitors.

The queue and the drawing are protected by one short lock. On Stop, the same lock waits for a callback that has already started, blocks later calls and clears the queue. Then, on leaving the block, the registration is removed and the API handle is released. The shared `Main` overlay that others use is not closed. [Cursor rendering context](/en/scripting/examples/basic/imgui-cursor) explains how the coordinates differ.

## Script.csx

```csharp
#r "nuget: EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var gate = new object();
    var points = new Queue<Vector2>(64);
    var clock = Stopwatch.StartNew();
    long nextSampleMs = 0;
    var stopping = false;
    using var rendering = imgui.AddRenderer(_ =>
    {
        lock (gate)
        {
            if (stopping) return;
            if (clock.ElapsedMilliseconds >= nextSampleMs)
            {
                points.Enqueue(ImGui.GetMousePos());
                if (points.Count > 64) points.Dequeue();
                nextSampleMs = clock.ElapsedMilliseconds + 16;
            }
            var draw = ImGui.GetBackgroundDrawList();
            var color = ImGui.ColorConvertFloat4ToU32(new Vector4(0, 1, 1, 1));
            Vector2? previous = null;
            foreach (var point in points)
            {
                if (previous.HasValue) draw.AddLine(previous.Value, point, color, 1.5f);
                previous = point;
            }
            var visible = ImGui.Begin("Owned cursor trail");
            try
            {
                if (visible)
                {
                    ImGui.Text($"Stored positions: {points.Count}/64");
                    if (ImGui.Button("Clear")) points.Clear();
                }
            }
            finally { ImGui.End(); }
        }
    });
    try { await Task.Delay(Timeout.Infinite, cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        lock (gate)
        {
            stopping = true;
            points.Clear();
        }
    }
}
```
