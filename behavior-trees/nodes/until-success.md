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

`Until Success` keeps a sequence in place until a check passes. One call of the node is **one attempt** of the child, and the next attempt happens on the next tick. There is no internal retry loop.

## Wait for a condition you control

Take a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`.

1. Through `Add new Node`, add the nodes below and connect them. Sequence's children go left to right.
2. Set the child of Until Success to `General → Status → Failure`. Set the other two Fixed Status nodes to `Success`. On Until Success, `General → Child` shows the connected check.

```text
My Tree
└─ Sequence
   ├─ Fixed Status: Success
   ├─ Until Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The first step passes. The check returns Failure, but Until Success and Sequence return `Running`. The last step does not run yet.
4. Tick again without changing anything. The child of Until Success tries once more. Sequence continues from this place and does not repeat the first step.
5. Set the check to `Success` and click the button again. Until Success returns Success and Sequence runs the last step. The next tick after completion starts a new Sequence pass.

| Child result | Until Success result |
| --- | --- |
| Success | Success. No more retries are needed in this pass |
| Failure | Running. A new attempt on the next call |
| Running | Running. The child continues its work on the next call |

Until Success has no attempt count and no delay. With automatic execution, the rate depends on the [Root settings](/en/behavior-trees/nodes/root) and on how long each pass takes.

<details>
<summary>Child state and reset</summary>

Until Success does not reset the child after Failure or after Success. This matters for timers, composite nodes and scripts with a saved continuation. A structural reset of the tree clears its state. Clearing the displayed status does not. A child's cancellation or error does not become one more ordinary attempt.

</details>
