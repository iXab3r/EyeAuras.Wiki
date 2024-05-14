---
title: Window Exists
description: activates when a specific window, identified through a window matching expression, is present in the system, and deactivates when the window is no longer found.
published: true
date: 2024-05-14T11:04:33.463Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:51:38.910Z
---

The `**Window Exists**` trigger is designed to monitor the state of a particular window in the system. This trigger activates when the specified window is found in the system and deactivates when the window is no longer present or can't be found.

#### Target Window

This option lets you specify the window that the trigger should monitor. You provide a `**Window Matching Expression**` to define the window. This expression can be specific to the window's title, handle, process, or other characteristics, making it a flexible way to pinpoint the exact window you want to track.

For instance, if you want to monitor a specific web browser window, you could use the title of the webpage as the window matching expression. When that webpage is open in the browser, the `**Window Exists**` trigger will activate, and it will deactivate when the webpage is closed or is no longer the active tab.

You can learn more about `**Window Matching Expressions**` and how to use them effectively in the [_documentation_](https://wiki.eyeauras.net/e/en/window-matching-expressions).

By using the `**Window Exists**` trigger, you can make your EyeAuras configurations responsive to the state of specific windows, creating dynamic, context-aware automation setups.