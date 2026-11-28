---
title: FAQ
description: Common questions about EyeAuras. Where to start, what is supported, licensing and multiple windows.
published: true
date: 2024-05-20T10:01:14.215Z
tags: ai-translated
editor: markdown
dateCreated: 2023-06-18T19:18:10.638Z
---

# Choose an automation approach and understand its limits

You know what you want to notice in a window but not how to tie it to a reaction? Start with a simple aura. You do not have to program: a lot can be built from triggers, actions and visual nodes. C# is for custom logic and integrations.

## What should I try first?

1. Describe a condition you can see: a window exists, a label appears in a region, your key combination is pressed.
2. Choose the source and check it on its own first. For the screen, get the right picture of your window before you set up a search.
3. Add one simple reaction, such as a sound. With [Fixed Value](/en/triggers/fixed-value) you can test it by hand without waiting for the event.
4. Only then add a sequence or input to your window. Check where the input goes and how in [input options](/en/actions/sendinput/options).

| Your task | Suitable approach |
| --- | --- |
| React to an image, color or label | [Capture](/en/triggers/images/imagecapturetriggers), then the search you need, then an action. EyeAuras looks at pixels. It does not read the application's internal data. |
| Notify someone | [Play Sound](/en/actions/play-sound) or [Send To Telegram](/en/actions/send-telegram-message). Discord, TeamSpeak, e-mail or another service needs its own integration and credentials. There is no ready-made sender for them, even though C# is available. |
| Run ordered work | [Send Sequence](/en/actions/sendinput/send-sequence) for input. [Macros](/en/macros/getting-started) for steps and waits. [Behavior trees](/en/behavior-trees/gettings-started) for branching and long-running work. |
| Display your data | [Text](/en/overlays/text), a [Blazor window](/en/scripting/blazor-windows/getting-started) or your own C# interface. |
| Recognize objects with your model | [AI Search](/en/triggers/images/ai-search-trigger). You need compatible weights, a task, classes and a parser layout. |
| Develop a larger program | [C# scripting](/en/scripting/getting-started), NuGet and a project with explicit dependencies. Look for examples in the [library](/en/aura-library). |

## Which applications or games are supported?

If you work with the screen, three things matter: whether you get a picture, whether the window you need is available and whether the input method fits. Fullscreen mode, a minimized window, application protection, scaling and process privileges all affect the result. An emulator such as BlueStacks needs the same checks.

EyeAuras can do more than look at the screen: C# and optional modules can take data from other sources. But a game API, character state or a world map will not appear in an ordinary script by themselves.

Earlier documentation did not claim support for the Lineage 2 servers [E-Global](https://l2e.global) and [MW/Expanse](https://mw-essence.com/en). For a particular distribution, read its description or ask [support](/en/contacts).

## Do I need to program?

No. There are editors for conditions, actions, overlays and many behavior branches. For example, you can tie recognized text to a sound without C#. Complex navigation, custom protocols and large programs do need programming skills.

A top-level C# script gets the EyeAuras context. An ordinary C# class or Razor component does not see `Log`, `AuraTree` and the rest as globals, so pass the context and dependencies explicitly. Start with the [script introduction](/en/scripting/getting-started).

## Is EyeAuras free?

You can use EyeAuras for free, with no time limit. Some features and limits depend on the license. Optional modules for specific environments can be supplied separately. Current options and requirements are on the [EyeAuras website](https://eyeauras.net/#downloads). The terms of a particular pack are set by its author. Registration and buying a license are different things: some network features need an account even in the free version.

## Is there a guarantee against detection or bans?

No. Running on the same computer, changing the input method, using a separate computer or a hardware device does not guarantee that you will not be noticed or penalized. Old notes about a particular anti-cheat refer to those versions and say nothing about the current one. [Security Measures](/en/features/securitymeasures) describes how a protected copy of the program is prepared.

External capture with a compatible input device is a separate technical setup. It needs a real image source and a device that accepts commands. Examples of input mechanisms: [Tetherscript](/en/actions/sendinput/tetherscript) and [USB2KBD](/en/actions/sendinput/usb2kbd).

## What limits matter in a multi-window setup?

Watching several windows and sending input to them are different tasks. You can set up a separate image source for each window, while input depends on the mechanism and the application. If the input method needs the window in the foreground, queue the operations: two scenarios must not switch focus to different windows at the same time. There is no universal background input for any application.

| Goal | What you need |
| --- | --- |
| Coordinate another instance | A [sender](/en/actions/send-network-message), a [receiver](/en/triggers/network-message), Eye Hub access and a separate reaction to the message. |
| Notice an event in another window | A capture source and a condition, then a notification. Check that the chosen method really gets the picture when the window is in that state. |
| Start or recover your own process | Your own workflow, for example [Process.Start](/en/scripting/examples/basic/process-start), and explicit checks of the result. |

For one window you can keep just reminders and sounds. Input can get in the way of your own hands, so decide in advance where and when it goes.

## Can I navigate without a prepared map?

Object detection or segmentation gives you features in the picture. The route and movement control are separate work. You will need a suitable model, prepared data and a way to turn the results into coordinates for your scenario.

Old demonstrations by linqse: [minimap segmentation](https://s3.eyeauras.net/media/2024/05/EyeAuras_jtUWInTD7R.mp4), [radar-based navigation](https://www.youtube.com/shorts/XDFpdpHf9yk?feature=share) and [name recognition](https://www.youtube.com/watch?v=xxLbHZXjDcI).

<details>
<summary>Community scenarios and earlier interfaces</summary>

These are examples of use. You still have to set everything up for your own window and version.

| Scenario | What must be configured |
| --- | --- |
| Skill or consumable assistance | A visible indicator, its condition and a separate reaction. The same goes for HP potions, buffs and defensive skills. |
| Notifications | [Telegram alert setup for L2](https://www.youtube.com/watch?v=CxAPlkT8roE). Other channels need their own integration. |
| Multi-step routines | Each step, wait and completion check, including a route to a vendor or a return to a work area. |
| Mini-games | [An automation example](https://www.youtube.com/watch?v=DRZ_BCMg--M). |
| Target selection and rotations | [Auto-target example](https://www.youtube.com/watch?v=eD2aFMZCm4c), [rotation setup](https://www.youtube.com/watch?v=-4XbOpBpo5o). |
| A reaction under the cursor | A search in a small region and a separately configured action. A neural model needs its classes and suitable weights. |
| Path of Exile | User-made conditions for flasks, skills, buffs, warcries, minions, following, Vaal skills and party commands. |
| Lineage 2 and other MMOs | User-made workflows for restoration, targeting, farming, spoil, crafting, lamps, shopping and return, consumables, fishing, gathering and storage. Old fishing examples covered Lineage 2, Lost Ark and Albion. |
| Extra window behavior | [Muting on minimization](https://www.youtube.com/watch?v=r4oHqHBpj-c). |

An alert example:

![Example notification setup](https://s3.eyeauras.net/media/2024/05/EyeAuras_fRkkvDVUz2IcLGR7.png =x200)

An action sequence in the earlier editor:

![Earlier sequence editor](/assets/legacy/eyeauras_7qwn3ee1ud.png =x100)

A pack can have its own interface with buttons, settings and state. The pack author builds it with the platform's UI features. One example:

![Community interface example 4](https://s3.eyeauras.net/media/wiki/faq/d83bcbeeac554d2e9b939.png)

| Author and material | Historical project shown |
| --- | --- |
| [linqse's channel](https://www.youtube.com/@eyesquad-cv9ii) | Community EyeAuras projects |
| linqse: [Lineage 2 bot](https://www.youtube.com/watch?v=6dpfccqzR8g) | A bot scenario |
| linqse: [AimLab exercise](https://www.youtube.com/shorts/P-dXST17lKQ) | Recognition and reaction |
| linqse: [GTA5 recognition](https://www.youtube.com/watch?v=zSMFl8-kK6U) | Neural recognition in a custom project |
| linqse: [GTA5 gathering](https://www.youtube.com/watch?v=y_WT5siaRvo) | A gathering workflow |
| linqse: [remote control](https://www.youtube.com/watch?v=udIskU5rJSU) | Coordination of a Lineage 2 scenario |
| Quo: [catacombs, 2021](https://www.youtube.com/watch?v=nKzTYwsas4U) | Two windows and a visualization of logic |
| Tony: [Escape From Tarkov prototype](https://www.youtube.com/watch?v=CsOCremAfCc) | Item recognition, valuation and visual markers |

You can build a large program with its own interface, recognition and behavior, but that is a separate development project.

</details>
