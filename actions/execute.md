---
title: Execute Actions
description: Runs the actions of other auras, so you build a chain once and reuse it.
published: true
date: 2022-11-02T15:04:00.781Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T15:03:59.667Z
---

# Execute Actions — reuse an existing chain

Execute Actions runs the actions of another aura. Build a chain once, for example two sounds with a pause, and call it from several auras instead of copying it. Older versions and this page's address call the action Execute Aura.

## Call a chain from another aura

1. Create an aura named “Two sounds”. Add [Fixed Value](/en/triggers/fixed-value) set to **Is NOT Active**, so it does not start its actions by itself.
2. In its **On Enter**, add [Play Sound](/en/actions/play-sound) with Ping and Play in background turned off, then [Delay](/en/actions/delay) set to `1000` ms, then Play Sound with Bell. Leave the other action groups empty.
3. Create an aura named “Call test” with Fixed Value set to Is NOT Active. Add **Execute Actions** to its On Enter.
4. Under **Aura links**, click **Links** and select “Two sounds”. Set **Execute actions** to `1` and **Strategy** to **Run 1-by-1 in order of addition**.
5. In “Call test”, switch Fixed Value to Is Active and wait for the chain to finish.

You will hear Ping, a pause, then Bell. “Two sounds” stays inactive: Execute Actions calls its actions directly and leaves its trigger alone.

In a behavior tree, the [Run Aura](/en/behavior-trees/nodes/execute-aura) node calls a prepared chain. The call does not look at whether the source aura is active. If that matters, check it separately with [Aura Is Active](/en/behavior-trees/nodes/aura-is-active).

## Settings

| Setting | Effect |
|---|---|
| Aura links / Links | The auras whose actions are used. |
| Execute actions, time(s) | Number of repeats. `1` runs the selected strategy once, `0` runs nothing. |
| Strategy — Run 1-by-1 in order of addition | Runs the actions one at a time and waits for each to finish. For each linked aura, it takes the On Enter, While Active and On Exit groups, in that order. |
| Strategy — Run one random linked action | On each repeat, picks one random action from all linked auras. That is a single action, not one aura's whole chain. |

Actions run from **all three groups**, not only On Enter. That is why the example leaves the other two groups empty. An error in an action stops the sequential run. A sound started in the background does not hold up the next action.

Links in the editor may not be shown in the order they run. When order matters, keep one chain in one aura. Do not make auras call each other in a circle. To run chains from a script, see the [scripting guide](/en/scripting/getting-started).
