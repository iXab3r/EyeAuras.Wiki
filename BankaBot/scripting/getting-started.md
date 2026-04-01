---
title: Scripting
description: What scripting in BankaBot can do, where it shines, and when you actually need it
published: true
date: 2026-03-08T15:40:00.000Z
tags: BankaBot, Lineage 2, скрипты, C#, AI, NuGet, ai-translated
editor: markdown
dateCreated: 2026-03-08T15:40:00.000Z
---
# What scripts add to BankaBot

In `BankaBot`, scripts are not just "one extra command on top." They are essentially a full way to build your own logic on top of the bot.

With scripts, you can:

- react to in-game events
- control your character and the game window
- draw hints and markers on top of the screen
- enable and disable parts of your logic depending on the situation
- build custom automation that would be hard to express with nodes alone

## How this differs from typical "bot scripts"

The scripting system here is not a tiny limited language with lots of restrictions — it is regular `C#`.

In practice, that means:

- you can write not only short logic snippets, but full mini-applications
- you can use `NuGet` packages
- you can organize code in a much more maintainable structure instead of one giant file
- you can combine scripts with behavior trees instead of having to choose one or the other

One important detail: `BankaBot` itself also works, by design, as a script inside `EyeAuras`. That gives a good idea of how capable the local scripting system really is.

## What a script can access

Scripts run in their own environment, which gives them access to everything they need:

- character, target, party, and game windows
- keyboard and mouse input
- `OSD`, meaning drawing over the game
- timer events
- system message events
- network message events
- key press events
- teleport events or sudden position changes

This is convenient because you do not have to build everything from scratch every time. Most useful foundations are already there.

> Placeholder image: BankaBot script editor with an open project and multiple files

## Script groups

One of the useful ideas in `BankaBot` is script groups.

The idea is simple: you can split a large scenario into separate parts. For example:

- combat
- buffs
- loot pickup
- notifications
- movement

Those groups can then be enabled and disabled independently. This is useful both for debugging and for day-to-day use. You do not have to stop the entire script every time if you only want to temporarily disable one part of the behavior.

There are dedicated button widgets in the interface for this, so you can quickly toggle groups while the bot is running.

> Placeholder image: panel with script group buttons, where some groups are enabled and others are disabled

## Where AI fits in

A major feature of `BankaBot` is its deep integration with `AI Code Assistant`.

If you do not want to write code from scratch, this makes things much easier:

- you can ask it to help write a new piece of logic
- you can ask it to refactor an existing script
- you can ask questions about the API, bot behavior, and scripting capabilities

This does not remove the need to review the result yourself, but it significantly lowers the entry barrier.

## When you really need a script

Scripts are especially useful when:

- the logic is too complex for a single behavior tree
- you need timers, events, and several independent parts of behavior
- you need custom behavior for your server or playstyle
- you want to add your own overlays, hints, or utility logic

If the task is simple, start with a behavior tree. If you hit the ceiling, then add a script.

See also:
- [Behavior Trees](../behavior-trees)