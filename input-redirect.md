---
title: Input Redirect
description: 
published: true
date: 2024-05-14T11:15:42.619Z
tags: 
editor: markdown
dateCreated: 2023-08-08T13:46:03.524Z
---

### **Input Redirection**

If you've worked with a remote desktop, like through RDP, you might have noticed occasional quirks with the keyboard or mouse. In some cases, keys might get stuck or not register at all.

This can be particularly frustrating if the software developer intentionally made input methods through remote connection fail, like the Active Anticheat protection.

That's where this feature comes in handy.

Mouse **redirection** is available to everyone, even in the free version of the program.

Keyboard **redirection**, however, is accessible after purchasing a license in the "My Profile" section.

### **What?**

When input redirection is enabled, the program monitors all keyboard and mouse presses and "mimics" them as if they were real. EyeAuras supports several different input simulation methods, so you can cycle through them to find the one that best solves your problem.

### **Why?**

-   **Working with RDP**: Sometimes, applications via a remote desktop don't "understand" your inputs or behave irresponsively.
-   **Bypassing RDP Protections**: Some games, for instance, Lineage II, actively prevent users from remotely controlling characters. Input redirection circumvents this protection by replacing remote input with local input, simulating the user's presence.

### **How?**

To use this feature, head to the settings and choose the input simulation method to use. While most of the settings might not be relevant to you, selecting the Input Redirect Simulator is a must.

**Settings:**

-   **Input Redirect Simulator (mandatory)**: As the name suggests, it's the input simulator used to "forge" your inputs.
-   **Input Redirect Timeout**: Determines the time interval between key presses. If you type too quickly and the Timeout is set too high, some input parts might be "suppressed", causing characters to vanish. Increase this parameter if you experience sticky keys.
-   **Input Grace Period**: Another tool against sticky keys. It sets the time after releasing a specific key before it can be pressed again. Unlike Timeout, this parameter applies individually to each key.
-   **Input Redirect Ignored Modifiers**: Sometimes, you may want to capture only mouse/keyboard key presses without modifiers so that the remote desktop can correctly process special operations. This set of checkboxes lets you decide which modifiers will be ignored by the program and bypassed by the simulator.
-   **Input Redirect Logging**: A debugging parameter that logs redirection events to the Event Log window.

![](/solo46c[1].png)

After selecting the **Input Redirect Simulator**, a separate control panel for managing redirection will appear in the bottom left. Here, you can toggle the redirection for the keyboard/mouse and view the current settings.

![](/rnpea15[1].png)