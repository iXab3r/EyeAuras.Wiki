---
title: Template Image Editor
description: quick editor for Image Search templates - crop, erase, remove color, and resize
published: true
date: 2026-03-26T18:00:00.000Z
tags: image search editor template
editor: markdown
dateCreated: 2026-03-26T18:00:00.000Z
---

# Template Image Editor — keep only the useful sample

If an icon has a changing caption or background, leave those pixels out of its Image Search template. The built-in editor can crop the sample, erase unwanted detail and store the result back in the trigger.

It changes the **saved template**. [Image Effects](/en/triggers/images/effects) changes **each captured frame** before matching. Choose according to which image needs work.

## Keep an icon and remove its background

Start with an **Image Search** trigger containing a sample loaded through **Load...**, the clipboard, or **Load from Preview Pane**. Use an icon on a flat background for this example; with a complex background, crop and erase without removing an entire color.

1. Under **Template source - what to search for**, click **Edit...**.
2. Choose **Crop**, frame the icon without its caption or neighbors, then click **Apply crop**. The mouse wheel zooms the view; you can move the image within the crop area.

   In this example, the crop keeps the flamingo and removes much of the empty space:

   ![Crop frame around the useful sample](https://s3.eyeauras.net/media/2026/03/EyeAuras_2GV7n4SiIU.png =x700)

3. Choose **Remove Color**, start with **Tolerance = 0%**, and click a flat-background pixel. If nearby shades remain, increase tolerance a little and select again. A large tolerance can remove part of the icon too.

   The checkerboard below represents transparency, excluded from Image Search comparison:

   ![Remove Color makes the background transparent](https://s3.eyeauras.net/media/2026/03/EyeAuras_GzpbgEXA4d.png =x700)

4. Choose **Erase** and a suitable **Brush size** for isolated unwanted detail. Keep distinctive lines and enough opaque pixels in the icon.
5. Use **Undo** or **Ctrl+Z** to revert a mistake; **Redo** or **Ctrl+Y** restores an undone edit.
6. Click **Save** at the bottom. The trigger's template should update. Back in Image Search, use **Refresh Once** on states with and without the icon.

These screenshots show the sample editor, not an object-recognition model. Transparency excludes pixels; it does not make the remaining template work at any size or rotation.

## Resize the template when necessary

Prefer capturing a sample at the same scale as the icon. If its dimensions differ, open **Resize**.

| Resize control | Use |
| --- | --- |
| 50%, 75%, 100%, 125%, 150%, 200% | Preset template scales. |
| Width / Height | Exact pixel dimensions. |
| Scale | Percentage scaling. |
| Keep aspect ratio | Preserves proportions; enabled by default. |
| Apply | Applies the selected size to the sample. |
| Reset | Resets resize parameters to the current image. |

![Resize controls with aspect ratio preservation](https://s3.eyeauras.net/media/2026/03/EyeAuras_bkvQJXOPqM.png =x700)

Shrinking only the template does not shrink the source application's icon. When capture resize effects are enabled, match the sample to their output.

<details>
<summary>Other tools and saving</summary>

| Control | Meaning |
| --- | --- |
| Erase → Brush size | Paints transparency onto the sample. |
| Remove Color → Tolerance | Selects similar colors throughout the image, not only adjacent background pixels. |
| Adjust → Brightness / Contrast / Saturation | Adjusts the sample. Apply commits the change; Reset resets adjustment parameters. |
| Fit / 1:1 | Changes the view scale, not saved pixel dimensions. |
| Save | Applies the edited result to the trigger, including an unfinished crop. |
| Cancel | Closes without applying the edited result. |

When the icon and background share a color, Remove Color can erase both. Undo and retain the background or erase selected areas instead.

</details>

Save does not overwrite the original file from which the sample was loaded. For a separate copy, use **Save...** in [Image Search](/en/triggers/images/image-search).
