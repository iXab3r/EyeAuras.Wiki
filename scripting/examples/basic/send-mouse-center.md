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

Select your own stable test window and move the real cursor to the centre of its outer frame. The program sends no mouse button event. You need desktop EyeAuras, its on-screen window picker and available **Windows Input**. Keep the window still and do not run the example while dragging anything.

1. Create your own aura and add a **C# Script** action to **On Enter**.
2. Put the complete program below in top-level **Script.csx**.
3. Click **Run** and select your test window. Escape or right-click cancels the picker.
4. The cursor should move to its frame centre. The log records the requested window, not an acknowledgement that another application processed an event.

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

**DwmFrameBounds** supplies the frame width and height. With a non-null **TargetWindow**, the standard controller activates that window and adds its frame origin to the relative point. This is not a client-area centre, WPF DIP conversion or a background move. The program restores the previous target in finally.

## Use the original primary-screen example

To use primary-monitor desktop coordinates instead, [import the original example](https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07) or configure this separate alternative:

1. Add [Hotkey Is Active](/en/triggers/hotkey-is-active) to your own aura: **F3**, **Hold**.
2. Add **C# Script** to **On Enter** and replace the previous program with:

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

3. In your own test workspace, press and release F3. The log should show the primary monitor size and the cursor should move once to its centre. Another separate press repeats the movement; there is no click.

| Choice | Coordinate contract |
| --- | --- |
| Windows Input | Explicit simulator selection. Unavailable input is an error, not proof of movement. |
| TargetWindow = null | The supplied point is already in desktop screen coordinates. |
| PrimaryMonitorSize | Only the primary monitor, whose origin is (0, 0). Its centre is not the whole virtual desktop's centre. |
| MouseMoveTo | Absolute destination; MouseMoveBy would be a displacement from the current position. |

For a destination supplied by visual search, start with the [Image Search example](/en/scripting/examples/basic/image-search), which distinguishes a window-relative result from raw bounds converted to screen coordinates. Choose the corresponding [coordinate domain](/en/features/coordinate-system) before sending the point; the monitor-centre formula is not a conversion of a found rectangle.

Do not substitute window dimensions into the screen formula without changing its coordinate context. Use the API's frame/monitor values directly; do not add another guessed DPI factor. Hold produces a new On Enter on each press/release cycle. With Toggle, the second cycle turns the aura off instead.

Both programs use the top-level host's **GetService**, **Log** and token; ordinary helpers receive dependencies explicitly. The service is borrowed. Token checks happen before movement, but the synchronous move takes no Run token and gives no target-application acknowledgement. See [input contracts](/en/scripting/api/ISendInputScriptingApi) and [coordinate systems](/en/features/coordinate-system).
