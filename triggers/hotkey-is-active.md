---
title: Hotkey Is Active
description: detects and responds to the activation of a specific keyboard/mouse events
published: true
date: 2024-06-22T19:40:33.605Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:24:31.243Z
---

## **Description**

"HotkeyIsActive" is a trigger that monitors specific keyboard or mouse input. This can be especially useful in various situations, such as gaming, where a user might want to automate certain repetitive tasks or complex actions with a single key press. It also provides an easy way for users to execute commands in applications or systems that otherwise don't offer customizable hotkey support.

![HotkeyIsActive trigger](https://s3.eyeauras.net/media/2024/06/EyeAuras_tamGDBtZFzTqqvoW.png)

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

### **Handle Even if EyeAuras is Active**

By default, EyeAuras doesn't react to hotkeys when its windows are active to avoid accidental triggering. Enabling this option allows the hotkey to be processed under any circumstances. This is particularly handy if you want the hotkey to remain active when a Custom UI overlay is active and focused by the user.


## Interception conditions
In fact, they have existed for ages (multiple years at this point), but they were not given enough publicity despite the fact that they are extremely useful in some cases.
All-in-all, this mechanism is directly responsible for enabling/disabling hotkeys handling at any given moment. By adding one or multiple auras you can specify exact set of conditions, which must be met before Trigger will start doing anything. 

For example, by linking Aura which has [WindowIsActive](/en/triggers/window-is-active) in it, you will make Trigger react only to keys which were pressed while game window is active.
In more complex cases, you can link the trigger to some in-game condition, for example, you when you click RMB(part of HotkeyIsActive configuration) **AND** some powerful skill is off-cooldown(linked condition), instead of casting whatever is usually on RMB, you'll simulate key press of a button which casts that skill. A good example would be automating cast of Vaal Skills on Path of Exile - you have the usual version of a skill bound to some button which you spam and whenever Vaal version got enough souls, it will be automatically release without you having to remember about it.

To better understand why two next options are needed, let me provide an example:
I have HotkeyIsActive tracking presses of `F3` in `Toggle mode`, meaning that when I first press on `F3`, trigger `activates` and to `deactivate` it I have to do a second press. Very simple and very useful to enable/disable some more complex auras (like auto-potions). Also I've set the option `Suppress Key` which blocks `F3` from reaching game window at all - otherwise the game could react to something bound to `F3`. What is bad in this configuration is that if I leave it as is, `F3` would be blocked in all applications, not only in my game - not really convenient, if you ask me. 
To fix that, I can add `Interception condition` with [WindowIsActive](/en/triggers/window-is-active) and this will restrict `F3` to that single game window. Kinda works, but there are two problems with this:

### Interception conditions - Ignore if Hotkey is set
**Problem:** 
To disable HotkeyIsActive, I now have to have game window to be in focus. So if I want to disable _something_ that is bound to `F3`, I have to activate game window first. If that `F3` enabled some kind of an aggressive clicker, getting your window back to foreground could be challenging at times. 

**Solution:** 
By setting this option, you can now make it so **enabling** the trigger can be done only while game window is active, but **disabling** it could be done from anywhere. Forgot to turn off your clicker before alt-tabbing? Not a problem, just hit `F3` again and the trigger will be disabled. 
Note that this option will have effect only if toggle is currently active.

### Interception conditions - Automatically deactivate Trigger
**Problem:**
There is no way to quickly disable HotkeyIsActive - you have to click the button. In some cases this is not very convenient - you have to remember that some automation currently runs. You alt-tab and forget about it. Then, out of nowhere, some trigger condition kicks in and you start doing something in the game. That could lead to problems.
 
**Solution:**
Just set this new option. Now, if trigger interception condition is no longer met, the trigger will automatically deactivate itself. In our example, if I alt-tab out of game window, the whole functionality that is powered by `F3` will be deactivated. Note that you'll have to enable it back on again after you alt-tab back to the game. By having this option enabled you can make the overall system much more resistant to human errors.


### Gaming applications

**Creating Game Shortcuts**: In certain video games, you may have complex key sequences that need to be executed quickly. With HotkeyIsActive, you can assign a single hotkey to automate these sequences. For instance, if you need to press "Ctrl + Shift + 5" to cast a particular spell in a game, you can set a hotkey like "F1" to perform this action, saving you time during crucial gameplay moments.

**Automating Repetitive Tasks**: If there's a specific action you perform regularly in a software, like saving a file (Ctrl + S) or refreshing a page (F5), you can use HotkeyIsActive to assign a more convenient hotkey for these actions, reducing the strain on your hands and increasing your productivity.

**Quick Access to Frequently Used Programs**: You can set up a hotkey to launch your most commonly used applications. For example, you could set up 'Ctrl + Alt + T' to open your preferred text editor or 'Ctrl + Alt + B' to open your web browser.

**Contextual Actions**: By linking a hotkey with another aura, you can create contextual actions. For example, in a design software, you might want 'Ctrl + Z' to act as an undo function when you're working on the canvas but as a zoom out function when you're navigating the workspace. By creating two auras with 'Ctrl + Z' as the hotkey and linking each to different contexts (canvas and workspace), you can achieve this functionality.