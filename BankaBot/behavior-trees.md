---
title: Behavior Trees
description: What behavior trees are, how they work, and why they are used in BankaBot
published: true
date: 2026-03-08T15:40:00.000Z
tags: BankaBot, Lineage 2, деревья поведения, логика, настройки, ai-translated
editor: markdown
dateCreated: 2026-03-08T15:40:00.000Z
---
# What Are Behavior Trees?

Behavior trees let you build bot logic from visual blocks instead of code. You work with nodes: conditions, actions, delays, selectors, and other logic elements.

In simple terms, a behavior tree answers one question: what should the bot do right now?

## Why They Matter in BankaBot

In `BankaBot`, behavior trees are one of the main ways to configure character behavior.

They are a convenient way to build logic such as:

- choosing a target
- checking the distance to the target
- using the right skill
- waiting for a cooldown
- switching to the next logic branch
- handling dangerous situations separately, such as low `HP`

This is much easier than trying to keep all the logic in your head or jumping straight into a large script.

> Placeholder image: BankaBot behavior tree editor window with a simple combat branch

## What a Behavior Tree Looks Like

Every tree starts with a root node. Below it are the nodes that make up the behavior.

Most users work with these types of nodes:

- conditions, for example “target exists” or “HP is below a threshold”
- actions, such as pressing a button, starting an action, or running a piece of logic
- utility nodes, such as delay, cooldown, or choosing between multiple branches

The tree is evaluated continuously. Because of that, the bot is not just running one long macro. It keeps checking the current situation and deciding what to do next.

If you need a more general overview of nodes, see the main EyeAuras documentation:

- [Nodes](/behavior-trees/nodes)
- [Scripting inside behavior trees](/behavior-trees/scripting)

## How It Works in Practice

A simple example:

1. If the character is alive and there is a suitable mob nearby, the bot selects it as the target.
2. If a target is already selected and is within attack range, the bot starts combat.
3. If `HP` drops, the bot switches to the healing branch.
4. If the target dies, the bot goes back to searching for the next one.

This is the key difference from a simple macro. A macro follows a fixed list of commands. A behavior tree keeps making decisions based on the current situation.

> Placeholder image: example tree with branches "target search -> combat -> healing -> return"

## When a Tree Is Enough, and When You Need a Script

If the logic can be described with clear building blocks, it is usually better to start with a behavior tree. It is easier to read, easier to edit, and faster to debug.

A script makes sense when:

- you need custom logic that is awkward to assemble with nodes
- you need to react to several events at once
- you need many conditions, timers, or custom math

For more details, see:

- [Scripting](../scripting/getting-started)

## Best Place to Start

- Do not try to build one huge tree for every possible situation right away
- Start with one working branch: target search, attack, healing
- Add complexity one step at a time so it is clear what exactly broke
- If the logic becomes too bulky, move part of the behavior into a script