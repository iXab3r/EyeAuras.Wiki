---
title: Wait
description: 
published: true
date: 2024-03-23T22:53:50.277Z
tags: behavior trees, node, delay, execution, cooldown
editor: markdown
dateCreated: 2024-03-07T23:15:03.222Z
---
The **Wait** node allows the behavior tree to pause its execution for a specific amount of time. This is useful when you need to introduce a delay between different actions or wait for a particular event.

Examples of use:
1. Waiting before using the next skill in rotation.
2. Delay before checking the state of a game object.

How it works:
1. When the **Wait** node is reached during the tree execution, it enters the `Running` state for the specified time, effectively pausing the tree execution - no other nodes can do anything until **Wait** returns `Success`.
2. After the waiting time elapses, the node returns `Success`, and the tree continues execution.

Tree example:
![eyeauras_axhsmldh9g.gif](/assets/eyeauras_axhsmldh9g.gif)

In this example, after casting a skill, the tree pauses at the **Wait** node for 5 seconds before using a basic attack. For instance, this can be used to wait for an animation to finish or for some event to occur in the game world.

> It is not recommended to use excessively long delays as it can reduce the effectiveness of the behavior tree. During the node's action, no other actions/nodes will work. In most situations, you can avoid using **Wait** by replacing this node with others, such as [Cooldown](/en/behavior-trees/nodes/cooldown)
{.is-warning}