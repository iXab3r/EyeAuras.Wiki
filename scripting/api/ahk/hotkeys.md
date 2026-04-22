---
title: AutoHotkey Migration: Hotkeys
description: Mapping AutoHotkey hotkeys and context hotkeys to EyeAuras keybinds, trackers, triggers, and actions.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, hotkeys
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: Hotkeys

Use this page for AHK hotkey labels, `Hotkey`, `#HotIf`, and simple hotkey
actions. Keyboard state polling and mouse clicks live in
[Keyboard And Mouse](./keyboard-mouse).

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Run code from a hotkey | Hotkey labels like `^!s::`, `Hotkey`, `#HotIf` | `[Keybind]` methods, `IHotkeyTracker` with Rx | `[Keybind("Ctrl+Alt+S")] void Run() { ... }` | `[Keybind]` is best for simple static hotkeys; tracker/Rx is better for dynamic control. | `KeybindAttribute` has `SuppressKey`, `IgnoreModifiers`, and `ActivationType`. `IHotkeyTracker` supports runtime setup and observable composition. Custom AHK combos, `~`, `*`, `$`, and context-sensitive hotkeys need more mapping. |

## Hotkey Sends Text

AutoHotkey v2:

```ahk
^!s::SendText "hello"
```

EyeAuras script:

```csharp
ISendInputScriptingApi SendInput { get; init; }

[Keybind("Ctrl+Alt+S", SuppressKey = true)]
void SendHello()
{
    SendInput.Text("hello");
}
```

Use `SuppressKey = false` when the original hotkey should still reach the
active application, similar to AHK hotkeys with the `~` prefix.

Tracker/Rx alternative:

```csharp
ISendInputScriptingApi SendInput { get; init; }
IFactory<IHotkeyTracker> HotkeyTrackerFactory { get; init; }

var tracker = HotkeyTrackerFactory.Create().AddTo(ExecutionAnchors);
tracker.Hotkey = new HotkeyGesture(Key.S, ModifierKeys.Control | ModifierKeys.Alt);
tracker.HotkeyMode = HotkeyMode.Click;
tracker.SuppressKey = true;

tracker.WhenAnyValue(x => x.IsActive)
    .Where(x => x)
    .SubscribeSafe(_ => SendInput.Text("hello"))
    .AddTo(ExecutionAnchors);
```

The tracker snippet assumes it is placed inside a script that already has a
real lifetime, such as a window, loop, hosted service, or larger mini-app. Do
not add a fake wait to every sample only to keep the subscription alive.

**Recommendation:** Good shape. Use `[Keybind]` for fixed hotkeys; use
`IHotkeyTracker` with Rx only when the script needs runtime hotkeys or
observable composition.

## Verification Links

- AHK docs:
  [Hotkeys](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Hotkeys.htm),
  [Hotkey](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Hotkey.htm),
  [#HotIf](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/_HotIf.htm),
  [#UseHook](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/_UseHook.htm).
- AHK source:
  [hotkey.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/hotkey.cpp).
- EyeAuras docs:
  [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys),
  [ISendInputScriptingApi](../ISendInputScriptingApi),
  [Scripting Runtime](../scripting/runtime).
- EyeAuras source:
  [KeybindAttribute.cs](../../../../../Sources/EyeAuras.Scripting/Api/KeybindAttribute.cs),
  [HotkeyTrackerRuntimeVisitor.cs](../../../../../Sources/EyeAuras.Scripting/Visitors/HotkeyTrackerRuntimeVisitor.cs),
  [IHotkeyTracker.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Wpf/UI/Hotkeys/IHotkeyTracker.cs),
  [HotkeyTracker.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyTracker.cs),
  [HotkeyGesture.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyGesture.cs),
  [IHotkeyConverter.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Wpf/UI/Hotkeys/IHotkeyConverter.cs),
  [HotkeyConverter.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyConverter.cs).
