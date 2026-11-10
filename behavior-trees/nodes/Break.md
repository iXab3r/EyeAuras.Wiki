---
title: Break
description:
published: true
date: 2025-08-17T09:40:43.000Z
tags:
editor: markdown
dateCreated: 2025-08-17T09:40:43.000Z
---

# Break — leave a macro loop or block

Put `Break` in a macro's Loop body when remaining iterations are no longer needed. Execution can continue after Repeat. An explicitly nested Block catches the exit earlier: only that Block ends.

## End Repeat on its first iteration

Create your own [macro](/en/macros/getting-started) with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. This example uses only internal checks and waits.

1. Add `Repeat` and a following `Fixed Status` to the initial Block. Set that last Fixed Status to `General → Status → Success`.
2. On Repeat choose `General → When Activated → Run N times`, `Repeat = 5`, `Delay = 0 ms`, randomization off. Repeat already contains the structural blocks `Condition` and `Loop body`.
3. Add a Fixed Status with Success and move it inside Condition. Inside Loop body, arrange `Wait` with `Delay = 500 ms`, `Break`, then Fixed Status with Failure. Check the nesting after dragging the steps.

```text
My Macro
└─ Block
   ├─ Repeat: 5 times
   │  ├─ Condition
   │  │  └─ Fixed Status: Success
   │  └─ Loop body
   │     ├─ Wait: 500 ms
   │     ├─ Break
   │     └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

4. Click the upper `Run Macro Once`. One wait completes; Break exits Repeat before another iteration. The Fixed Status after Break is skipped, but the last step **after Repeat** executes and the macro succeeds. Repeat's normal completion returns Success rather than aggregating every body failure.

| Placement or setting | Effect |
| --- | --- |
| Macro category | Break is a macro control-flow node, not an ordinary BT decorator |
| Loop body → Break | Skip the rest of the body and later iterations; continue after Repeat |
| IfThenElse inside Loop body | Break in the chosen branch propagates through its structural branch block to Repeat |
| Explicit nested Block → Break | Skip the rest of that Block; its enclosing flow may continue |
| Break settings | No result selector in the current editor; ordinary Break exit uses Success |
| Children of Break | Not executed as continuation; put the next step after the relevant Block or Repeat |

For a conditional exit, add macro IfThenElse to Loop body, your check to Condition, and Break to If matched, then. [Aura Is Active](/en/behavior-trees/nodes/aura-is-active) can read your configured aura. An “object found” condition needs an actual search source.

<details>
<summary>Exit boundaries and the conditional sketch</summary>

This abstract sketch uses placeholder action and condition names, not built-in enemy data or runnable C#:

```
Repeat (up to 5 times)
├── SomeAction
├── IfThenElse
│   ├── Condition: Enemy found
│   ├── If yes: Break
│   └── If no: (nothing)
└── Another action
```

Break in a chosen If branch can leave Repeat's body as shown. Do not put Break in Repeat's Condition expecting it to end the loop: that check Block catches its own exit, whose Success can admit another iteration. A Block you explicitly nest inside Loop body also catches Break before Repeat does.

Break acts when execution reaches it. It cannot interrupt an earlier stuck step, roll back actions or automatically release held keys. Errors and caller cancellation are separate. Observe the completed macro and step after Repeat rather than assuming a leaf's last color is the enclosing result.

Use [Return](/en/behavior-trees/nodes/Return) to end the currently invoked macro. Calling that macro from another flow does not make Break cancel every caller.

</details>
