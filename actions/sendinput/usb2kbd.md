---
title: Creating your own Usb2Kbd
description: 
published: true
date: 2025-06-26T22:55:20.068Z
tags: 
editor: markdown
dateCreated: 2025-06-26T21:39:17.968Z
---

[Usb2Kbd](https://usb2kbd.ru/) is an Arduino-based input device capable of sending key presses on command. In essence, it's a programmable keyboard/mouse.  
With this device, you can automate even the most uncooperative software or systems.

## Why not just buy it from the official site?

You **can** buy a pre-flashed device from the author. However, due to recurring issues with different device batches in the past, a more reliable solution is to build a clone yourself — this way, you get a proven working device with a verified firmware version.

The author’s distribution model assigns a **unique VID/PID** and bundles a **custom DLL** with each device. This is **extremely** inconvenient when using the device on multiple machines or sharing setups.  
Additionally, the original DLLs had multiple bugs that had to be patched on the client side. As of now, **EyeAuras does NOT use any extra libraries** and communicates with the device directly.

![Close up](https://s3.eyeauras.net/media/2025/06/IMG_3699.jpg =x400)

# What You’ll Need

- 15 minutes of your time
- Firmware tool: **Khazama AVR Programmer** (included in archive)
- USBASP driver (included in archive)
- Firmware file (included in archive)
- **TWO** (important!) **USBASP** devices based on **ATMega8** – costs around **$5** each  
  - [US] Amazon – example: https://www.amazon.com/Ferwooh-Downloader-Programmer-Microcontroller-Adapter/dp/B08DTRPT1Z/  
  - [RU] Robot-kit – https://robot-kit.ru/3370/
- Cable to connect the devices (usually included)
- Paperclip or jumper – needed to short **JP2** on the device being flashed

# Instructions

### Download the archive with prerequisites
Download link: –

### Prepare the target device – short JP2
Pick one of the devices — doesn't matter which. Initially, both are the same. One will become your Usb2Kbd device, the other will act as the programmer.

On the **target device** (the one you're flashing), **short the JP2 pins**. A paperclip works — just make sure the contacts aren’t touching anything else.

![Target device](https://s3.eyeauras.net/media/2025/06/IMG_3698.jpg =x400)

### Connect the devices

Use the ribbon cable to connect both devices. Make sure it’s firmly seated.

You should have something like this:

- **Target (1)** – the one being flashed (with JP2 shorted)
- **Programmer (2)** – used to flash Target (1)

![Wired](https://s3.eyeauras.net/media/2025/06/Photos_qt6wFLu8IX5vnwJi.jpg =x500)

### Connect to the computer

Plug **Programmer (2)** (the one WITHOUT the jumper) into a USB port.

A light may turn on (depends on the model), first on **Programmer (2)**, then on **Target (1)**.  
_P.S.: After flashing, the LED on Target (1) will no longer light up — useful to tell them apart._

![Inserted](https://s3.eyeauras.net/media/2025/06/Photos_vWVE1omRVkxzb9cU.jpg =x500)

### Install USBASP driver

Run `InstallDriver.exe` from the `driver` folder in the archive.  
Installation is just: **Next → Next → Finish**.

![Driver Install](https://s3.eyeauras.net/media/2025/06/explorer_x6YMxIwuDtx2HV4r.png =x400)

### Install Khazama AVR Programmer

Run `Khazama AVR Programmer.msi` from the archive.  
Installation is also: **Next → Next → Finish**.

![Khazama Install](https://s3.eyeauras.net/media/2025/06/explorer_VGFKmZaWKioZokGt.png =x400)

### Launch Khazama AVR Programmer

Launch it from Start Menu or via shortcut.  
Select **ATMEGA8** in the dropdown.

![Khazama UI](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_hEAnG7Z8zxvdC2It.png)

### Verify connection & jumper

Go to `Command` → `Fuses and Lock Bits...`.

![Open Fuses](https://s3.eyeauras.net/media/2025/06/msedge_vceQvSiBBDqVxB5r.png)

Click **Read All**. If successful, you’ll see values appear in a few seconds.  
If there’s an error — something’s wrong with your previous steps.

![Fuses](https://s3.eyeauras.net/media/2025/06/Khazama_AVR_Programmer_jM5G6HgYIiMsMVhP.png)

### Load the firmware file

Final step: locate the file `main.hex` in the archive — this is the firmware.

In Khazama, go to `File` → `Load FLASH file to Buffer`.

![Load FLASH](https://s3.eyeauras.net/media/2025/06/msedge_9wdOK2WkAob19fpS.png)

Choose `main.hex`.

![Loaded flash](https://s3.eyeauras.net/media/2025/06/msedge_wSXfntALbLMrrst4.png)

### Flash it

Now just click **Auto Program**, wait a few seconds… and you’re done!  
You now have a working Usb2Kbd device for **EyeAuras**.

🚨 **IMPORTANT**: You flashed **Target (1)** — the one with the jumper. That’s the one you’ll use from now on. Don’t forget to remove the jumper — it won’t work otherwise.

You can store **Programmer (2)** away in case you want to flash more units later.

![Flash](https://s3.eyeauras.net/media/2025/06/Code_VJUOeYEfoezd2yXk.gif)

### Plug it into your computer

Unplug **Programmer (2)**, remove the jumper from **Target (1)**, and unplug the cable.  
You can now plug the device into **any computer** — **no extra drivers or tools needed**.

You’ve got a ready-to-use input emulator!

![Usb2Kbd](https://s3.eyeauras.net/media/2025/06/IMG_3701.jpg =x400)

---

### Using it in EyeAuras

- Create an aura in any folder
- Add a `Send Sequence` action
- Open `Advanced input settings`
- Choose `Usb2Kbd device` from the list  
  Notice the orange exclamation icon — it means the device is not yet set up

![SendSequence](https://s3.eyeauras.net/media/2025/06/EyeAuras_u05n6CbeSHjASUB3.png =x600)

- Click `Install`
- In the popup, click `Detect automatically`
- Click OK

![Usb2Kbd settings](https://s3.eyeauras.net/media/2025/06/ShareX_dfe3exVzay6OP5YN.png =x200)

- If everything worked, the orange icon will disappear
- Done! This configuration is **global**, so any action using Usb2Kbd will now simulate input through the device

![Result](https://s3.eyeauras.net/media/2025/06/EyeAuras_jFqVNV0vHSnfn5dJ.png)

💡 **Tip**: Set `Usb2Kbd` on the **folder level** — it will apply to all auras/macros inside

![Folder properties](https://s3.eyeauras.net/media/2025/06/EyeAuras_X3t0uKQGRPWRfFLN.png)
```
