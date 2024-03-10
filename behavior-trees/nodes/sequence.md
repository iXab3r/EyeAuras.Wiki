---
title: Sequence
description: 1 -> 2 -> 3
published: true
date: 2024-03-08T10:14:33.037Z
tags: behavior trees, node types, sequence, selector, skill rotation
editor: markdown
dateCreated: 2024-03-07T14:54:35.964Z
---
The Sequence node executes its children in order, from left to right. If any of the children return `Failure`, the Sequence node stops execution and also returns `Failure`. If all children return `Success`, the Sequence node returns `Success`.

## Example of Use:
1. **Applying a skill to a target:**
![Example 1](/assets/ivvc60g[1].png)

The logic is as follows - if the 1st or 2nd check returns `Failure`, the skill won't be cast. If both return `Success`, the character will attempt to apply the skill.
Usually used in combination with the [Selector](/en/behavior-trees/nodes/selector) node.

Nodes can be arranged however you like, as long as you remember that the traversal will be from left to right.
![Example 1-1 vertical layout](https://i.imgur.com/DPmtnfu.png)

2. **Skill rotation - Selector + Sequence:**
Now let's build a full rotation.

![c5do0cg[1].png](/assets/c5do0cg[1].png)

Here's what's happening - first, we use the Sequence(1) node, which combines another Sequence(2) and a Selector(5).
Sequence(2) handles checks like "Can we attack at all?", meaning we are alive and have a target selected. In real examples, checks for HP, being in a city, and so on can also be added here. If **any** of the checks fail, the tree moves to the next cycle without attempting an attack.
If we are alive and have a target, the next step is to decide "How exactly will we attack the selected target?".

For simplicity, there are only 2 options here:
- if the **Aura Is Active(7)** skill is ready, we use **Execute Aura(8)**; inside, you can have the same [Send Sequence](/en/actions/sendinput/send-sequence)
- if the skill is not ready, we use a basic attack

In real scenarios, the rotation itself can be much more complex - resource checks (HP/MP/cooldowns), prioritizing the current target (if the target has low HP, there's no point in using a strong skill), and so on need to be considered.

## Node Operation:
1. The Sequence node executes its children in order.
2. If any child returns `Failure`, the Sequence returns `Failure`.
3. If all children return `Success`, the Sequence returns `Success`.
4. If any child returns `Running`, the Sequence remembers it and continues execution from that point in the next update.

Using the **Sequence** node allows for creating sequential chains of actions in behavior trees where the order of task execution is important.

> Note! **Sequence** stops at the first node that returns **Failure**, while **Selector** stops at the first node that returns **Success**.  
{.is-info}

![](https://i.imgur.com/HqHncgy.png)