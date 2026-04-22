---
title: AutoHotkey Migration Gaps
description: Known semantic gaps and verification backlog for AutoHotkey to EyeAuras migration docs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, gaps
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration Gaps

This page tracks places where AutoHotkey behavior has enough hidden semantics
that the migration guide should be careful. A row here does not always mean
EyeAuras cannot do the job. It means we still need a tested recipe, a clearer
API map, or a deliberate "not equivalent" note.

Status values:

- `Open` means not verified yet.
- `Mapped` means an EyeAuras route exists, but docs/examples are still needed.
- `Candidate helper` means a small wrapper or recipe may make migration much
  easier.
- `Not equivalent` means users should rewrite the flow instead of translating
  directly.

## Primitive Gaps

| ID | Area | AutoHotkey Behavior | EyeAuras Route | Gap / Verification Needed | Status |
|---|---|---|---|---|---|
| AHK-001 | Key waits | `KeyWait` waits for key/button up or down, supports timeout, logical/physical mode, and affects hotkey thread behavior. | `ISendInputScriptingApi.IsKeyDown`, `IsMouseDown`, script `Sleep(...)` loop. | Current script translation is awkward and too low-level. Verify logical vs physical state parity and document a cancellation-aware helper for wait-until-up/down with timeout. | Candidate helper |
| AHK-002 | Coordinate modes | `CoordMode` changes defaults per AHK thread for mouse, pixel, tooltip, caret, and menu coordinates. Defaults are active-window client coordinates for many APIs. | `ForScreen()`, `ForWindow(IWindowHandle)`, OSD region transform matrices, `IWindowHandle` bounds. | Need an explicit mapping table for `Screen`, `Window`, and `Client`, plus examples for window-relative mouse and CV work. | Open |
| AHK-003 | Send grammar | `Send` parses modifier symbols, `{Key down/up}`, repeat counts, raw/text/blind modes, and chooses send modes. `SendMode` also changes some mouse helper behavior. | `ISendInputScriptingApi.KeyPress`, `KeyDown`, `KeyUp`, `Gesture`, `Text`, input simulator ids. | Decide whether docs should teach manual translation only or provide a small AHK send-string parser helper for common cases. | Open |
| AHK-004 | Modifier restoration | AHK `Send` has menu masking, modifier restoration, `{Blind}`, `Win`-key protections, and `#InputLevel` / `SendLevel` self-trigger controls. | Manual `KeyDown`/`KeyUp`, `Gesture`, `Text`. | Need tests for stuck modifiers, Win-key combinations, Alt menu activation, and send-from-hotkey recursion. | Open |
| AHK-005 | Hotkey prefixes | AHK supports `~`, `*`, `$`, `Up`, left/right modifiers, custom combos with `&`, and context-sensitive `#HotIf`. | `KeybindAttribute` with `SuppressKey`, `IgnoreModifiers`, `ActivationType`, plus `IHotkeyTracker` for runtime hotkeys. | Map AHK prefixes to EyeAuras keybind properties. Custom two-key combos and `#HotIf` conditions may need recipes rather than direct translation. | Mapped |
| AHK-006 | Window matching | AHK `WinTitle` supports `A`, `ahk_exe`, `ahk_class`, `ahk_id`, `ahk_pid`, `SetTitleMatchMode`, hidden-window rules, and per-thread Last Found Window behavior. | `WindowMatchExpression`, `IWindowMatcher`, `IWindowListProvider`, `IWindowSelector`. | Basic title/process/path/handle matching is mapped. Still need a token-by-token table for AHK `WinTitle`, case rules, hidden windows, `A`, and Last Found Window. In EyeAuras, store the resolved `IWindowHandle` explicitly instead of relying on implicit last-found state. | Open |
| AHK-007 | Control-level input | `ControlClick` and `ControlSend` can target controls and sometimes avoid activating the window. | `ISendInputScriptingApi.TargetWindow`, send-input actions, possible native/window services. | Verify whether there is a script-facing control-level API. If not, mark as rewrite/native interop territory. | Open |
| AHK-008 | Timers | `SetTimer` creates timed subroutines with period, one-shot negative periods, priority, deletion, and reentrancy rules. | Script services with loops or observables; Aura Tree timer components only for configurable aura behavior. | Need a recommended pattern for repeating work and a section explaining that AHK timer thread semantics do not directly translate. Also document EyeAuras `TimerTrigger` 100 ms resolution floor as an aura-component constraint, not a script API default. | Open |
| AHK-009 | Clipboard wait/events | `A_Clipboard`, `ClipWait`, `ClipboardAll`, and `OnClipboardChange` cover text, all formats, waiting, and events. | `IClipboardManager` has text, image, file-drop, data object, and contains methods. | Verify DI availability in scripts, UI thread constraints, wait/change-event service availability, and full-format preservation. | Open |
| AHK-010 | Pixel read | `PixelGetColor` returns a single RGB hex string at a coordinate and has `Alt`/`Slow` modes. | `ICvAccessor.ProcessPixels`, `PixelSearch`, `PickColor`. | Need a concise one-pixel color recipe and notes about visibility, cursor obstruction, and full-screen/game capture differences. | Candidate helper |
| AHK-011 | Pixel/image search errors | AHK v2 returns values/throws exceptions depending on function and failure mode; v1 often used `ErrorLevel`. | EyeAuras `PixelSearch` returns `Point.Empty`, `ImageSearch` returns `Rectangle.Empty`, raw APIs expose processed event args. | Need a v1/v2/error-handling migration table. | Open |
| AHK-012 | Variables | AHK has dynamic variables, unset-variable errors in v2, built-in variables, and loose scalar/object patterns. | Primary: C# locals, fields, and objects. Shared/persistent: `IVariablesScriptingApi`, `ScriptVariable<T>`. | Need examples separating ordinary in-script state from state shared across launches, between scripts, or with EyeAuras infrastructure. Dynamic variable replacement and typed conversions still need coverage. | Open |
| AHK-013 | Window activation from script | `WinActivate` is a normal function and can restore/minimize/activate matching windows. | Script route: `IWindowSelector.GetWindow(...)`, `WindowHandleExtensions.Activate(...)`, `UnsafeNative.ActivateWindow(...)`. | There is no dedicated `WinActivate(...)` scripting API. Do not use `WinActivateAction` as a thin wrapper from scripts; it is an Aura Tree action component. Keep timeout/failure semantics visible, because foreground activation can fail or be blocked by Windows. | Mapped |
| AHK-014 | DPI and monitors | AHK coordinate APIs are affected by `CoordMode`, DPI, active-window client area, and multi-monitor layouts. | `IWindowHandle` bounds, `ForScreen()`, `ForWindow(...)`, OSD transform matrices. | Need multi-monitor and DPI examples for mouse, CV, and region selection. | Open |
| AHK-015 | DLL and native interop | `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, and `NumPut` make native calls and pointer/struct work easy but very dynamic. | Direct migration is typed C# P/Invoke wrappers or small domain services; existing EyeAuras/PoeShared APIs are rewrite options. | Need a fuller native-interop guide for structs, callbacks, ownership, bitness, and when to replace raw interop with existing APIs. | Open |

## Source Anchors To Recheck

EyeAuras:

- `scripting/api/ISendInputScriptingApi.md`
- `scripting/api/IComputerVisionExperimentalScriptingApi.md`
- `scripting/api/IVariablesScriptingApi.md`
- `scripting/api/windows-subsystems/input-hooks-hotkeys.md`
- `scripting/api/windows-subsystems/window-handles.md`
- `scripting/api/osd/selection.md`
- `scripting/api/scripting/runtime.md`
- `Sources/EyeAuras.Scripting/Api/KeybindAttribute.cs`
- `Sources/EyeAuras.Roxy.Shared/Api/ISendInputScriptingApi.cs`
- `Sources/EyeAuras.Shared/Services/IWindowSelector.cs`
- `Sources/EyeAuras.Shared/Services/IWindowMatcher.cs`
- `Sources/EyeAuras.Shared/Scaffolding/WindowSelectorExtensions.cs`
- `Sources/PoeShared.Wpf/Scaffolding/WindowHandleExtensions.cs`
- `Sources/PoeShared.Native/Native/UnsafeNative.WindowUtils.cs`
- `Submodules/PoeEye/PoeEye/PoeShared.Native/Native/IClipboardManager.cs`

AutoHotkey:

- `docs/Hotkeys.htm`
- `docs/lib/Hotkey.htm`
- `docs/lib/_HotIf.htm`
- `docs/lib/_UseHook.htm`
- `docs/lib/Send.htm`
- `docs/lib/SendMode.htm`
- `docs/lib/SendLevel.htm`
- `docs/lib/InputHook.htm`
- `docs/lib/GetKeyState.htm`
- `docs/lib/KeyWait.htm`
- `docs/lib/MouseMove.htm`
- `docs/lib/Click.htm`
- `docs/lib/MouseGetPos.htm`
- `docs/misc/WinTitle.htm`
- `docs/howto/ManageWindows.htm`
- `docs/lib/WinActivate.htm`
- `docs/lib/WinWait.htm`
- `docs/lib/WinWaitActive.htm`
- `docs/lib/WinActive.htm`
- `docs/lib/WinExist.htm`
- `docs/lib/ControlClick.htm`
- `docs/lib/Control.htm`
- `docs/lib/Sleep.htm`
- `docs/lib/SetTimer.htm`
- `docs/lib/A_Clipboard.htm`
- `docs/lib/ClipboardAll.htm`
- `docs/lib/ClipWait.htm`
- `docs/lib/CoordMode.htm`
- `docs/lib/PixelGetColor.htm`
- `docs/lib/PixelSearch.htm`
- `docs/lib/ImageSearch.htm`
- `docs/lib/DllCall.htm`
- `docs/lib/CallbackCreate.htm`
- `docs/lib/Buffer.htm`
- `docs/lib/NumGet.htm`
- `docs/lib/NumPut.htm`
- `docs/Variables.htm`
- `docs/Functions.htm`
- `docs/Concepts.htm`
- `docs/lib/_Requires.htm`
- `docs/v2-changes.htm`
