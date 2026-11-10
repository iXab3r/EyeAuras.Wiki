---
title: "Train your own reviewed detector and inspect its boxes"
description: "Review owned images, complete annotation, train and export a compatible detector, then inspect boxes without input actions."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Train your own reviewed detector and inspect its boxes

Teach a detector one visual class from your own images, then inspect its boxes on new images in EyeAuras. The result is a reviewed data-to-boxes workflow, not an automatic reaction or a promised accuracy level.

Use **YoloEase 2 on Windows x64** with its managed training toolchain and writable project storage, including symbolic-link permission. This route follows source revision **946be263** and the **v2.0.90** release line; the later source is not a promise that every change is in the released binary. EyeAuras is a separate consumer with its own OpenCV/ONNX Runtime, model parser and available provider. Training is not part of the main EyeAuras editor.

## Prepare independent images and complete a task

1. Prepare **20 of your own PNG images** containing a clearly identifiable object, for example your own orange desk marker, and genuine empty/background cases. Vary position, lighting and background across independently taken scenes. Reserve **5 additional, independently taken images** outside the project for the final check, including positive and negative cases. Do not split adjacent video frames, copies or variants of the same scene between training and validation.
2. In YoloEase click **New...** and save **OwnMarker.yeproj** in your own local folder. Keep the neighbouring **OwnMarker** working folder with it. In **Prerequisites**, click **Check all**, expand errors, use **Install missing** for the managed dependencies, then **Check all** again. CPU is supported; the informational GPU rows do not require a GPU for this route. Installation may download Python/packages/weights; it does not install a graphics driver. [Environment details](/en/YoloEase/prerequisites).
3. In **Settings** choose **Backend = Offline**. On **Project → Add label**, set **Label name = marker**, choose a colour, then **Add**. Drop only your 20 project PNGs onto **Drop folders, images, or videos here**. Individual images are copied into the project. A new class name does not create training examples.
4. In **Trainer**, click **Refresh**, set **Batch size = 100%** and check that **20** unassigned files are selected. Click **Create Task**. In **Labels** select `marker`, press **N** and click opposite corners around every intended object. Use unrotated boxes with one consistent object-boundary policy. Inspect every frame with **D/F**, correct classes and extents, and leave genuinely empty reviewed frames without invented boxes.
5. Click **Finish Job** after reviewing the whole task. Closing the editor alone saves but does not complete a new task. Reopen it through **All tasks** and check that the boxes are retained. Completed annotations supply the dataset; unaccepted model suggestions do not. [Annotation editor](/en/YoloEase/features/annotation-editor).

## Train once and inspect the actual split

6. Leave all rows on **Augmentations** disabled for this first clean-frame run. In the v2.0.90/source implementation, red original and cyan transformed contours are written into the saved augmented PNG pixels, not just preview. Variants are also added before the split and can leak across train/validation. [Augmentation limits](/en/YoloEase/features/augmentations).
7. Set these values in **Settings → Training settings**, then choose the Trainer controls separately:

| Setting | Value for this run |
| --- | --- |
| `Yolo8/10+ base model` | `yolo11s.pt`, a compatible detect checkpoint; missing weights may be downloaded. |
| `Epochs` / `Model Size` | `50` / `640`. These are requested training settings, not accuracy guarantees. |
| `Additional arguments` | `device=cpu` for an explicit CPU run. |
| Trainer `Train/Validation % split` | `80%`; check actual image counts after conversion. |
| Trainer execution | **Local Training**, **Run once**, then **Start automatic training**. |

8. Inspect the dataset stage and output under **datasets/<run-id>/**. Check **data.yaml**, **train/images + train/labels** and **valid/images + valid/labels**. The converter divides the received image order sequentially, without its own shuffle or class stratification; 80% is not a guarantee of balanced scenes/classes. Inspect both groups for real positive examples, reviewed negatives and scene independence. Keep the 5 outside images out of both groups. The generated `test` folders have a zero test split and are not that hold-out set. If the split is unsuitable, request **Stop automatic training**, wait for work to stop and correct the source selection/annotation before another run.
9. Read training **output**, validation metrics and ONNX export separately. A **Cycle completed** line can follow an error or cancellation. After successful training/export use **open...** to locate the actual output, normally under **datasets/<run-id>/runs/train/weights/**. Retain **best.pt**, **last.pt** and the exported **.onnx**. Inspect misses and false positives, not only loss/mAP; twenty images and fifty epochs do not establish useful generalisation. [Trainer](/en/YoloEase/features/trainer).

Local export requests `format=onnx`, **opset=17** from the selected checkpoint. `.pt` is not an EyeAuras input and changing its extension is not export. The wrapper does not explicitly set every Ultralytics export option. Check a fixed positive NCHW input named **images**, ordinarily **1×3×640×640**, supported detect output **1×(4 + class count)×candidates**, and `names` metadata containing the correct `marker` index. Other layouts, embedded NMS, pose/OBB or arbitrary ONNX require different compatibility checks. [Export contract](/en/YoloEase/features/yolo-onnx).

## Inspect boxes before adding any reaction

10. Open one of the five held-out images in your own visible image viewer. In EyeAuras create **RecipeMarker** through **Add new → New Aura** and add **Machine Learning(AI) Search** under **Triggers**. Keep the aura free of input actions. Click **Load from file...** and choose your actual exported ONNX. Wait for model information and verify task, input and class names; a load error is not a no-match result.
11. Under **Capture settings → Target Window**, select that viewer. Set **Image Capture Rate = 1**. Open **Preview captured image**, use **Crop region** to keep the image without viewer controls, and check that effects match your training input without applying them twice. Under **Inference performance tuning → Provider**, choose **Cpu** if available. A package or provider label alone does not establish native readiness.
12. Under **Trigger activation conditions → Search for**, select your actual `marker` class. Set **Confidence Threshold = 30%**, **IoU Threshold = 40%**. Click **Refresh Once** and enable preview **Bounding Boxes** and **Labels**. Inspect where the box is and what it names. Switch to a held-out negative image and refresh again; with no qualifying results the trigger is inactive. A retained result must score strictly above the confidence threshold. Scores are not measured probabilities of correctness.

Record misses, wrong boxes and false positives across all five independent images. If they occur, return to real data and reviewed annotation before adding a reaction. Training completion, model loading and class names alone do not confirm detection quality. The parser stretches input to model size and maps boxes back; do not scale them a second time. Use [model consumption](/en/YoloEase/use-in-eyeauras), [AI Search](/en/triggers/images/ai-search-trigger) and [capture settings](/en/triggers/images/imagecapturetriggers) for those distinct boundaries.

The local route avoids the cloud ZIP transfer step. Source `946be263` changed ZIP contents after v2.0.90; do not assume that later fix is installed if you separately choose Colab. No input reaction is needed to decide whether these boxes are useful.
