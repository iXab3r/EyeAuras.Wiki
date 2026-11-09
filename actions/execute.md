---
title: Execute Actions
description: Run actions from linked auras without copying their configuration.
published: true
date: 2022-11-02T15:04:00.781Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T15:03:59.667Z
---

# Execute Actions — reuse an existing chain

If several auras need the same two sounds and a pause, build that chain once and call it with Execute Actions. Older versions and this page's historical name call it Execute Aura.

## Call a chain from another aura

1. Create an aura named “Two sounds”. Add [Fixed Value](/en/triggers/fixed-value) set to **Is NOT Active**, so it does not start its actions by itself.
2. In its **On Enter**, add [Play Sound](/en/actions/play-sound) with Ping and Play in background disabled, [Delay](/en/actions/delay) set to `1000` ms, then Play Sound with Bell. Leave the other action groups empty.
3. Create a second aura named “Call test”, also with Fixed Value set to Is NOT Active. Add **Execute Actions** to its On Enter.
4. Under **Aura links**, click **Links** and select “Two sounds”. Set **Execute actions** to `1` and **Strategy** to **Run 1-by-1 in order of addition**.
5. Switch “Call test” to Is Active and wait for the chain to finish.

You should hear Ping, a pause, then Bell. “Two sounds” stays inactive: Execute Actions calls its actions directly without changing its trigger. You can now link the same chain from another aura.

## Settings

| Setting | Effect |
|---|---|
| Aura links / Links | Selects the auras whose actions will be used. One link is enough for this example. |
| Execute actions, time(s) | Number of repetitions. `1` runs the selected strategy once; `0` runs nothing. |
| Strategy — Run 1-by-1 in order of addition | Waits for each action in sequence. For each linked aura, it takes On Enter, While Active and On Exit actions in that order. |
| Strategy — Run one random linked action | On each repetition, chooses one action from all linked auras. It selects an individual action, not a whole aura's chain. |

Actions come from **all three groups**, which is why the example leaves two groups empty. An action error interrupts sequential execution. A sound started in the background does not itself delay the next action.

The order of links displayed in the editor may differ from execution order. When order matters, keep one chain in one aura. Avoid circular calls through other auras. For scripted orchestration, see the [scripting guide](/en/scripting/getting-started).
