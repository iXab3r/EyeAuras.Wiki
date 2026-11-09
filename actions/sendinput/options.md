---
title: Common Options
description: Select an input recipient and delivery method and understand restoration and blocking
published: true
date: 2025-07-14T13:17:24.353Z
tags: 
editor: markdown
dateCreated: 2023-06-18T15:26:34.441Z
---

# Common input options

If a shortcut opens search in the wrong document, check **Target Window** and the focus inside that window first. **Advanced input settings** control where and how Send Sequence delivers its events. They do not choose a text field, button or tab within the application.

## Check the recipient with one shortcut

Use a short Send Sequence containing the Down/Up pair for **Ctrl+F**, and your own document viewer where that shortcut opens search.

1. Under **Advanced input settings → Target Window**, select the document window. Narrow the [window expression](/en/features/window-matching-expressions) if several windows match.
2. Set **Input Simulator = Windows Input**, **Block User input = None**, **Randomize Mouse Movement X/Y = 0** and **Mouse Move smoothing algorithm = Disabled**. This keyboard shortcut needs no movement.
3. Enable **Restore after Action is completed → Key/Button State**. Leave window and mouse restoration off for the first check so you can see the recipient.
4. Focus the document and use **Execute**. Its search panel should open. If another field receives the shortcut, correct the target or internal focus rather than increasing a delay.

Windows Input and keyboard-like hardware or virtual devices normally activate the target and use desktop focus and cursor state. **Target Window is not a universal background-input channel.** A capture selector or a linked match region does not automatically select the input action's recipient.

## Main settings

| Setting | Meaning and limits |
| --- | --- |
| Target Window | Input recipient. A specified expression with no matching window causes an error; an empty expression does not pin a recipient and leaves it to the current context |
| Key Press delay | Delay between Down and Up. Send Sequence uses the shared value when Use default Key Down / Key Up delay is enabled |
| Randomize for a delay | Chooses a duration between its bounds. It does not confirm that the target is ready |
| Randomize Mouse Movement X / Y | Adds a random plus/minus pixel offset to the target point. Use 0 for an exact position |
| Restore after Action is completed → Mouse position | Restores the cursor after an individual coordinate-bearing input operation. In Move → Click it can return the cursor before the click; begin with it off for that pattern |
| Restore after Action is completed → Key/Button State | At the end of Send Sequence, attempts to release the sequence's keys still reported down. Keep explicit Up events |
| Restore after Action is completed → Window | Present in the editor, but current Send Sequence does not restore focus through this flag. Use a separate Win Activate action for a known recipient afterward |
| Key Press Passthrough → Do not process presses by Hotkey Trigger | Keeps this action's generated presses out of Hotkey Trigger processing, avoiding self-triggering. It does not disable all Windows shortcuts |
| Mouse Move smoothing algorithm | Adds intermediate points to absolute movement. It does not add clicks or change aura conditions |
| Input Simulator | Selects delivery. A listed name does not establish that its driver or device is installed |

Use [Win Activate](/en/actions/win-activate) to select a known window afterward. See [mouse smoothing](/en/actions/sendinput/mouseinputsmoothing) for movement shape and timing.

<details>
<summary>Block user input</summary>

The current list uses short enum names; older editors showed expanded labels.

| Block User input | What is blocked while the action runs |
| --- | --- |
| None / Disabled | Nothing |
| All / Block All Input | Keyboard, mouse buttons and movement |
| Keyboard / Block Keyboard Input | Keyboard |
| Mouse / Block Mouse Input | Mouse buttons; movement remains available |
| MouseMove / Block Mouse Movement | Movement; buttons remain available |

Keep **None** while preparing a short sequence. Blocking can exclude concurrent manual input, but it cannot fix the wrong coordinates or an unsupported input method.

</details>

## Choose a delivery method

| Input Simulator | How it delivers input |
| --- | --- |
| Windows Input | System SendInput; a starting point for keyboard and mouse in an active application |
| Windows Message API | PostMessage to the selected window. It may work without activation if the application handles those messages; many ignore them. Mouse message coordinates belong to the client area |
| Granny's Send Input | Older system keyboard/mouse events; an alternative mechanism, not a compatibility guarantee |
| TetherScript Driver | Virtual HID devices from the [installed Tetherscript driver](/en/actions/sendinput/tetherscript) |
| Usb2Kbd device | Commands to a compatible physical USB HID device; it needs [hardware and connection settings](/en/actions/sendinput/usb2kbd) |
| Input driver | A separate driver-based implementation requiring its driver to be installed and ready |
| Low-level Windows Input / Low-level Input Injection | Separate low-level methods. Use an available, prepared implementation in your installation; “low-level” does not imply background support |

Additional modules can contribute methods. **Install...** may open an installer, vendor page or device settings, depending on the selected method. Check its Status and guide. Neither software nor hardware input guarantees acceptance by every application or invisibility to it.

For shared defaults, use **Folder Properties → Triggers/Actions/Overlays Defaults → Input Simulator**. Check bindings on existing components and the scope of **Apply to All** before applying it: [default properties](/en/features/default-properties) explain this inheritance. Global USB device configuration is a separate setting from each component's selected simulator.
