---
title: AI OSD: Screen Overlay
description: AI-first map of Blazor screen overlay and OSD canvas APIs.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd, overlay
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Screen Overlay / Blazor OSD Discovery Map

Reference map for drawing screen annotations through the Blazor-backed overlay
canvas: rectangles, HTML labels, Razor components, and CV debug boxes.

Interactive picking belongs to `osd/selection.md`.

## User Intents

- Draw a rectangle around a region.
- Show HTML label or badge over the desktop.
- Render a Razor component as a floating annotation.
- Display CV/ML bounding boxes.
- Open overlay WebView DevTools.

## Concept Model

- `IOnScreenService` creates owner-scoped canvases.
- `IOnScreenCanvasScriptingApi` is the script-facing canvas factory.
- `IOnScreenCanvas` owns `IOnScreenObject` instances by `OnScreenObjectId`.
- Objects use desktop screen coordinates.
- Current rendered object contracts are `IOnScreenRectangle`,
  `IOnScreenHtml`, and `IOnScreenRazor`.
- The renderer uses a transparent click-through Blazor/WebView window
  internally; consumers should use canvas/object APIs.

## API Details

- `IOnScreenService` - runtime canvas factory and DevTools hook.
- `IOnScreenCanvasScriptingApi` - script-facing canvas factory.
- `IOnScreenCanvas` - `ObjectsById`, `AddOrUpdate`, `Remove`, `Clear`,
  `ShowDevTools`.
- `IOnScreenObject` - `Id`, `Location`, `Size`, `Opacity`, `IsVisible`.
- `IOnScreenRectangle` - `Background`, `BorderColor`, `BorderThickness`.
- `IOnScreenHtml` - raw trusted `Html`.
- `IOnScreenRazor` - `ViewType` and `DataContext`.
- `OnScreenCanvasExtensions` - `AddRectangle`, `AddHtmlObject`,
  `AddRazor<T>`.

## Prefer

- Prefer `IOnScreenCanvasScriptingApi` for script-owned overlays.
- Prefer `IOnScreenService` for app/runtime code.
- Prefer `AddRectangle`, `AddHtmlObject`, and `AddRazor<T>` for built-in
  objects.
- Prefer disposing objects/canvas for cleanup.
- Prefer `windows-subsystems/blazor-windows.md` for real windows.
- Prefer `nuget/imgui-sdk.md` for ImGui UI.

## Avoid

- Avoid creating custom transparent WebView windows for simple annotations.
- Avoid untrusted HTML in `IOnScreenHtml`.
- Avoid using screen overlay as an input picker.

## Research Anchors

- `IOnScreenCanvas`, `IOnScreenCanvasScriptingApi`, `IOnScreenService`,
  `IOnScreenObject`, `IOnScreenRectangle`, `IOnScreenHtml`,
  `IOnScreenRazor`, `OnScreenCanvasExtensions`, `AddRectangle`,
  `AddHtmlObject`, `AddRazor`, `OnScreenOverlayComponent`.

## Search Synonyms

- screen overlay
- Blazor OSD
- desktop overlay
- click-through overlay
- bounding box overlay
- debug overlay
- HTML overlay
- Razor overlay
- screen annotation

## Related Maps

- `osd/selection.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`
- `computer-vision/images.md`
