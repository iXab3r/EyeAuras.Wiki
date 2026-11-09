---
title: Win Activate
description: brings a specified window to the foreground, streamlining window management for games, workflows, and automated tasks
published: true
date: 2023-06-18T14:44:19.937Z
tags:
editor: markdown
dateCreated: 2023-06-18T14:44:18.831Z
---

# Win Activate — bring an existing window forward

Win Activate brings a matching window to the foreground. For example, it can return you to Notepad without cycling through windows with Alt+Tab.

Open your own Notepad window before setting this up. Leave just one instance open for an unambiguous first result.

## Bring Notepad to the foreground

1. Add **Win Activate** to an aura, for example in **On Enter**.
2. Open the window list in **Target Window** and select Notepad. Check that the expression identifies the intended window.
3. If **Timeout** is available, set it to `1000` ms for the activation attempt.
4. Put another window over Notepad, return to the action editor in EyeAuras and click **Execute** on Win Activate.

Notepad should come to the foreground. This manual run checks the selected target and the action. To call it with a key, add [Hotkey Is Active](/en/triggers/hotkey-is-active) to the same aura, choose an unused key and Hold mode. Pressing it then runs On Enter, including Win Activate.

## Settings

| Setting | Effect |
|---|---|
| Target Window | Chooses a window using a [window matching expression](/en/features/window-matching-expressions). Start by selecting an existing window from the list. |
| Timeout | Time allowed for an activation attempt, in milliseconds. It does not wait for a program to launch or guarantee the operation's total duration. |

Selecting from the list may store a window handle, its temporary identifier. Closing and reopening the program changes it. For a lasting setup, use an appropriate title or process expression and check the matches; a broad expression may pick another window.

Windows can restrict bringing another window to the foreground. If activation has no visible result, check the target first. [Window Exists](/en/triggers/window-exists) tracks whether it is present; [Window Is Active](/en/triggers/window-is-active) checks whether it is in the foreground.
