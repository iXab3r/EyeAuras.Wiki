---
title: Using Models in EyeAuras
description: From an ONNX model to ML Search and Behavior Tree
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Using YoloEase in EyeAuras

YoloEase prepares the `.onnx` model. EyeAuras uses it in `ML Search`, and then the Behavior Tree decides what to do with the detected objects.

Keep the `.pt` file for training and fine-tuning. For `ML Search`, use the `.onnx` file.

For a full walkthrough, see [EyeAuras integration](/YoloEase/features/eyeauras-integration).

## Quick start

1. Open the output folder from [Trainer](/YoloEase/features/trainer).
2. Take the `.onnx` model.
3. In EyeAuras, open `ML Search`.
4. Click the model load button and select the `.onnx` file.
5. Set the capture area so it matches the data used during training.
6. If you trained the model on frames with EyeAuras effects enabled, turn on the same effects before detection.
7. Enable `Enable OSD` and verify the bounding boxes without clicking anything.
8. Connect `ML Find Class`, then `Mouse Move`, and only add `Key Press` after everything works correctly.

![Load model in EyeAuras](https://s3.eyeauras.net/media/2026/05/RuS1yziKuU.png)

## Ready-made example

- [Recorded session](https://youtu.be/MdLETBZPeec)
- [Ready-made EyeAuras pack](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o)
- [ONNX weights](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.onnx)

## Read next

- [EyeAuras integration](/YoloEase/features/eyeauras-integration)
- [YOLO ONNX and model weights](/YoloEase/features/yolo-onnx)
- [Diagnostics](/YoloEase/features/diagnostics)
- [AI Search Trigger](/triggers/images/ai-search-trigger)
- [Behavior Trees](/behavior-trees/gettings-started)