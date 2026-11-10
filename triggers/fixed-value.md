---
title: Fixed Value
description: 
published: true
date: 2024-05-14T10:29:17.090Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:37:32.752Z
---

# Fixed Value — test an aura manually

To check an action without waiting for a window or text to appear, set the condition yourself with Fixed Value. For example, activate an aura manually and listen for its notification.

## Test one sound notification

1. Create an aura with only a **Fixed Value** trigger.
2. Select **Is NOT Active**, so setup starts with an inactive aura.
3. Add [Play Sound](/en/actions/play-sound) with Ping to **On Enter**. Check its volume with the preview button.
4. Select **Is Active** in Fixed Value.

The aura becomes active and runs On Enter once: you should hear Ping. To repeat, select Is NOT Active, then Is Active again. Actions in **While Active** repeat while the aura remains active; the fixed value itself does not set a repeat interval.

For a visual alternative to the sound, use a [Text overlay](/en/overlays/text) with your own **Content**; [Common Options](/en/overlays/common-options) explains placement and locking. If several auras should follow the same manual switch, keep Fixed Value in one source aura and use [Aura Is Active](/en/triggers/aura-is-active) in the others.

![Fixed trigger state in the older editor](https://s3.eyeauras.net/media/2024/05/EyeAuras_dwDaZIhSanYHVRtK.png)

## Choose a value

| Value | Trigger state |
|---|---|
| Is Active | Stays Active while the trigger runs with this setting. |
| Is NOT Active | Stays Not Active. |
| Not set | Unknown: the condition has no assigned result. This is a distinct state, not another name for Not Active. |

This example has one trigger, so the aura follows its state. With several triggers, the result depends on their combination rule. Unknown participates in that evaluation; it is not a condition that is always ignored.

After testing, replace Fixed Value with a real source such as [Window Exists](/en/triggers/window-exists). If you keep a constant Is Active alongside other conditions, check the combination rule so it does not activate the aura regardless of them.
