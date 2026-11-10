---
title: Debounce
description:
published: true
date: 2025-08-17T08:20:07.721Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:20:07.721Z
---

# Debounce — filter brief changes in a check

Use `Debounce` when a sampled check flickers between `Success` and `Failure`. Each direction has its own interval. The node evaluates its child on ticks; `Behavior` controls what the parent receives before the interval has elapsed.

## Observe both delays

Create a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`, as in [Getting Started](/en/behavior-trees/gettings-started). Use one Fixed Status as a controlled condition instead of an external sensor.

1. Add `Debounce` and `Fixed Status`. Connect the tree entry → Debounce → Fixed Status.
2. Set the child to `General → Status → Success`. On Debounce choose `General → Behavior → Wait until Stabilizes`, set `Activation Timeout = 2000 ms` and `Deactivation Timeout = 3000 ms`, with randomization off for both.
3. Click the upper `Tick BT Once`. The child succeeds but Debounce returns `Running`. Wait at least three seconds and tick again: Debounce returns `Success`.
4. Change the child to `Failure` and tick: Debounce returns Running. Wait at least four seconds and tick again: its result becomes `Failure`.

The earlier screenshot calls the group `Blocking Behavior`; its current label is `Behavior`. The two mode names and timeout fields remain useful:

![Earlier Debounce editor showing the two modes and timeout fields](https://s3.eyeauras.net/media/2025/08/EyeAuras_u25y8UknQG.png)

| Setting | Effect |
| --- | --- |
| Behavior — Wait until Stabilizes | Return Running while the current terminal result is pending; this waits in this branch, not every aura |
| Behavior — Return immediately | Return the opposite terminal result while pending, then the current child result |
| Activation Timeout | Delay for Success, in milliseconds |
| Deactivation Timeout | Delay for Failure, in milliseconds |
| Random Min / Max | Sample an interval when that direction starts, not on every tick |
| Child | One enabled check |

To filter an already configured indicator, use [Aura Is Active](/en/behavior-trees/nodes/aura-is-active) as the child and link its aura. Choose [Wait](/en/behavior-trees/nodes/wait) for a fixed pause before continuing, or [Cooldown](/en/behavior-trees/nodes/cooldown) for an interval after successful work; those solve different timing tasks.

## Return immediately is not the last confirmed state

| Child observation | Result in Return immediately |
| --- | --- |
| Success, Activation still pending | Failure |
| Success, Activation elapsed | Success |
| Failure, Deactivation still pending | Success |
| Failure, Deactivation elapsed | Failure |
| Running | Running in either mode |

For a door sensor, this can reject a brief opening before admitting Success, and apply a separate delay when it closes. The sensor must supply an actual sampled condition; Debounce does not discover doors or changes by itself.

<details>
<summary>Timing, re-entry and reset</summary>

The first Success starts Activation and clears Deactivation; the first Failure does the reverse. Repeated equal results keep the same interval, including after it has elapsed. A zero interval passes the terminal result immediately.

Debounce does not observe the child between ticks. A missed flicker is invisible. Running passes through without clearing either timer: elapsed time continues, so this does not prove uninterrupted Success during Running. Returning a terminal result does not itself restart the timer on the next entry.

Changing the configured duration does not recompute an interval already sampled. The new duration applies when that direction next starts. Structural reset clears both timers; clearing displayed statuses does not. A missing enabled child is treated as Success, so connect the real check before relying on the result. Cancellation and execution errors remain separate from the two timed terminal results.

</details>
