---
title: Interrupter
description:
published: true
date: 2025-08-17T08:33:00.641Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:33:00.641Z
---

**Interrupter** is a special node for behaviour trees and macros in EyeAuras that helps interrupt long‑running actions when certain conditions occur.

## How Interrupter works

Interrupter always has two children:

1. **Condition** – something to check (for example, character health below 20%).
2. **Action** – a task to perform (for example, wait a few seconds or use an ability).

### Main principle

- While **Action** is running, Interrupter constantly watches **Condition**.
- If **Condition** becomes `true` at any moment while **Action** is executing:
  - Interrupter immediately stops the **Action**.
  - Returns `Failure`.
- If **Condition** does not become `true` before **Action** completes:
  - Interrupter returns the result of that action (`Success`, `Failure`, or `Running`).

## Simple example
```
Interrupter
├── Condition: Mana drops below 10%
└── Action: Cast Meditate
```

- While the character meditates, Interrupter monitors mana.
- If mana suddenly falls below 10%, Meditate is interrupted and Interrupter returns `Failure`.
- If mana stays above 10% and the action finishes, Interrupter returns whatever result the action produced.

## When is it useful?
- Cancel long actions if something happens.
- React quickly to changing conditions during an action (e.g., interrupt recovery when an enemy appears or stats drop).
