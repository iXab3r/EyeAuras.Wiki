---
title: CheckKeyState
description:
published: true
date: 2025-08-17T08:36:34.854Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:36:34.854Z
---

**CheckKeyState** is a node that checks whether a specific keyboard key is currently pressed. If the chosen key is held down at the moment of the check, the node returns `Success`; otherwise it returns `Failure`.

![CheckKeyState parameters](https://s3.eyeauras.net/media/2025/08/EyeAuras_dfgmUF8kNg.png)

## How to use

1. Specify the key in the **Hotkey** parameter.
2. Insert the node where you need it in the scenario.
3. On each run it performs the check:
   - If the key is pressed, CheckKeyState returns `Success`.
   - If it isn't pressed, it returns `Failure`.
> If no key is selected, the result will always be `Failure`.

## Example
```
Sequence
├── CheckKeyState (Hotkey = F1)
├── DoSomethingWhileF1Pressed
```

In this example the actions in `DoSomethingWhileF1Pressed` run only while the user holds F1.

## What is it good for?
- Create branches in the tree that work only while a certain key is held, adjusting behavior on the fly.
