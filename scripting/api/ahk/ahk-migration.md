---
title: AutoHotkey Migration to EyeAuras
description: Hub for migrating AutoHotkey scripts to EyeAuras scripting, triggers, actions, and services.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration to EyeAuras

This is the hub for migrating AutoHotkey scripts to EyeAuras. AHK is too broad
for a single page, so detailed migration notes live in focused area files.

Use this together with [AHK Gaps](./ahk-gaps). The gaps page tracks behavior
that needs deeper verification before we call it equivalent.

## Plan

- Keep this page small: navigation, scope, and an at-a-glance matrix.
- Put detailed code samples, recommendations, and verification links in domain
  pages such as [Windows](./windows), [Hotkeys](./hotkeys), and
  [DLL And Native Interop](./dll-native).
- Every domain page should include a short mapping table, focused conversion
  examples, standalone `**Recommendation:**` paragraphs, and docs/source links.
- When a domain page becomes too large, split it further. For example,
  `windows.md` can later become `windows/matching.md`,
  `windows/activation.md`, and `windows/controls.md`.
- Keep uncertain behavior in [AHK Gaps](./ahk-gaps) and link to gap IDs instead
  of hiding caveats inside examples.

## How To Read This

- AutoHotkey examples use v2 names and syntax first. v1 command syntax and
  `ErrorLevel` differences are tracked as migration caveats.
- EyeAuras scripts are C# scripts. Top-level script files have host members such
  as `Sleep(...)`, `AuraTree`, `Variables`, and `cancellationToken`; services
  are usually injected as script properties.
- Prefer direct script APIs and services for migration examples. Mention
  Actions, Triggers, or Overlays only when the user is building configurable
  Aura Tree behavior, or when the component provides substantial domain runtime
  rather than a thin API wrapper.
- Each mapping includes a short judgment. "Possible" is not enough; the guide
  should say when the EyeAuras route is cleaner, merely acceptable, awkward, or
  better expressed as a helper/recipe.

## Area Files

