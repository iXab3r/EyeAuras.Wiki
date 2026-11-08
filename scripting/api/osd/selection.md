---
title: AI OSD: Selection
description: AI-first map of OSD-based selection services and selected window data.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# OSD Selection Discovery Map

Reference map for interactive on-screen selection: window, region, point, or
color picking.

Drawing persistent annotations belongs to [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay).

## User Intents

- Let the user pick a target window.
- Pick a screen region.
- Pick a screen point.
- Pick a color under cursor.
- Use selected window PID for CV, memory, or input workflows.

## Concept Model

- `IOsdSelectionService` is the user-facing picker.
- Selection is interactive and temporary.
- `PickWindow()` returns `IWindowHandle`.
- Region/point/color picking can be scoped to a target window.
- Region selection can provide screen/window coordinate transforms.

## API Details

- `IOsdSelectionService`
  - `PickWindow()`
  - `PickRegion(IWindowHandle targetWindow = default)`
  - `PickPoint(IWindowHandle targetWindow = default)`
  - `PickColor(IWindowHandle targetWindow = default)`
- `OsdRegionSelectionResult` - selected region, transform matrices, and window
  under cursor.
- `OsdRegionTransformationMatrices` - `ScreenToWindow` and `WindowToScreen`.
- `OsdPointSelectionResult` - `Point`, `Matrices`, `WindowUnderCursor`.
- `OsdColorSelectionResult` - `Color`, `Point`, `Matrices`, `WindowUnderCursor`.

## Pick a window and a region

Run this top-level EyeAuras C# Script. An ordinary helper receives `IOsdSelectionService` explicitly:

```csharp
using EyeAuras.Shared.Osd;

var selection = GetService<IOsdSelectionService>();
var window = await selection.PickWindow();
var result = await selection.PickRegion(window);
Log.Info($"Window: {window.Title}; region: {result.Region}");
```

Choose the window with the left mouse button, then select a rectangle. The log shows the chosen region. The service activates the supplied window before the second selection. `WindowUnderCursor` is sampled during selection and is separate from the supplied target window.

Right-click or Escape cancels selection and cancels the awaited task. These methods take no `CancellationToken`. A concurrent request on the same service throws `InvalidOperationException`. The selection window hides after completion or cancellation.

## Pick a screen point and color

Run this as a separate C# Script:

```csharp
using System;
using EyeAuras.Shared.Osd;

var selection = GetService<IOsdSelectionService>();
try
{
    var point = await selection.PickPoint();
    Log.Info($"Point: {point.Point}");
    var underCursor = point.WindowUnderCursor;
    Log.Info(underCursor == null || !underCursor.IsWindow
        ? "Window under cursor unavailable"
        : $"Window under cursor: {underCursor.Title}, PID: {underCursor.ProcessId}");

    var color = await selection.PickColor();
    var c = color.Color;
    Log.Info($"RGB({c.R}, {c.G}, {c.B}), HEX #{c.R:X2}{c.G:X2}{c.B:X2}; point: {color.Point}");
}
catch (OperationCanceledException)
{
    Log.Info("Selection cancelled by user");
}
```

Without `targetWindow`, the matrices are identity and coordinates are screen coordinates. Color selection samples a desktop snapshot captured at the start of that selection; it is not a continuous CV capture.

All three result structures expose `WindowUnderCursor`. It is borrowed, may be null or stale, and is not the supplied target window. Supplying a target changes the coordinate origin to that window’s `DwmFrameBounds`, not its client area. These matrices do not include OCR capture/ROI transforms.

## Coordinate contract and version

In EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`, matrix names disagree with the directions described in XML. The implementation builds `ScreenToWindow` with a positive translation by the target frame origin and `WindowToScreen` as its inverse. Returned `Region` and `Point` use `WindowToScreen`, subtracting the origin. For frame origin `(100, 200)`, screen point `(130, 240)` becomes `(30, 40)`; do not subtract the origin again. This does not promise client coordinates or DPI correction. Check implementation when changing versions.

[Selection contracts](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Shared/Osd/IOsdSelectionService.cs) · [Selection implementation](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Blazor.Controls/Osd/OsdSelectionService.cs)

## Prefer

- Prefer `IOsdSelectionService` for user-driven selection.
- Prefer `IWindowHandle` from `PickWindow()` over raw handles.
- Prefer [windows-subsystems/window-handles.md](/en/scripting/api/windows-subsystems/window-handles) for handle conversion/matching.
- Prefer [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay) for drawing persistent overlays.

## Avoid

- Avoid custom cursor polling or screenshots for picker behavior.
- Avoid using OSD selection as a persistent overlay renderer.
- Avoid assuming selected windows stay alive.

## Research Anchors

- `IOsdSelectionService`, `PickWindow`, `PickRegion`, `PickPoint`,
  `PickColor`, `OsdRegionSelectionResult`, `WindowUnderCursor`,
  `OsdRegionTransformationMatrices`.

## Search Synonyms

- select window
- pick window
- OSD picker
- region picker
- point picker
- color picker
- screen selection
- window under cursor

## Related Maps

- [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay)
- [windows-subsystems/window-handles.md](/en/scripting/api/windows-subsystems/window-handles)
- [computer-vision/images.md](/en/scripting/api/computer-vision/images)
- [memory/processes.md](/en/scripting/api/memory/processes)
