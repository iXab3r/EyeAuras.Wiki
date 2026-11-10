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

Show a small green frame at the current pointer position. The script reads screen cursor coordinates and moves only the OSD rectangle; it does not move the mouse or send input.

Use desktop EyeAuras with its screen-overlay module and Blazor/WebView2. Keep the cursor on the primary monitor for this first test: the current shared OSD window is placed there.

1. Create your own test aura and add a **C# Script** action.
2. Put this complete code in top-level `Script.csx`:

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

3. Click **Run**, then move the mouse normally on the primary monitor. The frame follows the pointer, centred on the read position.
4. Click **Stop**. The loop ends, the marker is removed and the script logs **Cursor marker removed**.

| Setting | Result |
| --- | --- |
| `Size(10, 10)` | Marker dimensions in the screen-overlay coordinate system. |
| `cursor.X - 5`, `cursor.Y - 5` | Converts the centre point to the top-left corner of the 10 × 10 frame. |
| `Background = Color.Transparent` | Leaves the middle clear. Assign a colour or use `WithBackground(Color.FromArgb(...))` for a filled marker. |
| `BorderThickness = 2`, `BorderColor = Color.Green` | Frame thickness and colour. |
| `Task.Delay(16, cancellationToken)` | A cancellable pause between updates, not a guarantee of exactly 60 rendered frames per second. |

`Create()` returns an owned proxy canvas over the shared screen window. `AddRectangle()` creates and registers this example's object. Leaving `try` disposes the rectangle first; `Clear()` then removes remaining registrations while the canvas is alive, and leaving the outer block disposes that canvas. `Remove`/`Clear` do not replace object disposal. The service owns overlay-window scheduling and its internal update subscriptions; no manual Razor refresh or extra UI thread is required here.

`Cursor.Position` uses screen coordinates, not a selected window's client coordinates. The shared OSD uses the primary monitor; this example does not promise identical placement across monitors and DPI combinations. Check the monitor and scaling before adding an arbitrary window offset.

<details>
<summary>Inspect the OSD or use a synchronous pause</summary>

After creating the canvas, `canvas.ShowDevTools()` opens its browser content for inspection. The shared window may remain alive for other OSD users after this marker is removed.

In this top-level script, `Sleep(16)` is an alternative to `await Task.Delay(...)`: the host method uses the Run token. An ordinary C# helper does not get `Sleep`, `Log`, `GetService` or that token as globals; pass the canvas factory, logger and token explicitly. The async pause above keeps the work awaited without a separate worker runner.

See [the versioned API reference](/en/scripting/api/reference) for OSD contract selection.

</details>
