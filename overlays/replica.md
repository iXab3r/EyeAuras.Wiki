---
title: Replica
description: allows to monitor a window or specific region of it in real-time, within an overlay
published: true
date: 2023-06-18T16:54:28.187Z
tags:
editor: markdown
dateCreated: 2023-06-18T16:54:27.099Z
---

# Replica

Replica Overlay in EyeAuras enables the display of a real-time replica of another window or a specific region of it within an overlay. This can be especially useful when you want to monitor a specific area of a window without keeping the entire window in focus.

You can refer to the common overlay options here: [Common Options](https://wiki.eyeauras.net/en/overlays/common-options)

### Target Window

This option lets you choose which window you'd like to clone. You can specify the target window using the Window Match Expression. More information about Window Match Expression can be found [here](https://wiki.eyeauras.net/en/window-match-expressions).

### Region

This option lets you choose a specific region of the target window that you want to clone. This can be useful when you only want to monitor a part of a window, like a progress bar or a chat box.

### Offset and Anchor

These options are used to determine the final region that gets cloned in the overlay. The Offset and Anchor options modify the Region in a specific way to give you the final area. More information on how these are calculated can be found [here](https://wiki.eyeauras.net/en/coordinate-system).

### Link Aura

This option allows the Replica Overlay to link to another Aura. This is especially useful when you want to create a replica of a region detected by another Aura, such as Image Search. When linked, the Replica Overlay will use the region defined by the linked Aura. If the linked Aura has multiple active regions, the Replica will pick up the first activated one.

### Gaming Applications

1. Clone the mini-map of a strategy game to monitor troop movements without looking away from the main gameplay area.
2. Replicate the chat window of a multiplayer game to keep an eye on team communication while focusing on the game.
3. Clone a region of an inventory window in a role-playing game (RPG) to monitor item usage and availability.
4. Create a replica of the enemy health bar in a boss fight for constant visibility.
5. Mirror the live feed of a security camera in stealth-based games.
6. Clone a speedometer or other vehicle status indicators in racing games for more convenient viewing.
7. Monitor quest updates and objectives in a role-playing game (RPG) without opening the full quest log.
8. Clone a teammate's status in cooperative games to keep track of their health and position.
9. Replicate the cooldown timers for abilities in MOBAs (Multiplayer Online Battle Arena) for better ability management.
10. Clone a section of a strategy game showing resource availability for better resource management.
