---
title: Force Failure
description: 
published: true
date: 2024-03-07T23:30:59.987Z
tags: behavior tree, game development, node decorator
editor: markdown
dateCreated: 2024-03-07T23:30:59.987Z
---

# Force Failure — finish a step, then reject the branch

Wrap work in `Force Failure` when the parent should receive `Failure` after that work finishes, even if the child succeeds. In a [Sequence](/en/behavior-trees/nodes/sequence), this prevents later siblings from running. A child that returns `Running` remains unfinished; Force Failure also returns `Running`.

## Observe the parent stop

Use a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. [Getting Started](/en/behavior-trees/gettings-started) shows how to add and connect nodes.

1. Add `Sequence`, `Force Failure` and two `Fixed Status` nodes. Connect them in the order below.
2. Set both Fixed Status nodes to `General → Status → Success`. Check that `General → Child` on Force Failure names its connected child.

```text
My Tree
└─ Sequence
   ├─ Force Failure
   │  └─ Fixed Status: Success
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The first Fixed Status succeeds, but Force Failure and Sequence return `Failure`. The last Fixed Status is not called in this pass.
4. Change the first check to `Running` and tick again. Both parents return `Running`. Change it back to `Success`; the next tick finishes this branch with `Failure`.

| Setting or child result | Effect |
| --- | --- |
| Child | One enabled child; use a child Sequence for several steps |
| Success | Force Failure returns Failure |
| Failure | Force Failure returns Failure |
| Running | Force Failure returns Running without forcing completion |

The original minimal schema shows a successful child whose result is changed:

```plaintext
Force Failure
    └── Child Node (Success)
```

With no connected children, Force Failure returns `Failure`. If a child is connected but disabled, the missing enabled child causes a configuration error. Execution errors and cancellation are separate from a normal `Failure` result.

The parent decides what Failure means: Sequence stops, while [Selector](/en/behavior-trees/nodes/selector) can try another option. This changes routing after a step; it neither cancels unfinished work nor reverses effects already performed.
