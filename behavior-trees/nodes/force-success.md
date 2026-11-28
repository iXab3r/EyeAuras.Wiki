---
title: Force Success
description: 
published: true
date: 2024-03-07T23:34:41.471Z
tags: behavior trees, decorator, game development
editor: markdown
dateCreated: 2024-03-07T23:34:41.470Z
---

# Force Success — continue after an optional step fails

`Force Success` turns its child's `Failure` into `Success`. Use it when a check is optional and the sequence should go on whatever the outcome. While the child is still working, the node returns `Running`.

## Try it in your own tree

Create a separate tree using [Getting Started](/en/behavior-trees/gettings-started). Keep `Activation → Is Loaded` and `Execution → When Activated → Do nothing`, so that every tick is manual.

1. Use `Add new Node` to add `Sequence`, `Force Success` and two `Fixed Status` nodes. Connect them as below. Sequence's children go left to right.
2. Set the child of Force Success to `General → Status → Failure` and the last Fixed Status to `Success`. Select Force Success and check that `General → Child` shows the right child.

```text
My Tree
└─ Sequence
   ├─ Force Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The first Fixed Status returns `Failure` and Force Success returns `Success`. Sequence reaches the last child and finishes with `Success`.
4. Set the first Fixed Status to `Running` and tick again. Force Success and Sequence return `Running`, and the last child does not run in that tick. Set the first one back to `Failure` and click the same button. The sequence runs to the end.

| Setting or child result | Effect |
| --- | --- |
| Child | One connected child. For several steps, connect your own Sequence to Force Success |
| Success | Force Success returns Success |
| Failure | Force Success also returns Success, and the parent can go on |
| Running | Force Success returns Running, and the child keeps working |

The smallest case, a failed child whose result is changed:

```plaintext
Force Success
    └── Child Node (Failure)
```

If the failed step should be retried, use [Until Success](/en/behavior-trees/nodes/until-success). It tries again on the next tick. If you want a different option after Failure, use [Selector](/en/behavior-trees/nodes/selector).

With no children, the node returns `Success`, but an optional step needs a child. Force Success does not turn execution errors or cancellation into success.
