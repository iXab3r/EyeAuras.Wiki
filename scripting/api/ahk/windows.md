---
title: AutoHotkey Migration: Windows
description: Mapping AutoHotkey window matching, active-window checks, waits, and activation to EyeAuras window APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, windows
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: Windows

Use this page for `WinExist`, `WinActive`, `WinWait`, `WinWaitActive`,
`WinActivate`, `ControlClick`, and `ControlSend`.

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Check or select windows | `WinExist`, `WinActive`, `WinWait`, `WinWaitActive` | `IWindowSelector.FindWindow(...)`, `IWindowListProvider.GetForegroundWindow()`, `IWindowMatcher` | `var window = WindowSelector.FindWindow("notepad.exe");` | Good for single-window lookup; strongest as explicit state. | EyeAuras uses `WindowMatchExpression`, not AHK `WinTitle` tokens. AHK Last Found Window should become an explicit `IWindowHandle` variable. Use `IWindowMatcher.FindMatches(...)` only when you need all matches or no selector state. `WinWait*` still needs a nicer helper/pattern. |
| Activate windows | `WinActivate` | `IWindowSelector.GetWindow(...)`, `WindowHandleExtensions.Activate(...)`, `UnsafeNative.ActivateWindow(...)` | `WindowSelector.GetWindow("notepad.exe").Activate(...)` | Good as direct script code after resolving a handle. | Do not use `WinActivateAction` as a scripting API wrapper. Activation can time out or be blocked by Windows, so keep timeout/failure behavior visible. |

## EyeAuras Naming Convention

EyeAuras APIs generally follow normal C# naming expectations:

| Name Shape | Meaning |
|---|---|
| `GetSomething(...)` | Return the value or throw when it cannot be found. |
| `FindSomething(...)` | Return the value or `null` when it cannot be found. |
| `TryGetSomething(..., out value)` | Return `bool` and write the value to an `out` parameter. |

This matters for migration examples. Avoid `try`/`catch` around `GetWindow(...)`
when a missing window is normal. Prefer a non-throwing selection shape instead.
For simple one-shot lookups, use `FindWindow(...)`.

## Check Window Exists Or Is Active

AutoHotkey v2:

```ahk
if WinExist("ahk_exe notepad.exe")
    MsgBox "Notepad is open"

if WinActive("ahk_exe notepad.exe")
    SendText "hello"
```

EyeAuras script, one-shot check:

```csharp
IFactory<IWindowSelector> WindowSelectorFactory { get; init; }
IWindowListProvider WindowsProvider { get; init; }
IWindowMatcher WindowMatcher { get; init; }
ISendInputScriptingApi SendInput { get; init; }

{
    using var WindowSelector = WindowSelectorFactory.Create();
    WindowMatchExpression target = "notepad.exe";

    var window = WindowSelector.FindWindow(target);
    if (window == null)
    {
        Log.Info("Notepad is not open");
        return;
    }

    Log.Info($"Window exists: {window.Title}");

    var foreground = WindowsProvider.GetForegroundWindow();
    if (foreground != null && WindowMatcher.IsMatch(foreground, target))
    {
        SendInput.Text("hello");
    }
}
```

Use `FindWindow(...)` when a missing window is a normal branch. It is clearer
than catching `GetWindow(...)`, and it gives you the `IWindowHandle` you should
keep instead of relying on AHK-style Last Found Window. To check
`WinActive(...)`, compare
`WindowsProvider.GetForegroundWindow()` against the same
`WindowMatchExpression`.

Use `IWindowMatcher.FindMatches(...)` only when the script really needs all
matches or a stateless query over a supplied list:

```csharp
IWindowListProvider WindowsProvider { get; init; }
IWindowMatcher WindowMatcher { get; init; }

WindowMatchExpression target = "notepad.exe";

WindowsProvider.RefreshWindowList();

var matches = WindowMatcher.FindMatches(
    WindowsProvider.WindowList.Items.ToArray(),
    target);
```

