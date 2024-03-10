---
title: Aura Is Active
description: 
published: true
date: 2024-03-07T23:54:26.541Z
tags: behavior trees, auras, triggers, actions
editor: markdown
dateCreated: 2024-03-07T23:54:26.541Z
---
The **Aura Is Active** node allows you to link auras and behavior tree nodes - depending on whether the aura is active or not, the node will return `Success` (if the aura is active) or `Failure` (if it is not active).

![](https://i.imgur.com/67jYSwV.png)

**How it works:**
- You can link 1 or more auras to this node, specifying the expected state of the aura (active/inactive).
- When executing the tree, **Aura Is Active** checks the current state of the aura and calculates `Success` or `Failure` based on it.

This node allows you to connect the "old" world of Eye Auras with triggers, actions, and behavior trees. Most often, you will have several auras with Image/Color/ML search, and you will use them in the tree specifically through the **Aura Is Active** node.