---
title: Tracking Mouse Cursor
description: Tracking the mouse cursor and displaying an overlay near it.
published: true
date: 2024-02-24T00:08:49.173Z
tags: mouse cursor, overlay, C# Script, EyeAuras, ai-translated
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---

# Displaying an overlay near the cursor
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX
{.is-info}

1. Create an aura.
2. Add HotkeyIsActive to it and bind it to a convenient button (this will be our on/off switch). In the example, it's `F1`.
3. Add a **C# Script** action to **WhileActive**.
4. Copy and paste the script itself.
5. Now, when our aura is activated, a small colored square will be rendered near the cursor.

![](https://i.imgur.com/FSSKzJp.gif)

This top-level EyeAuras script requires Roxy and OSD. With the standard Windows Input backend, `CursorPosition` is a screen point; this example sends no input. The loop checks cancellation and pauses between updates. On exit, the rectangle is disposed before the canvas is cleared and disposed. A helper class must receive the services and token explicitly. See [OSD ownership and monitor limits](/en/scripting/api/osd/screen-overlay).

```csharp
using System.Drawing;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    var sendInputApi = GetService<ISendInputScriptingApi>();
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var rectangle = canvas.AddRectangle();
        rectangle.BorderColor = Color.Azure;
        rectangle.BorderThickness = 1;
        rectangle.Size = new Size(32, 32);

        Log.Info("Starting tracking");
        while (!cancellationToken.IsCancellationRequested)
        {
            rectangle.Location = sendInputApi.CursorPosition;
            Sleep(16);
        }
    }
    finally
    {
        canvas.Clear();
        Log.Info("Completed tracking");
    }
}
```

> Naturally, the overlay can render not only squares. It can be anything - text, image, even video.
{.is-info}