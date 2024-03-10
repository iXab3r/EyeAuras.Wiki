---
title: Execute Aura
description: 
published: true
date: 2024-03-08T09:40:04.580Z
tags: Aura, Actions, Behavior Trees
editor: markdown
dateCreated: 2024-03-07T23:58:44.862Z
---
The **Execute Aura** node is primarily designed to perform actions in Eye Auras - you can link any aura, and if it contains actions (any supported - Send Sequence, Play Sound, etc.), when the node is executed, it will perform those actions.

![](https://i.imgur.com/i98jFM0.png)

**How it works:**
- You can link 1 or more auras to this node.
- When the **Execute Aura** tree is executed, it will gather all actions inside the auras (OnEnter => WhileActive => OnExit) and execute them sequentially in the order the auras were added.
- It doesn't matter what triggers are specified for the auras. It's best to have only triggers in the aura to avoid surprises.

This solution allows you to continue using "old" actions you already have while benefiting from the logic of behavior trees. At some point, most actions, or their equivalents, will appear in the tree, and then the need for this node will disappear, but it may take years until that moment.