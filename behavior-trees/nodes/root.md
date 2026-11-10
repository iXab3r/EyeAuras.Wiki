---
title: Root
description: Root Node
published: true
date: 2025-08-17T08:11:35.009Z
tags: tree, settings, logic, recalculation
editor: markdown
dateCreated: 2024-03-07T14:51:42.386Z
---
# Control when the main tree runs

Root stores the tree container's loading, activation and execution settings. It is not removable like an ordinary child. The graph entry **My Tree** belongs to one executable tree; a container can hold several.

| Object | What it selects |
| --- | --- |
| Root container | Loading, activation, period, shared settings and contained trees. |
| Selected tree | What you are editing and what the upper **Tick BT Once** runs. |
| MainTree | The starred tree used for automatic execution. Selecting another tab does not change it. |

## Enable periodic ticks with your own condition

First complete the [no-input example](/en/behavior-trees/gettings-started) manually. Also create your own aura named `BT enabled` with one [Fixed Value](/en/triggers/fixed-value), no actions, initially **Is NOT Active**.

1. Select the intended tree in the upper selector, then select its **My Tree** entry to show container settings.
2. In **General → Is Main**, check **This Tree is the Main one**. Otherwise click **Make this Tree the Main one**. The selector's star identifies automatic entry.
3. Enable **Activation → Is Loaded**. Click **activate when Aura Activated...**, then select `BT enabled` in **Enabling Condition → Links**.
4. Set **Execution → When Activated → Run periodically**, with **Tick every = 250 ms**.
5. Change your aura to **Is Active**. When activation and global pause permit work, **Ticking...** appears and MainTree receives ticks. Return the aura to **Is NOT Active** to stop automatic ticks.

The observable result is MainTree execution when allowed, and **Idle** when disallowed. **Pause Everything if Active** in EyeAuras window settings can pause automatic work while its main window is active. Account for that setting when observing your own tree; do not change unrelated configurations to make this example run.

![The earlier root settings and MainTree selection interface](https://s3.eyeauras.net/media/2025/08/EyeAuras_vs6Z34YfZ2.png)

The earlier **Activation Conditions**/**Activation Settings** groups correspond to current **Activation**/**Execution**. Main-window activation pauses work only when the relevant global pause setting applies.

| Setting or state | Behaviour |
| --- | --- |
| `Is Loaded` | Admits execution. Unload rejects new ticks, requests cancellation, then resets execution after active work drains; the saved graph/data remain. |
| `Enabling Condition` | Linked auras gate automatic activation. No links and no triggers means **manual**, not permanent automatic permission. |
| `activate when Key Pressed...` | Adds **Hotkey Is Active** to this container; configure its gesture/mode separately. |
| `Do nothing` | No automatic calls. A loaded selected tree can still be ticked manually. |
| `Run once` | One tick when IsActive changes from false to true, not a loop until a Running result completes. |
| `Run periodically` | Repeated ticks of MainTree while conditions permit. |
| `Tick every` | Delay after processing a periodic tick. Work duration affects the interval; this is not a fixed-FPS guarantee. |
| `Ticking` / `Idle` | Current permission and idle reason, not the last node's execution result. |

Folder conditions, loading and pause also matter. Read the idle explanation, such as **manual**, **paused**, **no main tree** or **no nodes to run**. An empty tree supplies no useful automatic work.

<details>
<summary>Manual entry, stopping and reset</summary>

The upper **Tick BT Once** ticks the selected tree. **Run** in a node's footer ticks that selected node. Manual entry can bypass automatic activation conditions, but still requires loading. Use a separate no-input tree for these experiments.

The adjacent repeat control issues manual ticks until stopped; **Stop** cancels the call issued by that panel, not all trees. Do not mix entrypoints on an unfinished route: another caller can receive Failure while the first retains its continuation.

**Reset node status** clears the displayed result, not timers or execution cursors. Stopping automatic ticks is not a full reset either. Unload requests cleanup after active work finishes; code that ignores cancellation can delay it. There is no universal instant interruption.

</details>

<details>
<summary>Shared settings and additional trees</summary>

| Field or group | Purpose |
| --- | --- |
| `Settings → Target Window` | Shared target for nodes that consume it, not a guarantee of background input. |
| `Settings → show more...` | Module-provided defaults such as **Input Simulator**. See [default properties](/en/features/default-properties) for binding/inheritance. |
| `Advanced → Is Shared` | Exposes the selected tree as a reusable node. |
| `Advanced → References → Links` | Shared classes/declarations from linked projects. Local values in `Script.csx` do not become another tree's global variables. |
| Selector's `New Behavior Tree` | Add another executable tree to this container, then explicitly choose Main for automatic use. |

Graph and nested-list configurations share MainTree and execution rules. This guide does not require a mode switch that may be absent from your toolbar.

</details>
