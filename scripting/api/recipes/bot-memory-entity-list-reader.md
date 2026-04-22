---
title: AI Recipe: Bot Reading Entity List From Memory
description: Short recommendation recipe for a primitive memory reader that shows entities from another process.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, memory, bot, entities
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Bot Reading Entity List From Memory

| Field | Value |
| --- | --- |
| Complexity | Medium |
| Example | Assault Cube radar demo that reads entity data from memory and displays it in a Blazor window. |
| End Goal | Show a live list of entities from another process with names, positions, health, or similar fields. |
| Key Technologies | Memory API, `RemoteMemoryObject`, module memory, Blazor window |

## Use When

- You already know the target process and module.
- You have offsets for player pointer, entity list pointer, count, and fields.
- The entity list is small enough to refresh on a timer.
- The goal is inspection, radar, debugging, or a simple helper UI.

## Example Illustration

[Assault Cube 1.3.0.2 Radar](https://eyeauras.net/share/S20241111183049Hs524Q7FisJ1)
is a very small public pack with one `CsharpScript` aura. The pack page
describes it as a demo of Memory API plus BlazorWindow for drawing a radar.

![Assault Cube radar demo](https://s3.eyeauras.net/media/2024/11/ac_client_OCl6NDHXWXR9G0aC.jpg)

## Shape

- Open the target process and create module-scoped memory.
- Model the game root, local player, entity list, and entity objects as memory
  wrapper classes.
- Read entity count and entity-list pointer from known module offsets.
- Iterate entity pointers and read simple fields such as name, position, health,
  armor, team, or type.
- Show the current snapshot in a small Blazor window, table, radar, or log.

## Choices

- Which process backend to use: local process, MPFS/LC, KD, or custom backend.
- Whether entities are represented as live memory objects or immutable
  snapshots.
- How often the list should refresh.
- Whether invalid/null pointers are skipped, shown as errors, or stop refresh.
- Whether the UI is a table, radar, map, or debug-only log.

## APIs To Look Up

- `IProcess`
- `LocalProcess`
- `LCProcess`
- `KDProcess`
- `IMemory`
- `MemoryOfModule`
- `RemoteMemoryObject`
- `Read<T>`
- `ReadString`
- `IDialogWindowUnstableScriptingApi`
- `BlazorReactiveComponent`
- `BlazorReactiveComponent<T>`

## Avoid

- Treating offsets as stable across game versions.
- Reading every field every frame when only a few fields are displayed.
- Letting UI code own pointer math.
- Crashing on null, stale, or invalid entity pointers.
- Turning a quick entity reader into a full bot framework too early.

## Related Maps

- `memory/processes.md`
- `windows-subsystems/blazor-windows.md`
- `reverse-engineering/reprocess.md`
- `scripting/runtime.md`
