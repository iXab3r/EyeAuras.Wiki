---
title: Nodes
description: what they are, how they work, and what to prepare with
published: true
date: 2025-08-17T09:32:39.778Z
tags: programming, behavior trees, nodes, logic
editor: markdown
dateCreated: 2024-03-10T17:11:18.598Z
---
# Choose a node for the next step

Decide whether you need to check a condition, perform work, choose a branch or transform a child's result. This page routes you to user guides for those choices; it is not a complete API catalogue or a standalone program.

## Understand execution results

| Result | Meaning |
| --- | --- |
| `Success` | This call completed successfully; the parent determines the next route. |
| `Failure` | This call completed unsuccessfully. An unmet condition need not be a program error. |
| `Running` | Work is unfinished; the parent can retain the point of continuation for the next tick. |
| Empty displayed result | The node has not run or its display was cleared. It is not a fourth NodeStatus. |

Aura/trigger **Active**, **Not Active** and **Unknown** are different states. Nodes reading auras translate them according to their own contract. Exceptions and cancellation are not universally converted into ordinary Failure: manual execution can report an error, while an automatic root can log it and return Failure.

## Choose a minimal structure

1. For required steps in order, start with **Sequence**. For alternatives, compare **Selector** and **IfThenElse** below.
2. Initially use **Fixed Status** instead of external conditions and **Wait** for a visible interval. This exposes the route without input or game data.
3. Use **Tick BT Once** on the loaded tree, following [the first example](/en/behavior-trees/gettings-started), then connect your actual data sources and reactions.

| Task | Node and boundary |
| --- | --- |
| Configure loading, activation and automatic entry | [Root](/en/behavior-trees/nodes/root), the container whose MainTree is the automatic entry. |
| Require steps in order | [Sequence](/en/behavior-trees/nodes/sequence): stop on Failure, resume the current Running child. |
| Try alternatives | [Selector](/en/behavior-trees/nodes/selector): continue after Failure, stop on Success or Running. |
| Separate a condition and two branches | [IfThenElse](/en/behavior-trees/nodes/ifthenelse): execute only the chosen branch. |
| Read your auras | [Aura Is Active](/en/behavior-trees/nodes/aura-is-active): needs an existing configured aura. |
| Invoke your aura's actions | [Execute Aura](/en/behavior-trees/nodes/execute-aura): configure the called aura separately. |
| Send a key | [Key Press](/en/behavior-trees/nodes/KeyPress): input needs an explicit target/backend. |
| Wait before continuing | [Wait](/en/behavior-trees/nodes/wait): elapsed time, not an external event. |
| Limit execution frequency | [Cooldown](/en/behavior-trees/nodes/cooldown): different from a delay before the next step. |
| Swap Success and Failure | [Inverter](/en/behavior-trees/nodes/inverter): Running stays Running. |
| Treat a terminal child result as Failure | [Force Failure](/en/behavior-trees/nodes/force-failure): does not turn Running into completion. |
| Treat a terminal child result as Success | [Force Success](/en/behavior-trees/nodes/force-success): also preserves Running. |
| Retry until successful | [Until Success](/en/behavior-trees/nodes/until-success): one child attempt per tick; Failure becomes Running. |
| Set a temporary test result | [Fixed Status](/en/behavior-trees/nodes/fixed-status): its parameter and last displayed result are different things. |
| Explain a section | [Comment](/en/behavior-trees/nodes/comment): a note does not replace an executable check. |

## Find the template

**Add new Node** opens templates; **Toggle Nodes toolbar visibility** shows the side panel. In graph mode, connect a new card to its parent before expecting it to execute.

Behavior-tree mode includes **Behavior Tree** and common templates. Macro mode uses its own **Macro** templates. Similar names, such as Wait or IfThenElse, do not establish identical execution semantics.

Installed modules also contribute templates: OpenCV supplies image/ML search, the input module supplies Key Press/Mouse Move, and base auras supply Aura Is Active. Trees marked **Is Shared** can appear as reusable nodes. A missing template is not automatically available through a similarly named script method.

Many action/condition nodes can run one enabled child after Success and return that child's result. Use Sequence for several steps and read the individual node's continuation rules. A Running node holds up its route, not every other aura or tree in the application.
