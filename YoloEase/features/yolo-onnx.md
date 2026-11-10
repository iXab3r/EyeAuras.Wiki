---
title: YOLO ONNX and Model Weights
description: What YOLO, .pt, ONNX, model sizes, and opset mean
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Keep training weights and a compatible ONNX export

To use a model in EyeAuras, find the actual `.onnx` produced after successful training. Keep the `.pt` weights for further training. Renaming a file extension does not convert it.

This route trains **detect**: an image goes in, and boxes, classes and scores come out. YOLO also names pose, segmentation, classification and OBB models, which have different outputs. Class names such as `tgt`, `btn`, `enemy`, `loot` or `hp_bar` are names you annotate, not access to an application's internal data.

## Find your training result

You need completed tasks, [prepared prerequisites](/en/YoloEase/prerequisites), at least one training and one validation image, and compatible base weights.

1. In **Settings → Training settings → Yolo8/10+ base model**, select `yolo11s.pt` or your own compatible detect `.pt`. Set **Model Size = 640** and the intended **Epochs**, for example **50**.

![Base-model and image-size settings in the earlier YoloEase 2.0.80 interface](https://s3.eyeauras.net/media/2026/05/YoloEase_T7diUmh3YW.png)

The earlier image also shows older storage controls; use [project setup](/en/YoloEase/getting-started) for the current storage route.

2. In **Trainer**, select **Local Training**, **Run once**, then **Start automatic training**. Inspect training and export **output** separately. A `best.pt` does not establish a successful ONNX export.
3. Use **open...** at a successful result. Find the corresponding run under `datasets/<run-id>/`, normally `runs/train/weights`. Follow the actual output path when run naming differs.
4. Keep `best.pt`, `last.pt` and the exported ONNX. YoloEase renames the ONNX using project/model/run names; the `.pt` names remain unchanged.

![Separate best.pt, last.pt and ONNX files from an earlier run](https://s3.eyeauras.net/media/2026/05/1gcs8iFm66.png)

5. In **Machine Learning(AI) Search → Load from file...**, load the ONNX and inspect a real class in your own window using [integration](/en/YoloEase/features/eyeauras-integration).

The outputs are separate training weights and an inference file. Epoch counts, file existence and successful loading do not establish quality on new images.

| File or setting | Purpose |
| --- | --- |
| `best.pt` | Checkpoint selected as best by Ultralytics validation, usable for further compatible training. |
| `last.pt` | Last-epoch weights; retain them for later experiments. |
| `.onnx` | Exported graph and metadata for a compatible runtime. EyeAuras does not require the training Python environment to consume it. |
| `Yolo8/10+ base model` | A base-model name or local path. Availability depends on actual files and the managed Ultralytics version. |
| `Model Size` | Training image size such as 640, distinct from the architecture suffix. |
| `n`, `s`, `m`, `l`, `x` | Nano, small, medium, large and extra-large architecture variants within a family. Compare memory, speed and accuracy on your own data; larger does not guarantee better, nor does small universally outperform nano. |

## What the local wrapper requests

YoloEase runs these commands in its managed environment, substituting paths. They explain the generated operations; you do not need to run a second training command yourself:

```text
yolo task=detect mode=train plots=true project="<run-folder>/runs" model="<base-weights>" data="<data.yaml>" imgsz=640 epochs=50
yolo export model="<path-to-best.pt>" format=onnx opset=17
```

Other training arguments come from the project; see [Trainer](/en/YoloEase/features/trainer). The export wrapper does not explicitly supply `dynamic`, `nms` or a separate export size. Those behaviours depend on installed Ultralytics and the checkpoint; do not assume today's external defaults apply to your build.

`opset` identifies the ONNX operator-set version. This route explicitly requests **17**, which alone does not establish compatibility: the receiving program must understand the input, output and box extraction.

| Boundary | Check before transferring |
| --- | --- |
| Task | `detect` rectangles for this workflow, not an interchangeable pose/OBB/classification output. |
| EyeAuras input | Input named `images`, with fixed positive dimensions. Start with an ordinary square input such as **1×3×640×640**, in NCHW form. |
| Detection output | A supported three-dimensional coordinate/class-score layout, commonly **1×(4 + classes)×candidates**. Embedded NMS or another axis order changes the contract. |
| EyeAuras preprocessing | Stretch to model input, RGB and 0–1 normalisation; not an automatic adapter for every preprocessing scheme. |
| `names` and class order | The numeric output index must correspond to its name. Inspect names after loading, beyond the project's label list. |
| Engines and dependencies | Managed PyTorch/Ultralytics training, YoloDotNet CPU annotation and EyeAuras ONNX Runtime/parser are separate paths. Installed provider/native support is still needed. |

The demonstration ONNX for `btn`/`tgt` records input `images` **1×3×640×640**, output `output0` **1×6×8400**, opset17, `dynamic=False` and `nms=False`. Those are metadata for that specific file, not a template for every YOLO generation or class count.

<details>
<summary>Class mapping, cloud training and external models</summary>

The converter assigns `data.yaml` class indices as it encounters annotation names, rather than copying project label IDs. Ultralytics can carry them into ONNX `names`. Verify names and index order in EyeAuras. [Editor label mapping](/en/YoloEase/features/annotation-editor) affects that editor; it does not rewrite the file for another consumer.

The prepared ZIP/Google Colab route uses a separate environment. Return both training results and a compatible ONNX through the [Trainer workflow](/en/YoloEase/features/trainer); `best.pt` alone is insufficient for EyeAuras. Colab export settings are not automatically the local `opset=17` settings. Inspect the archive's real image/label contents before transfer: ZIP preparation in source `946be263` was revised after release v2.0.90, so that later implementation is not proof of the released binary's behaviour.

For an external model, compare its export with [official Ultralytics arguments](https://docs.ultralytics.com/modes/export/). Metadata inspection does not execute inference. An older runtime can reject newer operations, and a model can load yet produce an unsupported layout or incorrect classes. This guide does not promise every YOLO version, arbitrary ONNX or a universal parser/provider fallback.

</details>

The earlier example provides [ONNX](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.onnx), [PyTorch weights](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.pt) and the [YoloEase project](https://s3.eyeauras.net/media/2026/05/AimTrainerDemo.zip). They represent its classes and data, not your window. Check the owners' model/data terms before reuse. For failed export or loading, start with [diagnostics](/en/YoloEase/features/diagnostics) and the affected stage's output.
