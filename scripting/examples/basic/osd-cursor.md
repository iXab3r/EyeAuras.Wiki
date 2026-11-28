---
title: OSD Drawing the cursor
description: 
published: true
date: 2025-03-31T18:03:18.405Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T18:02:42.036Z
---
# Draw a marker around the cursor

The script draws a small green frame around the cursor. It is a handy way to check where the pointer is. It reads the mouse coordinates and moves only the OSD frame.

You need desktop EyeAuras with the screen-overlay module and Blazor/WebView2. For the first try keep the cursor on the primary monitor: right now the shared OSD window is placed there.

1. Create your own test aura and add a **C# Script** action.
2. Paste the whole code into top-level `Script.csx`:

```csharp
using System;
using System.Drawing;
using System.Threading.Tasks;
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
            await Task.Delay(16, cancellationToken);
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
    finally
    {
        canvas.Clear();
        Log.Info("Cursor marker removed");
    }
}
```

3. Click **Run** and move the mouse around the primary monitor. The frame follows the pointer, centred on the position that was read.
4. Click **Stop**. The loop ends, the frame disappears and the log shows **Cursor marker removed**.

| Setting | Result |
| --- | --- |
| `Size(10, 10)` | Marker size in the screen-overlay coordinate system. |
| `cursor.X - 5`, `cursor.Y - 5` | Converts the centre point to the top-left corner of the 10 × 10 frame. |
| `Background = Color.Transparent` | The middle is clear and only the border shows. For a filled marker, assign a colour or use `WithBackground(Color.FromArgb(...))`. |
| `BorderThickness = 2`, `BorderColor = Color.Green` | Frame thickness and colour. |
| `Task.Delay(16, cancellationToken)` | A cancellable pause between updates. |

`Create()` makes your own proxy canvas over the shared screen window. `AddRectangle()` creates an object the example owns and registers it. Leaving `try` disposes the rectangle first. Then `Clear()` removes the remaining registrations while the canvas is still alive. Leaving the outer block disposes the canvas itself. `Remove` and `Clear` do not replace disposing objects.

`Cursor.Position` is in screen coordinates, not the client coordinates of a selected window. If the frame is off, check the monitor and scaling first instead of adding a window offset at random.

To draw the same marker in a native frame, use the [ImGui cursor example](/en/scripting/examples/basic/imgui-cursor). There the frame is described again on every draw instead of changing a canvas object.

<details>
<summary>Inspect the OSD or use a synchronous pause</summary>

While the script runs, you can call `canvas.ShowDevTools()` after creating the canvas and look at its browser content. The shared window may stay alive for other OSD users even after your marker is removed.

In this top-level script you can write `Sleep(16)` instead of `await Task.Delay(...)`. It is a host method and it respects the Run token. In an ordinary C# class it is not a global: pass dependencies and the token explicitly.

More in [the versioned API reference](/en/scripting/api/reference).

</details>
