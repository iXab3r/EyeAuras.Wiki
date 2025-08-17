---
title: IsActive
description:
published: true
date: 2025-08-17T08:30:21.182Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:30:21.182Z
---

**CheckIsActive** is a special node used in macros and behaviour trees in EyeAuras. It checks whether the current tree or macro is active and, if necessary, stops execution early.

![Params](https://s3.eyeauras.net/media/2025/08/EyeAuras_QxRuxRhJEV.png)

## Why do you need it?

At the beginning of each tick the tree will not start if it is disabled (for example, if you removed the active checkmark). Sometimes you need to check the status not only at the start but at any point during the macro or tree execution. In such cases CheckIsActive lets you:

- Check whether the current tree or macro is disabled.
- If the tree is disabled (or enabled, depending on the parameters), finish execution immediately with the desired status (`Failure` or `Success`).

An example situation: you want the tree to finish early if it was deactivated during work—then insert CheckIsActive at the necessary point.

## Invert

CheckIsActive has an **Invert** option: when enabled the node checks for INACTIVITY instead:

- If **Invert = off** (default): the node returns `Success` when the tree or macro is active and `Failure` when it is not.
- If **Invert = on**: it is the opposite—`Success` when the tree is **inactive**, and `Failure` when it is active.

This is convenient if you need the opposite behaviour, reacting to deactivation rather than activation of the tree or macro.

## How CheckIsActive works
- Insert the node in the required place in the tree or macro.
- On tick it checks the current active status.
- You can combine it with other nodes to end the tree early (for example, in a Sequence or Selector).

## Simple example
```
Sequence
 ├── CheckIsActive (Invert = false)   ← Checks that the tree is active
 ├── DoSomething                      ← Executes if the tree is active
```
In this example, if the tree is disabled while running, the sequence finishes with `Failure` and subsequent actions are skipped.

**CheckIsActive** helps make scenarios more controllable when it's important to quickly react to changes in the tree or macro's active state right from inside the execution chain.
