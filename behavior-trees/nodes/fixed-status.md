---
title: Fixed Status
description: 
published: true
date: 2024-03-07T23:24:16.618Z
tags: behavior trees, debugging, testing, composite nodes
editor: markdown
dateCreated: 2024-03-07T23:24:16.618Z
---
# Set a test condition's result

Use Fixed Status to inspect a route before configuring a real condition. You choose Success, Failure or Running; the node does not watch a window, key or application state.

## See which child is reached

Use your own loaded tree with **When Activated → Do nothing**. Connect its entry to Sequence, then two Fixed Status children left to right. Give the Fixed Status nodes no children of their own for this test.

1. Set the first to **General → Status → Failure**, the second to **Success**.
2. Click the upper **Tick BT Once**. The first child and Sequence fail; the second does not run.
3. Set the first to Success and tick again. Both children execute and Sequence succeeds.
4. Optionally set the first to Running and tick. Sequence retains that child. Set it back to Success and use the same tick control to continue.

Changing **Status** configures a future answer. It does not execute the tree or rewrite the previous displayed result by itself.

| Status with no child | Fixed Status returns |
| --- | --- |
| `Success` | Success, permitting Sequence to continue. |
| `Failure` | Failure, ending that Sequence pass. |
| `Running` | Running on every call until you change the setting; elapsed time alone does not change it. |

The earlier standalone leaf examples remain:

```
   Fixed Status: Success
   ```

```
   Fixed Status: Running
   ```

## Account for a connected child

Fixed Status follows the condition-node contract: after its own Success, it executes its single enabled child and returns **that child's result**. The Status parameter can therefore say Success while the displayed result is Failure or Running.

```text
Fixed Status: Success
└─ Wait: 1500 ms
```

The first tick returns Wait's Running. A later tick continues that child; changing the parent's Status during continuation is not a guaranteed interruption. Use [Sequence](/en/behavior-trees/nodes/sequence) for several following steps.

Sequence and [Selector](/en/behavior-trees/nodes/selector) retain a Running route rather than moving on. Other trees and auras continue independently. Once the route is understood, replace Fixed Status with a real condition such as [Aura Is Active](/en/behavior-trees/nodes/aura-is-active).
