---
title: Inverter
description: 
published: true
date: 2024-03-23T22:57:07.662Z
tags: behavior trees, nodes, inverter
editor: markdown
dateCreated: 2024-03-07T23:20:14.981Z
---
The **Inverter** node, or inverter, is one of the basic nodes in behavior trees. Its main function is to invert the result of its child node. If the child node returns Success, then the Inverter will return Failure, and vice versa.

**Example of Use:**
![eyeauras_exsrmbzxzu.gif](/assets/eyeauras_exsrmbzxzu.gif)
Here, the **[Fixed Status](/en/behavior-trees/nodes/fixed-status)** node returns `Failure`, but the inverter will return `Success`.

**Operation:**
1. The **Inverter** executes its child node.
2. If the child node returns `Success`, the Inverter will return `Failure`.
3. If the child node returns `Failure`, the Inverter will return `Success`.
4. If the child node returns `Running`, the Inverter will also return `Running`.