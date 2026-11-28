---
title: Template Image Editor
description: Built-in template editor for Image Search. Crop, erase, remove color and resize.
published: true
date: 2026-03-26T18:00:00.000Z
tags: image search editor template
editor: markdown
dateCreated: 2026-03-26T18:00:00.000Z
---

# Template Image Editor — keep only the useful sample

The built-in editor prepares a template for Image Search. You keep the icon, remove the extra pixels and save the result into the trigger. Use it when a caption or background next to the icon keeps changing and should stay out of the template.

The editor changes the **saved template**. [Image Effects](/en/triggers/images/effects) process **each captured frame** before matching. Pick the one that matches the image you need to change.

## Keep an icon and remove its background

You need an **Image Search** trigger with a sample already loaded through **Load...**, the clipboard, or **Load from Preview Pane**. For this example, take an icon on a flat background. With a busy background, crop and erase instead of removing a whole color.

1. Under **Template source - what to search for**, click **Edit...**.
2. Choose **Crop**. Fit the frame around the icon so the caption and neighbors stay outside, then click **Apply crop**. The mouse wheel zooms the view. You can move the image inside the crop area.

   ![Crop selected in the template editor, a blue crop frame around the flamingo and Apply crop in the right panel](/assets/callouts/batch2/en/template-editor-crop.png =x700)

3. Choose **Remove Color**. Start with **Tolerance = 0%** and click a pixel of the flat background. If nearby shades remain, raise the tolerance a little and click again. A large tolerance can remove part of the icon.

   The checkerboard in the picture is transparency. Image Search does not compare those pixels:

   ![Remove Color with tolerance at 20% and a pink sampled color. Parts of the flamingo show the transparency checkerboard.](/assets/callouts/batch2/en/template-editor-remove-color.png =x700)

4. For single unwanted details, choose **Erase** and set a **Brush size**. Keep the distinctive lines and enough opaque pixels of the icon.
5. **Undo** or **Ctrl+Z** reverts a mistake. **Redo** or **Ctrl+Y** brings it back.
6. Click **Save** at the bottom. The template in the trigger should update. Then click **Refresh Once** in Image Search and check a frame with the icon and one without it.

## Resize the template when necessary

If the template is a different size from the icon in the captured frame, open **Resize**. It is easier to take the sample from the frame itself, so the scale matches.

| Resize control | Use |
| --- | --- |
| 50%, 75%, 100%, 125%, 150%, 200% | Preset template scales. |
| Width / Height | Exact size in pixels. |
| Scale | Scale as a percentage. |
| Keep aspect ratio | Keeps the proportions. On by default. |
| Apply | Applies the selected size to the sample. |
| Reset | Resets the resize settings to the current image. |

![Resize displays a width of 2401 pixels and a height of 1162 pixels with Keep aspect ratio enabled](/assets/callouts/batch2/en/template-editor-resize.png =x700)

If effects resize the captured frame, match the sample to their output.

<details>
<summary>Other tools and saving</summary>

| Control | Meaning |
| --- | --- |
| Erase → Brush size | Erases pixels with a brush. They become transparent. |
| Remove Color → Tolerance | How far a color may differ from the pixel you clicked. Similar colors are removed across the whole image, not only the background next to it. |
| Adjust → Brightness / Contrast / Saturation | Changes the sample's brightness, contrast and saturation. Apply commits the change. Reset resets the adjustment settings. |
| Fit / 1:1 | Changes the view scale, not the size of the saved template. |
| Save | Saves the result to the trigger. An unfinished crop is saved too. |
| Cancel | Closes the editor without changing the trigger. |

If the icon and the background share a color, Remove Color can remove both. Undo it, then keep the background or erase only selected areas.

</details>

Save does not overwrite the file you originally loaded the sample from. To get a separate copy, click **Save...** in [Image Search](/en/triggers/images/image-search).
