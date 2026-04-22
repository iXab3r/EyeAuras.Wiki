---
title: AI Recipe: Add EyeAuras Tools To Another App
description: Short recommendation recipe for adding EyeAuras-powered UI, automation, or OSD features inside another app/plugin host.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, embedded, blazor, behavior-tree
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Add EyeAuras Tools To Another App

| Field | Value |
| --- | --- |
| Complexity | Very High |
| Example | Plugin or host app that opens EyeAuras-powered windows and runs editable automation. |
| End Goal | The host app gains EyeAuras-powered windows, screen visuals, scripting, or automation. |
| Key Technologies | `EyeAuras.SDK.Embedded`, app modules, `IBlazorWindow`, Behavior Tree APIs, OSD APIs |

## Use When

- The feature runs inside another app or plugin host.
- The host supplies ticks, render callbacks, or domain events.
- The user needs EyeAuras-powered windows, screen visuals, scripting, or
  automation in that host.
- A normal EyeAuras script is not the entry point.

## Shape

- Start the embedded SDK runtime from the host/plugin.
- Bridge host events into EyeAuras-facing services.
- Show complex controls through Blazor windows.
- Draw visuals through host rendering or OSD APIs.
- Add Behavior Tree or hosted scripting only if users need editable automation.

## Choices

- How much of the SDK runtime to load.
- Which thread can safely create UI.
- Whether visuals should use host rendering, OSD, Blazor windows, or mixed UI.
- Whether automation belongs to host callbacks, Behavior Tree, scripts, or
  services.

## APIs To Look Up

- `EyeAuras.SDK.Embedded`
- `EyeAurasEmbeddedBootstrapper`
- `EyeAurasWebAppBootstrapper`
- `IDynamicModule`
- `IBlazorWindow`
- `IBlazorWindowAccessor`
- `IOnScreenCanvas`
- `IBehaviorTreeRootNode`
- `IReactiveBehaviorTreeEditor`
- `IAuraScriptFactory`

## Avoid

- Treating embedded-host code like a normal script context.
- Creating UI windows from the wrong thread.
- Blocking host tick/render callbacks with SDK or UI work.
- Exposing host-private objects directly to user scripts.
- Persisting volatile host handles, pointers, or session objects.

## Related Maps

- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `windows-subsystems/blazor-windows.md`
- `osd/screen-overlay.md`
- `scripting/runtime.md`