| Area | Use For | Current Shape |
|---|---|---|
| [Hotkeys](./hotkeys) | Hotkey labels, `Hotkey`, `#HotIf`, simple hotkey actions | Has first conversion and source anchors. Needs custom combo/prefix expansion. |
| [Keyboard And Mouse](./keyboard-mouse) | `Send`, `SendText`, `SendInput`, `GetKeyState`, `KeyWait`, `MouseMove`, `Click` | Has direct send, key wait, and coordinate click conversions. Send grammar is a gap. |
| [Windows](./windows) | `WinExist`, `WinActive`, `WinWait`, `WinActivate`, `ControlClick`, `ControlSend` | Has single-window lookup and activation. Needs full `WinTitle` token table. |
| [CV, Pixels, And Images](./cv-pixels-images) | `CoordMode`, `PixelGetColor`, `PixelSearch`, `ImageSearch` | Has pixel-search conversion. Needs `CoordMode` and one-pixel color tables. |
| [Runtime, Timers, And State](./runtime-state) | `Sleep`, `SetTimer`, variables, globals, shared state | Has sleep and ordinary state. Needs timer and shared-variable recipes. |
| [Clipboard](./clipboard) | `A_Clipboard`, `ClipboardAll`, `ClipWait`, clipboard events | Scaffolded. Needs script DI/event verification. |
| [DLL And Native Interop](./dll-native) | `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, `NumPut`, raw Win32 | Direct P/Invoke examples first; existing EyeAuras/PoeShared APIs are rewrite options. |
| [AHK Gaps](./ahk-gaps) | Cross-domain semantic gaps and verification backlog | Tracks unresolved behavior and candidate helpers. |

## Primitive Matrix

| AutoHotkey Need | AHK APIs | Default Area | EyeAuras Route | Judgment |
|---|---|---|---|---|
| Run code from a hotkey | Hotkey labels like `^!s::`, `Hotkey`, `#HotIf` | [Hotkeys](./hotkeys) | `[Keybind]`, `IHotkeyTracker` | Good shape for static hotkeys; dynamic/context hotkeys need more mapping. |
| Send keyboard or text input | `Send`, `SendText`, `SendInput` | [Keyboard And Mouse](./keyboard-mouse) | `ISendInputScriptingApi` | Good for explicit input; weak for full AHK send grammar. |
| Read key or mouse state | `GetKeyState`, `KeyWait` | [Keyboard And Mouse](./keyboard-mouse) | `ISendInputScriptingApi.IsKeyDown`, `IsMouseDown` | `GetKeyState` is fine; `KeyWait` needs a helper. |
| Move and click mouse | `MouseMove`, `Click`, `MouseClick`, `MouseGetPos` | [Keyboard And Mouse](./keyboard-mouse) | `ISendInputScriptingApi` | Good, especially with coordinate overloads. |
| Check or select windows | `WinExist`, `WinActive`, `WinWait`, `WinWaitActive` | [Windows](./windows) | `IWindowSelector.FindWindow(...)`, `IWindowMatcher`, window services | Good for single-window lookup; wait semantics need a pattern. |
| Activate windows | `WinActivate` | [Windows](./windows) | `IWindowSelector.GetWindow(...)`, `WindowHandleExtensions.Activate(...)` | Good as direct script code after resolving a handle. |
| Sleep or repeat later | `Sleep`, `SetTimer` | [Runtime, Timers, And State](./runtime-state) | Script `Sleep(...)`, loops, services, observables | `Sleep` is good; `SetTimer` needs redesign. |
| Find pixels or images | `PixelGetColor`, `PixelSearch`, `ImageSearch`, `CoordMode` | [CV, Pixels, And Images](./cv-pixels-images) | `CV.ForScreen()`, `CV.ForWindow(...)`, `ICvAccessor` | More explicit than AHK, but heavier. |
| Read or write clipboard text | `A_Clipboard`, `ClipWait`, `OnClipboardChange` | [Clipboard](./clipboard) | `IClipboardManager` | Basic text is likely fine; full clipboard behavior is weak. |
| Store script state | Variables, built-in variables, globals | [Runtime, Timers, And State](./runtime-state) | C# locals/fields/objects; `ScriptVariable<T>` only for shared state | Better for normal state; shared state needs clear recipes. |
| Call native DLLs | `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, `NumPut` | [DLL And Native Interop](./dll-native) | Typed C# P/Invoke wrappers; existing APIs as rewrite options | Direct equivalent exists, but C# needs explicit signatures and lifetime rules. |

## EyeAuras References

- [Scripting Runtime](../scripting/runtime) for script host rules, helper class
  rules, `KeybindAttribute`, `ExecutionAnchors`, and `IVariablesScriptingApi`.
- [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys) for
  keybinds, hotkey triggers, input simulators, and `ISendInputScriptingApi`.
- [Window Handles](../windows-subsystems/window-handles) for `IWindowHandle`,
  `IWindowSelector`, `IWindowListProvider`, matching, and activation.
- [OSD Selection](../osd/selection) for picking windows, regions, points, and
  colors interactively.
- [Computer Vision / Images](../computer-vision/images) for capture,
  `ImageSearch`, `PixelSearch`, OCR, and image processing.
- [ISendInputScriptingApi](../ISendInputScriptingApi) for script keyboard and
  mouse output.
- [IComputerVisionExperimentalScriptingApi](../IComputerVisionExperimentalScriptingApi)
  for screen/window CV accessors.
- [IVariablesScriptingApi](../IVariablesScriptingApi) for shared or persistent
  script variables.

## AutoHotkey References

- [AutoHotkey source repository](https://github.com/AutoHotkey/AutoHotkey)
- [AutoHotkey docs repository](https://github.com/AutoHotkey/AutoHotkeyDocs)
- [Changes from v1.1 to v2.0](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/v2-changes.htm)
