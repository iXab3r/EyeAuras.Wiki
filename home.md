---
title: Home
description: EyeAuras is a software tool designed to create and manage "auras," which are scripts or functions that can automate tasks, process data, or enhance user interaction with their computer or applications
published: true
date: 2024-05-14T19:41:27.656Z
tags: 
editor: markdown
dateCreated: 2022-11-15T15:02:45.417Z
---

![](/mainfull.png)

EyeAuras is [computer-vision](/triggers/images/imagecapturetriggers) and [machine-learning](/triggers/images/ai-search-trigger) powered [clicker](/actions/sendinput/send-sequence) that can analyze anything that happens on the screen and perform actions such as [mouse movement](/actions/sendinput/send-sequence) and [keyboard](/actions/sendinput/send-sequence) presses on your behalf. It can also make sounds, [send messages to Telegram](/actions/send-telegram-message) and [across the Internet](/actions/send-network-message) and even [execute C# scripts](/scripting/getting-started)!

![](https://eyeauras.net/assets/img/appimages/EyeAuras_4GhOU01VKp.png =x600)

## Main concept

-   **Aura** \- combination of Triggers, Actions, Overlays and Enabling conditions. This is what you'll share with others, and this does the actual work.
-   [Enabling conditions](/en/enabling-conditions)
-   **Triggers** \- any kind of state which could be described in Active/NotActive terms. This could be Hotkey (pressed/unpressed or toggle),  foreground Window check (active/not active), Image/Text/Color search result(matched/not matched).  Aura Active/NotActive state is a combination of states of her child Triggers. Trigger has three states:
    -   Active - this means that condition is met, e.g. for WindowIsActive trigger this means that Window with matching title is Active
    -   Not Active - this means that conditions is not met
    -   Unknown - this means that for some reason it is not possible to calculate trigger state. For example, if Window specified in ImageSearch is not found that means that corresponding Trigger will have Unknown state as it is not possible to do comparison without any actual image.
-   **Actions** \- showing notifications, key/mouse presses, sending Telegram messages  or e-mails - these all is considered an Action and could be used inside Aura. Actions could be assigned to one of 3 groups:
    -   On Enter -  these are executed when Aura becomes Active
    -   While Active - these will be executed repeatedly while Auras is Active
    -   On Exit - these are executed when Aura becomes Not Active
-   **Overlays** \- always-on-top overlays which could show text, image, custom UI or anything else. Overlays are a part of Aura and are shown only while Aura is Active

### Subsystems

-   [Export/Import](/features/export-import) - transfer, share, or backup EyeAuras packs across different users or devices
-   [Aura Library](/aura-library) - a shared collection of EyeAuras packs, available for users to discover, import, and use
-   [Window Match Expressions](/features/window-matching-expressions) - enabling selection of specific windows using a custom expression
-   [Text Match Expressions](/features/text-match-expressions) - Powerful tool enabling text condition validation through Regex, Text, and Lambda evaluators.
-   [Bindings](/features/bindings) - interconnect properties between triggers, actions, and overlays to allow for easier change of group properties and to open up new capabilities
-   [Default Properties](/features/default-properties)

### Triggers

-   [Fixed Value](/en/triggers/fixed-value) - the most primitive trigger, you can control it's state by selecting it either manually or by using C# scripts
-   [Color Search](/en/triggers/images/color-search) - active when Average color of a selected region matches with Target color. Similarity threshold could be specified.
-   [**Image Search**](/en/triggers/images/image-search) - active when some Image is found with a specified similarity
-   [**AI/ML Search**](/en/triggers/images/ai-search-trigger) \- machine-learning powered [object detection](https://docs.ultralytics.com/tasks/detect/)/[segmentation](https://docs.ultralytics.com/tasks/segment/) or [classification](https://docs.ultralytics.com/tasks/classify/), currently supports only [**Yolo8**](https://docs.ultralytics.com/) **in ONNX format**, may be extended later
-   [**Text Search**](/en/triggers/images/text-search) - active when recognized text matches with specified expression. It could be comparison by Contains, regexp or C# Lambda
-   [**Aura Is Active**](/en/triggers/aura-is-active) - active when linked Auras have specified state (Active/NotActive)
-   [**Hotkey Is Active**](/en/triggers/hotkey-is-active) - active when specified combination of keys is either held down or toggled
-   [**Window Is Active**](/en/triggers/window-is-active) \- active when window matching specified expression is active (in foreground)
-   [**Window Exists**](/en/triggers/window-exists) - active when window matching specified expression exists in the system
-   [**Timer**](/en/triggers/timer) \- periodically activates itself for specified duration
-   [**Message Subscription**](/en/triggers/network-message) - activates/deactivates when specified message is received from EyeAuras webserver. Messages are separated by Channels and could be sent using SendMessage action
-   [**File Contains**](/en/triggers/file-contains-text) - activates when specified text is found in specified file
-   [**Telegram Subscription**](/en/triggers/telegram-message) - activates/deactivates when specified message is received in Telegram channel
-   [**Volume Control**](/en/triggers/volume-level) - activates/deactivates when volume level of specified audio device or process reaches specified threshold
-   [**C# Script**](/en/scripting/getting-started) \- custom scripts that use the latest version of C# language with full access to internal EyeAuras API. As soon as API will be stabilized there will be examples/docs.

### Actions

-   [**Send**](/en/actions/sendinput/options) \- emulates user input - mouse movement, clicks, keyboard presses, etc. Supports multiple input methods starting from most basic ones that are used WinAPI and all the way to hardware-level emulation that uses Usb2Kbd physical device.
    -   [Input](/en/actions/sendinput/send-input) \- generates single keyboard/mouse event
    -   [Text](/en/actions/sendinput/send-text) - inputs specified text either via clipboard or by typing each character individually
    -   [Sequence](/en/actions/sendinput/send-sequence) - replayed the specified sequence of keyboard presses, mouse clicks and mouse movements
-   [**Play Sound**](/en/actions/play-sound) - plays specified sound
-   [**Win Activate**](/en/actions/win-activate) - activates specified window
-   [**Delay**](/en/actions/delay) \- waits for some time before proceeding to the next action
-   [**Send To Telegram**](/en/actions/send-telegram-message) - sends message to Telegram channel
-   [**Send Message**](/en/actions/send-network-message) - sends network message through EyeAuras infrastructure to a specified Channel. All other instances of EyeAuras on other computers can subscribe and process these messages via Message Subscription trigger
-   **C# Script** \- custom scripts that use the latest version of C# language with full access to internal EyeAuras API. As soon as API will be stabilized there will be examples/docs.

### Overlays

-   [**Text**](/en/overlays/text) \- shows text, content could be modified either manually or using C# scripts
-   [**Image**](/en/overlays/image) \- shows an image, animated/transparent GIFs are supported
-   [**Replica**](/en/overlays/replica) \- created a real-time visual clone of any specified window or its subregion. This allows you to clone parts of UI (e.g. bring cooldowns closer to the middle of you screen) or show downsized version of YouTube player while farming
-   [**Dependencies Viewer**](/en/overlays/dependencies-viewer) \- debugging tool which could be used to check what states linked Auras have. Very useful for debugging complex models.
-   [**Custom UI**](/en/overlays/custom-ui) \- allows you to develop a full-blown custom user interface using combination of [Microsoft Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-7.0&tabs=visual-studio) (html+css+js) and **C#** to wire it all together inside EyeAuras