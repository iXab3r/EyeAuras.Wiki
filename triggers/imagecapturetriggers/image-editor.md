---
title: Image Template Editor
description: Quick template editor for Image Search with crop, erase, color removal, and resize tools
published: true
date: 2026-03-26T18:00:00.000Z
tags: image search editor template, ai-translated
editor: markdown
dateCreated: 2026-03-26T18:00:00.000Z
---
# Image Template Editor

`Image Search` now includes a built-in editor for quickly cleaning up a template before using it in search.

It is designed for small, practical edits:
- crop the useful area
- erase unwanted pixels
- remove a background by color
- resize the template
- undo and redo changes

The editor is intentionally simple. It is not a full graphics editor and it is not a replacement for [Image Effects](/en/triggers/images/effects), which are applied to the captured image in real time. This editor modifies the template itself and saves the result back into the trigger.

## How to open it

In `Image Search`, load or capture a template, then click `Edit...` next to the preview.

After you save, the updated image is written directly into the trigger, so you can immediately test the result in search.

## Main features

### Remove Color

`Remove Color` is useful when the template has a flat background or a color that should not be part of the comparison. Click a pixel, adjust the tolerance, and EyeAuras will make similar colors transparent.

![Remove Color](https://s3.eyeauras.net/media/2026/03/EyeAuras_GzpbgEXA4d.png =x700)

### Crop

Use `Crop` to keep only the part of the image that actually matters for search. The cleaner and more compact the template is, the easier it is to configure and the better it usually works.

![Cropping](https://s3.eyeauras.net/media/2026/03/EyeAuras_2GV7n4SiIU.png =x700)

### Resize

`Resize` lets you change the template size using preset percentages or enter a custom size manually. This is useful when you want to shrink a template, match a specific size, or quickly test a slightly different scale.

![Resize](https://s3.eyeauras.net/media/2026/03/EyeAuras_bkvQJXOPqM.png =x700)

### Erase

`Erase` lets you paint transparency directly onto the template. This is useful for removing noisy corners, particles, glow, and other small details that constantly change in-game.

### Undo / Redo

Use `Ctrl + Z` and `Ctrl + Y` to move through your recent changes. This makes it easy to try several cleanup options without reloading the image.

## When to use it

Use the template editor when you need to modify the template image itself.

Use [Image Effects](/en/triggers/images/effects) when you need to preprocess the live captured image before search.