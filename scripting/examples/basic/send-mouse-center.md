---
title: Moving the Mouse to the Center of the Screen
description: Translating the mouse to the center of the screen using a script in C#.
published: true
date: 2024-02-24T00:47:44.678Z
tags: mouse, screen, C#, script, ai-translated
editor: markdown
dateCreated: 2024-02-24T00:47:33.928Z
---

# Move the cursor to the primary screen center

This top-level C# Action uses the selected input simulator to move the real cursor in primary-monitor desktop coordinates, not window client coordinates.


> You can import the ready-made example from here: https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, for example `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. When you press `F3`, the cursor will move to the center of the primary screen.

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>();
sendInputApi.TargetWindow = null;
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize;
Log.Info($"Primary monitor size: {screenSize}");

sendInputApi.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2);
```

F3 moves to the primary monitor center whose dimensions are logged, not the whole virtual-desktop center. TargetWindow = null prevents a target-window activation or coordinate conversion. This synchronous method has no Run token. Resolving the service does not transfer ownership of a system input device.
