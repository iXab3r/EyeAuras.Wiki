---
title: Activation Conditions
description: Rules that determine when something can be enabled
published: true
date: 2022-11-02T15:35:58.240Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T13:32:30.540Z
---
# Enabling conditions

## The problem

![](https://eyeauras.net/uploads/switch_1ff70c1ad0.png)

In most cases, out of all your configured auras, only a small subset actually needs to be active.

For example, if you have a set of auras for one game, there is no reason for the auras for another game to keep running checks, intercepting key presses, searching for images, and so on.

Previously, this could be handled either by manually unloading/loading auras using the “eye” icon to the right of an aura or folder name, or with `Load` / `Unload` actions. The script-based approach was always:
- inconvenient
- unstable

At the same time, the need to quickly enable or disable aura sets on the fly, with near-zero delay, has always been there.

## The solution

![](https://eyeauras.net/uploads/tree_b338986591.png)

Each aura and folder now has an additional **Enabling conditions** block where you can define the conditions you need.

Triggers inside an aura or folder are evaluated only when those conditions are met.

For example, if you add the `WindowsIsActive` trigger with the parameter `l2.bin` to the conditions of the **Lineage 2** folder, then **all** triggers inside that folder will be evaluated only while the `l2.bin` process window is active.

This means that all the triggers in the **Lineage 2** folder will not consume resources when they are not needed.

### Technical details

- Conditions follow the folder hierarchy. You can assign a separate set of conditions to each folder and each aura. Triggers inside an aura will only be evaluated when both the folder conditions and the aura conditions are satisfied. This makes it possible to build condition sets that significantly reduce overall system load. For example, the root folder can require the game window to be active, while a nested folder can require some specific in-game dialog to be open before its triggers are evaluated.
- For convenience, the currently selected folder or aura in the program is treated as if its conditions are met.
- If an aura is **disabled**, its icon changes to `?` and its color becomes orange, just like unloaded auras.
- If an aura is **disabled**, it is guaranteed to consume 99% fewer resources. In practice, this means it mostly occupies memory and does not use CPU/GPU resources. There may still be issues in the early stages of this feature, so please send reports and screenshots.
- While an aura is **loading**, it is considered **disabled**. This fixes some startup issues where auras would begin triggering one after another before the whole system had fully loaded.