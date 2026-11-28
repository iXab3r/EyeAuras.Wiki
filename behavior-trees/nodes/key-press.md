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

If an older example with `Key Press` brought you here, use the current template with the same name. Everything about events, holding and combinations is on the [Key Press](/en/behavior-trees/nodes/KeyPress) page.

## Check the target with one key

Open a separate local text-editor window with one line of draft text and place the caret in the middle of the line. We will test with the Home key: the caret jumps to the start of the line, and you can see that without the clipboard or sending text.

1. Put the tree in a separate folder. In the folder's `Triggers/Actions/Overlays Defaults`, enable `Target Window` and choose the draft window. Through `show more...`, enable `Input Simulator → Windows Input`.
2. In the tree, keep `Activation → Is Loaded` and `Execution → When Activated → Do nothing`. In `Settings`, check that no other target or input backend is set there. The values are inherited from the folder or set on the tree itself. See [default properties](/en/features/default-properties).
3. Add the current `Key Press` through `Add new Node` and connect it to the entry. Set `General → Keys = Home`, `Delay = 30 ms` with randomization off, and `Input → Press and release`.
4. The node's `Window` should show exactly the draft window, and `Simulator` should show Windows Input. These fields show what the node inherited. You do not choose them separately in the node.
5. Click `Tick BT Once` once. Windows Input activates the editor, the caret moves to the start of the line, and the node returns Success. If you are checking an existing tree, first repeat only this one step in your own copy.

What the old labels are called now:

| Earlier setting or task | Current path |
| --- | --- |
| Key or combination | Key Press → General → Keys |
| Key Press Delay | General → Delay, fixed or random range |
| Input Type | General → Input: Press and release, Press and hold or Release |
| Window/simulator in Folder Properties | Folder defaults. Local tree Settings may override them. Check the resulting Window / Simulator on the node |
| Long sequence | Several Key Press nodes in a BT Sequence, or Run Aura with a configured Send Sequence action |

In the last option, a ready [Send Sequence](https://wiki.eyeauras.net/en/actions/sendinput/send-sequence) is called through [Run Aura](/en/behavior-trees/nodes/execute-aura). Set the window and input on the **original action**: the tree does not put its own into it.

Choosing a Target Window does not guarantee background operation. In the example, Windows Input activates the window itself, and other backends have their own limits. If the old tree held a key down, move the separate Release over as well. Stopping between Down and Up does not replace it.
