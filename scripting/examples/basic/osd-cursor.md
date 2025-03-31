---
title: OSD Drawing the cursor
description: 
published: true
date: 2025-03-31T18:03:18.405Z
tags: 
editor: markdown
dateCreated: 2025-03-31T18:02:42.036Z
---

## 🖱 Drawing the Cursor on Screen Using EyeAuras OSD API

This script demonstrates how to draw a small, live-updating rectangle around the mouse cursor using **EyeAuras’ On-Screen Display (OSD) API**. It uses the `IOnScreenCanvas` API to dynamically render an overlay element that tracks the cursor in real time.

---

### 📦 API Overview

EyeAuras exposes a scripting API for creating lightweight on-screen visuals:

These APIs allow you to create, manipulate, and remove lightweight on-screen overlays, which are perfect for scripting HUDs, tracking UI elements, debug helpers, or cursor markers.

---

### ✅ Example: Draw a Green Rectangle Around the Cursor

```csharp
try
{
    Log.Info("Booting up OSD");

    // Create an overlay canvas
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();

    // Add a 10x10 green-outlined rectangle (no fill) to the canvas
    using var cursorBox = canvas.AddRectangle()
        .WithSize(new Size(10, 10))
        .WithBackground(Color.Transparent)
        .WithBorderThickness(2)
        .WithBorderColor(Color.Green);

    // Continuously update position to follow the cursor
    while (!cancellationToken.IsCancellationRequested)
    {
        cursorBox.Location = System.Windows.Forms.Cursor.Position.OffsetBy(-5, -5);
    }
}
finally
{
    Log.Info("OSD routine has stopped");
}
```

---

### 📌 What’s Happening

- `canvas.AddRectangle()` creates a new rectangle overlay object.
- The rectangle is styled with:
  - Transparent background
  - Green border (`2px`)
  - Fixed size (`10x10`)
- The location is updated on every loop iteration to match the cursor position (centered via `.OffsetBy(-5, -5)`).
- The rectangle is automatically removed and disposed when the script exits.

---

### 🛠 Tips & Ideas

- 🔁 **Throttle updates** with `Task.Delay(16)` for ~60 FPS (optional).
- 🔲 Use `.WithBackground(Color.FromArgb(...))` if you want a filled marker.
- 🧪 Use `canvas.ShowDevTools()` for live UI inspection (great for debugging overlay layout).

---
