---
title: Window Is Active
description: Checks whether a matching window is in the foreground. Missing windows return Not Active.
published: true
date: 2024-05-14T11:05:55.872Z
tags: 
editor: markdown
dateCreated: 2023-06-18T12:12:23.045Z
---

# Window Is Active — react when you return to a window

To hear a notification when you return to Notepad, use Window Is Active. It checks whether a matching window is in the foreground. Add the sound or another response separately.

## Notify when Notepad gains focus

1. Open Notepad. Create an aura with one **Window Is Active** trigger.
2. Enter `notepad` in **Target Window** and check the matches. Keep one Notepad window for the first example.
3. Add [Play Sound](/en/actions/play-sound) with Ping to **On Enter**. Check its volume with the preview button.
4. Switch to another program, then return to Notepad with Alt+Tab or by clicking its window.

When Notepad comes to the foreground, the trigger becomes Active and the sound plays. Switching away makes it Not Active. On Enter does not repeat while Notepad stays in the foreground.

![Selecting a target for Window Is Active](https://s3.eyeauras.net/media/2024/05/EyeAuras_TntB9EP1WPMvNOEe.png)

## Target and states

| Setting or state | Meaning |
|---|---|
| Target Window | A [window matching expression](/en/features/window-matching-expressions). With several matches, the condition is true when one of them is in the foreground. |
| Active | The foreground window is in the matching list. |
| Not Active | Another window is in the foreground, there are no matches, or the current window could not be determined. Closing Notepad also gives Not Active. |

A missing window does not mean Unknown here. Unknown may occur before a trigger is running or when it is disabled, but it is not the result of checking that a window has closed.

## Restrict a hotkey to one application

Create a separate aura with Window Is Active and the chosen target. In another aura's [Hotkey Is Active](/en/triggers/hotkey-is-active), add that aura through **Interception Condition → Links**. This controls when the key is processed. Simply adding two triggers to one aura does not replace an interception condition.

If you only need to know that the program is open while you work elsewhere, use [Window Exists](/en/triggers/window-exists).
