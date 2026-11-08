---
title: ISendInputScriptingApi
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-21T23:36:13.915Z
---

> AI-first navigation: see [AI Input, Hooks, Hotkeys](./windows-subsystems/input-hooks-hotkeys), [AI Window Handles](./windows-subsystems/window-handles), and [AI OSD Selection](./osd/selection) for input routing, target windows, hooks, and selection workflows.
{.is-info}

# ISendInputScriptingApi

Send text, keys and mouse movement through the selected input simulator. The Roxy
module registers this capability in a running EyeAuras host; an SDK reference alone
does not. Ordinary classes receive the service explicitly.

In C# Actions, `[Inject]` initializes the property when the script instance is
configured; `get; init;` alone does not request injection. Unity `[Dependency]` is
another supported route; see [dependency injection](/en/scripting/dependency-injection).

## Send text and a key

Open a text editor and leave it active before running this C# Action:

```csharp
using Microsoft.AspNetCore.Components;
using System.Windows.Input;
using EyeAuras.Roxy.Api;

[Inject] public ISendInputScriptingApi SendInput { get; init; }

SendInput.TargetWindow = null;
SendInput.Text("hello");
SendInput.KeyPress(Key.Enter);
```

With the standard Windows Input simulator, text and Enter go to the active application.
The calls are synchronous side effects, not acknowledgments that the application
processed input. `Text` accepts plain text, not AutoHotkey Send grammar.
Use `KeyPress`, `KeyDown`, `KeyUp` for keys and `Gesture(HotkeyGesture, InputEventType, int?)`
for a combination. Pair a manual `KeyDown` with `KeyUp`.

## Click a screen point

With standard Windows Input and no target window, coordinates are absolute in
the virtual desktop:

```csharp
using Microsoft.AspNetCore.Components;
using System.Windows.Input;
using EyeAuras.Roxy.Api;

[Inject] public ISendInputScriptingApi SendInput { get; init; }

SendInput.TargetWindow = null;
SendInput.MouseLeftClick(100, 200);
Log.Info($"Cursor after click: {SendInput.CursorPosition}");
```

The coordinate overload moves the cursor then clicks, without restoring its position.
`MouseMoveTo` sets a position; `MouseMoveBy` is a displacement. `WinPoint` overloads
are available. Button operations use `MouseButton`; `MouseLeftDoubleClick` performs
two clicks with an interval.

`TargetWindow` does not guarantee background delivery. Standard Windows Input is
wrapped by `ForegroundInputController`: a non-null target requests activation and
maps an absolute point through the target's `DwmFrameBounds` origin into screen
coordinates. Without a target, the point is already in screen coordinates.
Relative movement remains a displacement. Other controllers can differ; this is
neither a universal AHK `CoordMode` nor a Win32 client origin. See [window coordinates](windows-subsystems/window-handles).

## Configure delays and simulator

Defaults in EyeAuras `20fd3d4`:

| Setting | Initial value or meaning |
| --- | --- |
| `InputSimulatorId` | Unset: registered standard Windows Input |
| `InputSmootherId` | Unset: no smoothing |
| `TargetWindow` | `null` |
| `KeyPressDelay` | `RandomInteger(1, 5)`, milliseconds |
| `ClickDelay` | `RandomInteger(50, 100)`, milliseconds |
| `DoubleClickDelay` | `RandomInteger(150, 300)`, milliseconds |

An `int?` delay argument overrides the setting for that call, for example
`SendInput.KeyPress(Key.F1, 20)`. Obtain available IDs from `IInputSimulatorProvider`
and `IUserInputSmootherProvider`; do not assume a driver exists on every machine.

## Observe state and stop a sequence

`IsKeyDown(Key)` and `IsMouseDown(MouseButton)` report the chosen controller's state.
They do not establish equivalence with every AHK logical/physical mode.

```csharp
using Microsoft.AspNetCore.Components;
using System.Windows.Input;
using EyeAuras.Roxy.Api;

[Inject] public ISendInputScriptingApi SendInput { get; init; }

for (var i = 0; i < 3; i++)
{
    cancellationToken.ThrowIfCancellationRequested();
    SendInput.KeyPress(Key.F1);
    Sleep(250);
}
```

This sends up to three F1 presses. Stop requests cancellation; the explicit check
prevents subsequent iterations. `Sleep` can return early on cancellation rather
than throwing. Input calls themselves accept no run token: internal `Send` uses
`CancellationToken.None`, and `Text` synchronously waits without the run token.
Stop therefore does not instantly cancel input already in progress. An unavailable
simulator or disallowed foreground window can cause an exception.

The service belongs to the script context; do not independently dispose borrowed
host services. Account for synchronous waiting in UI code.

## Reference and related operations

