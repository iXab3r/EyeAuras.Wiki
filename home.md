---
title: Home
description: EyeAuras is a software tool for creating and managing auras, scripts, and features that automate tasks, process data, and improve interaction with your computer and applications
published: true
date: 2026-04-25T12:40:21.080Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-15T15:02:45.417Z
---

# EyeAuras — connect a condition to a reaction

Build an aura when you want to notice a change in your application and respond to it. For example, a visible label can trigger a sound, or the state of a window can control an on-screen reminder.

Each condition needs a data source. Image search uses captured pixels, a file condition reads text, and a hotkey condition reads key state. Configure the reaction separately: finding an image does not itself click anything.

![EyeAuras logo](/assets/legacy/mainfull.png)

## Try one observable reaction

1. Download EyeAuras from the [official site](https://eyeauras.net/), which lists the requirements for its distributions. Start with your own small set rather than importing unfamiliar code.
2. Follow [Fixed Value](/en/triggers/fixed-value): change one condition manually and test one sound. This makes the state transition and its reaction easy to observe.
3. Replace the manual condition with the source your task needs: a window, image, color or text. Check the trigger's result before adding input.
4. Add a [Text overlay](/en/overlays/text) for a visible reminder. For ordered steps with waits or branches, continue to [macros](/en/macros/getting-started) or [behavior trees](/en/behavior-trees/gettings-started).

Your first result is a clear connection between a changed condition and one chosen reaction. Expand that working part gradually.

For a complete task without programming, choose a [Recipe](/en/recipes): keep a checklist beside your notes, distinguish a viewer opening from closing, or observe a small visual source. Each recipe includes its own preparation, settings and expected result.

The following screenshots show an earlier interface: a tree on the left and the selected item's editor on the right. Current labels and placement can differ.

![Earlier main window with the tree and editor](https://eyeauras.net/assets/img/appimages/EyeAuras_OzDyUnmzFH.webp =x400)

## Understand the parts

An **aura** combines triggers, action lists, overlays and enabling conditions. Auras and related sets can be exported and shared.

| Part | Responsibility |
| --- | --- |
| Trigger | Calculates Active, Not Active, or Unknown when a result is unavailable. The aura combines its triggers according to its configured rule. |
| On Enter | Actions for the transition into Active; useful for one notification. |
| While Active | Repeated work while Active. Timing and completion depend on the configured action chain. |
| On Exit | Actions for the transition from Active to Not Active. Unknown is a separate state. |
| Overlay | Text, an image or another visual element above windows; visibility also depends on its settings and editing state. |
| Enabling Conditions | Decide when an aura or tree may operate; see [Enabling Conditions](/en/features/enabling-conditions). |

A behavior tree organizes node execution through Success, Failure and Running. Those results differ from a trigger's Active, Not Active and Unknown states.

![Behavior-tree editor](https://eyeauras.net/assets/img/appimages/EyeAuras_4GhOU01VKp.webp =x400)

## Choose a guide by task

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
