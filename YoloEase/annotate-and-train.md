---
title: Data Labeling and Model Training
description: How to label your first frames, train a model, and improve it with auto-labeling
published: true
date: 2026-05-08T12:00:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Annotation and Training

Your first model will almost always start with manual annotation. After that, YoloEase uses the latest model for predictions and helps you label the next tasks much faster.

## Start small, then scale up

A practical workflow looks like this: annotate `5-10` frames by hand, train, do a bit more manual annotation, get your first model, then move on to tasks with dozens or hundreds of frames using auto-annotation. Do not wait until you have built a large dataset manually.

This is exactly where YoloEase works best: `Trainer` prepares a new model in the background while you review the next task. As the model improves, you can use larger batches and draw fewer boxes from scratch.

## Create your first task

Open the `Trainer` tab. If you do not have a model yet, the prediction step will be skipped, and `Create Task` will select frames from the available data.

![Trainer before model](https://s3.eyeauras.net/media/2026/05/YoloEase_e7nteB308n.png)

Click `Create Task`, then open the task through `Annotate Task` or from the task list.

More details about batch size, prediction strategy, and progress tracking: [Trainer](/YoloEase/features/trainer).

## Annotate the first frames

The empty editor shows labels on the right, frame navigation at the top, and the toolbar on the left. At this stage there are no objects yet, and the `Models` block tells you that no trained ONNX model has been found.

![Empty annotation editor](https://s3.eyeauras.net/media/2026/05/YoloEase_WpUxt25zLI.png)

Select a label and draw rectangles around the objects. For AimTrainer.io, that means the small `tgt` targets and the `btn` button.

![Annotating targets](https://s3.eyeauras.net/media/2026/05/YoloEase_AT0n2plVpV.png)

![Annotating button and targets](https://s3.eyeauras.net/media/2026/05/YoloEase_8VeAPbGp5G.png)

When the task is ready, click `Finish Job`. This step is important: completed tasks are included in the next training dataset.

For details about the toolbar, hotkeys, boxes, model suggestions, and label matching, see the [annotation editor](/YoloEase/features/annotation-editor).

![Ready for first training](https://s3.eyeauras.net/media/2026/05/YoloEase_0N5rmLKhsA.png)

## Start training

Go back to `Trainer` and start local training. YoloEase will build a dataset from completed tasks, split the images into training and validation sets, and then start training.

![Training running](https://s3.eyeauras.net/media/2026/05/YoloEase_pNV4AW3F2r.png)

When training finishes, open the metrics. The first result may look noisy, and that is normal when you do not have much data yet.

![Training metrics](https://s3.eyeauras.net/media/2026/05/YoloEase_UQNGLfMszk.png)

## Review predictions

Once a model is available, YoloEase can run predictions on frames. This helps you see what the model has already learned, where it makes mistakes, and which frames are worth adding to the next task.

![Prediction preview](https://s3.eyeauras.net/media/2026/05/YoloEase_eUeVre8Bbg.png)

![Prediction with button](https://s3.eyeauras.net/media/2026/05/YoloEase_fDH7TdlEga.png)

![Prediction on targets](https://s3.eyeauras.net/media/2026/05/YoloEase_jPrfbGeQtE.png)

## Use the model for auto-annotation

Open the next task. Now you can add `Latest` in the `Models` block, load the model, and run it on the current frame or on the entire task.

![Editor with model](https://s3.eyeauras.net/media/2026/05/YoloEase_jEFZb2nxWc.png)

After you run it, the model will either create suggestions or add boxes directly if that option is enabled. Review the result visually.

![Auto annotated task](https://s3.eyeauras.net/media/2026/05/YoloEase_KMBzwXfQT9.png)

If the model creates suggestions, they stay temporary until you click `Accept` or `Accept all`. Suggestions that are not accepted will not be used for training.

If the model added an extra object, select it and remove it with `Q`, `Delete`, or `Backspace`.

![Removing false positive](https://s3.eyeauras.net/media/2026/05/YoloEase_UyYYi1dOFb.png)

## Repeat the next generations

After the second and third iteration, quality usually improves noticeably: the model helps annotate more frames, and you mostly fix mistakes instead of drawing everything manually.

![Second generation metrics](https://s3.eyeauras.net/media/2026/05/YoloEase_IQStvCNnhh.png)

You can reopen completed tasks if you want to annotate them again with a newer model or fix older mistakes.

![Reopen completed tasks](https://s3.eyeauras.net/media/2026/05/IBbk1nDkee.png)

The final weights are stored in the training run folder. Use `Open` in `Trainer` to open the output folder and retrieve `best.pt`, `last.pt`, and `.onnx`.

![Open model folder](https://s3.eyeauras.net/media/2026/05/YoloEase_AKduA4R9xH.png)

![Model output files](https://s3.eyeauras.net/media/2026/05/1gcs8iFm66.png)

What `.pt`, `.onnx`, model size, and opset mean: [YOLO ONNX and model weights](/YoloEase/features/yolo-onnx).

If your dataset is small or the objects look too repetitive, move on to [augmentations](/YoloEase/features/augmentations). If the model is already good enough, connect it in [EyeAuras](/YoloEase/use-in-eyeauras). If something breaks, open [diagnostics](/YoloEase/features/diagnostics).