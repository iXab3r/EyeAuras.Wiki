---
title: Learning Curve or What to do next?
description: 
published: true
date: 2024-05-14T11:15:35.827Z
tags: 
editor: markdown
dateCreated: 2023-09-28T14:13:00.761Z
---

So, you've looking for something that you can do or try next ? 

I'll try to give you few ideas. All items are ordered by difficulty, the deeper you dive, the darker it becomes :)

-   **Basics** 
    -   how to [send input](/en/actions/sendinput/send-input) or [send sequences of inputs](/en/actions/sendinput/send-sequence), how to [search for images](/en/triggers/images/image-search), how to [link auras together](/en/triggers/aura-is-active) to create more complex conditions
-   [**Default propeties**](/en/default-properties)  / [**Enabling conditions**](/en/enabling-conditions)
    -   These are more of a quality of life things, you can live without using them, but they can make configuration and setting things up much-much easier
-   [Text search using OCR](/en/triggers/images/text-search) - this allows to convert images into text (e.g. get health numbers or some stat value, or item name). So you can write a condition "use health potion when my hp is less than 8584". Or "send notification when my character picks up item with some stat on it". Previous iteration of OCR used Tesseract and proven to be almost unusable due to performance requirements. I've recently (two days ago, in fact) added a new OCR engine, which seems to be up to 10(!) times faster in some cases, so this is now a very real option and tool in your arsenal
-   How to apply effects to images, how to click on images using "Link aura" (not bindings!)
    -   Not a lot of information about this, unfortunately, I will work on adding more. Effects are kinda obvious - this functionality allows to transform input image for better searchability
-   [Network messages](/en/actions/send-network-message) to orchestrate multiple characters simultaneously
    -   This mechanism allows you to build communication between multiple instances of EyeAuras running on different PCs. You can use triggers/actions to send different commands to other instances of EyeAuras to do something (cast some skill, follow or unfollow you, etc). I know that one of the groups using EyeAuras are using this mechanism to multi-box in PoE - one-man army, so to speak :) They play as one character and use EyeAuras to control a bunch of support characters that follow them, enter portals and do their support thing via network messages.
-   [Telegram messages](/en/actions/send-telegram-message) - you can configure remote control via you phone, for example. Start/stop farm, get information via Telegram when something cool drops, get notification when you're killed, etc
    -   Quite easy to configure and very powerful for games such as Lineage 2 Essence or any other game where there is some kind of auto-farm built-in into the game
-   Get a hang on [Text Match expressions](/en/text-match-expressions) (https://wiki.eyeauras.net/en/text-match-expressions)
    -   these are supported in all places of a program where you work with text. In most cases usual matching by value will suffice, BUT you can always use either regular expressions OR leverage C# (e.g. convert text to number and compare it with some value or parse item stats and scan it for a specific line in it)
-   Deep dive into [Bindings](/en/bindings)
    -   These allow you to make your aura pack extremely flexible by linking inputs and outputs of different triggers and actions together
        -   E.g. you want to search for something in one area of the screen (look for an item in inventory, for example). But resolution could be different, inventory window position could be different so it is not possible to hard-code search region in your triggers. There are multiple solutions:
            -   without bindings - ask user to select region manually inside a program. This may be really inconvenient in most cases.
            -   with bindings - create a single aura that holds position of an inventory (still selected manually) and BIND all auras which want to search for something in an inventory to this aura. Now instead of changing everywhere you can change it in 1 place and that is it
            -   even more advanced - you still have an aura which holds coordinates of an inventory, but instead of selecting area in a program manually you can create a rectangular transparent Text overlay, which, when dragged around, will send its coordinates to aura, notifying about updated position. Now, instead of selecting inventory area inside a program, user is doing it without ever working with eyeauras directly
            -   aaaand even more advanced - create a hotkey, which will unlock a bunch of overlays, each allowing user to drag it to some area (inventory, health globe, Skill#1, Skill#2, etc), "Config mode" so to say. This way you can create extremely universal setup of auras which will require a minute to setup even for different resolutions
        -   Bindings are extremely powerful as they allow you to access aspects of triggers/actions which are not exposed on UI.
-   [Machine learning](/en/triggers/images/ai-search-trigger)
    -   This is just next level of image processing. It is up to **100**(!) times faster than Image Search in some cases, it is much more versatile and infinitely more flexible as it can search for literally ANY object under ANY angle given enough training data.  This requires you to spend some time on understanding how to train the model and prepare it for EyeAuras to consume.
    -   ML may be a bit overwhelming at first, that is why I am developing another program, which will greatly reduce the complexity of bulding a model. It is in very early stages yet and I do not have any guides for it in english, but I recorded one video in russian which demonstrates how to find literally ANYTHING using this approach (subtitles ftw, if you'll decide to jump in :) )
    -   **This is definitely THE future and opens up huge possibilities for automation, especially if you combine it with scripting**
-   [C# scripting](/en/overlays/custom-ui)
    -   This is the ultimate weapon which does not have any restrictions and allows you to leverage everything that EyeAuras has to offer. Realistically, current UI has its flaws - performance, accessibility, etc. Scripting allows you to overcome this and use the core functionality directly, which is where the program shines - quick and effective image processing, sending inputs, etc
        -   Unfortunately, this requires coding skills and it may be a show stopper for many. I will work on adding intermediary steps (e.g. [behavior trees](https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control)#:~:text=Article%20Talk,tasks%20in%20a%20modular%20fashion) will come quite soon) - these will allow to configure more complex stuff than the current approach (trigger-onenter-whileactive-onexit). But, never I'll be able to make the program as flexible as it could be when using C# scripting )