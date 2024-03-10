---
title: Fixed Status
description: 
published: true
date: 2024-03-07T23:24:16.618Z
tags: behavior trees, debugging, testing, composite nodes
editor: markdown
dateCreated: 2024-03-07T23:24:16.618Z
---
The **Fixed Status** node allows you to explicitly set the desired state that will be returned when this node is executed. This is useful for debugging, testing, and controlling the passage of specific sections in behavior trees.

**Examples of Use:**
1. **Example 1:**
   ```
   Fixed Status: Success
   ```
   In this example, the **Fixed Status** node will always return the `Success` state.

2. **Example 3:**
   ```
   Fixed Status: Running
   ```
   In this example, the **Fixed Status** node will always return the `Running` state.
> Important! Most composite nodes, such as [Selector](/en/behavior-trees/nodes/selector) and [Sequence](/en/behavior-trees/nodes/sequence), when encountering `Running`, will block the execution of the tree until the node returns `Success` or `Failure`. So, use this status carefully.
{.is-warning}