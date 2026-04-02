---
title: Input Redirection
description: Guide to the Input Redirect feature.
published: true
date: 2024-05-14T19:49:27.174Z
tags: ai-translated
editor: markdown
dateCreated: 2023-08-08T13:40:30.830Z
---
# Input Redirection

If you have used a remote desktop connection such as RDP, you may have noticed that the keyboard or mouse sometimes behaves strangely. In some cases, keys get stuck, and in others, input is not processed at all.

This is especially relevant when the target application is intentionally designed to block input coming from a remote session. For example, **Active Anticheat** does this.

This feature is designed to solve exactly that problem.

**Mouse** redirection is available to everyone, including in the free version of the program.

**Keyboard** redirection is available after purchasing a license for this feature in the [My Profile](https://eyeauras.net/my) section.

## What is it?

When input redirection is enabled, the program monitors all keyboard and mouse input and “replays” it as if it were generated locally.

This is where EyeAuras helps: it supports several different input simulation methods, so you can try them one by one until you find the one that works for your setup.

## Why use it?

- **Working over RDP**: Some applications do not properly recognize your input through remote desktop, or they respond inconsistently.
- **Bypassing RDP protection**: Some games, such as **Lineage II**, actively block remote control of the character. Input redirection works around this by replacing remote input with local input, effectively simulating physical user presence.

## How to use it

To use this feature, open the settings and choose the input simulation method that will be used.

Most of the settings will probably not be necessary for you, but you **must** select **Input Redirect Simulator**.

### Settings

- **Input Redirect Simulator** (**required**): As the name suggests, this is the input simulator used to “replay” your input.
- **Input Redirect Timeout**: Controls how much time must pass between key presses. If you type very quickly and the timeout is set too high, some input may be suppressed and characters may go missing. Increase this value if you experience stuck keys.
- **Input Grace Period**: Another setting for dealing with stuck keys. It controls how much time must pass after releasing a specific key before that same key can be pressed again. Unlike Timeout, this setting works separately for each individual key.
- **Input Redirect Ignored Modifiers**: In some cases, you may want to intercept only mouse clicks or key presses without modifiers, so the remote desktop can correctly handle special operations. These checkboxes let you choose which modifiers should be ignored by the program and passed directly to the system instead of going through the simulator.
- **Input Redirect Logging**: A debugging option that writes key redirection events to the **Event Log** window.

![](/solo46c[1].png)

After you select **Input Redirect Simulator**, a separate control panel for redirection will appear in the lower-left corner. There you can enable or disable keyboard and mouse redirection and view the current settings.

![](/rnpea15[1].png)