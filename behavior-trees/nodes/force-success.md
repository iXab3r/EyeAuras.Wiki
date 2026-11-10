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

Wrap an optional check in `Force Success` when its normal `Failure` should not stop the parent sequence. The decorator changes a completed result to `Success`; it preserves `Running` while the child still has work to do. It does not repair the failed operation.

## Try it in your own tree

Create a separate tree using [Getting Started](/en/behavior-trees/gettings-started). Keep `Activation → Is Loaded` and `Execution → When Activated → Do nothing` so you control each tick manually.

1. Use `Add new Node` to add `Sequence`, `Force Success` and two `Fixed Status` nodes. Connect them as below, with Sequence's children ordered left to right.
2. Set the child of Force Success to `General → Status → Failure`, and the last Fixed Status to `Success`. Select Force Success and check the connected node in `General → Child`.

```text
My Tree
└─ Sequence
   ├─ Force Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The first check returns `Failure`, Force Success returns `Success`, and Sequence reaches the final child and succeeds.
4. Change the first check to `Running` and tick again. Force Success and Sequence now return `Running`; the last child is not called in that tick. Change the check back to `Failure` and use the same tick button: Sequence resumes that step and can finish.

| Setting or child result | Effect |
| --- | --- |
| Child | One enabled child. Put several steps in a child Sequence |
| Success | Force Success returns Success |
| Failure | Force Success returns Success, allowing the parent to continue |
| Running | Force Success returns Running |

The original small schema describes the terminal-failure case:

```plaintext
Force Success
    └── Child Node (Failure)
```

With no connected children, Force Success returns `Success`. A connected but disabled child is different: there is no enabled child to execute, and the decorator reports a configuration error. Exceptions and cancellation are not converted into success.

Use this for an optional step whose failure you deliberately accept. It cannot guarantee that an action succeeded in another application, and should not hide a failure that must stop the sequence.
