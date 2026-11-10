---
title: Getting Started
description: A practical path from data to a working YOLO model
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2023-10-29T19:14:56.548Z
---
# Build your first detector with your own images

YoloEase keeps images, annotation tasks and training runs in one project. Start with a small manually reviewed task, train a first model, then use its suggestions to annotate more images. The model learns from saved boxes and their classes, not from class names alone.

Use Windows x64, YoloEase 2 from the [author's releases](https://github.com/iXab3r/YoloEase/releases/) and the [prepared environment](/en/YoloEase/prerequisites). For this example, collect **10 of your own PNG frames** showing targets and a button in different positions. Create the class names `tgt` and `btn` yourself; neither is built in. Include actual examples of both classes in the first task.

![YoloEase project creation screen](https://s3.eyeauras.net/media/2026/05/YoloEase_egOi46KQfu.png)

## Complete the first cycle

1. Click **New...** and save `MyTargets.yeproj` in your own local folder. Keep its neighbouring `MyTargets` working folder with it when moving the project.
2. On **Project**, use **Add label** to add `tgt`, then `btn`. Drop your PNG files onto **Drop folders, images, or videos here**. Individual images are copied into the project; [folder sources](/en/YoloEase/features/data-sources) have different ownership.
3. In **Trainer**, set **Batch size** to **50%** for these 10 unassigned images. Check that the displayed count is **5**, then click **Create Task**. The editor opens that task.
4. Select a label, press **N** and click opposite corners of each object. Review every frame and all relevant objects, then click **Finish Job**. Simply closing the editor saves work but does not complete a new task.
5. In **Settings → Training settings**, use `yolo11s.pt`, **Epochs = 50** and **Model Size = 640**. In Trainer, select **Local Training**, **Run once**, **Train/Validation % split = 80%**, then **Start automatic training**. Completed tasks supply the dataset; unaccepted suggestions do not.
6. Read the training and export steps. After a successful result, **open...** selects the created model in its output folder. Find the actual `.onnx`; `.pt` weights are for training and are not an EyeAuras model input.
7. Create the next task. In **Models**, add **Latest**, click **Load**, check its class mapping, enable **Create suggestions** and click **Run current**. Accept correct boxes, fix mistakes and **Finish Job** before training again.

The first concrete outputs are saved annotations, an exported ONNX file after successful training, and actual boxes after explicitly running that model on another frame. Test on separate images: a generation count or a larger dataset alone does not establish useful accuracy.

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

| Object in the workflow | What it means |
| --- | --- |
| Project | `.yeproj` settings plus its working folder: tasks, annotations, models and run history. External source folders remain separate dependencies. |
| Frame / task | One image / a selected batch of images to review. A task becomes training input after **Finish Job**. |
| Label / box | A class name / one object's annotated extent in an image. A new label does not create examples. |
| Prediction / suggestion | Model output / a temporary proposed box. Accept and save suggestions before they become annotation. |
| False positive / missed object | An extra detection / a required object the model did not find. Both need review, not automatic acceptance. |
| `.pt` / `.onnx` | PyTorch weights for further training / an export for a compatible inference application. |

## Use the result

In [EyeAuras](/en/YoloEase/use-in-eyeauras), first load ONNX in **Machine Learning(AI) Search**, select your own window and inspect boxes without input actions. Recognition and the decision to react are separate stages.

The earlier AimTrainer.io demonstration below uses `tgt` and `btn`; its behavior tree decides when to act. The detector sees captured pixels, not the trainer's internal game state. A compatible application can run the ONNX export without the training Python environment, but still needs its own parser and inference runtime.

![Earlier model and behavior-tree demonstration in EyeAuras](https://s3.eyeauras.net/media/2026/05/NM2dnxhLf6.png)

<details>
<summary>Choose your next step or inspect the author's example</summary>

| Your next task | Guide |
| --- | --- |
| Configure the project and labels | [Data preparation](/en/YoloEase/prepare-data) |
| Extract video frames | [Video splitter](/en/YoloEase/features/video-splitter) |
| Understand imports and external paths | [Data sources](/en/YoloEase/features/data-sources) |
| Draw, save and review boxes | [Annotation editor](/en/YoloEase/features/annotation-editor) |
| Repeat annotation and training | [Annotation and training](/en/YoloEase/annotate-and-train) |
| Control a run and locate its output | [Trainer](/en/YoloEase/features/trainer) |
| Add image variation | [Augmentations](/en/YoloEase/features/augmentations) |
| Check weights, export and compatibility | [YOLO ONNX](/en/YoloEase/features/yolo-onnx) |
| Configure a reaction after recognition | [EyeAuras integration](/en/YoloEase/features/eyeauras-integration) |
| Investigate a failure | [Diagnostics](/en/YoloEase/features/diagnostics) |

The author's example includes a [recorded session](https://youtu.be/MdLETBZPeec), an [EyeAuras pack](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o), [ONNX](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.onnx), [PyTorch weights](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.pt) and a [YoloEase project with run history](https://s3.eyeauras.net/media/2026/05/AimTrainerDemo.zip). They belong to that demonstration, not to your new training run. Inspecting the files does not require executing imported input actions.

</details>
