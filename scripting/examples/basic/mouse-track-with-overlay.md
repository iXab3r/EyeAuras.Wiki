---
title: Tracking Mouse Cursor
description: Tracking the mouse cursor and displaying an overlay near it.
published: true
date: 2024-02-24T00:08:49.173Z
tags: mouse cursor, overlay, C# Script, EyeAuras
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---

## Displaying an Overlay Near the Cursor
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX
{.is-info}

1. Create an aura.
2. Add HotkeyIsActive to it and bind it to a convenient button (this will be our on/off switch). In the example, it's `F1`.
3. Add a **C# Script** action to **WhileActive**.
4. Copy and paste the script itself.
5. Now, when our aura is activated, a small colored square will be rendered near the cursor.

![](https://i.imgur.com/FSSKzJp.gif)

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); // to get cursor coordinates
var overlayApi = GetService<IOnScreenCanvasScriptingApi>(); // for overlay rendering

var canvas = overlayApi.Create() // create a canvas for overlay rendering
    .AddTo(ExecutionAnchors); // specify to clear the canvas when the script finishes

var rectangle = canvas
    .AddRectangle() // add a rectangle
    .WithBorderColor(Color.Azure) // color
    .WithBorderThickness(1) // border thickness
    .WithSize(new Size(32, 32)); // size

Log.Info("Starting tracking");

// Important! Not while(true), but in this form
// This code will run in a loop until the script is stopped
// It will stop either when the EyeAuras window becomes active or by a hotkey
while (!cancellationToken.IsCancellationRequested){
    // get cursor coordinates and specify that the overlay should be near
    rectangle.Location = sendInputApi.CursorPosition;
}

// This is where we will end up when the script is commanded to stop
Log.Info("Completed tracking");
```

> Naturally, the overlay can render not only squares. It can be anything - text, image, even video.
{.is-info}