---
title: Break
description:
published: true
date: 2025-08-17T09:40:43.000Z
tags:
editor: markdown
dateCreated: 2025-08-17T09:40:43.000Z
---

# Break
**Break** is a node used inside macros to immediately exit a Repeat loop, similar to the `break` statement in C#. It lets you stop the current loop without waiting for all iterations to finish.

## When to use
- When a Repeat loop should stop under a certain condition.
- When further iterations make no sense (the goal is reached or the situation changed).

## How it works
- Place the Break node inside the body of a Repeat loop or a Block node.
- As soon as Break triggers (for example, the condition is met), the macro exits the current Block or Repeat.
- The macro then continues with the actions after the loop.

## Example with Repeat
```
Repeat (up to 5 times)
├── SomeAction
├── IfThenElse
│   ├── Condition: Enemy found
│   ├── If yes: Break
│   └── If no: (nothing)
└── Another action
```
In this example, if an enemy is found during one of the iterations, Break is executed—the Repeat loop immediately stops and the macro continues with the node following Repeat. The remaining iterations will not run.

---

## Good to know
- The main use case is inside Repeat; its purpose is to exit the loop as soon as needed.
- Alternatively, you can use this node inside Block nodes to better structure your code.

