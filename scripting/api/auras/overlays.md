---
title: AI Auras — Overlays
description: AI-first map of aura overlays and visual output surfaces.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, overlays, ai-translated
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
- Retained built-in overlay UI is Blazor-hosted through `IBlazorWindow`; lower
  level `INativeWindow` support is host infrastructure rather than legacy
  overlay UI by itself.
- Blazor OSD screen overlay is lower-level drawing, not the same as an aura
  overlay entity.
- ImGui windows are optional package UI surfaces.

## Choose the UI surface

For a panel saved with an aura and controlled by its lifetime, start with
`CsharpScriptOverlay` and its entity registration. Properties store configuration;
`AuraOverlayContentBase` holds visibility, bounds, opacity and window commands.
It is created on the overlay dispatcher and retains its `Scheduler`; arbitrary
background-thread UI access is not appropriate.

A bot status panel enabled with the aura belongs here. A temporary rectangle
around a detection belongs to [OSD canvas](../osd/screen-overlay), a separate
Razor window to [Blazor windows](../windows-subsystems/blazor-windows), and
immediate-mode rendering to the separately loaded [ImGui SDK](../nuget/imgui-sdk).
The choice determines configuration and resource ownership. An `IOnScreenCanvas`
or ImGui assembly reference does not create an Aura Tree overlay entity;
use the cancellation and coordinate contract of the selected surface.

## API Details

- `CsharpScriptOverlay` - script overlay entity.
- `AuraOverlayPropertiesBase` - common overlay properties base.
- `AuraOverlayContentBase` - common overlay content/view-model base.
- `BlazorWindowAuraOverlay` - built-in overlay host path for retained
  Blazor-backed overlay runtime UI.
- `IOnScreenCanvas` - lower-level screen annotation canvas.
- `IBlazorWindow` - native Blazor-backed window.
- `IImGuiExperimentalApi` - optional ImGui SDK entry point.

## C# Overlay Context Lifetime

`CsharpAuraOverlay` and its `IWebUIOverlayScriptingApi` belong to the aura/window lifetime.
The script context borrows them as `IWebUIAuraOverlay` and `IWebUIOverlayScriptingApi`.
Recompilation and project import replace that context; disposing it must not dispose these borrowed objects or close the overlay window.

## Prefer

- Prefer aura overlay entities when UI is part of aura configuration/lifecycle.
- Prefer Blazor-hosted overlay views for retained EyeAuras overlay UI.
- Prefer [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay) for screen annotations and CV debug boxes.
- Prefer [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows) for real native windows.
- Prefer [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk) for ImGui SDK windows.

## Avoid

- Avoid confusing overlays with triggers or actions.
- Avoid using overlay entity docs for low-level OSD drawing.
- Avoid treating `PoeShared.Blazor.Wpf` host infrastructure as removable
  EyeAuras legacy UI.

## Research Anchors

- `CsharpScriptOverlay`, `AuraOverlayPropertiesBase`,
  `AuraOverlayContentBase`, `BlazorWindowAuraOverlay`, `IOnScreenCanvas`,
  `IBlazorWindow`, `IImGuiExperimentalApi`, `ImGuiWindowManager`.

## Search Synonyms

- overlay
- aura overlay
- script overlay
- visual overlay
- Blazor overlay
- ImGui overlay
- screen annotation

## Related Maps

- [auras/entities.md](/en/scripting/api/auras/entities)
- [auras/actions.md](/en/scripting/api/auras/actions)
- [auras/triggers.md](/en/scripting/api/auras/triggers)
- [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)
