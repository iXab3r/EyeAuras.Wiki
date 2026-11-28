---
title: Choose a tool for your task
description: A table of which trigger, action or overlay to use for your task.
published: true
date: 2026-11-11T00:00:00.000Z
tags: getting-started, reference, ai-translated
editor: markdown
dateCreated: 2026-11-11T00:00:00.000Z
---

# Choose a tool for your task

Find what you need in the table and open the guide. [Home](/en/home) explains how macros, auras and behavior trees differ.

| Your task | Start here |
| --- | --- |
| Check a window | [Window Exists](/en/triggers/window-exists), [Window Is Active](/en/triggers/window-is-active), [window matching](/en/features/window-matching-expressions) |
| Check what is visible on screen | [Image capture](/en/triggers/images/imagecapturetriggers), then [Image Search](/en/triggers/images/image-search), [Color Search](/en/triggers/images/color-search) or [Text Search](/en/triggers/images/text-search) |
| Recognize objects with your model | [AI Search](/en/triggers/images/ai-search-trigger). You need a compatible ONNX model, its task ([detection](https://docs.ultralytics.com/tasks/detect/), [classification](https://docs.ultralytics.com/tasks/classify/) or [segmentation](https://docs.ultralytics.com/tasks/segment/), see the [Ultralytics documentation](https://docs.ultralytics.com/)), classes and thresholds |
| Use manual state, a key or time | [Fixed Value](/en/triggers/fixed-value), [Hotkey Is Active](/en/triggers/hotkey-is-active), [Timer](/en/triggers/timer) |
| Check another aura | [Aura Is Active](/en/triggers/aura-is-active) |
| Read a file or incoming message | [File Contains Text](/en/triggers/file-contains-text), [Network Message](/en/triggers/network-message), [Telegram Message](/en/triggers/telegram-message) |
| Play a sound or send a notification | [Play Sound](/en/actions/play-sound), [Send To Telegram](/en/actions/send-telegram-message) |
| Send a command to another EyeAuras instance | [Send Network Message](/en/actions/send-network-message). Set up receiving and the reaction separately on the receiver's side |
| Send keys, mouse events or text | [Send Sequence](/en/actions/sendinput/send-sequence) and [input options](/en/actions/sendinput/options). The [Send Input](/en/actions/sendinput/send-input) and [Send Text](/en/actions/sendinput/send-text) pages explain what the older editors became in the current mechanism |
| Wait or activate a window | [Delay](/en/actions/delay), [Win Activate](/en/actions/win-activate) |
| Show a hint on top of a window | [Text](/en/overlays/text), [Image](/en/overlays/image), or [Replica](/en/overlays/replica), a live copy of a window or region. Image also shows animated GIFs |
| Build custom logic or an interface | [C# Script](/en/scripting/getting-started), [Blazor windows](/en/scripting/blazor-windows/getting-started), [Custom UI](/en/overlays/custom-ui) |
| Understand linked settings and auras | [Bindings](/en/features/bindings), [Default Properties](/en/features/default-properties), [Dependencies Viewer](/en/overlays/dependenciesviewer) |
| Match a string | [Text Match Expressions](/en/features/text-match-expressions): plain text, a regular expression or the supported Lambda context |
| Check the audio level | [Volume Level](/en/triggers/volume-level), a reference for an old alpha component. Not a good place to start |
| Move your own set or find a ready-made one | [Export and Import](/en/features/export-import), [Aura Library](/en/aura-library) |

For compatibility, multiple windows and licensing, see the [FAQ](/en/faq). If something does not work as expected, see [Known Issues](/en/known-problems).
