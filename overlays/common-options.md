---
title: Common Options
description:
published: true
date: 2023-06-18T16:39:19.091Z
tags:
editor: markdown
dateCreated: 2023-06-18T16:39:17.957Z
---

# Common Options

Overlays in EyeAuras are visual indicators displayed when an Aura is active. They provide a way to add on-screen cues or instructions to guide your automation steps. Each Overlay has a set of common attributes that determine its behavior and appearance.

### IsLocked

The `IsLocked` option allows you to control the mobility of the overlay. When an overlay is unlocked, it can be moved around the screen, and it's displayed regardless of whether the Aura that contains it is active or not. This feature is particularly useful when configuring the overlay's position and previewing its appearance.

### Position, Offset and Anchors

The position of an overlay is determined by its X (horizontal) and Y (vertical) coordinates, as well as its width and height.

The `Offset` settings (X, Y, Width, Height) are also used to define the position of an overlay. They are added to the Position values to calculate the overlay's final position. For instance, if the Position is set at (100, 100) and the Offset is (10, 20), the final position of the overlay will be (110, 120).

[More information is available here](/en/coordinate-system)

### Opacity

The `Opacity` option determines the transparency of the overlay. A value of 0 makes the overlay fully transparent, while a value of 1 makes it fully opaque.

### Background Color

This option allows you to specify the background color of the overlay. The overlay can also be made transparent.

### Click-through

The `Click-through` option makes the overlay transparent to user clicks. This means that any clicks on the overlay will be registered as clicks on whatever is beneath the overlay. Please note that this option is not functional when the overlay is unlocked.

### Aspect Ratio

Supported by some overlays, the `Aspect-ratio` feature ensures that the overlay maintains the aspect ratio of its content, such as an image, when resized.

### Border Thickness and Color

You can control the thickness of the overlay's border using the `Border thickness` option. You can also define its color with the `Border color` setting.
