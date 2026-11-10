---
title: Augmentations
description: Why augmentations are useful and how to use them in training
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Add a controlled variation of annotated images

The **Augmentations** tab creates variants of your annotated frames while building a dataset. Rotation and reflection also transform the rectangles; blur and noise retain their geometry. Choose variations that your real source can produce. A rotated text button is not a substitute for an ordinary button.

You need your own YoloEase 2 project, completed rectangle-annotation tasks, [prepared prerequisites](/en/YoloEase/prerequisites) and a baseline without effects.

**Saved-image limitation:** the implementation shared by v2.0.90 and source revision `946be263` draws the original boxes in red and transformed boxes in cyan **into the saved PNG pixels**. These are not just preview outlines. They can become misleading training cues. For ordinary clean-frame training, leave augmentations disabled unless you have inspected the generated images and established that they fit your intended input.

## Configure one variant

1. Open **Augmentations**. With an empty list it shows **No augmentations configured**.

![The empty augmentations list in the earlier YoloEase 2.0.80 interface](https://s3.eyeauras.net/media/2026/05/7XUJ1VcSyO.png)

2. Click **Add**. In **Add new Augmentation**, select **Box Blur → Radius: 1px**. This creates a row; an identical setting cannot be added twice.

![Selecting an augmentation and its parameter](https://s3.eyeauras.net/media/2026/05/p0ezutBSKi.png)

3. Check the row's checkbox and **Properties**. To change the parameter, use **Remove**, confirm, then add the desired variant. Clear the checkbox for temporary exclusion.

![An enabled Noise 5 percent row in the earlier interface](https://s3.eyeauras.net/media/2026/05/4KpzkNcDVB.png)

The illustrations are from YoloEase 2.0.80. The row, parameter choices and **Add** route remain relevant; they are not a clean-image preview.

4. If you intend to examine generated data, select **Trainer → Local Training**, **Run once**, then **Start automatic training**. Dataset preparation reports **Applying … augmentation…** and dataset counts. This continues the whole training cycle; adding an effect is not a separate preview-only command.
5. In project storage, inspect `augmentations/<id>/`, `assets/training_with_effects/` and the XML ending `_augmented.xml`. Open a generated PNG and compare its object, coloured contours and saved rectangle. Disable the row for the next ordinary run if those pixels or the transformation do not match your source.

The observable outputs are the setting row, then separate image and annotation files after preparation. Their existence does not establish improved detection. Keep new real frames for a separate comparison.

| Effect or control | Parameters and behaviour |
| --- | --- |
| `Rotate` | Clockwise **90°**, **180°**, **270°**. At 90°/270°, image and rectangle width/height exchange roles. Use only orientations that actually occur. |
| `Flip` | **Horizontal** reflects left/right; **Vertical** reflects top/bottom. Class names stay the same. A mirrored interface may be an unrealistic training example. |
| `Box Blur` | **Radius: 1px**, **3px**, **5px**, **10px**. Geometry is unchanged; a large radius can hide a small object. |
| `Noise` | **5**, **10**, **20**, **50%** are per-pixel selection probabilities, not percentages of frames or exact selected-pixel counts. Selected RGB channels receive small random changes; alpha and rectangles are retained. |
| Row checkbox | Include this variant in the next build. There is no general per-frame application-probability setting. |
| `Remove` | Delete the setting after confirmation; the checkbox is sufficient for temporary exclusion. |

## Understand counts, order and cache

Each enabled effect starts independently from the source image. With `N` available annotated frames and `K` enabled effects, expect `N × K` extra variants plus the originals. **Noise** and **Box Blur** create two variants, not a chained **Noise + Blur** image. Reordering rows does not create sequential processing.

Original images and XML are not overwritten. Generated PNGs are cached under `assets/training_with_effects/`; intermediate links and XML are under `augmentations/`. Windows symbolic-link permission is required. Reusing the same settings can reuse cached noise, so another cycle does not necessarily create a new random pattern.

<details>
<summary>Boxes, classes and validation</summary>

| Preparation stage | What happens |
| --- | --- |
| Rotate / Flip | Rectangles move into the transformed image's geometry; their classes are retained. |
| Blur / Noise | Rectangle coordinates stay unchanged. |
| YOLO conversion | Coordinates are clipped to image bounds and normalised; boxes with zero area after clipping are skipped. |
| Class names | Export writes names into `data.yaml`; indices are assigned during conversion, not copied from internal project label IDs. |
| `Train/Validation % split` | Runs after variants are added. Augmentation is not restricted to training: an original and a close copy can enter opposite splits. |

A validation set containing near-copies of training frames is not independent evidence of useful accuracy. Check new real captures as well. This route handles rectangle annotation; it does not turn arbitrary rotated shapes into a supported OBB export.

</details>

Start without effects, then investigate a mild blur/noise variant only for a real variation, after accounting for the saved contours. For missing states, [add real data](/en/YoloEase/features/data-sources) first. Continue with [annotation and training](/en/YoloEase/annotate-and-train), [Trainer](/en/YoloEase/features/trainer), [YOLO ONNX](/en/YoloEase/features/yolo-onnx), [EyeAuras integration](/en/YoloEase/features/eyeauras-integration) or [diagnostics](/en/YoloEase/features/diagnostics).
