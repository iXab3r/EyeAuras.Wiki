---
title: Until Success
description: 
published: true
date: 2024-03-07T23:41:51.969Z
tags: behavior tree, decorator, success state
editor: markdown
dateCreated: 2024-03-07T23:41:51.969Z
---

# Until Success — retry a check on the next tick

Use `Until Success` when a sequence should stay at a check until it succeeds. Each call makes **one child attempt**. A child `Failure` becomes `Running`, so the parent can resume here on its next tick. There is no internal retry loop or built-in delay.

## Wait for a condition you control

Create a separate tree as in [Getting Started](/en/behavior-trees/gettings-started), with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. Fixed Status supplies every result in this example; no external action is needed.

1. Through `Add new Node`, add and connect the nodes below. Keep Sequence's children in left-to-right order.
2. Set the child of Until Success to `General → Status → Failure`. Set the other two Fixed Status nodes to `Success`. Check the linked check in `General → Child` on Until Success.

```text
My Tree
└─ Sequence
   ├─ Fixed Status: Success
   ├─ Until Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The first step succeeds; the check fails, but Until Success and Sequence return `Running`. The final step is not called yet.
4. Tick again without changing the check. Until Success makes one more attempt. Sequence resumes here instead of repeating its earlier successful step.
5. Set the check to `Success` and tick again. Until Success succeeds, then Sequence executes the last step. A tick after this completed pass starts Sequence from the beginning.

| Child result | Until Success result |
| --- | --- |
| Success | Success; no further retry in this pass |
| Failure | Running; another attempt on the next call |
| Running | Running; the child continues under its own execution contract |

Until Success requires one enabled child; a missing or disabled child is a configuration error. It has no attempt-count or interval setting. For automatic execution, [Root settings](/en/behavior-trees/nodes/root) and the duration of each traversal determine when another tick occurs. Side effects in the retried child may happen again.

<details>
<summary>Child state and reset</summary>

Until Success does not reset the child after Failure or Success. Timers, composite-node cursors and script continuations follow that child's own contract. Structural reset clears owned execution state; clearing the displayed last status does not. Errors and cancellation do not automatically become another normal retry.

</details>
