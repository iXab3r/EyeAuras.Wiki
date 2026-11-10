---
title: KeyPress
description:
published: true
date: 2025-08-17T08:56:58.706Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:56:58.706Z
---

# Key Press — send one gesture to your own window

Use `Key Press` for one keyboard key, modifier combination, mouse button or supported wheel event. This is input delivery, not a test of what the user is holding. Start by selecting text in a separate local draft.

## Select your draft's text

Open your own text-editor window with two nonsecret lines. Click in its text so a caret is visible. Use this draft rather than a chat, submission form or command prompt.

1. Put a separate tree in your own folder. In the folder's `Triggers/Actions/Overlays Defaults`, enable `Target Window` and choose the exact draft window. Through `show more...`, enable `Input Simulator` and select `Windows Input`.
2. Keep `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. Check [default properties](/en/features/default-properties): local tree `Settings` must not override the intended window or backend.
3. Add `Key Press` and connect it to the entry. Choose `General → Keys → Ctrl+A`, `Delay = 30 ms`, randomization off, and `Input → Press and release`.
4. Check the read-only `Window` and `Simulator` fields in the same group. They must show the draft and Windows Input. Do not run with `not set`, `not found` or another target.
5. Click the upper `Tick BT Once` once. Windows Input activates the selected window and sends the gesture. Expect the text to become selected and the node to return Success. Recheck the target before repeating.

The earlier screenshot labels the fields `Key Press Delay` and `Input Type`; current labels are `Delay` and `Input`:

![Keys, delay and input event in the earlier Key Press editor](https://s3.eyeauras.net/media/2025/08/EyeAuras_vIJngJ7rpT.png)

| Setting | Effect |
| --- | --- |
| Keys | One main key with Ctrl, Alt or Shift; also mouse buttons and wheel events. Not a long-sequence command string |
| Delay | Pause after individual keyboard events, including Down and Up in a normal Press; not a node-repeat interval |
| Random Min / Max | Select event delays within the configured range |
| Input — Press and release | Send main-key Down then Up, with selected modifiers pressed and released around it |
| Input — Press and hold | Send Down, leaving the key and selected modifiers held |
| Input — Release | Send Up for the main key and selected modifiers |
| Window / Simulator | Resolved inherited target and backend, not separate editable selectors on this node |

For wheel gestures, Input is hidden and the chosen scroll direction is sent. Backend support differs: Windows Message API does not support wheel scrolling. Target Window alone does not guarantee background delivery; see [input options](/en/actions/sendinput/options).

<details>
<summary>Holding, cancellation and several steps</summary>

A timed hold needs separate steps with the same Keys, window and backend: `Press and hold → Wait → Release`. Delay within Key Press is not a substitute for the hold duration. If traversal stops before Release, it will not run. Stop, cancellation or disposing a controller does not universally release held keys. Even a single Press may be cancelled between its events.

The controller may skip Down for a physically held key, but still sends Up. It does not restore every prior modifier state; avoid manually holding unrelated keys during the draft example. Plan explicit release for input your own flow holds.

For a longer sequence, connect several Key Press nodes in a [Sequence](/en/behavior-trees/nodes/sequence), or use [Run Aura](/en/behavior-trees/nodes/execute-aura) with a configured [Send Sequence](/en/actions/sendinput/send-sequence) action. A paste gesture requires your own prepared clipboard. This original compact example uses the earlier field labels shown above:

```
KeyPress

Keys: Ctrl + V
Key Press Delay: 30 ms
Input Type: Press and release
```

To supply text from the node, use [Send Text](/en/behavior-trees/nodes/SendText). After successful input, Key Press can execute a child and return its result. A retained Running child resumes on the next tick without repeating the gesture. The same template exists in Macro, but surrounding order follows macro control flow. Success confirms call completion, not that the target processed the input.

</details>
