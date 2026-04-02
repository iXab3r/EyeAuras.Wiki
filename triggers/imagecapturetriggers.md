---
title: Image, Text, and Color Search
description: Overview of image, text, and color search features.
published: true
date: 2022-11-04T01:31:11.699Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-04T01:04:28.005Z
---
# Image / Text / Color Search

This group of triggers is based on image capture and analysis. The window selection and capture settings are shared, while the analysis settings depend on the specific trigger type.

## Settings

- **Target FPS** — sets how often EyeAuras should capture and process the image. In most cases, the actual FPS will be lower, because analysis tasks such as text recognition or image search take a noticeable amount of time and resources.
- **Mouse Cursor** — some capture methods support enabling or disabling cursor capture. This setting controls that behavior.
- **Settings => Max Capture FPS** — this setting limits FPS for all triggers globally.

## Capture Methods

- **Windows Graphics** — based on the official Windows capture API. One downside is that on versions older than **10.0.19041.0**, the captured window gets a yellow border. On newer Windows versions, that border is no longer shown.
- **Shared Surface** — based on copying the GPU memory region where the window image is stored. In general, it is very similar to Windows Graphics, but works at a lower level and is therefore less reliable.
- **Desktop Duplication** — based on copying the GPU memory region that contains the full desktop image. The image is then cropped to the required region.
- **Print Window** — uses an older API. Overall, it is a fairly universal and performant capture method, but it cannot capture some types of windows, such as browsers.
- **Copy Device Context** — one of the legacy capture methods, kept mostly for academic purposes. It is not needed in most situations.
- **Copy From Screen** — the slowest and least efficient capture method. In practice, it takes a screenshot of the screen and then works with that image.

The main recommended capture method is **Windows Graphics**. It offers the best CPU/RAM balance, but in some cases games may block it. If that happens, use the list below to choose an alternative.

###### Sorted by performance

Windows Graphics > Shared Surface > Desktop Duplication > Print Window > Copy Device Context

###### Sorted by memory usage (higher in the list = lower usage)

Print Window > Windows Graphics > Shared Surface > Copy Device Context > Desktop Duplication > Copy From Screen