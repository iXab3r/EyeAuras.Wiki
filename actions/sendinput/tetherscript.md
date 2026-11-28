---
title: TetherScript Simulator
description: Input through the virtual keyboard and mouse of the Tetherscript driver.
published: true
date: 2025-07-14T13:13:42.490Z
tags: 
editor: markdown
dateCreated: 2025-07-14T13:12:58.586Z
---

# Use TetherScript Driver for input

TetherScript Driver is an input method that goes through the Tetherscript virtual keyboard and mouse driver. EyeAuras sends commands to the driver's virtual HID devices. For example, a Send Sequence can press **F3** this way and open the find panel in a browser.

You do not need to run the ControlMyJoystick application itself.

![Input passes from EyeAuras through a driver to the target application](https://s3.eyeauras.net/media/2025/07/ChatGPT%20Image%20Jul%2014%2C%202025%2C%2003_09_58%20PM.png =x200)

## Prepare the driver

You need an EyeAuras that offers the **TetherScript Driver** input method, an installed compatible Tetherscript driver and an ordinary window that accepts keyboard input. For the example, open a browser page where F3 opens find.

If the driver is missing, get [ControlMyJoystick from the vendor's site](https://tetherscript.com/controlmyjoystick-home/). The **Install...** button for this input method opens the download page and rechecks the devices after setup. According to the [HVDK author's README](https://github.com/tetherscript/hvdk), the drivers from the trial keep working without buying ControlMyJoystick.

HVDK as a standalone product was discontinued. The [HVDK Standard 2.1 mirror](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe) is kept for older setups. Check the vendor's requirements and setup steps for your driver version. If the installer asks for a restart, restart before you set up input.

## Open find with F3

1. Create a test aura and add **Send Sequence**. Add **Fn → F3** and keep the Down, delay and Up events.
2. Under **Advanced input settings → Target Window**, select the browser window. Set **Input Simulator** to **TetherScript Driver**.
3. Check that the input method is ready. If Install... is offered, finish installing the driver first. Leave **Block User input** at **None** and turn on **Key/Button State**.
4. Make your page the current tab and click the action's **Execute**. The find panel should open just as it does with F3 on the keyboard. If it does not, check the selected window, the focus and whether the virtual keyboard is ready.
5. Close find by hand and repeat the command. Only then assign this input method to other actions.

![TetherScript Driver selected for Send Sequence](https://s3.eyeauras.net/media/2025/07/NVIDIA_Overlay_fejDExaVlczyGS5P.png =x600)

## Choose the configuration scope

| Where to select Input Simulator | Scope |
| --- | --- |
| Send Sequence → Advanced input settings | This action. Handy for a first check |
| Folder Properties → Triggers/Actions/Overlays Defaults | Components that take the default from this folder. Check the bindings of existing actions. Apply to All applies the selected properties across the folder's scope |
| Macro / Behavior Tree root properties | Input that uses the settings of that macro or tree |

The folder setting is handy when a whole group should use the driver. Do not set conflicting values at different levels. [Default properties](/en/features/default-properties) explain inheritance and which individual settings Apply to All replaces.

![Input Simulator enabled in the folder's defaults](https://s3.eyeauras.net/media/2025/07/NVIDIA_Overlay_w4H6swrVSxeI4uGV.png =x400)

In a macro, select the input method in the properties of the root row. In a behavior tree, select it in the properties of **Root**.

![Input method selected in macro root properties](https://s3.eyeauras.net/media/2025/07/NVIDIA_Overlay_N4kvjMqSsIqbaVhH.png =x600)

## Limits that affect setup

| Detail | What to expect |
| --- | --- |
| Virtual HID devices | EyeAuras uses the driver's keyboard and absolute/relative mouse devices |
| Target Window | The target window is activated before input. The driver does not turn an ordinary keyboard into universal input to a minimized window |
| Installed check | The check can find a keyboard or an absolute mouse. Still test the specific operation you need |
| Compatibility | A working driver does not mean it is invisible or allowed in every application |

If you need a physical device and not a virtual driver, see [Usb2Kbd](/en/actions/sendinput/usb2kbd). Delivery methods are compared in [common options](/en/actions/sendinput/options).
