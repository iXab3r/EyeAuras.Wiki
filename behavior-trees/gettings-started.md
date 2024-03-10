---
title: Getting Started
description: 
published: true
date: 2024-03-10T17:05:44.083Z
tags: behavior trees, AI, triggers, actions, Eye Auras
editor: markdown
dateCreated: 2024-03-07T14:06:44.950Z
---
# What are Behavior Trees?

In short, behavior trees allow specifying to a robot what it should do. It's like its brain. The old good actions and triggers serve as its hands and eyes.

Behavior trees are well-known in game development and have been used for over a decade in various projects to write AI. Therefore, there are mountains of materials on the internet; you just need to [start searching](https://letmegooglethat.com/?q=behavior+tree).

There are more complex and flexible technologies available, but behavior trees remain one of the most common options due to their relative simplicity.

# How are They Related to Eye Auras?

From the very early days of the program, there was a system of triggers and actions as a way to configure reactions to something - displaying an icon on the screen, collapsing/expanding windows, and so on. This approach works well but only for fairly simple conditions. Once additional elements are introduced, the configuration quickly spirals out of control, making it very difficult to understand what is happening and how to fix it. The tools I added, such as the [dependency graph](https://wiki.eyeauras.net/en/overlays/dependencies-viewer), only tackled the symptoms, while the core issue remained - triggers/actions are simply not suitable for modeling multi-level logic. For instance, rotating skills can be done but is quite complex.

This is where behavior trees come to the rescue - they are relatively easy to set up, flexible, and proven to be effective, as countless real robots and game bots work based on them.

# How Do They Work?

First, let's remember that in EyeAuras, we have triggers and actions. Triggers react to something and can be activated or deactivated. Actions do something. This is all clear, nothing new. Now, imagine these as two completely independent things - triggers only track **events** (e.g., appearance of a buff/debuff, HP level dropping below normal), while actions remain the same; we just stop associating them with triggers in the old way - no more adding them to OnEnter/WhileActive/OnExit; they simply exist on their own.

All we have to do is somehow link **events** and **actions** together. And the tree allows us to do just that - specify what to do if something happens.

Trees always start from the root and consist of nodes. Each node can be (more details [here](/ru/behavior-trees/nodes)):
- an action - straightforward, the node can do something
- a condition - more complex, conditions can vary greatly; the task of such a node is to return true/false. It's very similar to what triggers do - check a condition and activate/deactivate
- a decorator - these nodes can't do anything on their own, but they can alter the results of other nodes' execution, for example, invert and turn **true** into **false** (or vice versa)

Traversal always starts from the root, top-down, left-right. Depending on the nodes used, you can control how the final state is calculated and what decision is made.

![behavior tree visualization](https://habrastorage.org/files/5f3/cdb/96b/5f3cdb96beee450ca78697a67010b8e9.gif)
(image source [here](https://habr.com/ru/companies/cloud_mts/articles/306214/), article in Russian)

# Let's Get Closer to Practice

Enough of the stuffy theory; let's take a closer look at how it actually works.

Suppose we want the character to press the "eat food" button (F1) when their HP drops below a certain value. In this example, it will be F1.

## Input Data:
- we have an empty tree
- we have an aura named `HP is low`, which **somehow** checks when it's time to heal. How exactly doesn't matter - it could be [Color Search](https://wiki.eyeauras.net/en/triggers/images/color-search), [ML Search](https://wiki.eyeauras.net/en/triggers/images/ai-search-trigger), or a combination of any other triggers. It's business as usual.

## What Needs to Be Done:
- from the node panel, drag `Aura Is Active` and link the created node to the root, then establish a connection between the trigger and the node within the node itself
![](https://i.imgur.com/ewcmXlS.png =x600)

- from the panel, drag another node - `Key Press` and specify that `F1` should be pressed in this node
![](https://i.imgur.com/D07EBxw.png =x600)

- Overall, our tree is almost ready. Although it's not a tree yet :) All that's left is to indicate how often to recalculate it ("tick"). By default, the tree is recalculated every **250ms**, but it can be much faster. Besides the recalculation frequency, additional conditions for the tree can be specified - if they are not met, the tree won't do anything at all. This is controlled by `Is Active` in the settings of the root node. The simplest example is to link the tree to an aura with [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active), and then it will be activated/deactivated by pressing a button.
![](https://i.imgur.com/4NO0PdJ.png =x600)

## What's Achieved?
Now, every **250ms**, the program will traverse the tree from the root top-down. If the `HP is low` aura is active, then the `F1` button will be pressed.
![HP is low](https://i.imgur.com/DcH6wRD.png =x600)

However, if the aura is NOT active, the tree recalculation will stop at this point without reaching the `Key Press` action.
![HP is NOW low](https://i.imgur.com/iBcjZWJ.png =x600)

## How is This Better Than the Old Way?
It's more flexible. Let me illustrate by adding a condition "press F1 no more than once every 10 seconds." All you need to do is add a `Cooldown` node before `Key Press` and specify how much time must pass before the character can press `F1` again.
![With cooldown](https://i.imgur.com/wOfn1jU.png =x600)

Using a similar approach, you can add any other node from the entire available arsenal. For example, here is how the tree (in two variants) looks for a character in `Lineage 2` that autonomously selects targets, gathers resources, and fights mobs. By using nodes that control how the tree is traversed, very complex logic can be added.
![bt_l2.spoil.old.png](/assets/bt_l2.spoil.old.png)
This variant relies more on scripts for executing actions - the most flexible option but requires knowledge of `C#` and [scripts](/ru/scripting/getting-started).
![bt_l2_spoil.png](/assets/bt_l2_spoil.png)