---
title: Cooldown
description: Understanding the concept of Cooldown nodes in action sequences.
published: true
date: 2024-03-07T23:19:06.938Z
tags: Cooldown, Action Sequences, Node Operation
editor: markdown
dateCreated: 2024-03-07T23:19:06.938Z
---
The Cooldown node represents a delay before an action can be performed again. This is useful when it is necessary to limit the frequency of using a specific action.

Examples of application:

1. **Example 1: Skill rotation**
   - If the "Fireball" skill is used, a Cooldown node with a 10-second timer will prevent the reuse of this skill for the specified time.

```plaintext
Selector
    ├─ Sequence
    │    ├─ Cooldown (10 sec)
    │    └─ Use "Fireball"
    └─ Use "Basic Attack"
```

2. **Example 2: Self-healing**
   - After using the "Healing Potion" skill, a Cooldown node with a 30-second timer can prevent the reuse of the potion until the delay time expires. The potion will only be used if HP < 30%.

```plaintext
Selector
    ├─ Sequence
    |    ├─ AuraIsActive HP < 30% 
    │    ├─ Cooldown (30 sec)
    │    └─ Use "Healing Potion"
    └─ Use "Basic Attack"
```

**Node operation:**
- After successfully executing the action with a **Cooldown**, the node enters the `Running` state and starts the countdown.
- While the **Cooldown** is active, the node will return a `Failure` state, preventing the action from being executed.
- When the **Cooldown** delay time expires, it transitions to the Success state, allowing the action to be performed again.