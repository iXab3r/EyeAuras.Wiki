---
title: Getting Started
description: A brief overview of what BankaBot is, its key features, and how to start using it
published: true
date: 2026-03-08T13:30:00.000Z
tags: BankaBot, Lineage 2, бот, скрипты, AI, деревья поведения, ai-translated
editor: markdown
dateCreated: 2026-03-07T23:36:32.846Z
---
# What Is BankaBot

`BankaBot` is a bot for `Lineage 2`. It’s built for players who want to automate everyday gameplay tasks, not just loop a single button.

# Key Features

- IMPORTANT: it is **not** supported on every server. Some servers are blacklisted. For the current status, see the [BankaBot page](https://banka.gg/product/tprwcjh69vjh2kh/)
- Fully `usermod`. No drivers, no need to disable Windows security, and no “turn off half your system protection before launch” nonsense
- The bot works with `Active Anticheat` and `Smart Guard`. As testing continues, we’ll add other supported protections here
- The bot includes [behavior trees](behavior-trees), so you can configure logic without immediately diving into code
- It has a powerful `C#` scripting system. You’re not limited to tiny scripts here — you can build full mini-applications with `NuGet` package support and a proper project structure
- Scripts are deeply integrated with `AI`: you can use it to edit scripts and ask questions about the documentation, API, and features

One important thing that shows how capable the scripting system really is: `BankaBot` itself is *also* just a script running inside `EyeAuras`. The scripting side is not an afterthought — it’s one of the core features of the whole project.

# What the Bot Can Do in Practice

Without going too deep into implementation details, `BankaBot` can help you:

- build your own character logic: move, select targets, cast skills
- control actions through profiles, behavior trees, and scripts
- use built-in OSD (On-Screen Display) tools to draw directly on the screen, highlight targets, and display routes

# What the Bot Cannot Do

## Send input to an inactive window

We have always treated safety as a top priority, and we still do. Performing actions while the program runs in the background is currently only possible by sending packets. The combination of “the character is sending action packets” and “the game window is minimized” is extremely obvious from an analytics perspective.

We’ll continue monitoring anti-cheat and detection trends. If things remain quiet, we may consider supporting background action sending in the future — but for now, no.

## Work with multiple windows at the same time

The main reason is simple: sending actions requires the game window to be active, so this feature is not especially high on the priority list right now.

We still expect to get to it in the foreseeable future (`tbd`, end of Q1 to mid Q2 2026).

# Where to Get It

The current bot page is here — you can download the bot and buy a key there. You can log in using _only_ a key; an account is not required:

- [BankaBot on banka.gg](https://banka.gg/product/tprwcjh69vjh2kh/)

Register an EyeAuras account if you want to use that authentication option instead:

- [eyeauras.net/register](https://eyeauras.net/register)

# Getting Started

The startup flow is straightforward:

1. Download the program from the official website.
2. Buy a key on the bot page if you do not already have one.
3. Log in either with the key or with your EyeAuras account username and password.
4. Open Settings right after logging in.
5. Start with the `Prerequisites` section: the program will tell you what it needs to work correctly.
6. Then select the game window and move on to profiles and behavior setup.

# What to Read Next

- [Behavior Trees](behavior-trees)
- [Scripting](scripting/getting-started)
- [Rules and OSD](rules)
- [Geodata](geodata)
- [Section Topics](documentation-topics)

# Things to Keep in Mind

- Do not try to build the “perfect all-in-one bot” on day one. Start with a simple farming setup for one spot, then expand from there
- The easiest way to begin is with a ready-made profile or one small task
- If you want more control, look into behavior trees and scripts
- For the latest status on server support, anti-cheat compatibility, and bot availability, use the [BankaBot page](https://banka.gg/product/tprwcjh69vjh2kh/) as the source of truth