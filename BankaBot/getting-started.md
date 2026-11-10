---
title: Getting Started
description: A brief overview of what BankaBot is, its key features, and how to start using it
published: true
date: 2026-03-08T13:30:00.000Z
tags: BankaBot, Lineage 2, бот, скрипты, AI, деревья поведения, ai-translated
editor: markdown
dateCreated: 2026-03-07T23:36:32.846Z
---

# Getting started with BankaBot

Prepare one known BankaBot edition for one supported Lineage 2 client and window before choosing a behavior profile.

This guide describes the edition documented in March 2026. Obtain its version-specific instructions, supported client/server information and access requirements together with the distribution. General EyeAuras installation instructions do not establish BankaBot compatibility.

## Prepare the edition and window

1. Identify the BankaBot build and the client/server it supports. The [original publisher page](https://banka.gg/product/tprwcjh69vjh2kh/) is a historical reference, not a substitute for your distribution's download and compatibility instructions.
2. Prepare the access method supplied for that edition. The documented options were a key without an account, or an EyeAuras account; [account registration](https://eyeauras.net/register) is separate from obtaining a compatible BankaBot build.
3. Open the edition's settings and its **Prerequisites** section. Follow the checks described for that build. Do not replace them with settings from an unrelated EyeAuras installation.
4. Select the intended game window using that edition's instructions. Start with one small task, such as displaying supplied object data or inspecting a prepared behavior branch.
5. If the task involves movement, prepare [matching geodata](/en/BankaBot/geodata) before selecting a route or work area. Then choose the profile or behavior documented for the distribution.

At this point, you should be able to identify the selected window, required data and intended behavior. That preparation alone does not demonstrate successful movement, combat or support for a different server.

## What the documented edition provided

| Capability | What it required |
| --- | --- |
| Movement, target selection and skill use | BankaBot's supplied game data, commands and compatible client |
| Visual behavior logic | Prepared profiles or [behavior trees](/en/BankaBot/behavior-trees) with the edition's operations |
| Custom C# logic | The matching script context; multi-file projects and NuGet could organize larger programs |
| Object and route display | Supplied object/navigation data and OSD or radar settings; [rules](/en/BankaBot/rules) control visual emphasis |
| AI-assisted development | Actual project types, examples and documentation to ground code or explanations |
| User-mode operation | The historical description did not require a driver or disabling Windows security; this is not an invisibility or safety guarantee |

BankaBot itself was described as a script running within EyeAuras. This does not make its game-specific services available to an arbitrary EyeAuras script or C# class.

<details>
<summary>Compatibility and window limits</summary>

The historical description named ActiveAnticheat and SmartGuard and excluded some servers. Treat those names as the scope of that description, not a current support matrix or a guarantee against detection or account penalties.

The documented edition did not support input to an inactive game window or simultaneous operation in multiple windows. Planned support is not a selectable feature. Check the requirements of your exact build rather than assuming background delivery from an input backend's name.

</details>

Choose the next step by task: [behavior](/en/BankaBot/behavior-trees), [display rules](/en/BankaBot/rules), [geodata](/en/BankaBot/geodata), or [C# scripting](/en/BankaBot/scripting/getting-started). The [topic index](/en/BankaBot/documentation-topics) also lists information your edition's manual needs to supply.
