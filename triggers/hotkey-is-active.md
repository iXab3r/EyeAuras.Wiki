---
title: Hotkey Is Active
description: detects and responds to the activation of a specific keyboard/mouse events
published: true
date: 2024-06-19T21:39:31.019Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:24:31.243Z
---

## **Description**

"HotkeyIsActive" is a trigger that monitors specific keyboard or mouse input. This can be especially useful in various situations, such as gaming, where a user might want to automate certain repetitive tasks or complex actions with a single key press. It also provides an easy way for users to execute commands in applications or systems that otherwise don't offer customizable hotkey support.

![HotkeyIsActive Trigger](https://s3.eyeauras.net/media/2024/06/EyeAuras_4xBdABI0eUEK2BvL.png)

## **Configuration Options**

### **Is Pressed**

This checkbox displays the current state of the trigger. You can toggle it manually if needed, primarily for debugging purposes.

### **Tracking Mode**

An additional option available within the HotkeyIsActive trigger is the 'Tracking Mode'. This setting allows you to switch from tracking a specific hotkey to monitoring any keyboard, mouse input, or even mouse movement.

-   **Selected:** Default mode, tracks only specified key combination
-   **Any Keyboard key**: This mode will activate the trigger whenever any key on the keyboard is pressed. This is useful when you need to monitor the general activity on the keyboard, rather than a specific hotkey.
-   **Any Mouse button**: Similar to the "Any Key" mode, this will activate the trigger whenever any mouse action is performed, including left and right click, wheel scroll, etc.
-   **Any Keyboard/Mouse key:** tracks any event related to user inputs

This functionality is particularly useful for configuring a trigger that can detect when a user has stopped interacting with their PC, making it a great tool for setting up automated tasks during periods of user inactivity.

### **Hotkey**

A text field where you can specify the key combination to be monitored. Click the **Edit** button to change the hotkey. If you need to monitor mouse clicks or wheel actions, hover onto the edit field and double-click with the respective mouse button or rotate the wheel.

### **Hotkey Mode**

Choose the behavior of the hotkey:

-   **Toggle**: The trigger alternates between active and inactive states each time the hotkey is pressed and released.
-   **Hold**: The trigger activates when the hotkey is held down and deactivates when it is released. This is particularly useful for tasks that should only occur while the key is being held.

### **Suppress Key**

EyeAuras can prevent some key presses from being detected by other applications in the system. This makes the key combination exclusive to EyeAuras, avoiding accidental actions in other apps. This feature is implemented using Windows Hooks, however, not all types of key/mouse presses can be suppressed.

### **Link Aura**

This feature allows you to link another Aura to this trigger. The hotkey will be tracked and suppressed only when the linked Aura(s) are active. This functionality allows for the creation of context-dependent hotkeys, enabling different outcomes for the same key press based on the active Aura. For instance, your right mouse click could perform various tasks depending on the context.

### **Handle Even if EyeAuras is Active**

By default, EyeAuras doesn't react to hotkeys when its windows are active to avoid accidental triggering. Enabling this option allows the hotkey to be processed under any circumstances. This is particularly handy if you want the hotkey to remain active when a Custom UI overlay is active and focused by the user.

### Gaming applications

**Creating Game Shortcuts**: In certain video games, you may have complex key sequences that need to be executed quickly. With HotkeyIsActive, you can assign a single hotkey to automate these sequences. For instance, if you need to press "Ctrl + Shift + 5" to cast a particular spell in a game, you can set a hotkey like "F1" to perform this action, saving you time during crucial gameplay moments.

**Automating Repetitive Tasks**: If there's a specific action you perform regularly in a software, like saving a file (Ctrl + S) or refreshing a page (F5), you can use HotkeyIsActive to assign a more convenient hotkey for these actions, reducing the strain on your hands and increasing your productivity.

**Quick Access to Frequently Used Programs**: You can set up a hotkey to launch your most commonly used applications. For example, you could set up 'Ctrl + Alt + T' to open your preferred text editor or 'Ctrl + Alt + B' to open your web browser.

**Contextual Actions**: By linking a hotkey with another aura, you can create contextual actions. For example, in a design software, you might want 'Ctrl + Z' to act as an undo function when you're working on the canvas but as a zoom out function when you're navigating the workspace. By creating two auras with 'Ctrl + Z' as the hotkey and linking each to different contexts (canvas and workspace), you can achieve this functionality.