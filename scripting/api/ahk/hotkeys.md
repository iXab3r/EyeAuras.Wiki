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

await Task.Delay(Timeout.Infinite, cancellationToken);

[Keybind("Ctrl+Alt+S", SuppressKey = true)]
void SendHello()
{
    SendInput.Text("hello");
}
```

The token-aware wait keeps the C# Action running. Ctrl+Alt+S sends `hello`
while Run is active. Omit it if an awaited window or main task already owns
the lifetime. Run completion disables future dispatch; an already scheduled
callback is not automatically drained or cancelled.

Use `SuppressKey = false` when the original hotkey should still reach the
active application, similar to AHK hotkeys with the `~` prefix.

Tracker/Rx alternative:

```csharp
ISendInputScriptingApi SendInput { get; init; }
IFactory<IHotkeyTracker> HotkeyTrackerFactory { get; init; }

var tracker = HotkeyTrackerFactory.Create().AddTo(ExecutionAnchors);
tracker.Hotkey = new HotkeyGesture(Key.S, ModifierKeys.Control | ModifierKeys.Alt);
tracker.HotkeyMode = HotkeyMode.Hold;
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

The tracker and observer belong to `ExecutionAnchors`; `IsEnabled` defaults to
true. Hold reports active on key down and inactive on release, so the true filter
handles each press. `HotkeyMode.Click` toggles on release and would send only on
alternating cycles, so it is not the direct replacement shown here.

`KeybindAttribute` defaults to suppression, exact modifiers and KeyDown activation.
Handlers are scheduled in the background; parameters are resolved from the script
container and a returned Task is waited. UI dispatch and cooperative cancellation
remain your responsibility. Ordinary classes receive their services and lifetime
owner explicitly. See [keybind lifetime](/en/scripting/keybinds).

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
- EyeAuras contracts: [keybinds](/en/scripting/keybinds),
  [input and trackers](/en/scripting/api/windows-subsystems/input-hooks-hotkeys).

AHK `~` allows native key handling, `*` allows extra modifiers, and `$` forces the
keyboard hook to avoid ordinary Send self-triggering. In EyeAuras,
`SuppressKey = false` and `IgnoreModifiers = true` cover the first two basic
intentions; no identical `$`/SendLevel behavior is promised. Required modifiers
still apply. Suppression happens before activation-edge filtering.
