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

Draw a short cyan trail behind your cursor, with a visible count capped at 64 positions. This reads positions; it does not move the pointer or send input.

Use desktop EyeAuras on Windows with the optional **EyeAuras.ImGuiSdk 0.1.47** host and its compatible native dependencies (the SDK source uses ClickableTransparentOverlay 11.5.28). A NuGet reference alone does not install or register a native renderer. Start in your own primary-monitor desktop session, with the renderer visible; see [ImGui setup](/en/scripting/imgui/getting-started).

1. Create an editable aura through **Add new → New Aura**, name it `RecipeTrail`, and add **C# Script** under **Actions → On Enter**. Leave automatic activation and other input actions unused for this exercise.
2. Replace the complete top-level **Script.csx** with the file below. Allow its pinned package to resolve, then click the action's manual **Run**.
3. Move your own cursor across the area covered by the renderer. The cyan line joins recent positions. **Owned cursor trail** shows `Stored positions: n/64`; after the buffer fills, old points leave as new ones arrive.
4. Click **Clear** in that panel. It removes the stored path; sampling resumes on subsequent frames. Click **Stop** in the script editor to remove this renderer and its stored positions. A later Run starts an empty trail.

| Choice | Effect |
| --- | --- |
| Queue limit `64` | At most 64 `Vector2` positions are retained, not an unlimited mouse history. |
| Sample interval `16` ms | A minimum interval checked during rendered frames; it does not guarantee 60 samples per second. |
| `ImGui.GetMousePos()` and background draw list | Coordinates stay in the same live ImGui draw domain. They are not another window's client coordinates. |

Do not multiply these positions by a guessed DPI factor or add a captured window's desktop offset. On a different monitor/layout, check the renderer's actual coverage before extending the example. The native canvas can clip points outside that coverage; this is not a universal multi-monitor mapping API.

The callback owns no font or native context pointer. All its queue access and drawing occur under one short lock. On Stop, the same lock waits for an entered callback, marks later callbacks inactive and clears the queue; scope exit then removes the registration before releasing the API handle. It does not close the shared `Main` overlay belonging to other users. [Cursor rendering context](/en/scripting/examples/basic/imgui-cursor) explains the coordinate distinction.

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
