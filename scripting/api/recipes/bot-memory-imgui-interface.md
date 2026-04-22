---
title: AI Recipe: Bot Using Memory API And ImGui Interface
description: Short recommendation recipe for a bot that reads memory, shows an ImGui interface, and can run in-app scripts.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, imgui, memory, bot
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

- `nuget/imgui-sdk.md`
- `memory/processes.md`
- `nuget/frida-sdk.md`
- `windows-subsystems/window-handles.md`
- `scripting/runtime.md`
- `core/deployment.md`
