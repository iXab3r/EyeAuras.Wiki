---
title: Key Press
description: 
published: false
date: 2024-03-08T00:04:47.608Z
tags: input simulation, key press, automation
editor: markdown
dateCreated: 2024-03-08T00:04:47.608Z
---

# Key Press — map an earlier setup to the current node

If an older example brought you here, use the current `Key Press` template. The two case-sensitive page addresses do not identify two different input nodes. The full guide to events, gestures and holding is [Key Press](/en/behavior-trees/nodes/KeyPress).

## Check the target with one key

Prepare your own separate local text-editor window with a line of nonsecret draft text. Place the caret in the middle. Home gives a visible caret movement without using the clipboard or sending text.

1. Put the tree in a separate folder. In `Triggers/Actions/Overlays Defaults`, enable `Target Window` and choose that draft; through `show more...`, enable `Input Simulator → Windows Input`.
2. Keep `Activation → Is Loaded`, `Execution → When Activated → Do nothing`. Check that local tree `Settings` do not override the target/backend. See [default properties](/en/features/default-properties).
3. Add the current `Key Press` through `Add new Node` and connect it to the entry. Set `General → Keys = Home`, `Delay = 30 ms`, randomization off, and `Input → Press and release`.
4. Verify `Window` names the exact draft and `Simulator` is Windows Input. These show resolved inheritance, not an independent manual choice inside the node.
5. Use `Tick BT Once` once. Windows Input activates the editor; expect the caret at the start of the line and Success after normal call completion. When migrating an existing flow, first reproduce only this one step in your own copy.

Use this mapping for current labels:

| Earlier setting or task | Current path |
| --- | --- |
| Key or combination | Key Press → General → Keys |
| Key Press Delay | General → Delay, fixed or random range |
| Input Type | General → Input: Press and release, Press and hold or Release |
| Window/simulator in Folder Properties | Folder defaults; local tree Settings may override them. Check resolved Window / Simulator on the node |
| Long sequence | Several Key Press nodes in a BT Sequence, or Run Aura with a configured Send Sequence action |

The latter preserves the existing [Send Sequence](https://wiki.eyeauras.net/en/actions/sendinput/send-sequence) route through [Run Aura](/en/behavior-trees/nodes/execute-aura). Configure the target and input backend on the **original action**: tree defaults are not automatically substituted into it. Matching names do not automatically convert an old complex configuration.

Target Window does not guarantee background operation; the example uses Windows Input with activation of your own window. If the old flow held a key, migrate its explicit Release too. Stopping between Down and Up does not replace that step.
