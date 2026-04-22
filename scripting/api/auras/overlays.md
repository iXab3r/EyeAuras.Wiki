---
title: AI Auras: Overlays
description: AI-first map of aura overlays and visual output surfaces.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, overlays
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Aura Overlays Discovery Map

Reference map for aura overlay entities: user-configurable visual surfaces owned
by aura workflows.

## Concept Model

- Overlays are aura entities focused on presentation.
- Overlays are registered through `IAuraRegistrator`.
- Overlay properties persist configuration.
- Overlays do not activate auras and do not execute action lists.
- Blazor OSD screen overlay is lower-level drawing, not the same as an aura
  overlay entity.
- ImGui windows are optional package UI surfaces.

## API Details

- `CsharpScriptOverlay` - script overlay entity.
- `AuraOverlayPropertiesBase` - common overlay properties base.
- `AuraOverlayContentBase` - common overlay content/view-model base.
- `IOnScreenCanvas` - lower-level screen annotation canvas.
- `IBlazorWindow` - native Blazor-backed window.
- `IImGuiExperimentalApi` - optional ImGui SDK entry point.

## Prefer

- Prefer aura overlay entities when UI is part of aura configuration/lifecycle.
- Prefer `osd/screen-overlay.md` for screen annotations and CV debug boxes.
- Prefer `windows-subsystems/blazor-windows.md` for real native windows.
- Prefer `nuget/imgui-sdk.md` for ImGui SDK windows.

## Avoid

- Avoid confusing overlays with triggers or actions.
- Avoid using overlay entity docs for low-level OSD drawing.

## Research Anchors

- `CsharpScriptOverlay`, `AuraOverlayPropertiesBase`,
  `AuraOverlayContentBase`, `IOnScreenCanvas`, `IBlazorWindow`,
  `IImGuiExperimentalApi`, `ImGuiWindowManager`.

## Search Synonyms

- overlay
- aura overlay
- script overlay
- visual overlay
- Blazor overlay
- ImGui overlay
- screen annotation

## Related Maps

- `auras/entities.md`
- `auras/actions.md`
- `auras/triggers.md`
- `osd/screen-overlay.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`
