---
title: Window Is Active
description:  becomes active when the specified window, identified by a Window Matching Expression, is in the foreground and active. It becomes inactive when the window is minimized or not active, and switches to 'Unknown' if the window is not present in the system.
published: true
date: 2024-05-14T11:05:04.342Z
tags: 
editor: markdown
dateCreated: 2023-06-18T12:12:23.045Z
---

The `**Window Is Active**` trigger is  used to detect whether a specific window, identified by a Window Matching Expression, is in the foreground and active.

### **Overview**

This trigger works in three different states:

1.  **Active**: When the specified window is in the foreground and is currently active, the trigger state is `**Active**`.
2.  **Inactive**: If the window is minimized or not active, the trigger state switches to `**Inactive**`.
3.  **Unknown**: If the specified window is not present in the system at all, the trigger state switches to `**Unknown**`. This means that EyeAuras doesn't have enough information to determine whether the window is active or not.

### **Options**

-   **Target Window**: This option allows you to specify the window you want to check the state for. You can use a Window Matching Expression to define the window. You can learn more about Window Matching Expressions on our [_wiki page_](https://wiki.eyeauras.net/e/en/window-matching-expressions).

### **Example Use Case**

This trigger is a great way to make your workspace more dynamic and adaptive to your current focus. 

-   **FPS Custom Key Binding**: Let's say you have a favorite First-Person Shooter game, such as CS:GO. You want to bind a hotkey that activates an overlay showing a map of the current game level, but only when CS:GO is the active window. You create an aura with the `**Window Is Active**` trigger using the Window Matching Expression for CS:GO. Then, in the hotkey configuration, you link this hotkey to the aura, making it functional only when CS:GO is active.
-   **MMORPG Quick Macros**: For Massively Multiplayer Online Role-Playing Games (MMORPGs) like World of Warcraft, you may have several macros or special actions you frequently use. You can set up auras with the `**Window Is Active**` trigger for World of Warcraft and link each aura to a unique hotkey. These hotkeys can then trigger quick actions or macros, but only when World of Warcraft is the active window.
-   **Racing Game Car Setup**: In racing games like Forza Horizon, you might want a hotkey that opens your car setup or customization menu. You set up an aura with the `**Window Is Active**` trigger for Forza Horizon, and then you link a hotkey to this aura. This hotkey is then functional only when Forza Horizon is the active window.
-   **Fortnite Layout Change**: Let's say you have a particular layout or HUD you want to use specifically when playing Fortnite. You can set the `**Window Is Active**` trigger with the Window Matching Expression matching Fortnite's window. When Fortnite becomes active and is in the foreground, EyeAuras will activate this trigger and load your designated layout.
-   **Streaming Alert**: If you are streaming your gameplay and have a specific alert or effect you want to trigger when you open a particular game, set the `**Window Is Active**` trigger with the Window Matching Expression for that game. When the game becomes the active window, EyeAuras can trigger an alert, start a specific stream layout, or perform any other set action.