---
title: Input Redirect
description:
published: false
date: 2026-06-19T00:00:00.000Z
tags: retired
editor: markdown
dateCreated: 2023-08-08T13:46:03.524Z
---

# Choose between a configured action and physical-input redirection

**Input Redirect** was a mode for capturing manual keyboard and mouse events and replaying them through a chosen input mechanism. An aura action has a different source: EyeAuras sends a configured command when its condition or execution flow calls for it.

This page describes the historical mode. Its old switches, **Input Redirect Simulator** selector and bottom-panel controls are not a current setup path documented here. A legacy license name alone does not supply those controls in an installed build. A continuous forwarding workflow needs a matching distribution and its own documented event pipeline.

## Choose the source of the command

1. Decide whether the source is a specific aura condition or each physical input event you make.
2. For a configured command, start with [Send Sequence](/en/actions/sendinput/send-sequence). Set its sequence, **Target Window** and **Input Simulator** for your own separate test window and one action.
3. For text, use [Send Text](/en/actions/sendinput/send-text). For a key combination used as a condition, use [Hotkey Is Active](/en/triggers/hotkey-is-active). Recognizing a hotkey does not automatically replay every keyboard event.
4. If continuous physical-event forwarding is required, obtain the documentation for a distribution that actually provides that mode. Selecting a simulator on an ordinary action does not enable it.

The result is a clear event source and a documented command route. These choices do not recreate the old redirector as a universal global hook.

| Historical setting | What it referred to |
| --- | --- |
| `Input Redirect Simulator` | Mechanism replaying captured events. |
| `Input Redirect Timeout` | A timing option in the old event pipeline, not a Send Sequence delay inferred from its name. |
| `Input Grace Period` | A separate timing option after releasing a key. |
| `Input Redirect Ignored Modifiers` | Modifier filtering during capture, not the general modifier list for an aura command. |
| `Input Redirect Logging` | Logging for the old redirector, not all application actions. |

Do not infer a current suppression/forwarding order, `Down`/`Up` coverage, target mapping or held-key cleanup from these historical names. [Ordinary input](/en/actions/sendinput/options) follows the selected mechanism and action contracts. Remote-desktop use additionally depends on the session and window that are actually available.
