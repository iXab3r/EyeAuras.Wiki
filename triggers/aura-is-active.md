---
title: Aura Is Active
description: 
published: true
date: 2024-05-14T10:30:13.760Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:41:10.436Z
---

# Aura Is Active — combine existing conditions

Suppose a notification should play only when Notepad is open **and** you have enabled a manual switch. Aura Is Active combines those conditions from two separate auras. A third aura observes them and plays the sound.

## Combine a window check and a switch

1. Create “Notepad open” with one [Window Exists](/en/triggers/window-exists). Set **Target Window** to `notepad` and check the matches. This aura needs no actions.
2. Create “Allow notification” with one [Fixed Value](/en/triggers/fixed-value), initially **Is NOT Active**.
3. Create “Notification allowed”. Add **Aura Is Active** and use **Links** to select the two previous auras. Leave the required state of both links as Active.
4. Set **Logical operator** to **All must match (AND)**. Add [Play Sound](/en/actions/play-sound) with Ping to **On Enter** and check the volume.
5. Open Notepad, then set “Allow notification” to Is Active.

Both conditions now match: “Notification allowed” becomes active and plays the sound. Turn off the manual switch or close all matching windows, and the combined aura becomes inactive. The next time both conditions match, the sound plays again.

To keep the combined result visible, add a [Text overlay](/en/overlays/text) to “Notification allowed” and enter your own message in **Content**. It shows while that aura is active; [Common Options](/en/overlays/common-options) covers locking and normal visibility checks outside the editor. The linked auras still only supply the conditions.

![Aura Is Active links in the older editor](https://s3.eyeauras.net/media/2024/05/EyeAuras_83uLM0FmkdR4pgvJ.png)

## Link settings

| Setting | Effect |
|---|---|
| Links | Selects linked auras or folders. Use two specific auras for the first example. |
| Required state of a link | Selects which state counts as a match. The example requires Active for both links. |
| Logical operator — All must match (AND) | Requires every link to match. Older editor: All Conditions (AND). |
| Logical operator — At least one must match (OR) | Requires at least one link to match. Older editor: At Least One (OR). |

With OR, the example allows the notification when Notepad is open **or** the switch is enabled. Keep AND if both are required.

This trigger observes states; it does not call actions in the linked auras. Use [Execute Actions](/en/actions/execute) to call an existing chain.

With no links, Aura Is Active is inactive. A linked aura in Unknown does not satisfy an Active requirement; in AND mode, that uncertainty prevents activation. Build links from source conditions towards the final result, without circular dependencies.
