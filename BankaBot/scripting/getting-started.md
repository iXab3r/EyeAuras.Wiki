---
title: Scripting
description: What scripting in BankaBot can do, where it shines, and when you actually need it
published: true
date: 2026-03-08T15:40:00.000Z
tags: BankaBot, Lineage 2, скрипты, C#, AI, NuGet, ai-translated
editor: markdown
dateCreated: 2026-03-08T15:40:00.000Z
---

# Organize a BankaBot C# script

Split one custom behavior into understandable parts before expanding it into a full project. A useful first task is displaying a label from state already supplied by your BankaBot edition, without adding movement or input.

The historical BankaBot description supported C#, multi-file projects, NuGet and combining scripts with behavior trees. BankaBot itself was described as a script within EyeAuras. Its game-specific context still requires the matching distribution's types, examples and data providers; it is not an implicit API in every EyeAuras script.

## Define one small task

1. Choose one supplied value or event and one visible result, such as updating a label from an available state value.
2. Find the actual type and example in your edition's project or SDK. Establish how the state is obtained before writing a reaction. A descriptive name such as “target” is not an API contract.
3. Separate state acquisition, the decision and display code into small parts. Use multiple files when that makes ownership and dependencies clearer.
4. Define how the task is enabled and stopped, and who owns its subscriptions, timers and display resources, before placing it in a group or class.

You should now be able to name the input, reaction and lifetime of one part of the program. A runnable implementation needs the matching interfaces; there is no generic BankaBot snippet that supplies missing game data.

| Documented capability | Required context |
| --- | --- |
| Character, target, party and window data | The edition's supplied objects and data provider |
| Keyboard or mouse reactions | Its input interface, explicit target and supported window conditions |
| OSD labels and other visual output | Its display API and ownership rules |
| Timers and custom calculations | A defined lifetime and cancellation path |
| System or network messages | The actual event source and payload contract |
| Key events or sudden position changes such as teleportation | A supplied event or a defined comparison of available state |
| NuGet and several source files | The project's package support, imports and dependencies; a package reference alone does not register a game service |

## Give each group a clear responsibility

The historical workflow grouped related features so that widgets could enable or disable them independently.

| Example group | Responsibility to define |
| --- | --- |
| Combat | Target checks and permitted operations |
| Buffs | Availability, timing and conditions for the supplied operations |
| Loot | The actual item data and allowed reactions |
| Notifications | Which events produce a visible or audible notification |
| Movement | Route data, navigation operations and stopping conditions |

A group toggle expresses user intent. Its implementation must still dispose owned observers and timers and handle ongoing work according to the component's cancellation contract. It does not imply an immediate stop of arbitrary code or rollback of an operation already delivered.

<details>
<summary>C# context, trees and AI assistance</summary>

Use a [behavior tree](/en/BankaBot/behavior-trees) for a small visible sequence of checks. A script is useful for custom calculations, several events, timers or a specialized display. Expose a defined operation to the tree rather than hiding the entire workflow in one large node.

The historically described AI Code Assistant can help explain the available API, refactor a project or draft code from actual types and examples. Check the result against that project's interfaces and expected output; generated code cannot establish an unavailable integration.

For platform basics, read [EyeAuras C# scripting](/en/scripting/getting-started). Top-level script services such as `Log`, `GetService` or a cancellation token depend on the host. Ordinary C# helpers and Razor components need explicit dependencies; they do not inherit script globals. Keep namespace imports outside executable resource scopes, and keep awaited work inside the scope that owns its resources.

</details>

[Getting started](/en/BankaBot/getting-started) covers the distribution and environment. [Rules](/en/BankaBot/rules) covers display selection; it does not replace scripted decision logic.
