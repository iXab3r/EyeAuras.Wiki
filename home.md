---
title: Home
description: Explore macros, auras, behavior trees and AI, then build your first automation.
published: true
date: 2026-04-25T12:40:21.080Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-15T15:02:45.417Z
---


# Turn a workflow into automation

Watch conditions, run ordered steps and build branching logic in one workspace. [Download EyeAuras](https://eyeauras.net/#downloads) and start with a small task you want to automate.

![EyeAuras with a populated item tree and the Decision flow editor](/assets/home/showcase-hero.png)

*A demo workspace combines imported packs with local examples. Decision flow is selected.*

## Three tools

### Macros — steps in order

Build a sequence with waits, conditions and repeats. A macro is a good starting point when you can describe the task as “do this, then that”. [Explore macros](/en/macros/getting-started).

![Daily routine macro with two Wait steps and Fixed Status](/assets/home/showcase-macro.png)

*The local Daily routine example contains waits of 1 second and 500 milliseconds, followed by Fixed Status.*

### Auras — watch and react

A trigger contributes to the aura's state. Configure reactions in **On Enter**, **While Active** and **On Exit**, and add an overlay to show information. Try [Fixed Value](/en/triggers/fixed-value) as your first condition.

![Status monitor aura with Fixed Value and Text overlay settings](/assets/home/showcase-aura.png)

*Status monitor uses Fixed Value set to Is NOT Active and a Text overlay configured with “Status: Ready”.*

### Behavior trees — checks and branches

Connect nodes to express conditions, choices and repeated work. Nodes return **Success**, **Failure** or **Running**; ticks advance execution. [Build your first tree](/en/behavior-trees/gettings-started).

![Decision flow behavior tree with Sequence, Fixed Status and Wait nodes](/assets/home/showcase-bt.png)

*The local Decision flow example connects Sequence to Fixed Status and Wait. Activation is set to manual and When Activated to Do nothing.*

## AI in the workspace

Use the AI panel to discuss a task and work with EyeAuras context. Choose a mode and configure an available provider profile; see the [AI Assistant guide](/en/features/ai-assistant).

![AI panel before a chat session has been started](/assets/home/showcase-ai.png)

*The panel before starting a session. Model responses require an available provider profile.*

## Your first macro

Select **Macro** in the left-hand tree, then build a small sequence without keyboard or mouse actions:

1. Select the top root-settings row in the editor. Keep **Activation → Is Loaded** enabled and set **Execution → When Activated → Do nothing** for a manual run.
2. Through **Add new Node**, add two macro **Wait** nodes and one **Fixed Status** as siblings inside **Drag'n'drop instructions here**, in that order.
3. Set the waits' **General → Delay** to **1000 ms** and **500 ms**, with randomization off. Set **Fixed Status → General → Status → Success**.
4. Click **Run Macro Once**. After both waits, the final node and the block should show **Success**.

Continue with the [full macro guide](/en/macros/getting-started) for conditions, loops and calls.

## What next

- Explore [triggers with Fixed Value](/en/triggers/fixed-value), [actions with Play Sound](/en/actions/play-sound) and [overlays with Text](/en/overlays/text).
- Choose a complete [recipe](/en/recipes). [C# scripts](/en/scripting/getting-started) add custom logic and interfaces when built-in steps are not enough.
- Open [FAQ](/en/faq) for common questions or [Known Issues](/en/known-problems) when something behaves differently.

For a particular source or reaction, [choose a tool by task](/en/getting-started/choose-a-tool).
