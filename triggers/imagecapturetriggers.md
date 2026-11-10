---
title: Image, Text, and Color Search
description: Overview of image, text, and color search features.
published: true
date: 2022-11-04T01:31:11.699Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-04T01:04:28.005Z
---
# Choose the capture source for image, text or colour search

If you arrived through the older **Image / Text / Color Search** address, use the shared capture section of the relevant search trigger. This is the same pixel-capture mechanism covered by the [current capture guide](/en/triggers/images/imagecapturetriggers), not a second legacy trigger.

## Inspect your own source before adding a condition

Suppose you want to monitor a small coloured indicator in your own application. First obtain the right pixels; choosing the colour and a reaction comes afterwards.

1. Open your test application and add **Color Search** to your aura.
2. In **Capture settings → Target Window**, select its window. Set **Image Capture Rate = 5 Frames Per Second**.
3. Open **Preview captured image**. If the image is wrong, use **Show more... → Capture Source** to compare available methods. Start with **Windows Graphics** when available.
4. Limit **Crop region** to the indicator using the preview. Change the indicator in your application and confirm that the same area changes in the capture.

The result is the current image of your indicator, not automatically an **Active** condition. Next configure [Color Search](/en/triggers/images/color-search); add sound or another reaction separately as an aura action.

| Earlier label | Current correspondence |
| --- | --- |
| `Target FPS` | **Image Capture Rate**, the requested capture/analysis rate. Processing load can reduce actual FPS. |
| `Mouse Cursor` | **Capture Mouse Cursor**; not every capture source supports it. |
| `Settings → Max Capture FPS` | Global trigger limit, which can cap an individual trigger's requested rate. |
| Capture method | **Show more... → Capture Source**. Recheck pixels and bounds after switching. |

| Capture Source | How to evaluate it |
| --- | --- |
| `Windows Graphics` | Windows Graphics Capture for a window. Availability depends on Windows API support; disabling its system border also requires the corresponding API, not a universal version-number promise. |
| `Shared Surface` | An alternative graphics-surface path for the window. Compare its actual frame when the system method does not fit. |
| `Desktop duplication` | GPU desktop capture cropped to the region; consider overlapping windows. |
| `Print Window` | Win32 window capture; hardware-rendered content can be empty or incomplete. |
| `Copy Device Context` | A GDI alternative compatible with some windows. |
| `Copy From Screen` | Copies the visible screen area, affected by window position and occlusion. |

Choose by correct pixels first, then actual FPS and processing timings in the preview tooltip. A fixed speed or memory ranking does not establish the best method for your window. A minimised or unavailable window is not a dependable source of fresh frames.

Continue with [capture, crop and effects](/en/triggers/images/imagecapturetriggers), then [image search](/en/triggers/images/image-search), [colour search](/en/triggers/images/color-search), [text search](/en/triggers/images/text-search) or [AI Search](/en/triggers/images/ai-search-trigger).
