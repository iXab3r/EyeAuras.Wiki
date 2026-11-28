---
title: Tracking Mouse Cursor
description: How to follow the mouse cursor and show an overlay next to it.
published: true
date: 2024-02-24T00:08:49.173Z
tags: mouse cursor, overlay, C# Script, EyeAuras, ai-translated
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---
# Display a coloured square beside the cursor

The script shows a `32 × 32` square whose top-left corner follows the cursor on the screen. The position is read through the input API, but no input is sent. The square sits beside the pointer, not around it like the frame in [the other OSD example](/en/scripting/examples/basic/osd-cursor).

You need desktop EyeAuras with the input module and Blazor/WebView2 screen overlays. Try it on the primary monitor first.

1. Create your own aura with **Hotkey Is Active**, assign a free key such as `F1` and choose **Toggle Trigger state on Click**.
2. Under **While Active**, add **C# Script** and paste the whole program into `Script.csx`:

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

3. Turn the aura on with `F1` and move the mouse. The square stays next to the pointer. Press `F1` again to turn the aura off and cancel the action. If you started it by hand with **Run**, use **Stop**.

| Setting | Meaning |
| --- | --- |
| `CursorPosition` | Reads the screen position through standard Windows Input. Assigning a value to this property would move the mouse, but the example never does. |
| `Size(32, 32)` | Size of the square. Its origin is at the pointer. Half the size is not subtracted. |
| `Aquamarine`, `Azure`, `1` | Fill colour, border colour and border thickness. |
| `Task.Delay(16, cancellationToken)` | Pause between updates. It is cancelled together with the run. |

The rectangle is created once and then changed through its properties. On exit the rectangle is disposed first, then its canvas is cleared, then the canvas itself is disposed. The previous input simulator is restored. The services are borrowed from the host. The shared OSD window can stay for other owners. Right now it uses the primary monitor. An ordinary C# class gets services and the token passed in explicitly. See the [versioned API reference](/en/scripting/api/reference) for OSD contracts.

<details>
<summary>Other content and the historical sample</summary>

OSD can do more than rectangles. For labels there are HTML/Razor elements that can hold the content you need.

[Import the old example](https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX). It used a synchronous `Sleep(16)` pause, which respects the host's token.

</details>
