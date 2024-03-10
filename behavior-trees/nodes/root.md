---
title: Root
description: Root Node
published: true
date: 2024-03-07T14:53:17.542Z
tags: tree, settings, logic, recalculation
editor: markdown
dateCreated: 2024-03-07T14:51:42.386Z
---
## Why?
This is the root of your tree. This is where everything begins. It cannot be removed, but you can change the settings that affect **how** and **when** the tree recalculation and actions are performed.

### Is Loaded
Indicates whether the tree is loaded for execution or not, allowing you to conveniently enable/disable the entire tree without changing its logic. The logic of use is the same as with auras.

### Tick Every
Here you can specify how often the tree should be recalculated. Usually, values around 50-100ms are more than enough, but the decision is up to you. In the foreseeable future, another recalculation mode will be introduced - "on demand," which will analyze the tree itself and recalculate exactly when any of the checked conditions have changed.

### Is Active
Here you can set a condition under which the tree should function - whether it's a hotkey or window activation. The logic is exactly the same as in all other parts of the program where there are connections - you specify an aura, and the program monitors its state.