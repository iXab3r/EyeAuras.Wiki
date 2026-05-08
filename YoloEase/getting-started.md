---
title: Getting Started
description: A practical path from data to a working YOLO model
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2023-10-29T19:14:56.548Z
---
# YoloEase

```text
start: label 5-10 frames by hand -> first model
                                 |
                                 v
tens/hundreds of frames -> auto-annotation -> review and fixes
         ^                                         |
         |                                         v
         +------------ new model <- Trainer <------+
                                 |
                                 v
                  .pt/.onnx -> EyeAuras or another app
```

YoloEase is designed to help you train a YOLO model that finds the objects you need in your frames. The result is standard `.pt` weights for further training and an `.onnx` file you can run without Python.

In this guide, EyeAuras is just an example of where a finished model can be used. In the AimTrainer.io example, the model detects targets `tgt` and the button `btn`, then EyeAuras loads the ONNX model into `ML Search` and clicks the detected targets through Behavior Tree.

![Start screen](https://s3.eyeauras.net/media/2026/05/YoloEase_egOi46KQfu.png)

## Practical quick start

Do not begin with a huge perfect dataset. The fastest path is a small manual seed set, then your first model, then larger tasks with auto-annotation.

1. Take the first `5-10` frames.
2. Label them by hand.
3. Start training.
4. While the first model is training, add a bit more manual annotation if you have time.
5. When the first model is ready, use it to auto-annotate the next task.
6. If auto-annotation is already helping, increase the task size: first tens of frames, then hundreds.
7. Review the model suggestions, fix mistakes, and send the task back into training.

Each cycle gives you a new model version. At first it will be weak, then it will help more and more. After a few generations, you stop drawing every box from scratch and mostly review and correct auto-annotation.

Read more about this workflow here: [annotation and training](/YoloEase/annotate-and-train), [Trainer](/YoloEase/features/trainer), [annotation editor](/YoloEase/features/annotation-editor).

## What gets created along the way

| Step | What you get |
| --- | --- |
| Video or folder | Source frames that will become your dataset. |
| `Extract frames` | Copies of frames inside the YoloEase project. |
| `Create Task` | An annotation task: small at first, later tens or hundreds of frames. |
| Annotation editor | Object boxes and labels such as `tgt` or `btn`. |
| `Finish Job` | A completed task that can be used for training. |
| `Trainer` | YOLO dataset, training runs, predictions, and model files. |
| `Open` on a model | Folder with `.pt`, `.onnx`, charts, and training results. |
| EyeAuras or another app | Real automation that uses the finished `.onnx`. |

## Short glossary

| Term | Meaning |
| --- | --- |
| Frame | A single image from a video or folder. |
| Label or class | The name of an object type: `tgt`, `btn`, `enemy`, `loot`. |
| Task | A batch of frames that is convenient to process in one pass. |
| `.pt` | PyTorch weights for training and fine-tuning through YOLO/Ultralytics. |
| `.onnx` | A file for running the model in EyeAuras or another compatible engine. |
| Prediction | Objects found by the model: box, class, and confidence. |
| Auto-annotation | Using an already trained model to label new frames faster. |
| False positive | The model detected an object where there is none. |
| Miss | The model failed to detect an object it should have found. |

## What you will end up with

By the end, you will have:

- a YoloEase project with source frames, tasks, annotations, and training history;
- `.pt` weights for further training in YOLO/Ultralytics;
- an `.onnx` model that runs without a Python environment;
- optionally, finished EyeAuras logic that uses `ML Search` and Behavior Tree.

![Final result](https://s3.eyeauras.net/media/2026/05/NM2dnxhLf6.png)

## Main workflow

1. Download the latest build from [GitHub releases](https://github.com/iXab3r/YoloEase/releases/) and start YoloEase.
2. Create a project through `New...`. YoloEase will show the standard save dialog for `.yeproj` and create a project folder next to it. Read more: [prepare data](/YoloEase/prepare-data).
3. Open `Prerequisites`, click `Check all`, then `Install missing`. Read more: [prerequisites](/YoloEase/prerequisites).
4. Add labels such as `btn` and `tgt`. Read more: [data sources](/YoloEase/features/data-sources).
5. Add a video or a folder with images. Read more: [data sources](/YoloEase/features/data-sources).
6. If the source is a video, extract frames through `Extract frames`. Read more: [extracting frames from video](/YoloEase/features/video-splitter).
7. In `Trainer`, create your first task. Read more: [Trainer](/YoloEase/features/trainer).
8. Annotate the first frames manually and make sure to click `Finish Job`. Read more: [annotation editor](/YoloEase/features/annotation-editor).
9. Start `Start automatic training` and review the metrics. Read more: [annotation and training](/YoloEase/annotate-and-train).
10. Use predictions and auto-annotation for the next tasks. Read more: [annotation editor](/YoloEase/features/annotation-editor) and [Trainer](/YoloEase/features/trainer).
11. Enable augmentations if needed. Read more: [augmentations](/YoloEase/features/augmentations).
12. Review the files produced after training. Read more: [YOLO ONNX and model weights](/YoloEase/features/yolo-onnx).
13. Plug the final `.onnx` into EyeAuras or another compatible recognition engine. Read more: [EyeAuras integration](/YoloEase/features/eyeauras-integration).

## Pages in this section

Main guides:

- [Prerequisites](/YoloEase/prerequisites)
- [Prepare data](/YoloEase/prepare-data)
- [Annotation and training](/YoloEase/annotate-and-train)
- [Using it in EyeAuras](/YoloEase/use-in-eyeauras)

Detailed feature pages:

- [Data sources](/YoloEase/features/data-sources)
- [Extracting frames from video](/YoloEase/features/video-splitter)
- [Annotation editor](/YoloEase/features/annotation-editor)
- [Trainer](/YoloEase/features/trainer)
- [Augmentations](/YoloEase/features/augmentations)
- [YOLO ONNX and model weights](/YoloEase/features/yolo-onnx)
- [EyeAuras integration](/YoloEase/features/eyeauras-integration)
- [Diagnostics](/YoloEase/features/diagnostics)

## Ready-made materials

If you want to see the finished result or repeat the example without building everything from scratch:

- [Recorded session](https://youtu.be/MdLETBZPeec)
- [EyeAuras pack with Behavior Tree and model](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o) — you can open the finished example and compare your setup with the final one.
- [ONNX weights](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.onnx)
- [PyTorch weights](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.pt)
- [Full YoloEase project with training history](https://s3.eyeauras.net/media/2026/05/AimTrainerDemo.zip)

## See also

If this is your first time running YoloEase, start with [prerequisites](/YoloEase/prerequisites). If your environment is already ready, go straight to [prepare data](/YoloEase/prepare-data).