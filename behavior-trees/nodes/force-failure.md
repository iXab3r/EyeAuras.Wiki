---
title: Force Failure
description: 
published: true
date: 2024-03-07T23:30:59.987Z
tags: behavior tree, game development, node decorator
editor: markdown
dateCreated: 2024-03-07T23:30:59.987Z
---
The **Force Failure** node is a decorator that always returns a `Failure` state, regardless of the result of the child node's execution. This means that even if the child node completes successfully (`Success`), **Force Failure** will convert it to `Failure`.

**Usage Example:**

```plaintext
Force Failure
    └── Child Node (Success)
```

**Operation:**
1. The **Force Failure** node executes its child node.
2. If the child node completes successfully (`Success`), **Force Failure** changes the result to `Failure`.
3. In case the child node completes as `Failure` or `Running`, **Force Failure** also returns `Failure`.

**Purpose:**
The **Force Failure** node is useful in situations where it is necessary to interrupt the execution of a specific sequence of actions, even if they have completed successfully. For example, when there is a need to forcibly terminate a chain of actions in case a certain condition arises.

**Note:**
Using **Force Failure** can be beneficial for controlling the execution of a behavior tree and managing the flow of actions in game scenarios.