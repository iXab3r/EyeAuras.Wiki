---
title: Interrupter
description:
published: true
date: 2025-08-17T08:33:00.641Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:33:00.641Z
---

# Interrupter

**Interrupter** is a special node for behaviour trees and macros in EyeAuras that helps interrupt long‑running actions when certain conditions occur.

## How Interrupter works

Interrupter always has two children:

1. **Condition** – something to check (for example, character health below 20%).
2. **Action** – a task to perform (for example, wait a few seconds or use an ability).

### Main principle

- Before **Action** starts, a successful **Condition** returns `Failure` without starting it; a `Running` condition waits for the next tree tick.
- While an awaited **Action** runs, Interrupter checks **Condition** sequentially, with a 100ms delay between completed checks.
- If a check observes **Condition** as `true` while **Action** is executing:
  - Interrupter requests cooperative cancellation and waits for **Action** cleanup.
  - Returns `Failure`.
- If **Condition** does not become `true` before **Action** completes:
  - Interrupter returns the result of that action (`Success`, `Failure`, or `Running`).

Checks should be short and observe cancellation. Reaction time includes their
execution and scheduling; cancellation cannot forcibly stop an action that
ignores its token or undo effects it already performed. A condition sample
admitted before the monitor stops is fully drained. Success observed after
it stops cannot change the action result.

### State between ticks

On interruption, Interrupter resets its owned Action after the active tick has
finished. This also applies when Condition succeeds on a later tick after Action
returned Running: the retained script iterator is disposed, executing its finally,
and owned execution cursors/timers reset. Clearing Condition permits a fresh Action
from its first child. Ordinary Running without interruption preserves state.
The graph, script, blackboard and session remain. Reset covers structural children,
including disabled ones; it does not own a linked SubTree target or arbitrary
plugin state. Cleanup errors propagate, and remaining siblings may be uncleared.

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
