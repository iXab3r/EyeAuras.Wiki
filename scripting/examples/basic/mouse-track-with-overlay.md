---
title: Tracking Mouse Cursor
description: Tracking the mouse cursor and displaying an overlay near it.
published: true
date: 2024-02-24T00:08:49.173Z
tags: mouse cursor, overlay, C# Script, EyeAuras, ai-translated
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---
# Display a coloured square beside the cursor

Show a `32 × 32` marker whose top-left corner follows the screen cursor. The input API supplies the position, but this example sends no input. It is a square beside the pointer, rather than the centred frame in [the other OSD example](/en/scripting/examples/basic/osd-cursor).

Use desktop EyeAuras with the input module and Blazor/WebView2 screen overlays. Keep the cursor on the primary monitor for this first exercise.

1. Create your own aura with **Hotkey Is Active**, a free key such as `F1`, and **Toggle Trigger state on Click**.
2. Under **While Active**, add **C# Script** and put this complete program in `Script.csx`:

```csharp
using System;
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    var input = GetService<ISendInputScriptingApi>();
    var previousSimulator = input.InputSimulatorId;
    try
    {
        input.InputSimulatorId = "Windows Input";
        using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
        try
        {
            using var rectangle = canvas.AddRectangle();
            rectangle.Background = Color.Aquamarine;
            rectangle.BorderColor = Color.Azure;
            rectangle.BorderThickness = 1;
            rectangle.Size = new Size(32, 32);
            Log.Info("Starting tracking");
            while (!cancellationToken.IsCancellationRequested)
            {
                rectangle.Location = input.CursorPosition;
                await Task.Delay(16, cancellationToken);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
        finally { canvas.Clear(); Log.Info("Completed tracking"); }
    }
    finally { input.InputSimulatorId = previousSimulator; }
}
```

3. Activate the aura with `F1`. Moving the mouse normally makes the square follow it. Press `F1` again to deactivate and cancel the action; for manual **Run**, use **Stop**.

![Historical cursor-marker demonstration](https://i.imgur.com/FSSKzJp.gif)

| Setting | Meaning |
| --- | --- |
| `CursorPosition` | Reads screen coordinates from Windows Input. Assigning this property would move the mouse; this example never assigns it. |
| `Size(32, 32)` | Square dimensions. Its origin follows the pointer, without subtracting half its size. |
| `Aquamarine`, `Azure`, `1` | Fill colour, border colour and thickness. |
| `Task.Delay(16, cancellationToken)` | Cancellable pause between updates, not a fixed rendering-rate guarantee. |

The rectangle is created once and updated through its properties. Cleanup disposes it, clears its canvas, disposes that canvas and restores the prior input simulator. Host services are borrowed. The shared OSD window can remain for other owners; its current placement uses the primary monitor and does not promise uniform DPI across all screens. An ordinary C# helper needs explicit services and a token. See the [versioned API reference](/en/scripting/api/reference) for OSD contracts.

<details>
<summary>Other content and the historical sample</summary>

OSD also provides HTML/Razor elements for labels and richer content. Those require the corresponding element, host and resources; `AddRectangle` itself cannot display an image or video.

The [historical ready-made example](https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX) used synchronous `Sleep(16)`, which observes the host's Run token. The awaited delay above needs no separate worker task.

</details>
