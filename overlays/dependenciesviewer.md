---
title: Dependencies Viewer
description: View and inspect dependencies between EyeAuras elements.
published: true
date: 2022-11-02T15:14:54.619Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T15:14:53.516Z
---
# Dependencies Viewer

The alpha version includes a new feature designed to make working with complex auras easier, especially when they have many dependencies.

With a visual dependency graph, the current aura states, and the states of linked auras, you can quickly see what is happening right now and what is going to happen next.

The graph shows:

- The current state of each aura: enabled, disabled, or unloaded.
- Which block is currently running: `OnEnter`, `WhileActive`, or `OnExit`.

|  |  |
| --- | --- |
|  | The **WhileActive** block is currently running |
|  | The aura is active |
|  | The **OnEnter** block is currently running |
|  | The aura is **inactive** |
|  | The **OnExit** block is currently running |

You can open this graph in two ways:

1. A new **Show dependencies** item is available in the context menu. It opens a window with an interactive graph that updates in real time. You can drag nodes, zoom in and out, and more.
2. You can add a new overlay type to any aura: **Dependencies Viewer**. It also updates in real time, but it is not interactive. At the same time, by linking auras, you can limit the graph to only the auras you care about, along with their dependencies.

Example of a graph with a relatively large number of dependencies:

![](/assets/ib_ae_rn_r_808795ee7a[2].png)

Example of the overlay:

![](/assets/awflp_se_2c10e943e5[1].png)