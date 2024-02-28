---
title: Moving the Mouse to the Center of the Screen
description: Translating the mouse to the center of the screen using a script in C#.
published: true
date: 2024-02-24T00:47:44.678Z
tags: mouse, screen, C#, script
editor: markdown
dateCreated: 2024-02-24T00:47:33.928Z
---

> You can import the ready-made example from here: https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, for example `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. When you press `F3`, the cursor will move to the center of the primary screen.

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); // needed for input sending
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // get the size of the primary screen
Log.Info($"Primary monitor size: {screenSize}");

sendInputApi.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2); // move to the center
```