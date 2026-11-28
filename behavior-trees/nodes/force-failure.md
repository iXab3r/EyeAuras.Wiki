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

`Force Failure` runs its child and returns `Failure` to the parent, even if the child succeeded. For example, this lets you end the current branch of a [Sequence](/en/behavior-trees/nodes/sequence). It does not cut off unfinished work: `Running` stays `Running`.

## Observe the parent stop

You need your own tree that you start by hand: `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. [Getting Started](/en/behavior-trees/gettings-started) shows how to add and connect nodes.

1. Add `Sequence`, `Force Failure` and two `Fixed Status` nodes. Connect them in the order below, left to right.
2. Set both Fixed Status nodes to `General → Status → Success`. `General → Child` on Force Failure should name its child.

```text
My Tree
└─ Sequence
   ├─ Force Failure
   │  └─ Fixed Status: Success
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The child of Force Failure returns `Success`, but Force Failure and Sequence return `Failure`. The last Fixed Status is not called in this pass.
4. Set the first Fixed Status to `Running` and tick again. Now Force Failure and Sequence return `Running`. Set the child back to `Success`, and the next tick finishes the branch with `Failure`.

| Setting or child result | Effect |
| --- | --- |
| Child | One child. For several steps, connect a child Sequence |
| Success | Force Failure returns Failure |
| Failure | Force Failure returns Failure |
| Running | Force Failure returns Running and does not force the child to finish |

The smallest case, a successful child whose result is changed:

```plaintext
Force Failure
    └── Child Node (Success)
```

With no children, the node returns `Failure`. The parent decides what happens next: Sequence stops on Failure, while [Selector](/en/behavior-trees/nodes/selector) tries the next option.
