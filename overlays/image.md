---
title: Image
description: display static or animated images as in-game reminders, markers, or visual cues
published: true
date: 2023-06-18T16:49:11.857Z
tags:
editor: markdown
dateCreated: 2023-06-18T16:49:10.767Z
---

# Image — keep a reference picture in view

Load a wiring diagram, keyboard layout or other reference into Image and display it above your working application. A held key can show it only while you need to consult it.

Prepare your own PNG or JPEG. Animated GIFs are also supported: Image plays the file, rather than calculating a countdown or progress value from another application.

## Hold F8 to view your reference

1. Create an aura with one [Hotkey Is Active](/en/triggers/hotkey-is-active). Choose an unused **F8** and **Hold** mode.
2. Under **Overlays**, add **Image**. In its Image section, click **Load image from file...** and select the file. It appears in **Preview**.
3. Under **Visual style**, enable **Aspect Ratio** to preserve the picture's proportions when resizing.
4. Turn **Locked** off, place the overlay and resize it by its edge. Start large enough to read the details. Enable Locked again and optionally Click-through.
5. Switch to your working application, hold F8, then release it.

The picture appears while the key is held and hides on release. When the aura is selected for editing or Locked is off, the picture can stay visible independently of the key.

## Image settings

| Setting | What it does |
| --- | --- |
| Load image from file... | Loads file data. The dialog lists JPEG, PNG, BMP, GIF and TGA. |
| Preview | Shows the selected picture in the editor. |
| Clear | Removes the picture from the overlay. |
| Aspect Ratio | Preserves image proportions when resizing. Unavailable while position is linked to a source. |
| Position / Locked | Placement and locking; see [Common Options](/en/overlays/common-options). |

The loaded data is stored with the overlay configuration as an image resource. Editing the original disk file does not automatically update it: load the file again to replace the picture.

For a permanent reference, use [Fixed Value](/en/triggers/fixed-value) set to Is Active instead of the hotkey. For an actual changing region of another window, such as a progress indicator, use [Replica](/en/overlays/replica). An icon, logo, control diagram or animation remains content you supply; a separate trigger is needed for any event-dependent visibility.
