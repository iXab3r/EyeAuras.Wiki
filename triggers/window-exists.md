---
title: Window Exists
description: activates when a specific window, identified through a window matching expression, is present in the system, and deactivates when the window is no longer found.
published: true
date: 2024-05-14T11:04:46.600Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:51:38.910Z
---

# Window Exists — detect when a window appears

Use Window Exists to play a notification when Notepad opens. It tracks windows matching an expression: a matching window is found, or no matching window can be found.

The window can be in the background. If foreground focus matters, use [Window Is Active](/en/triggers/window-is-active).

## Notify when Notepad opens

1. Open one Notepad window. Create an aura with only **Window Exists**.
2. Enter `notepad` in **Target Window** and check the matches. If other windows match too, refine the [window matching expression](/en/features/window-matching-expressions).
3. Add [Play Sound](/en/actions/play-sound) with Ping to **On Enter** and check its volume.
4. Close all windows matching the expression. Wait for Not Active.
5. Open Notepad again.

The trigger becomes Active and the aura runs On Enter, playing the sound. Switching to another program does not by itself remove the matching window. Another notification follows only after all matches disappear and a matching window appears again.

![Selecting a target for Window Exists](https://s3.eyeauras.net/media/2024/05/EyeAuras_i1HqMJPIQLu7SC7C.png)

## Target and states

| Setting or state | Meaning |
|---|---|
| Target Window | A window matching expression. It can use titles, processes and other information; plain text is not restricted to title matching alone. |
| Active | A matching window was found and could be selected. |
| Not Active | No matching window exists, or one could not be selected. |

Picking a window from the list may store its temporary handle. Check that expression again after restarting the program. For a notification on each launch, use an expression that can find the program's new window.

Window Exists checks windows, not hidden browser-tab contents. If the expression uses a page title, switching tabs may change the window title and the match result. Use [Text Search](/en/triggers/images/text-search) for text inside a window.
