---
title: Creating your own Usb2Kbd
description: Connect a compatible USB HID input device or prepare the documented ATmega8 variant
published: true
date: 2025-06-26T23:05:46.103Z
tags: 
editor: markdown
dateCreated: 2025-06-26T21:39:17.968Z
---

# Use a Usb2Kbd device

A compatible physical Usb2Kbd can receive keyboard and mouse commands from EyeAuras. For a first check, enter **7** in your own empty test field: you can see the result without submitting a form or accessing game data.

You need the supported USB variant and compatible firmware. EyeAuras talks directly to its HID interface without the bundled DLL. The [Usb2Kbd author's site](https://usb2kbd.ru/) also describes LAN/COM models with another command transport; the shared product name does not make those models compatible with this USB implementation.

![Two ATmega8 USBASP boards from the assembly example](https://s3.eyeauras.net/media/2025/06/IMG_3699.jpg =x400)

## Connect an already prepared device

Before starting, connect an already flashed, compatible controller to the computer running EyeAuras. Know its **VID/PID** and **Serial number**. The firmware variant in the archive below uses **VID_0245&PID_D342** and **1232**; use the real values for a different device.

1. Create a test aura with **Send Sequence**. Add **7** from the main number row through **Keyboard**, keeping **Key down → delay → Key up**.
2. Open **Advanced input settings** and select **Input Simulator = Usb2Kbd device**.

   The older image shows the selector and unconfigured-device warning:

   ![Usb2Kbd device selected for Send Sequence](https://s3.eyeauras.net/media/2025/06/EyeAuras_u05n6CbeSHjASUB3.png =x600)

3. Choose **Install...** to open **Usb2Kbd settings**. Here Install configures EyeAuras' connection; it does not flash the controller.
4. For the archived firmware variant, choose **Detect automatically** and check the values. This button immediately saves the specific **VID_0245&PID_D342 / 1232** profile; it does not enumerate arbitrary connected devices. For another compatible variant, enter its Device and Serial number manually.
5. Leave **Post-operation delay = 5 ms** and select **Ok**. These device settings are global to this input method.

   ![Device, Serial number and Post-operation delay settings](https://s3.eyeauras.net/media/2025/06/ShareX_dfe3exVzay6OP5YN.png =x200)

6. Select your test application's **Target Window**, keep **Block User input = None** and enable **Key/Button State**. Focus the empty field and use **Execute**. One digit 7 should appear.
7. If nothing appears, check connection, VID/PID, serial and focus. A saved identifier or disappearing warning confirms configuration, not receipt by the application.

![Saved device connection settings in the older interface](https://s3.eyeauras.net/media/2025/06/EyeAuras_jFqVNV0vHSnfn5dJ.png)

| Setting | Meaning |
| --- | --- |
| Device | HID identifier fragment, such as VID_0245&PID_D342. The implementation looks for that device's control HID collection |
| Serial number | Number included in command packets; it must match the firmware |
| Post-operation delay | Minimum spacing between commands; the current implementation clamps it to at least 5 ms, even if a lower value is entered |
| Detect automatically | A preset for the described variant, saved as soon as it is clicked |
| Reset | Resets values in the settings window; Ok saves them |
| Target Window | Recipient of ordinary desktop input. The device shares focus and cursor state rather than providing a separate background channel |

The protocol includes key, button, wheel and movement commands with the serial number in the packet. This is not any arbitrary Arduino keyboard: its firmware must understand this format. Movement also accounts for DPI; recheck [coordinates](/en/features/coordinate-system) after changing monitor or scaling.

## Apply the input method to a folder

For a group, enable **Folder Properties → Triggers/Actions/Overlays Defaults → Input Simulator = Usb2Kbd device**. Check existing action bindings or deliberately use **Apply to All**. Global Device/Serial settings do not replace simulator selection on a component.

![Usb2Kbd device in folder defaults](https://s3.eyeauras.net/media/2025/06/EyeAuras_X3t0uKQGRPWRfFLN.png)

<details>
<summary>Build the archived two-USBASP ATmega8 variant</summary>

This is a separate hardware-preparation route for the original example. You need **two ATmega8 USBASP boards**, their ribbon cable, a **JP2** jumper and the [firmware/tool archive](https://s3.eyeauras.net/media/2025/06/usb2kbd.zip). One board becomes Target; the other remains Programmer. Do not transfer these steps to a different board or microcontroller without its documentation.

The archive contains `main.hex`, the USBASP driver installer and `Khazama AVR Programmer.msi`. Original example board links: [Amazon](https://www.amazon.com/Ferwooh-Downloader-Programmer-Microcontroller-Adapter/dp/B08DTRPT1Z/) and [Robot-kit](https://robot-kit.ru/3370/). Compatibility depends on the board and controller, not the store or price.

1. With both boards unplugged, select **Target (1)** and short its **JP2** pins. The jumper must touch only the intended contacts.

   ![JP2 on the target USBASP board](https://s3.eyeauras.net/media/2025/06/IMG_3698.jpg =x400)

2. Join Target (1) and **Programmer (2)** with the correctly oriented ribbon cable. Only Target has JP2 shorted.

   ![Target and Programmer joined by a ribbon cable](https://s3.eyeauras.net/media/2025/06/Photos_qt6wFLu8IX5vnwJi.jpg =x500)

3. Connect **Programmer (2)** to USB, leaving Target attached to it by the cable.

   ![The Programmer is connected to USB](https://s3.eyeauras.net/media/2025/06/Photos_vWVE1omRVkxzb9cU.jpg =x500)

4. Install the programming driver through `driver/InstallDriver.exe`, then install `Khazama AVR Programmer.msi`. These are flashing tools, rather than required installations on every computer using the finished HID device.

   ![USBASP programming-driver installer](https://s3.eyeauras.net/media/2025/06/explorer_x6YMxIwuDtx2HV4r.png =x400)

   ![Khazama installer](https://s3.eyeauras.net/media/2025/06/explorer_VGFKmZaWKioZokGt.png =x400)

5. Open Khazama and select **ATMEGA8**.

   ![ATMEGA8 selected in Khazama](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_hEAnG7Z8zxvdC2It.png)

6. Open **Command → Fuses and Lock Bits...** and choose **Read All** to check communication. Do not change fuse bits merely to match a picture. If reading fails, check the board, cable and jumper first.

   ![Opening Fuses and Lock Bits](https://s3.eyeauras.net/media/2025/06/msedge_vceQvSiBBDqVxB5r.png)

   ![Read All in the controller settings](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_jM5G6HgYIiMsMVhP.png)

7. Use **File → Load FLASH file to Buffer** to select `main.hex` from the archive. Check the selected file path.

   ![Loading a FLASH file into the buffer](https://s3.eyeauras.net/media/2025/06/msedge_9wdOK2WkAob19fpS.png)

   ![The selected main.hex firmware](https://s3.eyeauras.net/media/2025/06/msedge_wSXfntALbLMrrst4.png)

8. Select **Auto Program** and wait for successful completion. It programs Target, the board with the jumper.

   ![Auto Program in the original flashing example](https://s3.eyeauras.net/media/2025/06/Code_VJUOeYEfoezd2yXk.gif)

9. Disconnect power and the ribbon cable, then remove Target's JP2 jumper. Put Programmer aside and connect the flashed Target directly to USB. Continue with EyeAuras settings above. A compatible finished HID device uses Windows' system HID driver.

   ![The finished device without its jumper](https://s3.eyeauras.net/media/2025/06/IMG_3701.jpg =x400)

</details>

## Older interface demonstrations

The first GIF shows Send Sequence; the second shows a macro input node. These are different editors using the same configured device. Their appearance does not establish compatibility with your hardware or target application.

![Older Send Sequence demonstration through Usb2Kbd](https://s3.eyeauras.net/media/2025/06/EyeAuras_JDZlg740lGwiPBED.gif =x400)

![Older macro-node demonstration through Usb2Kbd](https://s3.eyeauras.net/media/2025/06/EyeAuras_ErWZbRhxLmhdb47W.gif =x500)

Hardware does not guarantee acceptance by every program. Selecting Usb2Kbd device without the device does not create a software replacement. Choose another [input method](/en/actions/sendinput/options) for ordinary system input or a virtual driver.
