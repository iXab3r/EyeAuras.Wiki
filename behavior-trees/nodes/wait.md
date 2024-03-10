---
title: Wait
description: 
published: true
date: 2024-03-07T23:15:03.222Z
tags: behavior tree, delay, execution control, game development
editor: markdown
dateCreated: 2024-03-07T23:15:03.222Z
---
The **Wait** node allows the behavior tree to pause its execution for a specified amount of time. This is useful when you need to introduce a delay between different actions or wait for a specific event.

Examples of use:
1. Waiting before using the next skill in rotation.
2. Delay before checking the state of a game object.

How it works:
1. When the **Wait** node is reached during tree execution, the execution pauses for the specified time - no other nodes can do anything until the **Wait** is completed.
2. After the waiting time elapses, the node returns a Success state, and the tree continues execution.

Tree example:
```plaintext
Sequence
    └─ AttackEnemy
    └─ Wait (3 seconds)
    └─ UseSkill
```

In this example, after attacking the enemy, the tree pauses at the **Wait** node for 3 seconds before using the next skill. For instance, this can be used to wait for the attack animation to finish.

> It is not recommended to use excessively long delays as it may reduce the effectiveness of the behavior tree.
{.is-warning}