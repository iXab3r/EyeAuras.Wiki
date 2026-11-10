---
title: Cooldown
description: Understanding the concept of Cooldown nodes in action sequences.
published: true
date: 2024-03-07T23:19:06.938Z
tags: Cooldown, Action Sequences, Node Operation
editor: markdown
dateCreated: 2024-03-07T23:19:06.938Z
---

# Cooldown — limit how often a successful step repeats

Put work **under** `Cooldown` to start an interval after the child returns `Success`. A call before that interval expires returns `Failure` without calling the child. The first call is admitted immediately.

## Admit your check once every five seconds

Use a separate tree with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. [Getting Started](/en/behavior-trees/gettings-started) covers node creation and connections. A Fixed Status child supplies the result without external work.

1. Use `Add new Node` to add `Cooldown` and `Fixed Status`. Connect the tree entry to Cooldown, then Cooldown to Fixed Status.
2. Set the child to `General → Status → Success`. On Cooldown set `General → Cooldown = 5000 ms`, turn off randomization with the shuffle button, and check `Child`.

```text
My Tree
└─ Cooldown: 5000 ms
   └─ Fixed Status: Success
```

3. Click the upper `Tick BT Once`. The child executes and Cooldown returns `Success`, starting the interval.
4. Tick again before five seconds have elapsed. Cooldown returns `Failure` and does not call its child. The remaining interval is shown on the node.
5. After the interval expires, tick again. The child succeeds and starts another interval. Time passing alone does not execute a manually ticked tree.

| Setting or outcome | Effect |
| --- | --- |
| Cooldown | Interval after child Success, in milliseconds |
| Random Min / Max | Sample a new interval after each child Success, for example 4000–6000 ms |
| Child | The work being limited; group several steps in a child Sequence |
| Child Success | Return Success and start the interval after the awaited call finishes |
| Child Failure | Return Failure and clear the active countdown |
| Child Running | Return Running without starting a new interval |
| Call during the countdown | Return Failure without calling the child |

After expiry, Cooldown returns the child's new result; expiry does not guarantee Success. It measures elapsed time rather than a wall-clock appointment. Editing the configured duration clears the countdown. Structural reset clears its history and children; clearing displayed statuses does not.

<details>
<summary>Placement and conditional examples</summary>

In a [Selector](/en/behavior-trees/nodes/selector), Cooldown's temporary Failure lets a fallback branch run. The following are abstract adaptations of the skill and healing examples, not ready game integrations. Each named action needs a real configured implementation; the HP check needs your own aura and data source.

```plaintext
Selector
    ├─ Cooldown (10 sec)
    │    └─ Use "Fireball"
    └─ Use "Basic Attack"
```

```plaintext
Selector
    ├─ Sequence
    │    ├─ AuraIsActive HP < 30%
    │    └─ Cooldown (30 sec)
    │         └─ Use "Healing Potion"
    └─ Use "Basic Attack"
```

Cooldown without a child treats the admitted call as Success and starts its timer. Placing it as a **sibling before** an action therefore starts the interval before that action runs; a later action failure cannot undo it. Nest the action as shown to measure time after its success. [Wait](/en/behavior-trees/nodes/wait) instead pauses the current pass by returning Running.

</details>
