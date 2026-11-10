---
title: Augmentations
description: Short link to the detailed augmentations page
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Decide whether your dataset needs image variations

If a first model misses slightly blurred or noisy versions of objects you already annotated, use [the detailed augmentations guide](/en/YoloEase/features/augmentations). This short guide leads to the same **Augmentations** tab and helps you decide whether to use it.

Start with your own project, a completed annotation task and a baseline training result without effects.

1. Inspect errors on new real frames. For missing objects or window states, first [add and annotate those images](/en/YoloEase/features/annotation-editor).
2. For an actual pixel variation, inspect one mild option such as **Box Blur → Radius: 1px** using the [detailed procedure](/en/YoloEase/features/augmentations). Read its saved-image limitation first: the current generator draws coloured annotation contours into the PNG itself.
3. Check enabled rows before the next [Trainer](/en/YoloEase/features/trainer) cycle. Clear a row's checkbox to exclude it without deleting the setting.

You now have a deliberate dataset-preparation choice. Adding a row alone does not change images; variants are produced during dataset construction before training, with the original annotations retained.

| Your situation | Next step |
| --- | --- |
| No baseline model yet | Leave augmentations empty and obtain a first result. |
| Need variations of existing annotated frames | Check the generated images and transformed boxes in the detailed guide; do not assume clean output without contours. |
| Need to transform pixels before every recognition call | Use [EyeAuras effects](/en/triggers/images/effects), consistently for recording and inference. These are a different pipeline. |

For the exported model and the difference between `.pt` and `.onnx`, continue with [YOLO ONNX](/en/YoloEase/features/yolo-onnx).
