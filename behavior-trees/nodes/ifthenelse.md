---
title: IfThenElse
description: 1 -> 2 OR 3
published: true
date: 2025-03-30T19:07:24.627Z
tags: 
editor: markdown
dateCreated: 2025-03-30T19:07:24.627Z
---
# Choose one branch after a condition

The behavior-tree IfThenElse uses its first enabled child as Condition, its second as Then and its third as Else. These roles are connected nodes, not fields for arbitrary C# expressions.

## Test both routes without input

In your own loaded behavior tree, set **When Activated → Do nothing**. Add IfThenElse and three Fixed Status nodes, connected left to right:

```text
My Tree
└─ IfThenElse
   ├─ Fixed Status: Success    ← If
   ├─ Fixed Status: Failure    ← Then
   └─ Fixed Status: Success    ← Else
```

1. Set each child's **General → Status** as shown. In IfThenElse, check **General → If**, **Then**, **Else** identify those nodes rather than **not set**.
2. Click the upper **Tick BT Once**. Condition succeeds, Then returns Failure, and Else is not called. The composite's result is the branch's Failure.
3. Change Condition to Failure and tick again. Else now runs, returning Success.

This exposes branch choice before replacing the test nodes with your actual conditions and work. Put a Sequence inside a branch when it needs several required steps.

| Role or result | Behaviour |
| --- | --- |
| `If` / Condition | First enabled child selects the branch. |
| `Then` | Second enabled child, after Condition Success. |
| `Else` | Third enabled child, after Condition Failure. |
| Condition returns Running | Return Running; neither branch starts yet. |
| Chosen branch returns Running | Resume that branch next tick without repeating Condition. |
| Chosen branch completes | Its Success/Failure is the result. A fresh completed pass starts at Condition. |
| Chosen branch is absent | Failure; a false condition without Else does not become Success. |

Disabling a child removes it from the enabled list and can shift later roles; it is not equivalent to setting Condition to Failure. With no Condition, execution is misconfigured rather than an ordinary false result. Check the displayed roles.

## Compare with Selector and Sequence

![The three IfThenElse roles in the earlier editor](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_CSBaIFoJJPCR9f6p.png)

`Selector → Sequence(Condition, Then), Else` looks similar, but can try Else after Then fails. IfThenElse does not try another branch after choosing Then.

![A similar-looking alternative built with Selector and Sequence](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_ccGKJyQMUxAsLe2c.png)

An EyeAuras condition can also execute its own single child after Success, producing the earlier compact form:

![The compact alternative using a condition child](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_pcWHNBqeobgqgrd0.png)

Choose IfThenElse for one explicit decision, [Sequence](/en/behavior-trees/nodes/sequence) for required steps and [Selector](/en/behavior-trees/nodes/selector) for several alternatives. This is a routing choice, not a claim that one is universally faster.

The Macro template is a different node: it owns **Condition**, **If matched, then** and **Otherwise** blocks, accepting two or three blocks. Its execution contract must not be inferred from this BT node's positional children and Running cursor.

<details>
<summary>Earlier abstract examples</summary>

These retained sketches illustrate choosing a strategy. Their named checks/actions are placeholders that require your own data sources and implementations, not built-in game integration or ready EyeAuras templates.

```
IfThenElse
├── Condition: "Is the target a boss?"
├── Then: "Use special boss skills"
└── Else: "Use regular skills"
```

```
IfThenElse
├── Condition: "Is the character in a dangerous zone?"
├── Then: "Leave the dangerous zone"
└── Else: "Follow the regular route"
```

The same decision structure can use a configured indicator aura in your own application. The earlier images show user-named checks and input reactions; they do not establish that EyeAuras knows target type or danger automatically.

</details>
