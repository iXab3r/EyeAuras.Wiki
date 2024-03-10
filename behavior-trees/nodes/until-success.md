---
title: Until Success
description: 
published: true
date: 2024-03-07T23:41:51.969Z
tags: behavior tree, decorator, success state
editor: markdown
dateCreated: 2024-03-07T23:41:51.969Z
---
The Node Until Success is a decorator that continues the execution of its child node until it returns the Success state. While the child node returns Running, Until Success also returns Running, continuing the execution. Once the child node returns Success, Until Success will also return Success.