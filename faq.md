---
title: FAQ
description: Frequently asked questions and answers
published: true
date: 2024-05-20T10:01:14.215Z
tags: ai-translated
editor: markdown
dateCreated: 2023-06-18T19:18:10.638Z
---

# Choose an automation approach and understand its limits

Start with an aura when you know what change you want to notice but have not yet chosen how to react. Many tasks use visual editors for conditions, actions and overlays. C# is useful for custom logic and integrations.

## What should I try first?

1. Describe an observable condition: a window exists, a label appears in a region, or your chosen key combination is pressed.
2. Select its data source and check the result on its own. Screen-based search first needs the correct captured pixels.
3. Add one understandable reaction, such as a sound. [Fixed Value](/en/triggers/fixed-value) lets you test it manually without waiting for an external event.
4. Add a sequence or input only after checking the target window and delivery method in [input options](/en/actions/sendinput/options).

| Your task | Suitable approach |
| --- | --- |
| React to an image, color or label | [Capture](/en/triggers/images/imagecapturetriggers), the corresponding search, then a separate action. This reads pixels, not internal application properties. |
| Notify someone | [Play Sound](/en/actions/play-sound) or [Send To Telegram](/en/actions/send-telegram-message). Discord, TeamSpeak, e-mail or another service needs its own supported integration and credentials; C# support is not a built-in sender for every service. |
| Run ordered work | [Send Sequence](/en/actions/sendinput/send-sequence) for input, [macros](/en/macros/getting-started) for steps and waits, [behavior trees](/en/behavior-trees/gettings-started) for branching and continuation |
| Display your data | [Text](/en/overlays/text), a [Blazor window](/en/scripting/blazor-windows/getting-started) or another supported C# interface |
| Recognize objects with your model | [AI Search](/en/triggers/images/ai-search-trigger), with compatible weights, task, classes and parser layout |
| Develop a larger program | [C# scripting](/en/scripting/getting-started), NuGet and explicit project dependencies; look for examples in the [library](/en/aura-library) |

## Which applications or games are supported?

For a screen workflow, check capture, window matching and input availability. A game name does not guarantee them. Fullscreen mode, minimized windows, application protection, scaling and process privileges can change the result. An emulator such as BlueStacks needs those checks too.

C# and optional modules can use other data sources. Character state, a game API or a world map do not automatically appear in an ordinary script.

Earlier documentation excluded official support for the Lineage 2 servers [E-Global](https://l2e.global) and [MW/Expanse](https://mw-essence.com/en). This is historical support information, not a new policy for every pack. Check the particular distribution's description and [support contacts](/en/contacts).

## Do I need to program?

You can connect many conditions, actions and overlays without C#. For example, recognized text can trigger a sound. Custom navigation, protocols and larger programs require suitable development work; a visual editor does not make them ready-made features.

A top-level C# script receives its host context. Ordinary C# helpers and Razor components do not inherit `Log`, `AuraTree` and other script capabilities as globals. Start with the [script introduction](/en/scripting/getting-started) and pass dependencies explicitly where needed.

## Is EyeAuras free?

The free version has no time limit. Features and limits depend on the license, and optional environment-specific modules can be supplied separately. Check the [official download and feature information](https://eyeauras.net/#downloads) and the pack author's requirements. Registration and a paid license are separate: some network features require an account even when used free of charge.

## Is there a guarantee against detection or bans?

No. Running on the same computer, changing the input method, using hardware or moving capture to another computer does not guarantee invisibility or immunity from penalties. Historical anti-cheat observations do not establish present compatibility. [Security Measures](/en/features/securitymeasures) describes the supported preparation of a protected copy separately.

External capture and a compatible input device form a separate technical setup with real image and command sources. Installing EyeAuras does not create that setup. See the prerequisites for [Tetherscript](/en/actions/sendinput/tetherscript) and [USB2KBD](/en/actions/sendinput/usb2kbd).

## What limits matter in a multi-window setup?

Observing windows and delivering input are different tasks. Capture can have separate sources, while input depends on the selected backend and target application. Serialize work that requires foreground activation so that two scenarios do not fight over focus. There is no universal background-input guarantee.

| Goal | What you need |
| --- | --- |
| Coordinate another instance | A [sender](/en/actions/send-network-message), [receiver](/en/triggers/network-message), Eye Hub access and a configured reaction. Sending “Follow” does not implement movement. |
| Notice an event in another window | A capture method that actually supplies that window's image in the intended state, followed by a condition and notification |
| Start or recover your own process | A defined workflow, for example [Process.Start](/en/scripting/examples/basic/process-start), and checks for the result. A process starting does not mean login or application readiness. |

For one window, you can use only reminders and sounds. Added input can interfere with manual work, so choose its target and timing deliberately. Model compatibility, capture availability, license limits and optional components still apply; there is no unrestricted “any application” mode.

## Can I navigate without a prepared map?

Object detection or segmentation can provide image features. Route selection and movement control remain separate work requiring a suitable model, data and coordinate mapping. There is no built-in “walk to the target” button merely because an object was recognized.

Historical demonstrations by linqse show [minimap segmentation](https://s3.eyeauras.net/media/2024/05/EyeAuras_jtUWInTD7R.mp4), [radar-based navigation](https://www.youtube.com/shorts/XDFpdpHf9yk?feature=share) and [name recognition](https://www.youtube.com/watch?v=xxLbHZXjDcI). They do not supply compatible data and weights for every window.

<details>
<summary>Community scenarios and earlier interfaces</summary>

These examples illustrate user projects. Their game indicators may come from visible UI or that project's own environment; a video does not add those data sources to ordinary EyeAuras.

| Scenario | What must be configured |
| --- | --- |
| Skill or consumable assistance | A visible indicator or supplied state, its condition and a separate reaction; the same applies to HP potions, buffs and defensive skills |
| Notifications | [Telegram alert setup for L2](https://www.youtube.com/watch?v=CxAPlkT8roE); other channels need their own integration |
| Multi-step routines | Each step, wait and completion check, including a route to a vendor or a return to a work area. A list of key presses alone does not navigate. |
| Mini-games | [An automation example](https://www.youtube.com/watch?v=DRZ_BCMg--M), with its own capture and reactions |
| Target selection and rotations | [Auto-target example](https://www.youtube.com/watch?v=eD2aFMZCm4c), [rotation setup](https://www.youtube.com/watch?v=-4XbOpBpo5o) |
| A reaction under the cursor | A small search region and a separately configured action; a neural model needs the appropriate classes and weights |
| Path of Exile | Project-specific flask, skill, buff, warcry, minion, following, Vaal-skill and party-command conditions; these are not built-in game-state APIs or a promise of better efficiency |
| Lineage 2 and other MMOs | Project-specific restoration, targeting, farming, spoil, crafting, lamps, shopping/return, consumables, fishing and gathering/storage workflows. Historical fishing examples included Lineage 2, Lost Ark and Albion. A compatible distribution, server and data determine what works. |
| Extra window behavior | [Muting on minimization](https://www.youtube.com/watch?v=r4oHqHBpj-c), shown with an earlier interface |

An alert example:

![Example notification setup](https://s3.eyeauras.net/media/2024/05/EyeAuras_fRkkvDVUz2IcLGR7.png =x200)

An action sequence in the earlier editor:

![Earlier sequence editor](/assets/legacy/eyeauras_7qwn3ee1ud.png =x100)

A pack can have its own buttons, settings and state display. These community designs use the platform's UI capabilities; they are not the mandatory appearance of an aura:

![Community interface example 1](https://i.imgur.com/iaKm2Br.png)
![Community interface example 2](https://i.imgur.com/HRux7Lu.png)
![Community interface example 3](https://i.imgur.com/f9882rg.png)
![Community interface example 4](https://telegra.ph/file/d83bcbeeac554d2e9b939.png)

| Author and material | Historical project shown |
| --- | --- |
| [linqse's channel](https://www.youtube.com/@eyesquad-cv9ii) | Community EyeAuras projects |
| linqse: [Lineage 2 bot](https://www.youtube.com/watch?v=6dpfccqzR8g) | A configured bot scenario |
| linqse: [AimLab exercise](https://www.youtube.com/shorts/P-dXST17lKQ) | Recognition and reaction |
| linqse: [GTA5 recognition](https://www.youtube.com/watch?v=zSMFl8-kK6U) | Neural recognition in a custom project |
| linqse: [GTA5 gathering](https://www.youtube.com/watch?v=y_WT5siaRvo) | A gathering workflow |
| linqse: [remote control](https://www.youtube.com/watch?v=udIskU5rJSU) | Coordination of a Lineage 2 scenario |
| Quo: [catacombs, 2021](https://www.youtube.com/watch?v=nKzTYwsas4U) | Two windows and a visualization of logic; earlier UI |
| Tony: [Escape From Tarkov prototype](https://www.youtube.com/watch?v=CsOCremAfCc) | Item recognition, valuation and visual markers |

A complete program with custom UI, recognition and behavior is a development project. These examples do not guarantee model quality, performance, development time or readiness on another person's computer.

</details>
