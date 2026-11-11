---
title: Choose a tool for your task
description: Find a trigger, action or overlay for the source and reaction you need.
published: true
date: 2026-11-11T00:00:00.000Z
tags: getting-started, reference, ai-translated
editor: markdown
dateCreated: 2026-11-11T00:00:00.000Z
---

# Choose a tool for your task

Find the data source or reaction you need, then open its guide. For an introduction to macros, auras and behavior trees, return to [Getting started](/en/home).

| Your task | Start here |
| --- | --- |
| Check a window | [Window Exists](/en/triggers/window-exists), [Window Is Active](/en/triggers/window-is-active), [window matching](/en/features/window-matching-expressions) |
| Check a visible region | [Image capture](/en/triggers/images/imagecapturetriggers), then [Image Search](/en/triggers/images/image-search), [Color Search](/en/triggers/images/color-search) or [Text Search](/en/triggers/images/text-search) |
| Recognize objects with your model | [AI Search](/en/triggers/images/ai-search-trigger): a compatible ONNX model, task, classes and thresholds; a YOLO name alone does not establish compatibility |
| Use manual state, a key or time | [Fixed Value](/en/triggers/fixed-value), [Hotkey Is Active](/en/triggers/hotkey-is-active), [Timer](/en/triggers/timer) |
| Check another aura | [Aura Is Active](/en/triggers/aura-is-active) |
| Read a file or incoming message | [File Contains Text](/en/triggers/file-contains-text), [Network Message](/en/triggers/network-message), [Telegram Message](/en/triggers/telegram-message) |
| Play a sound or send a notification | [Play Sound](/en/actions/play-sound), [Send To Telegram](/en/actions/send-telegram-message) |
| Send a command to another EyeAuras instance | [Send Network Message](/en/actions/send-network-message); configure receipt and its reaction separately |
| Send keys, mouse events or text | [Send Sequence](/en/actions/sendinput/send-sequence) and [input options](/en/actions/sendinput/options). [Send Input](/en/actions/sendinput/send-input) and [Send Text](/en/actions/sendinput/send-text) explain the older editors' correspondence to the current mechanism |
| Wait or activate a window | [Delay](/en/actions/delay), [Win Activate](/en/actions/win-activate) |
| Keep a visual reference in view | [Text](/en/overlays/text), [Image](/en/overlays/image), or [Replica](/en/overlays/replica), a live copy of a selected window or region. Image also supports supplied animated GIFs |
| Build custom logic or an interface | [C# Script](/en/scripting/getting-started), [Blazor windows](/en/scripting/blazor-windows/getting-started), [Custom UI](/en/overlays/custom-ui) |
| Understand linked settings and auras | [Bindings](/en/features/bindings), [Default Properties](/en/features/default-properties), [Dependencies Viewer](/en/overlays/dependenciesviewer) |
| Match a string | [Text Match Expressions](/en/features/text-match-expressions): plain text, regular expressions or the supported Lambda context |
| Understand the old audio-level trigger | [Volume Level](/en/triggers/volume-level), a historical alpha-component guide rather than a first setup step |
| Move or reuse a set | [Export and Import](/en/features/export-import), [Aura Library](/en/aura-library) |

[Ultralytics documentation](https://docs.ultralytics.com/) explains [detection](https://docs.ultralytics.com/tasks/detect/), [classification](https://docs.ultralytics.com/tasks/classify/) and [segmentation](https://docs.ultralytics.com/tasks/segment/). EyeAuras consumption still requires the task and layout supported by its parser and runtime.

Screen workflows analyze the captured image, not an application's internal game state. Capture and input availability depend on the window and backend. See [FAQ](/en/faq) for compatibility and multiple-window boundaries, or [Known Issues](/en/known-problems) when setup behaves differently from expected.
