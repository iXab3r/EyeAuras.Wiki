---
title: Trainer
description: How Trainer creates tasks, trains a model, and prepares output files
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Run one training cycle and find its ONNX export

Trainer builds a dataset from completed annotation tasks, runs YOLO and exports a model. Start with one local cycle so you can inspect each stage and its output before enabling repetition.

You need YoloEase 2, [passing prerequisites](/en/YoloEase/prerequisites), readable source frames and at least one task saved with **Finish Job**. The resulting dataset needs at least one training and one validation image, with actual examples of the intended classes. Label names or unaccepted suggestions alone do not provide that data.

![Trainer and the controls for selecting an annotation batch](https://s3.eyeauras.net/media/2026/05/YoloEase_e7nteB308n.png)

## Run locally

1. Open **Settings → Training settings** and check the inputs. These are new-project defaults; an existing project may store different values.

| Setting | Value and purpose |
| --- | --- |
| `Yolo8/10+ base model` | `yolo11s.pt`, resolved through the model cache and downloaded if missing. Select your own compatible `.pt` to train from those weights. |
| `Epochs` | `50`, requested epochs. |
| `Model Size` | `640`, passed as `imgsz`. |
| `Additional arguments` | Empty by default. For example, `device=cpu` explicitly selects CPU. |
| `Max CPU Cores` | Sets `NUM_THREADS` for the child process; `0` means **Any**, not a machine-wide workload cap. |

2. In **Trainer**, select **Local Training**, **Run once**, **Train/Validation % split = 80%**, then **Start automatic training**. This runs the local YOLO CLI, without uploading the dataset to Colab.
3. Inspect the timeline and expanded stage output. It refreshes data and available predictions, applies enabled augmentations, prepares the dataset, trains and exports. With no first model, prediction work is skipped.

![Epoch progress and command output from an earlier local run](https://s3.eyeauras.net/media/2026/05/YoloEase_pNV4AW3F2r.png)

4. Wait for a successful training/export result. **open...** selects the model in its output folder. A **Cycle completed** entry is also produced after an error or cancellation; it does not establish success.

![Opening the model file from a successful result](https://s3.eyeauras.net/media/2026/05/YoloEase_AKduA4R9xH.png)

5. Inspect the actual `.onnx`, `.pt` weights and `results.csv`/`results.png`. Keep `.pt` for training, and use the compatible ONNX for [EyeAuras](/en/YoloEase/use-in-eyeauras). YoloEase may rename the ONNX using the project, base model and run name.

![Weights and export from one demonstration run](https://s3.eyeauras.net/media/2026/05/1gcs8iFm66.png)

A typical result inside the working folder is:

```text
datasets/<run-id>/
  data.yaml
  cvataat.json
  train/images, train/labels
  valid/images, valid/labels
  test/images, test/labels
  runs/train/weights/best.pt
  runs/train/weights/last.pt
  runs/train/results.png
  runs/train/results.csv
  runs/train/weights/<project-base-model-run>.onnx
```

The current converter assigns **0** to the test split, while still creating its folders and YAML entry. These are not a separately evaluated test set. Dataset images can be symbolic links into working storage; copying `data.yaml` alone does not make a portable dataset. `best.pt` and `last.pt` are different checkpoints, not two ready ONNX files.

## Control the next cycle and task

| Control | Effect |
| --- | --- |
| `Start automatic training` / `Stop automatic training` | Start a cycle / request cancellation. Wait until active work finishes before restarting; synchronous work need not stop immediately. |
| `Run once` | Stop after one cycle, including a failed one. |
| `Run until stopped` | Repeat until stopped. An unchanged project can skip training rather than create another model each pass. |
| `Create Task` | Select a new annotation batch and open it. |
| `Annotate Task` / task list | Open an unfinished task or select a particular task. **All tasks** includes completed tasks. |
| `Refresh` | Update project files, tasks, models and related state. |
| `Clear` | Clear the timeline, without deleting weights or annotation. |
| `Batch size` | Percentage of files not yet assigned to tasks, initially **5%**, with a rounded count beside it. It is not YOLO's training `batch`. For a small pool, increase it until the intended count is nonzero. |
| `Train/Validation % split` | Initially **80%** training, with the remainder for validation. Small datasets require rounding. |

For 10 unassigned images, **50%** selects a task of 5. Start with a manually reviewed seed of 5–10 frames, then use larger tasks only after checking whether suggestions help. [Complete workflow](/en/YoloEase/annotate-and-train).

<details>
<summary>File selection, predictions and active learning</summary>

| Setting | Behaviour |
| --- | --- |
| `File pick strategy → Annotated-first` | Prefer unassigned files with available predictions, then fill randomly. This is not verified error-based selection. |
| `File pick strategy → Random` | Random selection from remaining files. |
| `Prediction strategy → Unannotated` | Predict on files not yet assigned to any task; it does not mean every frame without boxes. |
| `All files` | Predict across all project files, potentially doing more work. |
| `Disabled` | Skip new predictions; existing results can still be used. |
| `Annotated files → Include/Exclude` | Include/exclude files already assigned to tasks from the displayed prediction statistics. |
| `Threshold → Global/Per Label` | One confidence threshold or separate class thresholds for selecting predictions. Initial confidence is **25%**, prediction IoU **70%**. |

![Predictions available before selecting another annotation task](https://s3.eyeauras.net/media/2026/05/YoloEase_eUeVre8Bbg.png)

These settings help select frames and produce annotation suggestions. They are separate from the loaded model's thresholds in EyeAuras. A model score is not a measured probability of a correct action. Review predictions before **Finish Job**. Each training run starts from the selected base model; another cycle does not automatically resume the preceding checkpoint. Choose that compatible `.pt` explicitly when that is your intention.

</details>

<details>
<summary>Splits, class names and metrics</summary>

The converter divides images sequentially in the received order, without its own shuffle or class stratification. It reserves at least one image for each nonzero split before distributing the remainder. Check actual counts and keep separate scenes for validation; near-identical frames can make a result misleading.

Class names and indices in `data.yaml` come from encountered annotation names, not project `LabelId` values. A reviewed empty frame in a completed task has an empty label file. Keep names consistent and do not transfer class indices between models without checking their `names` metadata.

| Metric | Meaning |
| --- | --- |
| `precision` | Share of predicted detections judged correct on validation data. |
| `recall` | Share of labelled objects found. |
| `mAP50` | Detection evaluation at IoU 0.5. |
| `mAP50-95` | Evaluation across a stricter range of IoU thresholds. |
| `train/val loss` | Training/validation loss, not a percentage of failed clicks. |

![Metrics from an earlier training run](https://s3.eyeauras.net/media/2026/05/YoloEase_UQNGLfMszk.png)
![Metrics from another demonstration generation](https://s3.eyeauras.net/media/2026/05/YoloEase_IQStvCNnhh.png)

These historical images do not specify expected accuracy, duration or improvement after two or three cycles. Compare your models on held-out images and inspect false positives and missed objects, beyond the summary plots.

</details>

<details>
<summary>Commands, devices and cloud preparation</summary>

YoloEase constructs a local command of this form, substituting paths itself. This is an explanation of the run, not a command you need to launch separately:

```text
yolo task=detect mode=train plots=true project="<run-folder>/runs" model="<base-weights>" data="<data.yaml>" imgsz=640 epochs=50
```

| Additional argument | Meaning |
| --- | --- |
| `device=cpu` | Explicit CPU. Without a device override, YoloEase probes PyTorch CUDA and adds `device=0` when available. |
| `workers=0` | Added when no `workers` is supplied. An explicit value such as `workers=2` takes precedence. |
| `batch=8`, `patience=20` | Ultralytics training batch and early stopping, separate from annotation **Batch size**. |
| `cache=false`, `amp=false` | Ultralytics cache and mixed-precision choices. |
| `seed=0` | An explicit training seed; it does not add shuffling to YoloEase's dataset converter. |

Arguments can conflict with UI settings or differ between installed Ultralytics versions. Read the actual command and error output. After training, a separate `yolo export` uses `format=onnx` and `opset=17`; changing a `.pt` extension cannot perform that conversion. Check the [ONNX compatibility requirements](/en/YoloEase/features/yolo-onnx).

**Google Colab** prepares a dataset ZIP and a notebook link. Upload, notebook execution and returning the model are separate user steps; selecting this mode alone does not run cloud training. Check that the ZIP contains real images and labels, not merely local links. Archive preparation changed after **v2.0.90**: the later source revision `946be263` writes file contents into the archive. With the released v2.0.90 build, inspect the produced ZIP before transferring it rather than assuming that later implementation is installed.

[Integration](/en/YoloEase/features/eyeauras-integration) · [Diagnostics](/en/YoloEase/features/diagnostics)

</details>
