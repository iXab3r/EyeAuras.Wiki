---
title: "Stop and restart your own pending tree wait"
description: "Check an explicit stop aura on manual ticks, interrupt a retained 2000 ms Wait and begin a fresh interval."
published: true
date: 2026-11-10T17:01:45.000Z
tags: recipes, intermediate
editor: markdown
dateCreated: 2026-11-10T17:01:45.000Z
---

# Stop a pending wait on your next check

Keep a two-second tree wait under a separate stop decision. When you next tick with Stop active, Interrupter rejects continuation and clears its owned wait. Clearing Stop then starts a fresh full interval instead of continuing the old deadline.

You need Behavior Tree templates **Interrupter**, **Aura Is Active**, **Wait**, **Sequence** and **Fixed Status**. This example has no input, sound or external work. It demonstrates a retained Running wait checked on manual ticks, not a synchronous two-second sleep or a monitor running between ticks.

## Connect the stop check before the wait

1. Create **New Aura → Stop waiting** with **Triggers → Fixed Value → Is NOT Active**, no actions or overlays. Keep it loaded, enabled and EyeAuras unpaused.
2. Create **New Behavior Tree**, select **My Tree**, enable **Activation → Is Loaded**, and choose **Execution → When Activated → Do nothing**. Leave automatic activation links empty and repeat off.
3. Through **Add new Node**, connect this tree. Put Interrupter before the final Fixed Status; within Interrupter put the condition on the left and Wait on the right. Keep all nodes enabled.

```text
My Tree
└─ Sequence
   ├─ Interrupter
   │  ├─ If: Aura Is Active — Stop waiting must be Active
   │  └─ Action: Wait — 2000 ms
   └─ Fixed Status — Success
```

4. In Aura Is Active, use **General → Links → Edit**, select only Stop waiting, require **must be Active**, choose **All must match (AND)** and give the check no child. In Interrupter's **General**, verify **If** names this check and **Action** names Wait.
5. In Wait set **General → Delay = 2000 ms**, randomization off, no child. Set the last Fixed Status to **General → Status → Success**, also without a child.

## Interrupt and start a fresh interval

1. While Stop waiting is known **Not Active**, click the upper **Tick BT Once**. The false stop check admits Wait; Wait, Interrupter and Sequence return **Running**. The final node is not reached.
2. Set Stop waiting to **Is Active**, wait for the aura's state and click the **same** tick button. Interrupter sees Success **before** resuming Wait, resets the owned wait and returns **Failure**. Sequence does not reach its final node. This still rejects continuation if the old deadline elapsed between ticks.
3. Set Stop waiting back to **Is NOT Active** and wait for that state. Tick again: Wait begins a new full 2000 ms interval and returns Running. Wait more than two seconds, then tick once more. Wait succeeds, the final Fixed Status runs and Sequence returns **Success**.
4. Stop ticking after completion. A new tick begins a new pass. To abandon a retained pass instead, unload your own tree through **Is Loaded**, await cleanup and reload; clearing status colors is not an execution reset.

[Interrupter](/en/behavior-trees/nodes/Interrupter) checks **If**, then admits **Action** only on Failure. Initial Success resets Action without calling it; initial Running postpones work without that reset. [Wait](/en/behavior-trees/nodes/wait) returns promptly with Running and retains a deadline, so there is no continuing 100 ms monitor between these calls.

For an Action whose call is still actively awaiting work, Interrupter instead checks serially with a **100 ms delay between completed condition samples**, requests cooperative cancellation and waits for work and cleanup before Failure. That is not an instant-stop guarantee for arbitrary code, and already delivered effects are not undone. Keep the same manual entrypoint throughout this example; [Root](/en/behavior-trees/nodes/root) distinguishes manual continuation from automatic Main execution.
