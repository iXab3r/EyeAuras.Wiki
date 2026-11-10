---
title: Troubleshooting
description: What to check if training, the model, or integration is not working
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Find the first failing stage

If YoloEase does not produce a model, or EyeAuras gives different detections, locate the first unexpected result: source images, annotation, dataset, training, export or inference. Keep your project and the error output; a full environment reset or relabelling everything is not the first step.

## Keep local evidence of one failure

1. Open your own affected project. Note the YoloEase version, selected base model and action that failed.
2. For environment errors, use **Prerequisites → Check all** and expand the failing row. For Trainer errors, expand **output** on the failed stage: inspect its actual command, process output and exit result.
3. Use the icon with tooltip **Copy output** if you need local text. The timeline keeps the last **1000 lines per stage**, not a complete archive of every run.
4. For the application log, use the file icon at the bottom right of the main window to open application data. Check `logs/`; environment preparation can also create logs under `tools/logs/`. Keep a copy in your own folder before another launch replaces or rolls it.
5. Compare the last successful artifact with the tables below. Preserve images, annotations and weights while investigating.

The result is a local record of the failing stage, command and error. **Copy output** copies text; **Report a problem** opens a separate preparation dialog. Neither alone sends a report. Review paths, images and access details before choosing any attachment or transmission.

## Environment and source files

| Symptom | Next check |
| --- | --- |
| `No space left on device` | Space on both project storage and application-data filesystems, including Python, the environment and `tools/downloads`. |
| Required prerequisite fails | **Check all**, then the affected row's repair or **Install missing**. See [prerequisites](/en/YoloEase/prerequisites). Optional GPU information does not by itself block CPU training. |
| CUDA is unused | Actual **PyTorch runtime**/**GPU acceleration** results. `device=cpu` in **Additional arguments** explicitly selects CPU training; EyeAuras ONNX providers are separate. |
| Video does not open | The **Extract frames** metadata error and Windows codec support, not a missing FFmpeg or Python training package. |
| Expected images are missing | Source path and **Refresh**. An unavailable source can lead synchronisation to remove its working copies; restore the source first. |
| Too many near-identical frames | Narrow **Range of frames to extract** or increase **Frame step** in [video extraction](/en/YoloEase/features/video-splitter). |

![A disk-space error during PyTorch preparation in the earlier YoloEase 2.0.80 interface](https://s3.eyeauras.net/media/2026/05/YoloEase_5T0uv3vFkV.png)

That installation error is different from running out of video memory during training. The application log uses `logs/<APPNAME>.<CONFIGURATION>.log` and rolling variants; the opened application-data folder identifies the actual location for your build.

## Annotation and dataset

| Symptom | Next check |
| --- | --- |
| No training data | Completed tasks and their XML under `assets/training/`. Importing images alone does not supply reviewed annotation. |
| Missing `data.yaml` | Dataset-preparation output, symbolic-link permissions and `datasets/<run-id>/`. Conversion creates YAML before training. |
| `train`/`valid` error | At least one image in each split. A percentage does not ensure that a rare class appears in both. |
| Suggestions absent from training | **Accept**/**Accept all** for the reviewed current-frame suggestions, saved boxes and **Finish Job**. Temporary suggestions are not training annotation. |
| Misses or inconsistent classes | In the [editor](/en/YoloEase/features/annotation-editor), add actual positive examples, correct tight box extents and apply one class policy consistently. |
| False positives | Review real negative frames—empty backgrounds, menus or similar colours—without invented boxes. Complete the task after review. |
| Coloured contours in generated frames | The [augmentation generator](/en/YoloEase/features/augmentations) draws these into saved PNGs; they are not part of the real object. |

## Training and export

| Symptom | Next check |
| --- | --- |
| No `best.pt` | Training-stage output. A newly created `runs` directory does not mean training succeeded. |
| `best.pt` exists but ONNX does not | The separate export output; training weights can survive a failed conversion. |
| Not enough VRAM | Reduce **Model Size** or use a smaller compatible base such as `yolo11n.pt`; consider a lower training `batch` or `device=cpu`. |
| Windows memory grows sharply | Keep the default `workers=0` unless you have a reason to override it. |
| Ultralytics requests an update and a stage fails | Record the installed version and error, then inspect **Prerequisites**. Manage the application's environment there; a global `pip` install does not update it. |
| Good metrics, poor new-frame predictions | Validation independence, rare-class examples and close copies introduced by augmentation. A chart alone does not establish usable detections. |
| Cloud ZIP lacks usable image data | Inspect its files and source links. The later `946be263` archive implementation differs from released v2.0.90; do not assume it is installed. [Trainer](/en/YoloEase/features/trainer) explains the boundary. |

## ONNX and EyeAuras

| Symptom | Next check |
| --- | --- |
| A `.pt` was selected | EyeAuras needs the exported `.onnx`. See [model files](/en/YoloEase/features/yolo-onnx). |
| ONNX fails to load | `detect` task, input/output layout, opset and receiving parser/provider. The extension and opset 17 alone are insufficient. |
| Wrong or missing class names | `names` metadata, index order and editor label mapping. YoloEase's mapping does not rewrite model metadata for EyeAuras. |
| Good in the editor, poor in EyeAuras | Same ONNX file, window/region, size and effects. Editor YoloDotNet and EyeAuras inference/preprocessing are different consumers. |
| Offset boxes | Compare actual preview pixels, crop and effects first, then the reaction's coordinate transform. Increasing confidence does not fix geometry. |
| Wrong click position | Keep input off while checking boxes/OSD. Configure the selected object's coordinates and input target before adding movement and a click. |
| Tiny false detections in a tree | Use **Width**, **Height** or **Area** in **ML Find Class** after checking the model. These filters do not repair training labels. |

If detection is correct but slow in EyeAuras, check **Processing time** in the FPS tooltip and the available **Provider** in [AI Search](/en/triggers/images/ai-search-trigger). For your own script loop, use [CV pipeline profiling](/en/scripting/examples/advanced/profiling-cv) to compare warm-up and later capture/search work; those measurements concern the receiving application, not Python training.

For a new real failure case, record your own prepared input, add it to the project and correct its annotation before the next [Trainer](/en/YoloEase/features/trainer) cycle. [Integration](/en/YoloEase/features/eyeauras-integration) explains the capture-to-result comparison.
