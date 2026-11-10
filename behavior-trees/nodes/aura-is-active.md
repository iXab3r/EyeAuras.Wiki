---
title: Aura Is Active
description: 
published: true
date: 2024-03-07T23:54:26.541Z
tags: behavior trees, auras, triggers, actions
editor: markdown
dateCreated: 2024-03-07T23:54:26.541Z
---

# Aura Is Active — use your aura's state in a tree

Use `Aura Is Active` to admit a branch only when an already configured aura has the expected state. The aura supplies the data: Fixed Value for a first test, or Image, Color, Text or AI Search for a real condition. The node reads that state; it does not rerun recognition or read another application's internal data.

## Control a branch with your own signal

Create a loaded aura named `BT signal` with one [Fixed Value](/en/triggers/fixed-value), no actions, and `Is NOT Active` selected. Prepare a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`.

1. Through `Add new Node`, add `Aura Is Active` and connect it to the tree entry. Leave it without a child so you can observe the check itself.
2. Open `General → Links → Edit`, select your `BT signal` aura and confirm. Check that the intended aura appears in the list.
3. Keep `must be Active` and choose `Operator → All must match (AND)`. Click the upper `Tick BT Once`: the inactive aura does not match, so the node returns `Failure`.
4. In the aura, change Fixed Value to `Is Active`. Wait until the aura shows Active, then return to the tree. `General → Status` shows Active; another manual tick returns `Success`.
5. To check the opposite state, clear the expected-state checkbox in the link row so it says `must be Not Active`. Success now requires a known inactive state.

The earlier editor image shows the linked aura and expected-state choice. In the current editor, begin at `Links → Edit`:

![Linked aura and expected state in the earlier Aura Is Active editor](https://i.imgur.com/67jYSwV.png)

| Setting | Effect |
| --- | --- |
| Links → Edit | Select one or more existing auras; the row's navigation button opens its target and the cross removes the link |
| must be Active / Not Active | Compare a known aura state with its expected state |
| All must match (AND) | Every link must match; an undefined link makes the aggregate Unknown |
| At least one must match (OR) | One matching link is enough; a nonempty list without a match evaluates Not active |
| Status | Current aggregate Active, Not active or Unknown; not the node's last execution result |

Without a child, aggregate Active maps to `Success` and Not active to `Failure`. Aggregate Unknown raises a check error rather than a normal Failure. Check linked-aura loading/enabling and the error message; unknown is not confirmed inactivity. Links refer to configured auras, not built-in game properties.

## Continue after a successful check

Attach one [Wait](/en/behavior-trees/nodes/wait) or a [Sequence](/en/behavior-trees/nodes/sequence). Success admits the child, and the node returns that child's result. With a 2000 ms Wait, the first admission returns Running; a later tick after the interval can return Success.

While that child has retained Running, the next tick resumes **the child first**, without rechecking the aura. An aura change alone therefore does not interrupt it. Use [Interrupter](/en/behavior-trees/nodes/Interrupter) for a separate interruption condition.

<details>
<summary>Unknown links and an empty list</summary>

In AND, Unknown prevents a definite aggregate even if another link already fails. In OR, any match succeeds; a nonempty list with no match is negative, including when individual links are unknown.

A saved link with no expected value may display `must be Undefined`. It passes through the aura's source state; it does not test equality with Unknown. Explicitly choose Active or Not Active for the first example. An empty list can admit a branch without testing an aura, so always verify the intended link is present and resolved. Tree references and aura links are different relationships; this node links aura state into BT logic.

</details>
