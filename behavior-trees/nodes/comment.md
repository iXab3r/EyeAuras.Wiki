---
title: Comment
description: 
published: true
date: 2024-03-07T23:27:21.079Z
tags: behavior tree, documentation, developer notes
editor: markdown
dateCreated: 2024-03-07T23:27:21.079Z
---
The **Comment** node is designed to add comments and descriptions directly into the behavior tree. This node does not affect the logic of the tree execution and does not return any results. It is used solely for documenting and explaining the structure of the behavior tree.

![](https://i.imgur.com/oXOamNx.png)

**How it works:**
- **Comment** has no input or output data.
- When the tree is executed, **Comment** is simply ignored and does not affect the execution result.
- It is recommended to use **Comment** to describe logic, explain complex parts of the tree, or add developer notes.