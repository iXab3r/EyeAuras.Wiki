---
title: ImGui Drawing the cursor
description: 
published: true
date: 2025-06-13T21:46:14.167Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-03-31T17:49:10.631Z
---

# Drawing the Cursor on Screen Using ImGui

This guide demonstrates how to draw a simple visual overlay (e.g., a green rectangle around your mouse cursor) using [Dear ImGui](https://github.com/ocornut/imgui) via the `ClickableTransparentOverlay` library.

We’ll use **ImGui.NET**, .NET bindings for ImGui, and render directly to a fullscreen transparent overlay window that doesn't block mouse input.

---

## Draw a frame through the EyeAuras SDK

Run this in a top-level EyeAuras C# Action with `#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"`. The published package contains the API used here; native rendering still depends on a compatible host.

```csharp
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
using PoeShared.Scaffolding;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var osd = GetService<IImGuiExperimentalApi>();
    using var renderer = osd.AddRenderer(() =>
    {
        if (cancellationToken.IsCancellationRequested) return;
        var cursor = ImGui.GetMousePos();
        ImGui.GetBackgroundDrawList().AddRect(
            cursor - new Vector2(5, 5),
            cursor + new Vector2(5, 5),
            ImGui.GetColorU32(new Vector4(0f, 1f, 0f, 1f)),
            0f, ImDrawFlags.None, 1f);
    });
    cancellationToken.WaitHandle.WaitOne();
}
```

While Run is active, a green 10×10 frame follows the cursor. `ImGui.GetMousePos()` uses the draw list's coordinate system, avoiding an unconverted native desktop position. Draw only in the frame callback and wait outside it. Stop disposes the subscription before the API. Its shared `Main` overlay may serve other scripts, so do not close it directly. See the [SDK map](/en/scripting/api/nuget/imgui-sdk).

## A standalone ClickableTransparentOverlay window

The following is an alternative script using `ClickableTransparentOverlay 10.2.0`; do not run both versions together. It owns a separate primary-monitor window and render loop.

### 💡 What is ImGui?

**ImGui** (Immediate Mode GUI) is a fast, minimal UI library used for debugging, dev tools, overlays, and custom editors. Unlike traditional retained-mode UI libraries, ImGui redraws everything each frame — making it great for real-time tools like HUDs and debug panels.

---

### 📦 Requirements

Make sure you have this NuGet package:

```csharp
#r "nuget: ClickableTransparentOverlay, 10.2.0"
```

This package provides a base `Overlay` class that handles window creation, ImGui setup, and rendering.

---

### ✅ Complete Example: Cursor Tracker with ImGui

```csharp
#r "nuget: ClickableTransparentOverlay, 10.2.0"

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

        // Use the draw list coordinate system
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

---

### 📌 Key Concepts:

- `ImGui.GetBackgroundDrawList()` gives you access to a canvas for drawing in the background layer.
- `AddRect()` accepts points in ImGui draw-list coordinates.
- The color is passed as a `Vector4` (RGBA) and converted via `ImGui.GetColorU32`.
- The `Overlay` base class runs a frame loop for you and handles transparency.

---

### 🎯 Want More?

- Add a label or tooltip at the cursor
- Draw different shapes depending on state
- Detect clicks or interaction with the overlay
- Show debug data or game-related visuals in real-time

## Standalone overlay contract

[CTO 10.2.0 source](https://github.com/zaafar/ClickableTransparentOverlay/blob/6a343a2af63b7af0cfa9ab41e9b7cc95b88452b9/ClickableTransparentOverlay/Overlay.cs) provides the width/height constructor with `DPIAware = false`. `Start` waits for window readiness; `Run` waits for internal cancellation; `Close` requests that cancellation. The script token belongs to our subclass and is checked by `Render`, not by the library constructor. That check requires a working render loop. Source inspection does not establish live DPI or graphics behavior.
