---
title: IsActive
description:
published: true
date: 2025-08-17T08:30:21.182Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:30:21.182Z
---

# Is Active — check activation of your own tree

Add `Is Active` to check the activation state of the root containing this tree or macro at a particular point in its flow. Use [Aura Is Active](/en/behavior-trees/nodes/aura-is-active) to inspect another aura instead.

## Gate a step with your own signal

Create a loaded aura named `BT enabled` with one [Fixed Value](/en/triggers/fixed-value), no actions, and `Is NOT Active` selected. Prepare a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`.

1. At the tree entry, open `Activation → activate when Aura Activated...`. Under `Enabling Condition → Links`, select `BT enabled` with expected state Active. This configures root activation, not a link inside Is Active.
2. Add and connect `Sequence`, `Is Active` and `Fixed Status`. Set Fixed Status to `General → Status → Success` and leave `General → Invert` off on Is Active.

```text
My Tree
└─ Sequence
   ├─ Is Active
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. A loaded tree can be ticked manually while its activation condition is inactive: Is Active returns `Failure` and the last step is skipped.
4. Set your aura's Fixed Value to `Is Active`. Wait for the linked state to update, then return to the tree. The node's `General → Status` shows Active; another tick reaches the last step with Success.
5. Enable `Invert`. The displayed check state is inverted; while the root remains active, the next tick returns Failure.

![State and Invert in the earlier Is Active editor](https://s3.eyeauras.net/media/2025/08/EyeAuras_QxRuxRhJEV.png)

| Setting or root state | Check result without a child |
| --- | --- |
| Invert off, root active | Success |
| Invert off, root inactive | Failure |
| Invert on, root active | Failure |
| Invert on, root inactive | Success |
| Status | Current check state after inversion, not the last NodeStatus result |

Loading, activation and automatic ticking are different. A root without conditions or triggers is `manual`, which is inactive for this check even though manual ticks are available. `Do nothing` prevents automatic execution; it does not make a satisfied activation condition false. Pause and loading conditions also affect the root state; see [Root](/en/behavior-trees/nodes/root).

## Where this check stops a branch

Sequence evaluates it only when traversal reaches it. The node does not continuously watch arbitrary work or undo effects. If a later Sequence child returns Running, the next tick resumes that child without repeating Is Active. A child attached directly to Is Active is admitted after Success; retained child Running likewise resumes before another activation check.

The earlier abstract schema uses `CheckIsActive` for the current `Is Active` template and `DoSomething` for your own work:

```
Sequence
 ├── CheckIsActive (Invert = false)   ← Checks that the tree is active
 ├── DoSomething                      ← Executes if the tree is active
```

This gates work at the check, rather than guaranteeing instant interruption on deactivation. The shared template also appears in Macro, where Failure in an ordinary Block need not skip all following siblings. Ending a whole macro requires its own control flow. If a valid root state is unavailable, this check returns Failure; Invert does not turn unknown state into confirmed inactivity.
