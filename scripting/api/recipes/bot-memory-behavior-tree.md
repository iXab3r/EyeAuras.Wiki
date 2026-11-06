---
title: AI Recipe: Bot Using Memory API And Behavior Tree
description: Short recommendation recipe for reading memory and feeding Behavior Tree automation.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, blazor, memory, behavior-tree, ai-translated
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

## Publish a snapshot to an existing tree

This recipe assumes a running EyeAuras host, a user-created tree, and a reader script in a known variable scope. It does not create a standalone BT engine: the root depends on aura context, triggers, loaded state and the host scheduler.

The reader inputs are a chosen PID, a versioned layout and the absolute HP address or verified pointer chain. Its owner opens a reader through the loaded memory module and calls `process.Memory.Read<int>(healthAddress)`. Read outside the UI, then publish the value with availability, read time and connection identity. Producer and consuming node must share the same variable owner and name; identical short names in different folders do not establish shared state.

The tree first checks connection identity and freshness, then compares HP against a threshold and executes its configured branch. Blazor displays the same snapshot and read status. A missing variable is not zero HP: `ScriptVariable<T>.Value` can return `default`; use `TryGetValue` plus a separate availability status.

The expected result is a tree and UI making decisions from the same published state. When the process disappears, stop using stale values. On Stop, cancel and await the read loop before disposing its reader; the synchronous read itself takes no cancellation token. Exact offsets, refresh interval and tree branches are project inputs, not supplied by this recipe. The generic memory/variable contracts were checked at EyeAuras `20fd3d4`.

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

- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [windows-subsystems/window-handles.md](/en/scripting/api/windows-subsystems/window-handles)
- [memory/processes.md](/en/scripting/api/memory/processes)
- [auras/overview.md](/en/scripting/api/auras/overview)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)

## Root lifetime and the linked pack

At `c8b2304`, setting `IsLoaded=false` closes tick admission immediately; cancellation, draining and owned-tree/session reset finish asynchronously. Reload waits for that cleanup. This does not delete graph configuration or blackboard values. Code that ignores cancellation can delay the drain. `IsTicking=false` is not equivalent to unload, and loaded-but-inactive manual ticks remain a separate route. A memory producer has its own owner; root unload is not a promise to dispose an unrelated reader.

The linked pack page identifies revision 33 and EyeAuras 1.9.9774.0, and describes the C# reader/BT combination. Its downloadable payload and live game behavior were not validated here. The screenshots illustrate the architecture; select offsets and pack revision for your actual target.

[Root implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.BehaviorTree/BehaviorTreeRootNode.cs)
