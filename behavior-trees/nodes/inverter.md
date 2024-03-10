---
title: Inverter
description: 
published: true
date: 2024-03-07T23:21:08.200Z
tags: behavior trees, nodes, inverter, examples
editor: markdown
dateCreated: 2024-03-07T23:20:14.981Z
---
The **Inverter** node, or inverter, is one of the basic nodes in behavior trees. Its main function is to invert the result of its child node. If the child node returns Success, then the Inverter will return Failure, and vice versa.

**Examples of Use:**
1. **Example 1:**
   ```
   Inverter
   └─ Condition Check
   ```
   If the condition check returns `Success`, the **Inverter** will return `Failure`.

2. **Example 2:**
   ```
   Inverter
   └─ Perform Action
   ```
   If the action execution results in `Success`, the **Inverter** will return `Failure`.

**Operation:**
1. **Inverter** executes its child node.
2. If the child node returns `Success`, the Inverter will return `Failure`.
3. If the child node returns `Failure`, the Inverter will return `Success`.
4. If the child node returns `Running`, the Inverter will also return `Running`.