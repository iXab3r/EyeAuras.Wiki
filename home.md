---
title: Home
description: EyeAuras is a software tool for creating and managing auras, scripts, and features that automate tasks, process data, and improve interaction with your computer and applications
published: true
date: 2026-04-25T12:40:21.080Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-15T15:02:45.417Z
---
![](/mainfull.png)

# EyeAuras

[EyeAuras](https://eyeauras.net/) is a [clicker](/actions/sendinput/send-sequence) powered by [computer vision](/triggers/images/imagecapturetriggers) and [machine learning](/triggers/images/ai-search-trigger). It can analyze everything happening on your screen and perform actions for you, such as [moving the mouse](/actions/sendinput/send-sequence) and [pressing keys](/actions/sendinput/send-sequence). EyeAuras can also play sounds, [send messages to Telegram](/actions/send-telegram-message) and [over the Internet](/actions/send-network-message), and even [run C# scripts](/scripting/getting-started)!

![Main window](https://eyeauras.net/assets/img/appimages/EyeAuras_OzDyUnmzFH.webp =x400)

## Core concepts

- **Aura** — a combination of triggers, actions, overlays, and enabling conditions. The Aura is what actually does the work, and it is usually what people export and share with others.
- [**Behavior Tree**](/behavior-trees/gettings-started) — in short, a way to describe what the bot should do. Think of it as the bot’s “brain”, while triggers and actions act as its eyes and hands.
- **Triggers** — any state that can be described as `Active` / `Not Active`. For example: a hotkey (pressed / not pressed or toggled), an active window check (active / not active), or the result of an image, text, or color search (found / not found). An Aura’s state is determined by the combined states of its child triggers. Every trigger has three possible states:
  - `Active` — the condition is met. For example, for the `Window Is Active` trigger, this means a window with a matching title is currently active.
  - `Not Active` — the condition is not met.
  - `Unknown` — the trigger state cannot be calculated for some reason. For example, if the window specified in `Image Search` is not found, the comparison cannot be performed, so the trigger gets the `Unknown` state.
- **Actions** — everything EyeAuras can do: show notifications, press keys and mouse buttons, send messages to Telegram or e-mail, and more. All actions inside an Aura belong to one of three groups:
  - `On Enter` — runs when the Aura becomes `Active`
  - `While Active` — runs repeatedly while the Aura stays `Active`
  - `On Exit` — runs when the Aura becomes `Not Active`
- **Overlays** — elements displayed on top of all windows that can show text, images, custom UI, and more. Overlays are part of an Aura and are shown only while it is active.
- [**Enabling Conditions**](/features/enabling-conditions) — triggers that can enable or disable Auras and Behavior Trees. For example, you can disable a bot if the game window does not exist.

![Behavior Trees](https://eyeauras.net/assets/img/appimages/EyeAuras_4GhOU01VKp.webp =x400)

---

## Subsystems

- [Export and Import](/features/export-import) — move, share, and back up EyeAuras packs between users and devices
- [Aura Library](/aura-library) — a shared library of EyeAuras packs where users can find, import, and use ready-made solutions
- [Window Match Expressions](/features/window-matching-expressions) — select specific windows using a custom expression
- [Text Match Expressions](/features/text-match-expressions) — a powerful way to check text conditions through Regex, Text, and Lambda evaluators
- [Bindings](/features/bindings) — link properties between triggers, actions, and overlays for easier setup of shared parameters and new workflows
- [Default Properties](/features/default-properties)

## Triggers

- [**Fixed Value**](/triggers/fixed-value) — the simplest trigger. Its state can be changed manually or through C# scripts.
- [**Color Search**](/triggers/images/color-search) — becomes active when the average color of the selected area matches the target color. You can set a similarity threshold.
- [**Image Search**](/triggers/images/image-search) — becomes active when it finds the specified image with the selected similarity level
- [**AI/ML Search**](/triggers/images/ai-search-trigger) — machine-learning-based search using [object detection](https://docs.ultralytics.com/tasks/detect/), [segmentation](https://docs.ultralytics.com/tasks/segment/), or [classification](https://docs.ultralytics.com/tasks/classify/). Currently only [**Yolo8**](https://docs.ultralytics.com/) **in ONNX format** is supported, but this list may expand later.
- [**Text Search**](/triggers/images/text-search) — becomes active when recognized text matches the specified expression. Supports `Contains`, regexp, and C# Lambda checks.
- [**Aura Is Active**](/triggers/aura-is-active) — becomes active when linked Auras are in the selected state (`Active` / `Not Active`)
- [**Hotkey Is Active**](/triggers/hotkey-is-active) — becomes active when the specified key combination is held or used as a toggle
- [**Window Is Active**](/triggers/window-is-active) — becomes active when a window matching the specified expression is in the foreground
- [**Window Exists**](/triggers/window-exists) — becomes active when a window matching the specified expression exists in the system
- [**Timer**](/triggers/timer) — activates periodically for the specified duration
- [**Message Subscription**](/triggers/network-message) — activates and deactivates when the specified message is received from the EyeAuras web server. Messages are separated by channels and can be sent through the `Send Message` action.
- [**File Contains**](/triggers/file-contains-text) — activates when the specified text is found in the selected file
- [**Telegram Subscription**](/triggers/telegram-message) — activates and deactivates when the specified message is received in a Telegram channel
- [**Volume Control**](/triggers/volume-level) — activates and deactivates when the volume level of the selected audio device or process reaches the specified threshold
- [**C# Script**](/scripting/getting-started) — custom scripts written in the latest version of C# with full access to the internal EyeAuras API. Examples and documentation will be added once the API is more stable.

## Actions

- [**Send**](/actions/sendinput/options) — simulates user input: mouse movement, clicks, key presses, and more. Supports multiple input methods, from basic WinAPI-based input to hardware emulation using a physical Usb2Kbd device.
  - [Input](/actions/sendinput/send-input) — generates a single keyboard or mouse event
  - [Text](/actions/sendinput/send-text) — enters the specified text through the clipboard or character by character
  - [Sequence](/actions/sendinput/send-sequence) — plays back a configured sequence of key presses, mouse clicks, and cursor movements
- [**Play Sound**](/actions/play-sound) — plays the specified sound
- [**Win Activate**](/actions/win-activate) — activates the specified window
- [**Delay**](/actions/delay) — waits for the specified time before moving to the next action
- [**Send To Telegram**](/actions/send-telegram-message) — sends a message to a Telegram channel
- [**Send Message**](/actions/send-network-message) — sends a network message through the EyeAuras infrastructure to the specified channel. Other EyeAuras instances on other computers can subscribe to that channel and process those messages through the `Message Subscription` trigger.
- [**C# Script**](/scripting/getting-started) — custom scripts written in the latest version of C# with full access to the internal EyeAuras API. Examples and documentation will be added once the API is more stable.

## Overlays

- [**Text**](/overlays/text) — shows text; the content can be changed manually or through C# scripts
- [**Image**](/overlays/image) — shows an image; animated and transparent GIFs are supported
- [**Replica**](/overlays/replica) — creates a real-time visual copy of the specified window or part of it. For example, this lets you move important UI elements closer to the center of the screen or show a smaller copy of a YouTube player while farming.
- [**Dependencies Viewer**](/overlays/dependencies-viewer) — a debugging tool that lets you inspect the states of linked Auras. Especially useful for understanding complex setups.
- [**Custom UI**](/overlays/custom-ui) — lets you build a full user interface inside EyeAuras using a combination of [Microsoft Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-7.0&tabs=visual-studio) (`html+css+js`) and **C#** for logic and component integration