---
title: Lineage 2 Default
description: 
published: true
date: 2026-03-30T21:11:11.693Z
tags: 
editor: markdown
dateCreated: 2024-03-15T02:39:36.765Z
---

# Prepare the Scryde pack for Lineage 2

**Scryde autofarm Behavior Tree** is a ready-made autofarm pack for low-rate servers on older chronicles. EyeAuras itself knows nothing about health, targets or rules on your server. The pack does all of that.

The [author's publication](https://eu.eyeauras.net/share/S202403150219539BfeOJ0eRl1q) is **revision 5**. It was made by **linqse** in **EyeAuras 1.4.7520.0** and released on **31 January 2025**. It may not work with the current Lineage 2 client. You need a matching client, your own key assignments in it and an EyeAuras version the pack works with.

## Check the pack before enabling it

1. Download EyeAuras from the [official download page](https://eu.eyeauras.net/download). You can sign in to your account [on the website](https://eu.eyeauras.net/login).
2. Open the publication. Check that it is **Scryde autofarm Behavior Tree** by **linqse** and that the revision is the right one. Read the description before importing.
3. In EyeAuras, open **Import**, paste the link into **Source** and click **Download**. In **Preview**, look at the tree and its dependencies. If you already have the pack, read about [import conflicts and replacement modes](/en/features/export-import) first, or you may replace your working copy by accident.
4. Before enabling anything, look through the pack's window, hotkey and input settings. Wherever there is a **Target Window**, choose your own client window. Check the actual pixels in the [capture preview](/en/triggers/images/imagecapturetriggers).
5. Compare the pack's menu and keys with the table below. Run the pack only after you have checked the window and the actions.

| Revision 5 item | Purpose |
| --- | --- |
| `PageUp` | Opens the pack menu (default key). |
| `Alt+Shift+Z` | Turns the author's auto-hunt on and off. Do not press it until you have checked the settings. |
| `Combat` | Spoil, repeated keys and a summoner variant. |
| `Heal` | Character and summon healing, summon resurrection and two buff groups. |
| `Target Selector` | Next target and skipping a target after a set time. |
| `Alerts` | Reactions to death or a removed buff, and returning to town. |

Following the minimap, ignoring a target and returning to the centre are marked **planned** in this publication. They are not there yet, even if a section with that name is already visible.

## Choose an input mechanism separately

EyeAuras has several ways to send input. [Windows Input and Windows Message API](/en/actions/sendinput/options) have different focus and window requirements. Windows Message API works only with applications that accept those messages.

[TetherScript Driver](/en/actions/sendinput/tetherscript) needs a compatible virtual HID driver installed beforehand. Do not pick an input mechanism by the name of an anti-cheat.

<details>
<summary>Earlier driver and client instructions</summary>

The earlier guide used [HVDK Standard 2.1](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe). It may not suit your version of Windows. The TetherScript guide explains how to prepare the driver now. The old `C:\Program Files (x86)\ControlMyJoystick 5.5.78.50\Driver\Joystick` path belongs to one installation. Do not uninstall drivers on your computer by that path.

If the camera spins by itself after you add a virtual device, the old advice was to turn off `Enable Controller` in `Settings → Configuration`. This applies only to clients that have that setting.

</details>
