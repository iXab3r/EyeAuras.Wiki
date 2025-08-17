---
title: Return
description:
published: true
date: 2025-08-17T09:40:43.000Z
tags:
editor: markdown
dateCreated: 2025-08-17T09:40:43.000Z
---

# Return
**Return** is a node that allows you to immediately finish executing a macro with a specific status—similar to the `return` statement in C#. It is available only in macros.

## When to use
Sometimes a macro should end without waiting for every step to run—for example, if something went wrong or the required condition is already met. Return is used for this:
- Stop the macro on failure or an error.
- Interrupt execution under a certain condition.

## How it works
- Insert this node at the desired point in the macro.
- Specify the status the macro should finish with: `Success` or `Failure`.
- Once Return fires, the macro terminates immediately; anything after it will **not run**.

## Example
```csharp
IfThenElse
├── Condition: No mana
├── If yes: Return (Result = Failure)
└── If no: Continue with other actions
```
In this example, if there is no mana, the macro ends with a `Failure` status and all subsequent steps are skipped.

