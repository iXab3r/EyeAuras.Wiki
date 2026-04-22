---
title: AI Recipe: Bot Using Memory API And Behavior Tree
description: Short recommendation recipe for reading memory and feeding Behavior Tree automation.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, blazor, memory, behavior-tree
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Bot Using Memory API And Behavior Tree

| Field | Value |
| --- | --- |
| Complexity | Medium |
| Example | POE2 Helper |
| End Goal | Read a small amount of memory, show it to the user, and let Behavior Tree use the same values. |
| Key Technologies | Memory API, Behavior Tree, Blazor window, shared script variables |

## Use When

- The bot logic already lives in Behavior Tree.
- A script needs to read memory and expose a few values to that tree.
- The user also needs a small window showing those values.
- A full ImGui bot panel would be too much.

## Example Illustration

[Path of Exile 2 Helper - Auto HP/MP](https://eyeauras.net/share/S20241213181401RaWLZLE430e6)
shows this pattern: a small status/config window, memory reads in C#, and
Behavior Tree nodes using the values.

![Small status and configuration window](https://s3.eyeauras.net/media/2025/01/EyeAuras_iSuJSK1pHGNKt6oe.png)

![Memory values passed to Behavior Tree](https://s3.eyeauras.net/media/2024/12/NVIDIA_Overlay_6AQq69FcnRKIaom4.png)

![Behavior Tree consuming memory-backed values](https://s3.eyeauras.net/media/2024/12/NVIDIA_Overlay_ZETbjmdKSZXdNyWt.png)

## Shape

- Read only the memory values the Behavior Tree needs.
- Store or expose those values in a small shared values object or script
  variables.
- Show the same values in a compact Blazor window.
- Let Behavior Tree nodes read the values and decide what to do.
- Show process/window loss clearly in the UI.

## Choices

- How the user picks the process/window.
- Which values must be shared with Behavior Tree.
- Which values are only for display.
- Whether the window is normal, topmost, or compact.
- Whether Behavior Tree reads script variables or calls a script/service.

## APIs To Look Up

- `IBlazorWindow`
- `BlazorReactiveComponent<T>`
- `IDialogWindowUnstableScriptingApi`
- `IWindowHandle`
- `IWindowSelector`
- `IWindowMatcher`
- `IBehaviorTreeAccessor`
- `ScriptVariable<T>`
- `IProcess`

## Avoid

- Large control panels.
- Treating the window as an overlay rendering layer.
- Hiding process attach/read failures.
- Persisting raw handles, process ids, or runtime addresses.

## Related Maps

- `windows-subsystems/blazor-windows.md`
- `windows-subsystems/window-handles.md`
- `memory/processes.md`
- `auras/overview.md`
- `scripting/runtime.md`
