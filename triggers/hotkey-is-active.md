---
title: Hotkey Is Active
description: Tracks selected keyboard or mouse input and exposes its trigger state.
published: true
date: 2024-06-22T19:41:02.799Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:24:31.243Z
---

# Hotkey Is Active — start an action with a key

To play a notification with F6, put Hotkey Is Active and Play Sound in the same aura. The trigger tracks the key; the action in On Enter runs when the aura becomes active.

## Try F6 as a toggle

Open your own Notepad window and choose an unused key. This example uses F6; choose another if it is already assigned in your setup.

1. Create an aura with one **Hotkey Is Active** trigger. Some versions spell the name HotkeyIsActive.
2. Keep **Hotkey** set to **Selected** and assign F6 in the combination editor. The older editor opens it with **Edit**.
3. Set **Mode** to **Toggle Trigger state on Click** (Toggle in the older editor). Leave **Suppress Key** off and do not add interception conditions yet.
4. Add [Play Sound](/en/actions/play-sound) with Ping to **On Enter**. Check the volume with its preview button.
5. Switch to Notepad, press and release F6, then press and release it twice more.

The first press enables the trigger and plays Ping. The second disables it silently; the third enables it and plays the sound again. On Enter does not repeat while the trigger stays active. Use **While Active** for a repeating action chain.

In Toggle mode, input in EyeAuras's own windows is ignored by default. Test in Notepad, or enable handling of EyeAuras windows under Advanced to test there. Hold continues to handle input despite this restriction.

![Hotkey settings in the older editor](https://s3.eyeauras.net/media/2024/06/EyeAuras_tamGDBtZFzTqqvoW.png)

## Main settings

| Setting | Effect |
|---|---|
| Hotkey — Selected | Tracks a specific key, combination, mouse button or wheel direction. Use the combination editor for mouse and wheel input; in the older field, double-click with the required button or rotate the wheel. |
| Mode — Hold | Active while the key or button is held. |
| Mode — Toggle Trigger state on Click | Changes state after pressing and releasing: first enables, next disables. Called Toggle in the older editor. |
| Suppress Key | Prevents supported input from reaching other applications. Not every kind of input can be suppressed. Without interception conditions, suppression may also apply outside your intended application. |
| Ignore Ctrl/Alt/Shift | Allows triggering while modifiers are held. This setting resets when the assigned combination itself contains modifiers. |
| Is Pressed | The older editor displays the state and lets you change it manually for a quick check. |

<details>
<summary>Track any key or mouse button</summary>

Instead of Selected, choose an input group. The older editor calls this Tracking Mode.

| Group | Input tracked |
|---|---|
| Any Keyboard key | Any keyboard key. |
| Any Mouse button | Any mouse button. |
| Any Keyboard/Mouse key | Keyboard keys and mouse buttons. |

These groups do not track mouse movement or measure idle time. Assign a wheel direction as a specific combination in Selected.

</details>

## Handle the key only in the intended window

1. Create a separate “Notepad active” aura with [Window Is Active](/en/triggers/window-is-active). Set Target Window to `notepad` and check the matches.
2. In Hotkey Is Active, add “Notepad active” as an Active condition through **Advanced → Interception Condition → Links**.
3. Set **Mode** to Hold. Briefly hold F6 in Notepad, then try it in another program. The notification should occur only in Notepad.

For Toggle, choose what happens when you leave the window:

| Advanced setting | Effect |
|---|---|
| If EyeAuras window is Active | Intercept events allows handling in EyeAuras windows; Ignore all mouse/keyboard input events disables it for Toggle. Hold continues to be processed. Older editor: Handle Even if EyeAuras is Active. |
| Ignore If Hotkey Is Pressed | Allows handling an already-enabled toggle even after the linked condition stops matching, so you can turn it off from another window. It does not bypass the condition when the toggle is off. Older wording: Ignore if Hotkey is set. |
| Automatically deactivate Trigger | Turns off an active trigger when its interception condition stops matching. After returning to the window, enable Toggle again. |

With several links, check their required states and combination rule. Interception conditions control where Hotkey Is Active accepts and suppresses input. They observe the states supplied by your linked auras; they do not create a game-specific condition or an action by themselves.