`WindowSelector` is stateful: it keeps `TargetWindow`, `MatchingWindowList`,
and `ActiveWindow` updated. That is useful for auras and mini-apps. Use
`GetWindow(...)` only when absence is exceptional and throwing is the right
behavior.

**Recommendation:** Good shape for single-window lookup. Prefer
`FindWindow(...)` for AHK-like `WinExist(...)` branches; use `GetWindow(...)`
only for must-exist code and `FindMatches(...)` only when all matches or a
supplied window list matter.

AHK `WinTitle` strings are not copied literally. `notepad.exe` also searches
path, title and arguments, so it is broader than `ahk_exe notepad.exe`. To restrict
the process, set `WindowFilter` and compare the normalized full `ProcessName` as
shown in the [window map](/en/scripting/api/windows-subsystems/window-handles).
Quoted text is an exact comparison, not a process-only selector. EyeAuras also
supports `/regex/`, `0x...`, `#2` and `[type=toplevel]`.

## Wait for a target or foreground change

`FindWindow` is an immediate query, not `WinWait`. Keep a selector alive and poll
its current `ActiveWindow` with `await Task.Delay(..., cancellationToken)`; the
[window map](/en/scripting/api/windows-subsystems/window-handles) provides the
complete wait-for-visible-Notepad operation. Re-read the target for repeated work
and check `IsWindow`; a saved handle does not automatically follow a new window.

For `WinWaitActive`, check `IWindowListProvider.GetForegroundWindow()` instead.
Apply the same process constraint there; a broad text `IsMatch` does not reproduce
it. AHK v2 wait timeouts are in seconds and return HWND or zero on timeout. An
EyeAuras selector's `ActiveWindow` means selected target, not OS foreground.

## Activate Window

AutoHotkey v2:

```ahk
WinActivate "ahk_exe notepad.exe"
```

EyeAuras script:

```csharp
IFactory<IWindowSelector> WindowSelectorFactory { get; init; }

{
    using var WindowSelector = WindowSelectorFactory.Create();
    var window = WindowSelector.GetWindow("notepad.exe");
    window.Activate(TimeSpan.FromMilliseconds(500));
}
```

`GetWindow(...)` throws when there is no match, and activation can throw if
Windows does not switch foreground within the timeout. When foreground is zero,
the implementation can wait up to ten seconds, so 500 ms is not a strict duration
bound. `Activate(...)` is the
`WindowHandleExtensions` wrapper over `UnsafeNative.ActivateWindow(...)`.

Do not instantiate or route through `WinActivateAction` from script. Actions,
Triggers, and Overlays are stateful Aura Tree components; they are useful when
the user is configuring aura behavior in the UI, but they are the wrong
abstraction for a thin operation such as window activation.

**Recommendation:** Use `WindowHandleExtensions.Activate(...)` from script
after resolving an `IWindowHandle`. Mention `WinActivateAction` only as an Aura
Tree configuration option, not as the API equivalent.

These are desktop C# Action examples. A factory creates an owned selector, and
`using` releases its subscriptions without changing somebody else's selection.
The factory and window handles are borrowed. `FindWindow` sets `TargetWindow`
and immediately reads `ActiveWindow`; live enumeration may update later.
`OnlyVisible` defaults to false; assigning a target defaults to top-level external
windows unless the expression overrides those properties. The complete grammar,
case behavior and `FindMatches`/`IsMatch` distinction are in the window map.

## Verification Links

- AHK docs:
  [WinTitle and Last Found Window](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/misc/WinTitle.htm),
  [How to Manage Windows](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/howto/ManageWindows.htm),
  [WinActivate](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinActivate.htm),
  [WinWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinWait.htm),
  [WinWaitActive](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinWaitActive.htm),
  [WinActive](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinActive.htm),
  [WinExist](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinExist.htm),
  [ControlClick](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ControlClick.htm),
  [Control functions](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Control.htm).
- AHK source:
  [win.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/win.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp),
  [window.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/window.cpp).
- EyeAuras docs:
  [Window Handles](../windows-subsystems/window-handles),
  [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys).
- EyeAuras contracts: [window matching and tracking](/en/scripting/api/windows-subsystems/window-handles).
