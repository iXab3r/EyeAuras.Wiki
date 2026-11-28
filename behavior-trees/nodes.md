---
title: Nodes
description: what they are, how they work, and what to prepare with
published: true
date: 2025-08-17T09:32:39.778Z
tags: programming, behavior trees, nodes, logic
editor: markdown
dateCreated: 2024-03-10T17:11:18.598Z
---
# How to choose a tree node

First decide what you need: check a condition, do a step, choose a branch or change a child's result. Below are the main EyeAuras nodes with links to their pages.

## Execution results

| Result | Meaning |
| --- | --- |
| `Success` | The node finished successfully. The parent decides where to go next. |
| `Failure` | The node finished unsuccessfully. For a condition this usually means "not met", not a program error. |
| `Running` | The node has not finished yet. The parent can remember the place and continue on the next tick. |
| Empty displayed result | The node has not run yet or its status was cleared. |

**Active**, **Not Active** and **Unknown** are states of triggers and auras, not of nodes. A node that reads an aura turns its state into its own result.

An error or a cancellation does not always look like an ordinary Failure. On a manual run you can see an error. On an automatic run the root can log it and return Failure. Read the message, not only the colour.

## Start with a minimal tree

1. If the steps go one after another, start with **Sequence**. If you need one of several options, choose **Selector** or **IfThenElse** from the table below.
2. At first, put **Fixed Status** nodes in place of real checks. You will see the route without any input or outside data. Add **Wait** for a pause.
3. Run the tree with **Tick BT Once**, as in [the first example](/en/behavior-trees/gettings-started). Then connect your real conditions and reactions.

| Task | Node and what to know |
| --- | --- |
| Set up loading, activation and automatic entry | [Root](/en/behavior-trees/nodes/root): holds the settings. MainTree is the automatic entry. |
| Run steps in order | [Sequence](/en/behavior-trees/nodes/sequence): goes until the first Failure, and on Running continues from the same place. |
| Pick the first option that works | [Selector](/en/behavior-trees/nodes/selector): skips Failure, stops on Success or Running. |
| Separate a condition and two branches | [IfThenElse](/en/behavior-trees/nodes/ifthenelse): runs only the chosen branch. |
| Check the state of your auras | [Aura Is Active](/en/behavior-trees/nodes/aura-is-active): needs an aura that is already set up. |
| Call your aura's actions | [Execute Aura](/en/behavior-trees/nodes/execute-aura): set up the aura itself separately. |
| Press a key | [Key Press](/en/behavior-trees/nodes/KeyPress): this is input, so it needs the right window and delivery method. |
| Wait before continuing | [Wait](/en/behavior-trees/nodes/wait): waits for time, not for an event. |
| Limit how often something runs | [Cooldown](/en/behavior-trees/nodes/cooldown): not a pause before the next step. |
| Swap Success and Failure | [Inverter](/en/behavior-trees/nodes/inverter): Running stays Running. |
| Treat any final result of the child as Failure | [Force Failure](/en/behavior-trees/nodes/force-failure): Running stays Running. |
| Treat any final result of the child as Success | [Force Success](/en/behavior-trees/nodes/force-success): Running stays Running too. |
| Retry until it succeeds | [Until Success](/en/behavior-trees/nodes/until-success): one attempt of the child per tick. Failure becomes Running. |
| Set a temporary test result | [Fixed Status](/en/behavior-trees/nodes/fixed-status): the value you choose is a setting, not the last result of a run. |
| Label a section | [Comment](/en/behavior-trees/nodes/comment): only a note, it checks nothing. |
| Check whether a behavior tree is active | [Is Active](/en/behavior-trees/nodes/IsActive) |
| Check whether a key is held | [Check Key State](/en/behavior-trees/nodes/CheckKeyState) |
| Ignore brief changes in a condition | [Debounce](/en/behavior-trees/nodes/Debounce) |
| Interrupt work when a condition succeeds | [Interrupter](/en/behavior-trees/nodes/Interrupter) |
| Move the pointer to a point | [Mouse Move](/en/behavior-trees/nodes/MouseMoveAbs) |
| Move the pointer by an offset | [Mouse Move Rel.](/en/behavior-trees/nodes/MouseMoveRel) |
| Enter text in a target window | [Send Text](/en/behavior-trees/nodes/SendText) |
| Leave a loop or block in a macro | [Break](/en/behavior-trees/nodes/Break) |
| Finish a macro with a chosen result | [Return](/en/behavior-trees/nodes/Return) |

## Where to find a node

**Add new Node** opens the list of templates. **Toggle Nodes toolbar visibility** shows the side panel. A node you add has to be connected to its parent.

A behavior tree has the **Behavior Tree** templates and the common nodes. A macro has its own **Macro** templates. Wait and IfThenElse exist in both modes, but they can work differently.

The set of nodes also depends on the installed modules. For example, image and ML search come from OpenCV, Key Press and Mouse Move come from the input module, and Aura Is Active comes from the base auras. The list can also include your own trees marked **Is Shared**.

Many conditions and actions can have one child. It runs only after Success, and its result can become the result of the node. If there are several steps, connect a Sequence.
