---
title: Interrupter
description:
published: true
date: 2025-08-17T08:33:00.641Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:33:00.641Z
---

# Interrupter — stop owned work when a condition succeeds

Use `Interrupter` to end a branch when a separate check returns `Success`. It checks that condition before admitting the action. On interruption it waits for active work and cleanup, resets owned action state, then returns `Failure`.

## Interrupt a wait and start it again

Create a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. [Getting Started](/en/behavior-trees/gettings-started) shows the editor route. This example uses only Fixed Status and Wait, without scripts or external input.

1. Add `Interrupter`, `Fixed Status` and `Wait`. Connect the entry to Interrupter, with Fixed Status as its **left** child and Wait as its **right** child.
2. Set Fixed Status to `General → Status → Failure`. Set Wait to `General → Delay = 5000 ms`, randomization off. Check Interrupter's `General → If` and `Action` fields: they must name Fixed Status and Wait respectively.

```text
My Tree
└─ Interrupter
   ├─ If: Fixed Status — Failure
   └─ Action: Wait — 5000 ms
```

3. Click the upper `Tick BT Once`. Failure in If admits Wait, which returns `Running`. Interrupter also returns Running.
4. Set If to `Success` and tick again. Interrupter returns `Failure`, does not resume Wait, and resets its countdown.
5. Set If back to `Failure` and tick. Wait starts a new full five-second interval with Running. After that interval, another tick can finish with Success.

This demonstrates interruption of retained work **on the next tick**. Wait returns Running promptly; no monitor stays alive between these manual ticks.

| Field or condition | Behavior |
| --- | --- |
| If | First enabled child, ordered by horizontal position; the interruption check |
| Action | Second enabled child; put several steps in a child Sequence |
| Initial If Success | Do not call Action; reset its owned state and return Failure |
| Initial If Running | Do not call or reset Action; return Running |
| Initial If Failure | Admit Action |
| Action completes its tick without interruption | Return its Success, Failure or Running |

For a real stop signal, put [Aura Is Active](/en/behavior-trees/nodes/aura-is-active) in **If** and link your stop-condition aura with expected state Active. To use an existing configured action chain as **Action**, select [Run Aura](/en/behavior-trees/nodes/execute-aura). Keep the repeatedly sampled check free of action children.

## While an action call is still awaiting work

During an actively awaited Action call, Interrupter samples If serially, with a **100 ms delay between completed checks**. Success requests cooperative cancellation. Failure and Running leave the action running. Keep checks short and cancellation-aware; their side effects repeat on each sample.

Interrupter waits for the action and any admitted condition sample to finish. Success latched before monitoring stops causes interruption; a late Success after it stops does not replace the action result. Cleanup precedes the final Failure. Reaction time includes checks and scheduling: this cannot instantly stop arbitrary code that ignores cancellation or undo effects already delivered.

<details>
<summary>Retained state, linked trees and errors</summary>

After interruption, structural cleanup includes disabled children, composite cursors, timers and retained script iterators with Dispose/finally. Graph, script project, blackboard and session remain. Ordinary Running without interruption preserves continuation. Clearing status colors is not resource cleanup.

A linked SubTree is shared work, not simply another owned structural child. Its captured invocation must be released and drained under its ownership contract before handoff; arbitrary plugin state has its own rules. Do not reset another caller's work by assumption.

Action, monitor, cancellation-callback and cleanup errors remain observable; cleanup faults can leave later siblings uncleared. Caller cancellation takes precedence over an ordinary interruption result. With no Action, the If result is returned directly. Use both enabled children for this example: disabling one changes positional roles.

The earlier mana example is an abstract application of the same mechanism, requiring your own actual condition source and cooperative action:

```
Interrupter
├── Condition: Mana drops below 10%
└── Action: Cast Meditate
```

If that check succeeds, the action is cancelled and drained before Failure. If it does not, Interrupter returns the action result. The node supplies neither game statistics nor an ability integration. The same pattern can interrupt recovery when an independently configured condition changes.

</details>
