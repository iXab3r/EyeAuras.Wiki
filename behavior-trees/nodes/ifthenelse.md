---
title: IfThenElse
description: 1 -> 2 OR 3
published: true
date: 2025-03-30T19:07:24.627Z
tags: 
editor: markdown
dateCreated: 2025-03-30T19:07:24.627Z
---

The **IfThenElse** node works on the classic principle of "if-then-else". It helps decide what to do next based on whether a condition is met or not.

The left-most node is a **Condition**. If it returns `Success`, the middle node (**Then**) is executed. If the condition fails (`Failure`), the right-most node (**Else**) is executed, if it exists.

![IfThenElse](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_CSBaIFoJJPCR9f6p.png)

## Comparison with Selector and Sequence Nodes:

![IfThenElse via Selector](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_ccGKJyQMUxAsLe2c.png)

Alternatively, in more compact EyeAuras notation, this could look like this
![](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_pcWHNBqeobgqgrd0.png)

### Advantages:
- Clearly separates the condition from subsequent actions (Then/Else), enhancing readability and understanding.
- Ideal for simple conditions and reactions requiring explicit action separation.
- Convenient for clearly expressing "if-then-else" logic without going through multiple possibilities.

### Disadvantages:
- Less suitable for complex situations with numerous conditions and potential actions.
- For multiple actions and conditions, Selector or Sequence nodes might be more convenient and efficient.

In situations where you simply need to iterate through actions from left to right and stop at the first successful one, the **Selector** node is preferable. If performing several actions sequentially is essential, the **Sequence** node is suitable.

## Usage Examples:

### 1. Choosing Behavior Based on Target Type:

Suppose a character encounters an enemy and must behave differently depending on whether the enemy is a boss or a regular mob.

```
IfThenElse
├── Condition: "Is the target a boss?"
├── Then: "Use special boss skills"
└── Else: "Use regular skills"
```

This approach clearly specifies different behaviors for regular enemies and special cases.

### 2. Avoiding Danger:

The character must either avoid a dangerous zone if inside it or continue following the usual route.

```
IfThenElse
├── Condition: "Is the character in a dangerous zone?"
├── Then: "Leave the dangerous zone"
└── Else: "Follow the regular route"
```

This example clearly separates two entirely different behavioral strategies depending on the current situation.

## How It Works:

1. The left node (**Condition**) executes.
2. If it returns `Success`, the middle node (**Then**) executes.
3. If it returns `Failure`, the right-most node (**Else**) executes, if specified.
4. The **IfThenElse** node returns the status of the last executed node (Then or Else).
5. If the right-most (**Else**) node doesn't exist and the condition fails, the entire **IfThenElse** node returns `Failure`.

The **IfThenElse** node allows you to easily create various reactions for characters in game situations, making behavior flexible.

> Don't confuse! **IfThenElse** separates conditions and two action variants distinctly, unlike the **Selector** node, which simply iterates actions from left to right until the first success.