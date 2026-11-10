---
title: Data Labeling and Model Training
description: How to label your first frames, train a model, and improve it with auto-labeling
published: true
date: 2026-05-08T12:00:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Train once, review the next task, then repeat

Use a small manually reviewed seed task to obtain a model, then let that model suggest boxes on more of your own images. You still decide which boxes are correct. Training can run while you review a later task, but only completed tasks available when the dataset is prepared enter that run.

You need [prepared components](/en/YoloEase/prerequisites), a [project with labels and real images](/en/YoloEase/prepare-data), and permission to write its working folder. The example uses 10 PNG frames and your own `tgt` and `btn` classes. Include different positive examples and background; those names are not built-in object knowledge.

## Make the first task

1. Open **Trainer**, click **Refresh** and set **Batch size = 50%**. For 10 unassigned files, check the displayed count is **5**, then **Create Task**. Before a first model exists, the prediction step is skipped.

![Trainer before the first model is available](https://s3.eyeauras.net/media/2026/05/YoloEase_e7nteB308n.png)

2. In the editor, select the class and press **N**. Click opposite corners of every intended object and review all five frames. A reviewed empty background frame can remain empty.

![A new task before manual annotation](https://s3.eyeauras.net/media/2026/05/YoloEase_WpUxt25zLI.png)
![Manually annotated target examples](https://s3.eyeauras.net/media/2026/05/YoloEase_AT0n2plVpV.png)
![Button and target annotations use separate classes](https://s3.eyeauras.net/media/2026/05/YoloEase_8VeAPbGp5G.png)

3. Click **Finish Job**. This saves and completes the task; closing the editor alone is insufficient. [Editor shortcuts and saving](/en/YoloEase/features/annotation-editor).

![A completed first task ready for training](https://s3.eyeauras.net/media/2026/05/YoloEase_0N5rmLKhsA.png)

## Train and locate a real output

4. In **Settings → Training settings**, choose `yolo11s.pt`, **Epochs = 50**, **Model Size = 640**. In Trainer select **Local Training**, **Run once**, **Train/Validation % split = 80%**, then **Start automatic training**. The dataset needs at least one training image and one validation image; small-set rounding affects the actual counts.

![An earlier local training run and its epoch output](https://s3.eyeauras.net/media/2026/05/YoloEase_pNV4AW3F2r.png)

5. Read the stage output for a successful training result and ONNX export. **Cycle completed** can also appear after an error or cancellation. Open the metrics to inspect this run, without treating completion or a low loss as a guarantee of useful detections.

![Metrics from an earlier small training run](https://s3.eyeauras.net/media/2026/05/YoloEase_UQNGLfMszk.png)

6. Use **open...** at a successful training result to select the produced file. Keep the `.pt` weights for further training and the actual `.onnx` for a compatible inference host. Detailed settings and output paths: [Trainer](/en/YoloEase/features/trainer).

## Review predictions and the next task

7. Refresh after a model becomes available. Review its predictions and class thresholds to choose useful new frames. **Annotated-first** prefers unassigned files with predictions, then fills randomly; it does not prove that those images contain the model's worst errors.

![Predictions used to inspect available images](https://s3.eyeauras.net/media/2026/05/YoloEase_eUeVre8Bbg.png)
![A prediction for the button class](https://s3.eyeauras.net/media/2026/05/YoloEase_fDH7TdlEga.png)
![Predictions for target objects](https://s3.eyeauras.net/media/2026/05/YoloEase_jPrfbGeQtE.png)

8. Create the next task and add **Latest** in **Models**. Click **Load**, check class mapping, enable **Create suggestions**, and use **Run current** or **Run all**. This is explicit inference by the selected model.

![Loading a model for a later task](https://s3.eyeauras.net/media/2026/05/YoloEase_jEFZb2nxWc.png)
![Model-assisted annotation ready for review](https://s3.eyeauras.net/media/2026/05/YoloEase_KMBzwXfQT9.png)

9. Accept correct suggestions, adjust boxes and classes, draw missed objects and remove false positives. **Accept**/**Accept all** is required for temporary suggestions to become saved annotation. Direct box creation with **Create suggestions** off still needs review.

![Deleting an extra detection](https://s3.eyeauras.net/media/2026/05/YoloEase_UyYYi1dOFb.png)

10. Click **Finish Job**, then start another **Run once**. Completed tasks are collected again; it is not automatic checkpoint resumption. To fine-tune an existing run, explicitly select its compatible `.pt` as the base model.

| Stage | What to check before continuing |
| --- | --- |
| Manual seed task | Every intended object has a consistent class and box; reviewed negatives are deliberate. |
| Training and export | The actual stage succeeded and an ONNX file exists, beyond a process starting or a cycle ending. |
| Predictions | The correct model, classes and thresholds are selected; missing and extra boxes remain visible review work. |
| Next completed task | Accepted/corrected boxes are saved with **Finish Job**, so they can enter the next dataset. |

## Decide whether another cycle helps

Compare models on images held out from training. More cycles do not guarantee better accuracy, particularly when new frames are near-duplicates or errors were accepted as truth. Increase task size only when suggestions are useful enough to review efficiently.

![Metrics from another demonstration generation, not an expected improvement target](https://s3.eyeauras.net/media/2026/05/YoloEase_IQStvCNnhh.png)

Use **All tasks** to reopen completed tasks and correct earlier annotation. You can run a newer model there, but review what it changes before finishing the task again.

![Reopening completed tasks for correction](https://s3.eyeauras.net/media/2026/05/IBbk1nDkee.png)

Each run retains its weights, reports and export in the working folder. **open...** selects its model output.

![Opening a model result from Trainer](https://s3.eyeauras.net/media/2026/05/YoloEase_AKduA4R9xH.png)
![Output weights and export from an earlier run](https://s3.eyeauras.net/media/2026/05/1gcs8iFm66.png)

Read [YOLO ONNX](/en/YoloEase/features/yolo-onnx) for file formats and model-size/opset limits. Use [augmentations](/en/YoloEase/features/augmentations) for controlled image variation, [EyeAuras](/en/YoloEase/use-in-eyeauras) to inspect a compatible model on your window, or [diagnostics](/en/YoloEase/features/diagnostics) for a failed stage.
