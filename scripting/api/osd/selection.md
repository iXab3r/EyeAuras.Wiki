---
title: AI OSD: Selection
description: AI-first map of OSD-based selection services and selected window data.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# OSD Selection Discovery Map

Reference map for interactive on-screen selection: window, region, point, or
color picking.

Drawing persistent annotations belongs to `osd/screen-overlay.md`.

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
- `OsdPointSelectionResult` - selected point.
- `OsdColorSelectionResult` - sampled color.

## Prefer

- Prefer `IOsdSelectionService` for user-driven selection.
- Prefer `IWindowHandle` from `PickWindow()` over raw handles.
- Prefer `windows-subsystems/window-handles.md` for handle conversion/matching.
- Prefer `osd/screen-overlay.md` for drawing persistent overlays.

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

- `osd/screen-overlay.md`
- `windows-subsystems/window-handles.md`
- `computer-vision/images.md`
- `memory/processes.md`