See [hooks/hotkeys](windows-subsystems/input-hooks-hotkeys), [windows](windows-subsystems/window-handles)
and [AHK input migration](ahk/keyboard-mouse). Check `EyeAuras.Roxy.Api.ISendInputScriptingApi`
in your SDK/XML for the full current contract. The old
[unstable interface](ISendInputUnstableScriptingApi) adds no capabilities.

```csharp
/// <summary>
/// Provides an interface for simulating user input, including mouse and keyboard actions.
/// </summary>
public interface ISendInputScriptingApi : IScriptingApi
{
    /// <summary>
    /// Gets or sets the identifier for the input simulator to use.
    /// </summary>
    string InputSimulatorId { get; set; }
    
    /// <summary>
    /// Gets or sets the identifier for the input smoother to use.
    /// </summary>
    string InputSmootherId { get; set; }
    
    /// <summary>
    /// Gets or sets identifier of a window which will receive inputs
    /// </summary>
    IWindowHandle TargetWindow { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) between key down and up event.
    /// </summary>
    RandomInteger KeyPressDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) before releasing mouse button.
    /// </summary>
    RandomInteger ClickDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) for a mouse double-click action.
    /// </summary>
    RandomInteger DoubleClickDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the current cursor location on the screen. Setting the position is equivalent to MouseMoveTo()
    /// Users current input simulator, specified by InputSimulatorId to get cursor position
    /// </summary>
    WinPoint CursorPosition { get; set; }
    
    /// <summary>
    /// Moves the mouse cursor by a specified offset.
    /// </summary>
    /// <param name="x">The horizontal offset.</param>
    /// <param name="y">The vertical offset.</param>
    void MouseMoveBy(int x, int y);
    
    /// <summary>
    /// Moves the mouse cursor by a specified offset.
    /// </summary>
    /// <param name="offset">The offset as a WinPoint.</param>
    void MouseMoveBy(WinPoint offset);
    
    /// <summary>
    /// Moves the mouse cursor to a specific location on the screen.
    /// </summary>
    /// <param name="x">The X coordinate of the location.</param>
    /// <param name="y">The Y coordinate of the location.</param>
    void MouseMoveTo(int x, int y);
    
    /// <summary>
    /// Moves the mouse cursor to a specific location on the screen.
    /// </summary>
    /// <param name="location">The location as a WinPoint.</param>
    void MouseMoveTo(WinPoint location);
    
    /// <summary>
    /// Simulates a left mouse button click.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    void MouseLeftClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates a double-click using the left mouse button.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    /// <param name="dblClickDelayMs">Optional delay (in milliseconds) between the two clicks. Uses DoubleClickDelay if not specified.</param>
    void MouseLeftDoubleClick(int? clickDelayMs = default, int? dblClickDelayMs = default);
    
    /// <summary>
    /// Simulates a right mouse button click.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    void MouseRightClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates a mouse button click.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    void MouseClick(MouseButton button = default, int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates pressing down a mouse button.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    void MouseDown(MouseButton button = default);
    
    /// <summary>
    /// Simulates releasing a mouse button.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    void MouseUp(MouseButton button = default);
    
    /// <summary>
    /// Simulates pressing and releasing a keyboard key.
    /// </summary>
    /// <param name="key">The key to simulate.</param>
    /// <param name="keyPressDelay">Optional delay (in milliseconds) before releasing the button. Uses KeyPressDelay if not specified.</param>
    void KeyPress(Key key, int? keyPressDelay = default);
    
    /// <summary>
    /// Simulates pressing down a keyboard key.
    /// </summary>
    /// <param name="key">The key to simulate.</param>
    void KeyDown(Key key);
    
    /// <summary>
    /// Simulates releasing a keyboard key.
    /// </summary>
    /// <param name="key">The key to simulate.</param>
    void KeyUp(Key key);
    
    /// <summary>
    /// Simulates a complex gesture involving keyboard keys or mouse buttons.
    /// </summary>
    /// <param name="gesture">The gesture to simulate.</param>
    /// <param name="inputEventType">The type of input event to simulate (e.g., key press, key down, key up).</param>
    /// <param name="keyPressDelay">Optional delay (in milliseconds) before releasing the button, works only for KeyPress events. Uses KeyPressDelay if not specified.</param>
    void Gesture(HotkeyGesture gesture, InputEventType inputEventType, int? keyPressDelay = default);

    /// <summary>
    /// Simulates typing a string of text.
    /// </summary>
    /// <param name="text">The text to type.</param>
    /// <param name="delayMs">Optional delay (in milliseconds) between each character. Uses KeyPressDelay if not specified.</param>
    void Text(string text, int? delayMs = default);

    /// <summary>
    /// Returns status of a mouse button - whether it is pressed (down) or not
    /// </summary>
    /// <param name="button">The button which has to be checked</param>
    bool IsMouseDown(MouseButton button = default);

    /// <summary>
    /// Returns status of a key - whether it is pressed (down) or not
    /// </summary>
    /// <param name="key">The key which has to be checked</param>
    bool IsKeyDown(Key key);
}
```