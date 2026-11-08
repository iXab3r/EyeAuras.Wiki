---
title: AI Recipe: Bot Using Memory API And ImGui Interface
description: Short recommendation recipe for a bot that reads memory, shows an ImGui interface, and can run in-app scripts.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, imgui, memory, bot, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Bot Using Memory API And ImGui Interface

| Field | Value |
| --- | --- |
| Complexity | High |
| Example | `BankaBot`-style game bot with a live ImGui control panel. |
| End Goal | Build a bot that reads another process, shows status and controls in ImGui, and optionally lets users add scripts. |
| Key Technologies | Memory API, ImGui SDK, in-app scripts, window/process selection |

## Use When

- You are building a bot, not a one-off macro.
- The bot reads memory from another process.
- The user needs a live panel with buttons, status, settings, and logs.
- Users may need to add their own scripts inside the bot.

## Connect the reader and panel without reading memory in a frame

Start with an `IProcess` and known target layout, plus an EyeAuras script container referencing `EyeAuras.ImGuiSdk`. Register `ImGuiContainerExtensions` before resolving the API. In an ordinary app/plugin class the host supplies these dependencies; `GetService` and `cancellationToken` are not global C# APIs.

The reading loop uses `process.Memory.Read<T>(absoluteAddress)`, builds an immutable snapshot with PID, timestamp and status, then atomically publishes its reference. `AddRenderer` reads only that reference, draws fields and records commands for the worker. It does not resolve modules or read process memory every frame. A Stop button changes the owner's state; closing a window does not inherently stop the bot.

The panel stays responsive when a read is delayed and can display snapshot age and attachment errors. On completion, the owner stops and awaits its worker, removes rendering, closes its own windows and releases the reader and API. Keep the API alive while managed windows process closure on a frame; see the [complete window lifetime](/en/scripting/imgui/getting-started).

API instances share `Main`, including FPS, VSync, fonts and images. `ReplaceFont` changes the shared default. The static `ImGuiWindowManager` requires a compatible package (`0.1.47` contains it; `0.1.42` does not). Close your window with `Close(window)`, not other owners' windows with `CloseAll()`. Dispose the renderer subscription separately. Optional user scripts need an explicitly composed sandbox with permitted dependencies; they do not inherit arbitrary panel services.

## Shape

- Use Memory API services to read the process.
- Keep memory reads and bot data outside the ImGui render code.
- Use ImGui as the main always-open bot interface.
- Put heavy editors or long forms into Blazor windows only if ImGui becomes too
  cramped.
- Add in-app scripts only when users must customize behavior while the bot is
  running.

## Choices

- Which Memory API backend the bot supports.
- How the user chooses the game/process window.
- Whether bot logic lives in C# services, Behavior Trees, aura actions, or
  user scripts.
- Whether the UI is only ImGui or ImGui plus Blazor editor windows.

## APIs To Look Up

- `ScriptContainerExtension`
- `IWindowHandle`
- `IWindowSelector`
- `IWindowHandleProvider`
- `IProcess`
- `IImGuiExperimentalApi`
- `ICanBeDisplayedInImGui`
- `IImGuiWindowContent`
- `ImGuiWindowManager`
- `AuraScriptRunner<TSandbox>`
- `AuraScriptSandbox`

## Avoid

- Memory reads directly inside render code.
- Custom scripting unless users actually need runtime extensions.
- Mixing data from different process attachments.
- Assuming ImGui is built in; it comes from a separate SDK package.
- Persisting volatile handles or live process objects.

## Related Maps

- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)
- [memory/processes.md](/en/scripting/api/memory/processes)
- [nuget/frida-sdk.md](/en/scripting/api/nuget/frida-sdk)
- [windows-subsystems/window-handles.md](/en/scripting/api/windows-subsystems/window-handles)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [core/deployment.md](/en/scripting/api/core/deployment)
