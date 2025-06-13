---
title: ImGui Drawing the cursor
description: 
published: true
date: 2025-06-13T21:46:14.167Z
tags: 
editor: markdown
dateCreated: 2025-03-31T17:49:10.631Z
---

## 🖱 Drawing the Cursor on Screen Using ImGui

This guide demonstrates how to draw a simple visual overlay (e.g., a green rectangle around your mouse cursor) using [Dear ImGui](https://github.com/ocornut/imgui) via the `ClickableTransparentOverlay` library.

We’ll use **ImGui.NET**, the official .NET binding for ImGui, and render directly to a fullscreen transparent overlay window that doesn't block mouse input.

---

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

        // Get the current cursor position (in screen coordinates)
        var cursorPosition = UnsafeNative.GetCursorPosition();

        // Draw a green 10x10 rectangle centered on the cursor
        drawList.AddRect(
            cursorPosition.OffsetBy(-5, -5).ToVector2(),
            cursorPosition.OffsetBy(5, 5).ToVector2(),
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
- `AddRect()` draws a rectangle in screen coordinates.
- The color is passed as a `Vector4` (RGBA) and converted via `ImGui.GetColorU32`.
- `OffsetBy(x, y)` is assumed to be a helper that returns a new `Point` offset by given delta.
- The `Overlay` base class runs a frame loop for you and handles transparency.

---

### 🎯 Want More?

- Add a label or tooltip at the cursor
- Draw different shapes depending on state
- Detect clicks or interaction with the overlay
- Show debug data or game-related visuals in real-time
