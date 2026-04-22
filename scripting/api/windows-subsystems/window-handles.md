---
title: AI Windows: Window Handles
description: AI-first map of window handles, selectors, matchers, and providers.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, windows
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Window Handles / Matching / Tracking Discovery Map

Reference map for native window handles, raw `HWND` conversion, window
enumeration, matching, foreground tracking, and bounds tracking.

Interactive picking belongs to `osd/selection.md`.

## User Intents

- Convert raw `HWND` / `IntPtr` into `IWindowHandle`.
- Read process id, title, bounds, owner, parent, and visibility for a window.
- Enumerate known windows.
- Match windows by title, process, path, handle, or expression.
- Keep live target-window selection.
- Track foreground window or bounds changes.

## Concept Model

- `IWindowHandle` is the PoeShared wrapper around a native window.
- `IWindowHandleProvider` converts raw handles into wrappers.
- `IWindowListProvider` owns live enumeration, ignored windows, blacklists, and
  foreground resolution.
- `IWindowMatcher` performs stateless expression matching.
- `IWindowSelector` keeps a stateful active target from a match expression.
- `IWindowHandleMatcher` and `IComplexWindowHandleMatcher` are infrastructure
  include/exclude predicates.
- Foreground and bounds trackers wrap native event hooks.

## API Details

- `PoeShared.Native.IWindowHandle`
  - Use `Handle` only when raw `IntPtr` is required.
  - Prefer `ProcessId`, `ProcessName`, `Title`, `Bounds`, owner/parent/state
    metadata over re-querying Win32.

- `PoeShared.Native.IWindowHandleProvider`
  - `GetByWindowHandle(IntPtr hwnd)` converts raw handles.
  - `GetMonitorByWindowHandle(IntPtr hwnd)` resolves monitor context.
  - Does not select or enumerate windows.

- `IWindowListProvider`
  - `AllWindowList`, `WindowList`, `IgnoredWindows`, `BlacklistedWindows`.
  - `ResolveByHandle(IntPtr)`, `GetForegroundWindow()`,
    `RefreshWindowList()`.

- `IWindowMatcher`
  - `IsMatch(...)` and `FindMatches(...)` for `WindowMatchExpression`.

- `IWindowSelector`
  - `TargetWindow`, `ActiveWindow`, `MatchingWindowList`, `OnlyVisible`,
    `WindowFilter`.
  - Use when code needs a persistent selected target window that follows a
    match expression.

- `WindowSelectorExtensions`
  - `FindWindow(...)` sets `TargetWindow` and returns the selected
    `ActiveWindow`, or `null` when no match exists.
  - `GetWindow(...)` sets `TargetWindow` and returns the selected
    `ActiveWindow`; use it when absence is exceptional.
  - Use `TargetWindow` plus `ActiveWindow` when absence is expected and should
    be handled without exceptions and the code wants persistent selector state.
  - Use `IWindowMatcher.FindMatches(...)` when the code intentionally needs
    multiple matches or matching over a supplied list.

- `WindowHandleExtensions`
  - `Activate(...)` brings an `IWindowHandle` to the foreground.
  - `Activate(...)` delegates to `UnsafeNative.ActivateWindow(...)`.
  - `ToWindowMatchExpressionOrDefault(...)` creates a reusable match expression
    from a known window handle.

- `UnsafeNative.ActivateWindow(...)`
  - Low-level activation helper with `IntPtr`, `IWindowHandle`, timeout, and log
    overloads.
  - Restores minimized windows before activation and waits for the foreground
    switch.
  - Throws when the target does not become foreground before the timeout.
  - Prefer `WindowHandleExtensions.Activate(...)` in script/docs examples.

- `IForegroundWindowTracker`, `IWindowTracker`
  - Foreground/active window tracking.

- `IWindowBoundsTrackerFactory`
  - Tracks window rectangle changes.

## Common Flows

- Raw handle to wrapper:
  - receive `IntPtr hwnd`.
  - call `IWindowHandleProvider.GetByWindowHandle(hwnd)`.
  - pass `IWindowHandle` downstream.

