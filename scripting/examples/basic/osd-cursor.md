---
title: OSD Drawing the cursor
description: 
published: true
date: 2025-03-31T18:03:18.405Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T18:02:42.036Z
---

# Drawing the cursor through EyeAuras OSD

This script demonstrates how to draw a small, live-updating rectangle around the mouse cursor using **EyeAuras’ On-Screen Display (OSD) API**. It uses the `IOnScreenCanvas` API to dynamically render an overlay element that tracks the cursor in real time.

---

### 📦 API Overview

EyeAuras exposes a scripting API for creating lightweight on-screen visuals:

These APIs allow you to create, manipulate, and remove lightweight on-screen overlays, which are perfect for scripting HUDs, tracking UI elements, debug helpers, or cursor markers.

---

### ✅ Example: Draw a Green Rectangle Around the Cursor

Run this as a desktop EyeAuras C# Script with the OSD/Blazor/WebView module. The 10×10 frame follows the screen cursor until Stop. An ordinary helper needs the canvas factory and token passed explicitly.

```csharp
using System.Drawing;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        Log.Info("Booting up OSD");
        using var cursorBox = canvas.AddRectangle();
        cursorBox.Size = new Size(10, 10);
        cursorBox.Background = Color.Transparent;
        cursorBox.BorderThickness = 2;
        cursorBox.BorderColor = Color.Green;

        while (!cancellationToken.IsCancellationRequested)
        {
            var cursor = System.Windows.Forms.Cursor.Position;
            cursorBox.Location = new Point(cursor.X - 5, cursor.Y - 5);
            Sleep(16);
        }
    }
    finally
    {
        canvas.Clear();
        Log.Info("OSD routine has stopped");
    }
}
```

---

### 📌 What’s Happening

- `canvas.AddRectangle()` creates a new rectangle overlay object.
- The rectangle is styled with:
  - Transparent background
  - Green border (`2px`)
  - Fixed size (`10x10`)
- The location is updated on every loop iteration to match the cursor position (centered by subtracting five pixels on each axis).
- The rectangle is disposed first; `finally` clears the canvas before the canvas is disposed. `Clear` removes registrations and does not replace object disposal. The shared window may remain for other users. See [OSD ownership and primary-monitor limits](/en/scripting/api/osd/screen-overlay).

---

### 🛠 Tips & Ideas

- 🔁 `Sleep(16)` limits the loop rate; actual rendering cadence depends on the host. Cancellation is checked by the loop condition.
- 🔲 Use `.WithBackground(Color.FromArgb(...))` if you want a filled marker.
- 🧪 Use `canvas.ShowDevTools()` for live UI inspection (great for debugging overlay layout).

---
