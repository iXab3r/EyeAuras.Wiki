---
title: CheckKeyState
description:
published: true
date: 2025-08-17T08:36:34.854Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:36:34.854Z
---

# Check Key State — test whether a key is held

Use `Check Key State` to admit a branch when a keyboard key is down at the moment of the check. It reads low-level key state through the host's default input-device state service. It does not send a key, register a global hotkey, intercept input or remember a brief press between ticks.

## Check a key without sending input

Create your own [tree](/en/behavior-trees/gettings-started) with `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. Choose F8 only if it has no assigned command in the window you are using. This tree performs no input reaction.

1. Use `Add new Node` to add `Sequence`, `Check Key State` and `Fixed Status`. Connect them in left-to-right order as below.
2. Set the check's `General → Key` to `F8` and Fixed Status to `General → Status → Success`.

```text
My Tree
└─ Sequence
   ├─ Check Key State: F8
   └─ Fixed Status: Success
```

3. Release F8 and click the upper `Tick BT Once`. The check and Sequence return `Failure`; the last step is not called.
4. Hold F8 while clicking the same tick button with the mouse. The check succeeds and Sequence reaches Fixed Status. Release F8 after the check.

The image shows the keyboard selector. The current field is `Key`; earlier descriptions called it `Hotkey`:

![Keyboard selection for Check Key State](https://s3.eyeauras.net/media/2025/08/EyeAuras_dfgmUF8kNg.png)

| Setting or observation | Result of the check without a child |
| --- | --- |
| Key | Main keyboard key; this editor does not select mouse buttons or the wheel |
| Key down | Success |
| Key up, no key selected or no main key in the gesture | Failure |
| Gesture with Ctrl, Alt or Shift | Only the main key is tested; the modifier combination is not validated |

The check does not use the tree's selected Target Window or Input Simulator. A key being down is not confirmation that an application processed it. For full hotkey combinations, hold/toggle modes and an aura state, use [Hotkey Is Active](/en/triggers/hotkey-is-active) with [Aura Is Active](/en/behavior-trees/nodes/aura-is-active).

<details>
<summary>Conditional work, continuation and macros</summary>

This original abstract schema shows a check before work. `Hotkey` corresponds to the current Key field, and the last name is a placeholder for your configured work, not a built-in node:

```
Sequence
├── CheckKeyState (Hotkey = F1)
├── DoSomethingWhileF1Pressed
```

The condition applies when Sequence reaches the check. If later work returns Running, Sequence resumes that work without repeating the earlier successful check. Attaching a child directly to Check Key State has the same important boundary: after Success it returns the child's result, and a retained Running child resumes before another key check. Releasing the key alone does not interrupt that continuation.

The template is available in BT and Macro. A BT Sequence stops on Failure, but an ordinary macro Block can continue to later siblings after Failure. Put conditional work under the check or use the appropriate macro control flow; do not infer macro behavior from this Sequence schema.

</details>
