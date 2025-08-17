---
title: Nodes
description: what they are, how they work, and what to prepare with
published: true
date: 2025-08-17T09:32:19.811Z
tags: programming, behavior trees, nodes, logic
editor: markdown
dateCreated: 2024-03-10T17:11:18.598Z
---

The behavior tree consists entirely of nodes ("nods"), each of which can do something - press buttons, check conditions, and so on.

## Success/Failure
All nodes return a status based on the execution results, which can be:
- **Success** - the button was pressed, the image was found, etc.
- **Failure** - the opposite happened - something couldn't be done (action not selected or condition not met).
- **Running** - the node has started working but has not finished yet. This occurs when the action the node performs takes some time, more than one tick. Typically, this means that the entire tree will wait until the node finishes its work, returning **Success** or **Failure**. A classic example is the [Wait](/behavior-trees/nodes/wait) node, which simply delays the entire tree until the specified time has passed.

## Types of Nodes
- [Root](/behavior-trees/nodes/root) - the root of the entire tree, containing general settings.
- [Sequence](/behavior-trees/nodes/sequence) - iterates through child nodes until it finds one that returns `Failure`.
- [Selector](/behavior-trees/nodes/selector) - iterates through child nodes until it finds one that returns `Success`.
- [Aura Is Active](/behavior-trees/nodes/aura-is-active) - allows specifying one or more auras that will serve as conditions for the node.
- [Execute Aura](/behavior-trees/nodes/execute-aura) - specifies an aura whose actions will be executed when the node is launched.
- [Key Press](/behavior-trees/nodes/keypress) - presses a key or key combination.
- [Wait](/behavior-trees/nodes/wait) - pauses the execution of the tree for a specified time.
- [Cooldown](/behavior-trees/nodes/cooldown) - prevents too frequent execution of a particular node.
- [Inverter](/behavior-trees/nodes/inverter) - inverts the state of the child node (`Success` => `Failure` and vice versa).
- [Force Failure](/behavior-trees/nodes/force-failure) - executes the child node but always returns `Failure`.
- [Force Success](/behavior-trees/nodes/force-success) - executes the child node but always returns `Success`.
- [Until Success](/behavior-trees/nodes/until-success) - executes the child node until it returns `Success`.
- [Fixed Status](/behavior-trees/nodes/fixed-status) - an auxiliary node that allows setting a fixed status that the node will return, helpful for debugging/configuration.
- [Comment](/behavior-trees/nodes/comment) - allows writing comments on the logic directly in the tree.