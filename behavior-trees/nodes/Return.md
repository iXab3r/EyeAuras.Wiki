---
title: Return
description:
published: true
date: 2025-08-17T09:40:43.000Z
tags:
editor: markdown
dateCreated: 2025-08-17T09:40:43.000Z
---

# Return — finish a macro with a chosen result

Use `Return` to finish the currently invoked macro and skip its remaining steps. It returns Success or Failure to the caller. Unlike [Break](/en/behavior-trees/nodes/Break), its exit is not limited to an inner Block or Repeat.

## Finish before the final wait

Prepare a separate [macro](/en/macros/getting-started) with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`.

1. In the initial Block add `Wait`, `Return`, another `Wait`, then `Fixed Status` in order.
2. Set the first Wait's `General → Delay = 500 ms`, the second to `5000 ms`, randomization off. Set Fixed Status to Failure. On Return choose `General → Return → Success`.

```text
My Macro
└─ Block
   ├─ Wait: 500 ms
   ├─ Return: Success
   ├─ Wait: 5000 ms
   └─ Fixed Status: Failure
```

3. Click the upper `Run Macro Once`. After the first wait, the macro finishes with Success. The five-second wait and final Fixed Status are not called.
4. Set Return to `Failure` and run again. The same steps are skipped, but the macro result is Failure. This is a chosen outcome, not necessarily an application error.

| Setting or boundary | Effect |
| --- | --- |
| General → Return → Success | Finish the invoked macro successfully |
| General → Return → Failure | Finish the invoked macro with Failure |
| Macro category | Offered in macros, not as an ordinary BT node |
| Inside Block, IfThenElse or Repeat | Exit propagates through these nested constructs to the macro boundary |
| Invoked through Run Macro | Finish the callee; the caller receives its result and follows its own routing rules |
| Return children | Not executed after the exit; caller continuation belongs after its Run Macro node |

A successful callee can let a caller's BT Sequence continue; Failure stops that Sequence. An ordinary Block in a calling macro may still execute later siblings after Failure. Return does not stop all EyeAuras trees.

## Return only when a condition matches

Use macro IfThenElse with your check in Condition and Return in If matched, then. For example, [Aura Is Active](/en/behavior-trees/nodes/aura-is-active) can read your Fixed Value aura. This earlier abstract schema needs such a real condition source; it is a tree sketch, not C#:

```text
IfThenElse
├── Condition: No mana
├── If yes: Return (Result = Failure)
└── If no: Continue with other actions
```

Return runs only when traversal reaches it. It does not roll back completed effects, cancel separately launched work or release a held key. Cancellation and resource cleanup belong to that work's own lifetime/code. To leave only a loop or a particular Block, choose Break.
