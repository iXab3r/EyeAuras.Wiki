---
title: TetherScript Simulator
description: Prepare the compatible virtual HID driver and select it for a short input command
published: true
date: 2025-07-14T13:13:42.490Z
tags: 
editor: markdown
dateCreated: 2025-07-14T13:12:58.586Z
---

# Use TetherScript Driver for input

With a compatible Tetherscript virtual-keyboard driver already prepared, you can use it for a short command in your own application. For example, a Send Sequence containing **F3** can open a browser's find panel.

EyeAuras sends commands to the driver's virtual keyboard and mouse HID devices. ControlMyJoystick itself does not need to run the sequence. The older diagram shows the delivery chain; its word Game does not represent a built-in game integration.

![Input passes from EyeAuras through a driver to the target application](https://s3.eyeauras.net/media/2025/07/ChatGPT%20Image%20Jul%2014%2C%202025%2C%2003_09_58%20PM.png =x200)

## Prepare the driver

You need an EyeAuras installation offering **TetherScript Driver**, its compatible installed driver and an application accepting keyboard input. For the first check, use your own browser page where manual F3 opens find. A detected virtual device does not establish that every mouse mode works.

If the driver is missing, follow the vendor's [ControlMyJoystick installation route](https://tetherscript.com/controlmyjoystick-home/). **Install...** for this simulator opens the vendor download page and rechecks devices after setup. The [HVDK author's README](https://github.com/tetherscript/hvdk) states that the trial's drivers continue working without buying ControlMyJoystick.

The standalone HVDK product was discontinued. The [HVDK Standard 2.1 mirror](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe) remains a source for older setups, not a promise of compatibility with every current Windows version. Check the requirements for your particular driver release; complete any requested restart before configuring input.

## Open find with F3

1. Create a test aura with **Send Sequence**. Add **Fn → F3**, keeping the Down, delay and Up events.
2. Select the browser under **Advanced input settings → Target Window**, then choose **Input Simulator = TetherScript Driver**.
3. Check readiness. If Install... is offered, finish driver preparation first. Leave **Block User input = None** and enable **Key/Button State**.
4. Make your page the current tab and use **Execute**. The browser's find panel should open as it does with manual F3. Otherwise check the target, focus and virtual-keyboard readiness.
5. Close find manually and repeat the short command before assigning this input method more broadly.

This older image shows the action-level selector. In the current editor it is under Advanced input settings, with different styling.

![TetherScript Driver selected for Send Sequence](https://s3.eyeauras.net/media/2025/07/NVIDIA_Overlay_fejDExaVlczyGS5P.png =x600)

## Choose the configuration scope

| Where to select Input Simulator | Scope |
| --- | --- |
| Send Sequence → Advanced input settings | This action; useful for a first isolated check |
| Folder Properties → Triggers/Actions/Overlays Defaults | Components bound to that folder default. Check existing bindings before Apply to All, which applies selected properties within the folder scope |
| Macro / Behavior Tree root properties | Input using that macro or tree's settings; this is a separate editor, not the old Send Text action |

Folder configuration is useful for a group. Avoid conflicting overrides at several levels; [default properties](/en/features/default-properties) explain inheritance and what Apply to All replaces.

![Input Simulator enabled in the folder's defaults](https://s3.eyeauras.net/media/2025/07/NVIDIA_Overlay_w4H6swrVSxeI4uGV.png =x400)

For a behavior tree select **Root**; for a macro select its root row. The following older image shows that root-level selection.

![Input method selected in macro root properties](https://s3.eyeauras.net/media/2025/07/NVIDIA_Overlay_N4kvjMqSsIqbaVhH.png =x600)

## Limits that affect setup

| Detail | What to expect |
| --- | --- |
| Virtual HID devices | Keyboard and absolute/relative mouse devices deliver input, not internal application data |
| Target Window | The foreground controller activates the target. This is not universal input to a minimized window |
| Installed check | Can discover a keyboard or absolute mouse; check the particular operation you need separately |
| Compatibility | Driver operation does not establish acceptance, invisibility or permission in every application |

For a physical device instead of a virtual driver, [Usb2Kbd](/en/actions/sendinput/usb2kbd) has different prerequisites and a different protocol. Compare delivery methods in [common options](/en/actions/sendinput/options).
