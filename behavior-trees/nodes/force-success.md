---
title: Force Success
description: 
published: true
date: 2024-03-07T23:34:41.471Z
tags: behavior trees, decorator, game development
editor: markdown
dateCreated: 2024-03-07T23:34:41.470Z
---
The **Force Success** node is a decorator in behavior trees. It always returns the `Success` state, regardless of the result of the child node execution.

**Example of use:**
```plaintext
Force Success
    └── Child Node (Failure)
```

**How it works:**
1. If the child node returns `Success`, **Force Success** will also return `Success`.
2. If the child node returns `Failure`, **Force Success** will still return `Success`.
3. If the child node returns `Running`, **Force Success** will return `Running`, allowing the child node to complete its execution.

**Note:**
Force Success can be used, for example, to ensure the successful completion of a specific action in a game bot, even if that action is not executed correctly.