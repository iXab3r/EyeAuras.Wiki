---
title: Selector
description: 1 or 2 or 3
published: true
date: 2024-03-08T10:20:16.343Z
tags: behavior trees, composite node, Selector, Sequence, skill rotation
editor: markdown
dateCreated: 2024-03-07T14:54:10.206Z
---
**Selector** is one of the basic nodes in behavior trees. It represents a composite node that executes its children sequentially from left to right until one of the children returns `Success`, or until all children return `Failure`.

## Example of Use
The Selector node is useful when actions need to be executed in order of priority. If one action fails, the **Selector** moves on to the next action in the list.

1. Choosing to attack with a skill or a basic attack
![oxjyg11[1].png](/assets/oxjyg11[1].png)
The logic here is to check if we can attack with a skill (it's ready, enough MP, etc.). If yes, we use the skill and exit. If not, we use a basic attack.
Note that either a skill attack or a basic attack will be executed. That is, if the skill attack is successful, the tree won't even reach **Execute Aura(2')**.

2. **Skill Rotation - Selector + Sequence:**
Now let's build a complete rotation.

![c5do0cg[1].png](/assets/c5do0cg[1].png)

What's happening here - first, we use the Sequence(1) node, which combines another Sequence(2) and Selector(5).
Sequence(2) handles checks like "Can we attack at all?", meaning we are alive and have a target selected. In real examples, checks for HP, being in a city, and so on can also be included here. If **any** of the checks fail, the tree moves to the next cycle without attempting an attack.
If we are alive and have a target, the next step is to decide "How exactly will we attack the selected target?".

For simplicity, there are only 2 options here:
- if the **Aura Is Active(7)** skill is ready, we use **Execute Aura(8)**, which may contain the same [Send Sequence](/en/actions/sendinput/send-sequence) inside.
- if the skill is not ready, we use a basic attack.

In real scenarios, the rotation itself can be much more complex - resource checks (HP/MP/cooldowns) are needed, target priority can be considered (if the target has low HP, there's no point in using a strong skill), and so on.

### Node Operation
1. The **Selector** node executes its children in order, starting from the leftmost child.
2. If any child returns `Success`, the **Selector** also returns `Success` and stops executing the remaining children.
3. If all children return `Failure`, the **Selector** returns `Failure`.
4. If all children return `Running`, the **Selector** also returns `Running` and continues execution from where it stopped.

> Don't confuse! **Sequence** stops at the first node that returns **Failure**, while **Selector** stops at the first node that returns **Success**.  
{.is-info}

![](https://i.imgur.com/pgaOalh.png)