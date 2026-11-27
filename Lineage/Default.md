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

The **Scryde autofarm Behavior Tree** pack was published for low-rate servers using older chronicles. Start by checking the pack's version and contents. EyeAuras does not acquire built-in knowledge of every server's health, targets or rules from the Lineage 2 page name.

The [author's publication](https://eu.eyeauras.net/share/S202403150219539BfeOJ0eRl1q) identifies **revision 5**, created with **EyeAuras 1.4.7520.0** and released on **31 January 2025** by **linqse**. The steps below describe that historical pack. They require a matching client, its own key assignments and an EyeAuras version compatible with the pack; current compatibility and availability of a working pack cannot be inferred from its public description.

## Check the pack before enabling it

1. Obtain EyeAuras from the [official download page](https://eu.eyeauras.net/download). Use [website sign-in](https://eu.eyeauras.net/login) for your account. License requirements depend on the functions and pack access you use, not simply on the game's name.
2. Open the publication and compare the name **Scryde autofarm Behavior Tree**, author **linqse** and revision. Read its description before importing. A share page or download redirect alone is not the configuration itself.
3. In a compatible EyeAuras build, open **Import**, paste the link into **Source**, then click **Download**. Inspect **Preview**, the tree and its dependencies. If you already have the pack, review [import conflicts and replacement modes](/en/features/export-import) before adding another copy.
4. Before enabling actions, inspect the pack's window, hotkey and input settings. Where **Target Window** is used, choose your own client window. Check the actual pixels in the [capture preview](/en/triggers/images/imagecapturetriggers); matching a title does not establish the right region or input target.
5. Compare the menu and key assignments with the table below. Only proceed to operation in a matching environment after checking the recipient and actions. Another revision may expose different controls.

The preparation result is a specific pack revision with understood contents and a selected source window. Importing a configuration does not demonstrate that it works on your server or supply a game's internal data automatically.

| Revision 5 item | Documented purpose |
| --- | --- |
| `PageUp` | Default pack menu key. |
| `Alt+Shift+Z` | Toggles the author's auto-hunt workflow; check its actions before using it. |
| `Combat` | Spoil, repeated keys and a summoner variant. |
| `Heal` | Character/summon healing, summon resurrection and two buff groups. |
| `Target Selector` | Next target and skipping a target after a configured time. |
| `Alerts` | Responses to death or a removed buff, and returning to town. |

Following the minimap, ignoring a target and returning to the centre are marked **planned** in this publication. Their names do not establish implemented features. Conditions depend on the pack's actual nodes, scripts and prepared client data.

## Choose an input mechanism separately

[Windows Input and Windows Message API](/en/actions/sendinput/options) have different target and focus requirements. Message delivery only helps when the recipient accepts those messages. Neither mechanism promises input to every background or minimized window, and a capture selector does not automatically configure action routing.

[TetherScript Driver](/en/actions/sendinput/tetherscript) requires a compatible virtual HID driver prepared for that environment. Choosing a mechanism by an anti-cheat's name is not a compatibility test or permission from a server.

<details>
<summary>Earlier driver and client instructions</summary>

The earlier guide linked [HVDK Standard 2.1](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe). That historical installer is not a universal Windows prerequisite; follow the TetherScript guide for the relevant supported setup. The old `C:\Program Files (x86)\ControlMyJoystick 5.5.78.50\Driver\Joystick` path belongs to one installation, not a general instruction to run an administrator uninstall script on any computer.

For older clients whose camera spun after adding a virtual device, the guide suggested disabling `Enable Controller` in `Settings → Configuration`. This applies only to clients exposing that setting and does not diagnose every source of unwanted input.

</details>
