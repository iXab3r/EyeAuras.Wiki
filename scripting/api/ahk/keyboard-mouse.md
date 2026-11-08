---
title: AutoHotkey Migration: Keyboard And Mouse
description: Mapping AutoHotkey send, key state, waits, mouse movement, and clicks to EyeAuras input APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, keyboard, mouse
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: Keyboard And Mouse

Use this page for `Send`, `SendText`, `SendInput`, `GetKeyState`, `KeyWait`,
`MouseMove`, `Click`, `MouseClick`, and `MouseGetPos`. Hotkey declaration
itself lives in [Hotkeys](./hotkeys).

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Send keyboard or text input | `Send`, `SendText`, `SendInput`, `{Key down}`, `{Key up}` | `ISendInputScriptingApi` | `SendInput.KeyPress(Key.F1); SendInput.Text("hello");` | Good for explicit input; weak for full AHK send grammar. | Use the stable `ISendInputScriptingApi`, not deprecated unstable aliases. AHK's `{Raw}`, `{Text}`, `{Blind}`, modifier restoration, `SendMode`, and `SendLevel` are not one-to-one. |
| Read key or mouse state | `GetKeyState`, `KeyWait` | `ISendInputScriptingApi.IsKeyDown`, `IsMouseDown` | `if (SendInput.IsKeyDown(Key.LeftCtrl)) { ... }` | `GetKeyState` is fine; `KeyWait` is awkward today. | No dedicated `KeyWait` equivalent is documented yet. Use a loop with script `Sleep(...)` only as a low-level fallback; track a helper or higher-level pattern as a gap. |
| Move and click mouse | `MouseMove`, `Click`, `MouseClick`, `MouseGetPos` | `ISendInputScriptingApi` | `SendInput.CursorPosition`, `SendInput.MouseMoveTo(x, y)`, `SendInput.MouseLeftClick(x, y)` | Good, especially with coordinate overloads. | EyeAuras methods operate through the selected input simulator. Prefer coordinate or `WinPoint` click overloads when translating AHK `Click x, y`. |

## Direct Send

AutoHotkey v2:

```ahk
SendText "hello"
Send "{F1}"
```

Top-level C# Action; the script host injects the service:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.Text("hello");
SendInput.KeyPress(Key.F1);
```

**Recommendation:** Good shape for explicit text and keys. Full AHK send-string
grammar is not a one-to-one migration; complex `{Blind}`, `{Raw}`, repeat, and
modifier cases should be translated deliberately.

## Wait For Key Release

AutoHotkey v2:

```ahk
KeyWait "LButton"
```

EyeAuras script, current low-level shape:

```csharp
ISendInputScriptingApi SendInput { get; init; }

while (SendInput.IsMouseDown(MouseButton.Left) && !cancellationToken.IsCancellationRequested)
{
    Sleep(10);
}
cancellationToken.ThrowIfCancellationRequested();
```

**Recommendation:** Awkward but usable as a low-level fallback. A small helper
such as `WaitUntilReleased(...)` would be more user-friendly; timeout, logical
vs physical state, and down vs up semantics are tracked in
[AHK Gaps](./ahk-gaps).

## Click At Coordinates

AutoHotkey v2:

```ahk
Click 100, 200
```

Top-level C# Action; the script host injects the service:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.MouseLeftClick(100, 200);
```

**Recommendation:** Good shape. Use coordinate or `WinPoint` overloads instead
of moving first and clicking second unless the movement itself matters.

With the default Windows Input simulator, `(100, 200)` is a virtual-desktop
coordinate. AHK v2 defaults to active-window client coordinates; use
`CoordMode "Mouse", "Screen"` on the AHK side for that coordinate comparison.
`TargetWindow` neither guarantees background input nor supplies a universal
coordinate conversion for every simulator.

`IsKeyDown` and `IsMouseDown` query the selected controller's device state. The
loop has no timeout, checks cancellation explicitly, and does not reproduce AHK
hotkey thread rules. Current `Sleep(10)` itself ignores cancellation; the loop
condition and following checkpoint provide cancellation here. Input calls are
synchronous and do not automatically receive the Run token. See
[SendInput operations](/en/scripting/api/ISendInputScriptingApi) for delays and targeting.

## Verification Links

- AHK docs:
  [Send](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Send.htm),
  [SendMode](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/SendMode.htm),
  [SendLevel](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/SendLevel.htm),
  [GetKeyState](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/GetKeyState.htm),
  [KeyWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/KeyWait.htm),
  [MouseMove](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/MouseMove.htm),
  [Click](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Click.htm),
  [MouseGetPos](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/MouseGetPos.htm).
- AHK source:
  [keyboard_mouse.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/keyboard_mouse.cpp),
  [script2.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/script2.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp).
- EyeAuras docs:
  [ISendInputScriptingApi](../ISendInputScriptingApi),
  [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys).
- EyeAuras contract: [SendInput operations](/en/scripting/api/ISendInputScriptingApi).

AHK `GetKeyState` defaults to logical state; `P` requests physical state and `T`
toggle state. `KeyWait` instead defaults to physical release, with `D` for press,
`L` for logical state and `T` for a timeout in seconds. Physical tracking depends
on installed hooks. Do not silently replace these modes with the same polling call.

[AHK v2 coordinate modes](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/CoordMode.htm).
