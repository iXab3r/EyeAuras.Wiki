---
title: Creating your own Usb2Kbd
description: Connect a compatible Usb2Kbd USB device for input, or build the ATmega8 variant yourself.
published: true
date: 2025-06-26T23:05:46.103Z
tags: 
editor: markdown
dateCreated: 2025-06-26T21:39:17.968Z
---

# Use a Usb2Kbd device

Usb2Kbd is a physical USB device that presses keys and moves the mouse on commands from EyeAuras. For a first check it is enough to enter **7** in an empty test field: you see the result at once and nothing has to be submitted.

Only the supported USB variant with compatible firmware works. EyeAuras talks to the HID device directly, without the bundled DLL. The LAN/COM models from the [Usb2Kbd author's site](https://usb2kbd.ru/) take commands over a different transport. They share the name but do not work with this input method.

![Two ATmega8 USBASP boards from the assembly example](https://s3.eyeauras.net/media/2025/06/IMG_3699.jpg =x400)

## Connect an already prepared device

You need an already flashed, compatible controller connected to the computer that runs EyeAuras. You will need its **VID/PID** and **Serial number**. For the firmware variant in the archive below they are **VID_0245&PID_D342** and **1232**.

1. Create a test aura with **Send Sequence**. Add **7** from the main number row through **Keyboard**. Keep the **Key down → delay → Key up** events it creates.
2. Open **Advanced input settings** and set **Input Simulator** to **Usb2Kbd device**.

   ![Usb2Kbd device selected for Send Sequence](https://s3.eyeauras.net/media/2025/06/EyeAuras_u05n6CbeSHjASUB3.png =x600)

3. Click **Install...** to open **Usb2Kbd settings**. This sets up the connection from EyeAuras to the device. It does not flash the controller.
4. For a device with the firmware from the archive, click **Detect automatically** and check the values. The button does not search for connected devices. It fills in and saves one specific profile, **VID_0245&PID_D342 / 1232**. For another variant, enter Device and Serial number by hand.
5. Leave **Post-operation delay** at **5 ms** and click **Ok**. The device settings are shared by everything that uses this input method.

   ![Device, Serial number and Post-operation delay settings](https://s3.eyeauras.net/media/2025/06/ShareX_dfe3exVzay6OP5YN.png =x200)

6. In Send Sequence, select your test application's **Target Window**, leave **Block User input** at **None** and turn on **Key/Button State**. Put the focus in the empty field and click **Execute**. One digit 7 should appear.
7. If nothing appears, check the connection, VID/PID, serial and focus. A saved identifier or a warning icon that has gone away only tells you the device is configured.

![Saved device connection settings in the older interface](https://s3.eyeauras.net/media/2025/06/EyeAuras_jFqVNV0vHSnfn5dJ.png)

| Setting | Meaning |
| --- | --- |
| Device | Part of the HID device identifier, such as VID_0245&PID_D342. EyeAuras looks for that device's control HID collection |
| Serial number | The number sent to the device in each command packet. It must match the firmware |
| Post-operation delay | Minimum interval between commands. It currently never goes below 5 ms, even if you enter less |
| Detect automatically | A ready profile for the variant described here. It is saved as soon as you click |
| Reset | Resets the values in the settings window. Ok saves them |
| Target Window | The window that gets ordinary input. The device shares focus and cursor with the system and has no separate background channel into an application |

At the protocol level these are HID commands for keys, buttons, wheel and movement, with the serial number in the packet. An arbitrary Arduino keyboard will not do: the firmware must understand this exact format. Mouse movement takes DPI into account. After changing the monitor or scaling, recheck the [coordinates](/en/features/coordinate-system).

## Apply the input method to a folder

If a group of auras should use the device, turn on **Folder Properties → Triggers/Actions/Overlays Defaults → Input Simulator** and choose **Usb2Kbd device**. Check the bindings of existing actions, or use **Apply to All** deliberately. The global Device/Serial settings do not replace choosing the input method on a component.

![Usb2Kbd device in folder defaults](https://s3.eyeauras.net/media/2025/06/EyeAuras_X3t0uKQGRPWRfFLN.png)

<details>
<summary>Build the archived two-USBASP ATmega8 variant</summary>

This is how to build the device by the original instructions. You need **two ATmega8 USBASP boards**, their ribbon cable, a **JP2** jumper and the [firmware/tool archive](https://s3.eyeauras.net/media/2025/06/usb2kbd.zip). One board becomes Target and the other stays Programmer. Do not use these steps for a different board or microcontroller without its documentation.

The archive contains `main.hex`, the USBASP driver installer and `Khazama AVR Programmer.msi`. The boards from the original example: [Amazon](https://www.amazon.com/Ferwooh-Downloader-Programmer-Microcontroller-Adapter/dp/B08DTRPT1Z/) and [Robot-kit](https://robot-kit.ru/3370/).

1. With both boards unplugged from the computer, pick **Target (1)** and short its **JP2** pins. The jumper must join the right contacts and touch no others.

   ![JP2 on the target USBASP board](https://s3.eyeauras.net/media/2025/06/IMG_3698.jpg =x400)

2. Join Target (1) and **Programmer (2)** with the ribbon cable, with the connectors the right way round. Only Target has JP2 shorted.

   ![Target and Programmer joined by a ribbon cable](https://s3.eyeauras.net/media/2025/06/Photos_qt6wFLu8IX5vnwJi.jpg =x500)

3. Connect **Programmer (2)** to USB.

   ![The Programmer is connected to USB](https://s3.eyeauras.net/media/2025/06/Photos_vWVE1omRVkxzb9cU.jpg =x500)

4. Install the programmer driver with `driver/InstallDriver.exe`, then install `Khazama AVR Programmer.msi`. You need them only for flashing. You do not have to install them on a computer that just uses the finished HID device.

   ![USBASP programming-driver installer](https://s3.eyeauras.net/media/2025/06/explorer_x6YMxIwuDtx2HV4r.png =x400)

   ![Khazama installer](https://s3.eyeauras.net/media/2025/06/explorer_VGFKmZaWKioZokGt.png =x400)

5. Open Khazama and select **ATMEGA8**.

   ![ATMEGA8 selected in Khazama](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_hEAnG7Z8zxvdC2It.png)

6. Open **Command → Fuses and Lock Bits...** and click **Read All** to make sure the controller can be read. Do not change fuse bits just because yours look different from the picture. If reading fails, check the board, cable and jumper first.

   ![Opening Fuses and Lock Bits](https://s3.eyeauras.net/media/2025/06/msedge_vceQvSiBBDqVxB5r.png)

   ![Read All in the controller settings](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_jM5G6HgYIiMsMVhP.png)

7. Use **File → Load FLASH file to Buffer** to select `main.hex` from the archive. Check the path of the selected file.

   ![Loading a FLASH file into the buffer](https://s3.eyeauras.net/media/2025/06/msedge_9wdOK2WkAob19fpS.png)

   ![The selected main.hex firmware](https://s3.eyeauras.net/media/2025/06/msedge_wSXfntALbLMrrst4.png)

8. Click **Auto Program** and wait until it finishes successfully. It flashes Target, the board with the jumper.

   ![Auto Program in the original flashing example](https://s3.eyeauras.net/media/2025/06/Code_VJUOeYEfoezd2yXk.gif)

9. Disconnect power, unplug the ribbon cable and remove the JP2 jumper from Target. You can put Programmer away. Plug the flashed Target straight into USB and continue with the EyeAuras settings above.

   ![The finished device without its jumper](https://s3.eyeauras.net/media/2025/06/IMG_3701.jpg =x400)

</details>

## Older interface demonstrations

![Older Send Sequence demonstration through Usb2Kbd](https://s3.eyeauras.net/media/2025/06/EyeAuras_JDZlg740lGwiPBED.gif =x400)

![Older macro-node demonstration through Usb2Kbd](https://s3.eyeauras.net/media/2025/06/EyeAuras_ErWZbRhxLmhdb47W.gif =x500)

For ordinary system input or a virtual driver, choose another [input method](/en/actions/sendinput/options).
