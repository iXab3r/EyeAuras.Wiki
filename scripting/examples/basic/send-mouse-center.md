---
title: Moving the Mouse to the Center of the Screen
description: Translating the mouse to the center of the screen using a script in C#.
published: true
date: 2024-02-24T00:47:44.678Z
tags: mouse, screen, C#, script, ai-translated
editor: markdown
dateCreated: 2024-02-24T00:47:33.928Z
---
# Move the cursor once, without clicking

This script moves the real cursor to the centre of a window you pick. It does not click.

You need desktop EyeAuras, its on-screen window picker and available **Windows Input**. Use your own test window, keep it still and do not run the example while you are dragging something.

1. Create an aura and add a **C# Script** action to **On Enter**.
2. Paste the whole code below into top-level **Script.csx**.
3. Click **Run** and pick your test window. Escape or a right-click cancels the picker.
4. The cursor moves to the centre of the window frame, and the log names the requested window.

```csharp
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Osd;

cancellationToken.ThrowIfCancellationRequested();
var window = await GetService<IOsdSelectionService>().PickWindow();
if (window == null || !window.IsWindow) { Log.Warn("Window unavailable"); return; }
cancellationToken.ThrowIfCancellationRequested();
var input = GetService<ISendInputScriptingApi>();
input.InputSimulatorId = "Windows Input";
var previousTarget = input.TargetWindow;
try
{
    input.TargetWindow = window;
    var frame = window.DwmFrameBounds;
    input.MouseMoveTo(frame.Width / 2, frame.Height / 2);
    Log.Info($"Window centre requested: {window.Title}");
}
finally { input.TargetWindow = previousTarget; }
```

**DwmFrameBounds** gives the width and height of the window frame. When **TargetWindow** is not null, the standard controller activates that window and adds the origin of its frame to the point you pass. So this is the centre of the frame, not of the client area. No WPF DIP conversion is applied, and the window does not stay in the background. The script puts the previous target back in finally.

## Use the original primary-screen example

For the centre of the primary monitor in screen coordinates, [import the original example](https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07) or build this other variant:

1. Add [Hotkey Is Active](/en/triggers/hotkey-is-active) to your aura: **F3**, **Hold**.
2. Add **C# Script** to **On Enter** and replace the previous code with:

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>();
sendInputApi.InputSimulatorId = "Windows Input";
sendInputApi.TargetWindow = null;
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize;
Log.Info($"Primary monitor size: {screenSize}");

cancellationToken.ThrowIfCancellationRequested();
sendInputApi.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2);
```

3. Press and release F3. The log shows the primary monitor size and the cursor moves to its centre. Each new press moves it again. There is no click.

| Choice | What it means here |
| --- | --- |
| Windows Input | The input simulator, chosen explicitly. If it is unavailable you get an error, not a move. |
| TargetWindow = null | The point is already in screen coordinates. |
| PrimaryMonitorSize | The primary monitor only. Its origin is (0, 0). Its centre is not the centre of the whole virtual desktop. |
| MouseMoveTo | An absolute position. MouseMoveBy would shift the cursor from where it is now. |

If the point comes from a search, start with the [Image Search example](/en/scripting/examples/basic/image-search). It shows a window-relative result and raw bounds converted to screen coordinates separately. Pick the matching [coordinate system](/en/features/coordinate-system) before you send the point.

Do not put a window size into the screen formula. Use the frame and monitor values from the API as they are, without an extra DPI factor. In Hold mode each press and release gives a new On Enter. In Toggle mode the second press would turn the aura off instead.

Both scripts use **GetService**, **Log** and the token of the top-level script. Ordinary helper classes get their dependencies passed in. You do not need to dispose the service. The token is checked before the move, but the move itself is synchronous: it takes no Run token and returns no confirmation from the application. More in the [input API](/en/scripting/api/ISendInputScriptingApi).
