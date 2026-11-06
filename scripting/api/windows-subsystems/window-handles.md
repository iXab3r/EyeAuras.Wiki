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

Interactive picking belongs to [osd/selection.md](/en/scripting/api/osd/selection).

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

## Find and activate a window

Open Notepad and run this top-level C# Action:

```csharp
IFactory<IWindowSelector> WindowSelectorFactory { get; init; }

{
    using var selector = WindowSelectorFactory.Create();
    var window = selector.FindWindow("notepad.exe");
    if (window == null)
    {
        Log.Info("No matching window yet");
        return;
    }
    window.Activate(TimeSpan.FromMilliseconds(500));
    Log.Info($"Selected window: {window.Title}");
}
```

This Run owns the selector and its subscriptions. The factory and handles are
borrowed host infrastructure. Ordinary classes receive the factory explicitly.
The desktop host needs native registrations and UI Core; SDK types alone do not
provide a live window list. `FindWindow` reads immediately and may return null;
`GetWindow` throws `InvalidOperationException` in that case. Selection is not OS
foreground. The current target is retained while it still matches.

`OnlyVisible` defaults to false. Target assignment defaults to top-level external
windows unless overridden. Plain text matches paths/titles/arguments or a whole
process name, so `notepad.exe` is not AHK's process-only restriction. Activation
is synchronous, may restore a minimized window, has no cancellation token and can
fail under Windows foreground policy. A zero foreground can extend the wait to
ten seconds; 500 ms is not a strict total-duration bound.

## Wait for a window from one process

Start this top-level script, then open Notepad:

```csharp
using System;
using System.IO;
using System.Threading.Tasks;
using EyeAuras.Shared.Services;
using PoeShared.Native;
using PoeShared.Prism;

{
    var runToken = cancellationToken;
    var factory = GetService<IFactory<IWindowSelector>>();
    using var selector = factory.Create();
    selector.OnlyVisible = true;
    selector.WindowFilter = candidate => string.Equals(
        Path.GetFileNameWithoutExtension(candidate.ProcessName),
        "notepad", StringComparison.OrdinalIgnoreCase);
    selector.TargetWindow = "#1";

    IWindowHandle window;
    while (true)
    {
        runToken.ThrowIfCancellationRequested();
        window = selector.ActiveWindow;
        if (window != null && window.IsWindow)
        {
            break;
        }
        await Task.Delay(250, runToken);
    }
    Log.Info($"Notepad found: {window.Title}");
}
```

`#1` selects the first result after filtering, not necessarily a particular
Notepad document. Normalize the executable extension because `ProcessName` can
come from a file name or the fallback `Process.ProcessName`. Stop cancels the
delay and releases the selector. `IsWindow` is a point-in-time check, not a lock
against window closure. Re-read `selector.ActiveWindow` on every later iteration;
the local `window` variable does not follow future target changes.

## Take a process window snapshot

This C# Script reads the shared provider without changing another selector:

```csharp
using System;
using System.IO;
using System.Linq;
using EyeAuras.Shared.Services;

var provider = GetService<IWindowListProvider>();
provider.RefreshWindowList();
var snapshot = provider.WindowList.Items.ToArray();
var matches = snapshot.Where(w => w.IsWindow && string.Equals(
    Path.GetFileNameWithoutExtension(w.ProcessName),
    "notepad", StringComparison.OrdinalIgnoreCase)).ToArray();
foreach (var w in matches)
    Log.Info($"{w.Title}, PID: {w.ProcessId}");
```

The array snapshots enumeration, not future window validity. Provider and handles
are borrowed. For a text expression across multiple fields, pass the materialized
array to `IWindowMatcher.FindMatches(snapshot, expression)`; its contract takes
`IReadOnlyList<IWindowHandle>`, not an arbitrary lazy enumerable.

## Check the foreground process

This query does not read or modify a selector:

```csharp
using System;
using System.IO;
using EyeAuras.Shared.Services;

var foreground = GetService<IWindowListProvider>().GetForegroundWindow();
var isNotepad = foreground != null && foreground.Handle != IntPtr.Zero &&
    foreground.IsWindow && string.Equals(
        Path.GetFileNameWithoutExtension(foreground.ProcessName),
        "notepad", StringComparison.OrdinalIgnoreCase);
Log.Info($"Notepad is foreground: {isNotepad}");
```

The provider may wrap a zero HWND, so a non-null managed reference is insufficient.
Foreground can change immediately after the read.

## Convert a frame-relative point

`ToScreen(Point)` and `FromScreen(Point)` add/subtract the origin of
`DwmFrameBounds`; invalid bounds throw. This is frame-relative geometry, not a
promise of Win32 client coordinates. Choose the input coordinate space and backend
before using an OSD matrix or sending mouse input.

## Observe one window's bounds

Open Notepad, run this C# Action and move its window during the next ten seconds.
The text expression is broad; use the earlier filter for process-only selection.

```csharp
using System;
using System.Reactive.Linq;
using System.Threading.Tasks;
using EyeAuras.Shared.Services;
using EyeAuras.Shared.Scaffolding;
using PoeShared.Native;
using PoeShared.Prism;

{
    using var selector = GetService<IFactory<IWindowSelector>>().Create();
    var window = selector.FindWindow("notepad.exe");
    if (window == null || !window.IsWindow)
    {
        Log.Info("No window yet; run this example again");
        return;
    }

    var tracker = GetService<IWindowBoundsTrackerFactory>();
    using var subscription = tracker.Track(window).Subscribe(
        bounds => Log.Info(bounds.HasValue
            ? $"Bounds: {bounds.Value}"
            : "Bounds unavailable"),
        error => Log.Error("Bounds tracking failed", error));
    await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);
}
```

The stream emits initial bounds and later changes. Ten seconds or Stop ends this
subscription. It follows one HWND, not replacement selector targets. Nullable bounds
do not guarantee a close event; the stream can fail. The factory is borrowed.
The source does not establish native-hook disposal as a subscription completion
barrier; do not assume a UI delivery thread or complete native teardown.

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
  - `FindMatches` narrows results with `&&`; `||` takes the first nonempty
    alternative, not a union. `IsMatch` accepts a simple expression.
  - Text uses ordinal case-insensitive comparison; regex ignores case too.
  - Selector consumes `[type=toplevel]`, `[type=child]` and `[ownedBy=...]`;
    parsed `[visible]`/`[focus]` are not automatic filters. Use `OnlyVisible`.

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

- [osd/selection.md](/en/scripting/api/osd/selection)
- [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay)
- [windows-subsystems/input-hooks-hotkeys.md](/en/scripting/api/windows-subsystems/input-hooks-hotkeys)
- [memory/processes.md](/en/scripting/api/memory/processes)