- Persistent target selection:
  - receive `IWindowSelector`.
  - set `TargetWindow`.
  - read `ActiveWindow` and `MatchingWindowList`.

- Single target lookup:
  - receive `IWindowSelector`.
  - call `FindWindow(...)` when absence is expected and should be handled
    without exception.
  - call `GetWindow(...)` only when absence is exceptional.
  - use `TargetWindow` plus `ActiveWindow` when the code wants persistent
    selector state.
  - keep the returned `IWindowHandle` instead of re-querying by raw handle or
    string.

- Multiple-match or stateless query:
  - receive `IWindowListProvider` and `IWindowMatcher`.
  - read `WindowsProvider.WindowList.Items`.
  - call `IWindowMatcher.FindMatches(..., targetExpression)`.

- One-shot "window is active" query:
  - receive `IWindowListProvider` and `IWindowMatcher`.
  - call `IWindowListProvider.GetForegroundWindow()`.
  - call `IWindowMatcher.IsMatch(foregroundWindow, targetExpression)`.

- Activate a matched window:
  - receive `IWindowSelector`.
  - call `FindWindow(...)` when the missing-window path should be handled
    explicitly.
  - call `GetWindow(...)` only when absence is exceptional.
  - call `Activate(...)` on the handle.

- Window match expression basics:
  - plain text matches process path, process name, or title.
  - quoted text is strict.
  - `/pattern/` is regex.
  - `0x...` or `&H...` matches a native handle.
  - `#2` selects the second matching window.
  - `&&` and `||` combine simpler expressions.
  - properties such as `[type=toplevel]`, `[type=child]`, `[visible]`, and
    `[focus]` further constrain matching.

- Track bounds:
  - receive `IWindowBoundsTrackerFactory`.
  - call `Track(window)`.
  - dispose the subscription with the owner lifetime.

## Prefer

- Prefer `IWindowHandle` after selection/resolution.
- Prefer `IWindowHandleProvider` only for raw handle conversion.
- Prefer `IWindowSelector` for live target matching.
- Prefer `IWindowSelector.FindWindow(...)` for non-throwing single-window
  lookup.
- Prefer `IWindowSelector.GetWindow(...)` only when absence is exceptional.
- Prefer `IWindowMatcher` plus `IWindowListProvider` for multi-window matching,
  custom supplied lists, or active-window checks that should not mutate
  selector state.
- Prefer direct window-handle APIs for thin window operations.
- Prefer trackers over raw native event hooks.

## Avoid

- Avoid storing raw `IntPtr` as long-term contract.
- Avoid using `IWindowHandleProvider` as selector/enumerator.
- Avoid using aura Actions, Triggers, or Overlays as lightweight wrappers for
  thin script/API operations. They are stateful Aura Tree runtime objects with
  configuration and lifecycle.
- Avoid copying AutoHotkey `WinTitle` tokens such as `ahk_exe` or `ahk_class`
  directly into `WindowMatchExpression`; map them deliberately.
- Avoid treating activation as guaranteed; foreground activation can time out or
  be blocked by Windows.
- Avoid direct low-level WinEvent code when trackers exist.

## Research Anchors

- `IWindowHandle`, `IWindowHandleProvider`, `IWindowListProvider`,
  `IWindowMatcher`, `IWindowSelector`, `WindowMatchExpression`,
  `WindowSelectorExtensions`, `WindowHandleExtensions`,
  `UnsafeNative.ActivateWindow`,
  `IWindowHandleMatcher`, `IComplexWindowHandleMatcher`,
  `IForegroundWindowTracker`, `IWindowBoundsTrackerFactory`,
  `IWinEventHookWrapper`.

## Search Synonyms

- HWND
- IntPtr window handle
- window handle wrapper
- window selector
- window matcher
- foreground window
- active window
- target window
- window exists
- WinExist
- WinActive
- WinActivate
- window bounds tracker
- WinEvent hook

## Related Maps

- `osd/selection.md`
- `osd/screen-overlay.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `memory/processes.md`
