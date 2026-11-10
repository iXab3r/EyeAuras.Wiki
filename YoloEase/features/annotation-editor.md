---
title: Annotation Editor
description: How to annotate images and use auto-annotation in the task editor
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Draw and save the boxes for one task

Annotate a small task of your own images, then complete it so Trainer can use the saved boxes. Manual annotation requires no trained model. You need a [project with class labels and images](/en/YoloEase/prepare-data); **Trainer → Create Task** opens its selected batch. Reopen an unfinished task with **Annotate Task** or choose it from the task list.

![The annotation editor before adding boxes or loading a model](https://s3.eyeauras.net/media/2026/05/YoloEase_WpUxt25zLI.png)

| Area | Purpose |
| --- | --- |
| Centre canvas | Inspect the frame, draw and transform boxes. |
| Left toolbar / top navigation | Select drawing, selection and edit tools, toggle annotation/suggestion visibility and move between frames. |
| Right `Labels`, `Shapes`, `Models` | Choose classes, inspect objects and explicitly load/run a model. |
| Bottom status | Image size, cursor position, object count, save state and task state. |

## Complete a manual task

1. Select `tgt` in **Labels**, press **N**, then click opposite corners of a visible target. A rectangle must span at least 4 image pixels.
2. Draw every required target on the frame. Select `btn` for a button. Move or resize boxes to cover the intended object consistently, without unnecessarily including background.

![Manual boxes for the target class](https://s3.eyeauras.net/media/2026/05/YoloEase_AT0n2plVpV.png)
![Separate classes for targets and the button](https://s3.eyeauras.net/media/2026/05/YoloEase_8VeAPbGp5G.png)

3. Use **D/F** to inspect the previous/next frame. Draw missing objects and correct misplaced or wrongly classified boxes. A genuinely empty frame can remain empty after review; do not add a fictitious object.
4. Watch **Unsaved changes → Saving... → Saved**. Autosave runs about every 5 seconds while the editor is idle; it pauses during drawing, saving or model work.
5. Click **Finish Job** after reviewing the whole task. It saves, marks the task completed and closes the editor. Closing the window alone saves changes but does not complete a new task.
6. Reopen that task from **All tasks** to check the saved boxes. Trainer uses completed tasks; an unfinished task with some saved boxes is not the same input.

Annotations are stored as CVAT-style XML in `assets/training/annotations.project.<projectId>.task.<taskId>.xml`. Dataset conversion clips boxes to image bounds and writes normalised centre/width/height values; zero-area boxes are skipped. A reviewed empty frame in a completed task is exported as a negative image with an empty YOLO label file. Unreviewed source files are not automatically equivalent negatives. See [Trainer](/en/YoloEase/features/trainer) for splitting and class indices.

<details>
<summary>Shortcuts and a faster manual workflow</summary>

| Shortcut or gesture | Effect |
| --- | --- |
| `N` | Draw a rectangle with two corner clicks. |
| `M` / `L` | Rectangular selection / free selection. |
| `Escape` | Cancel the current operation and clear selection. |
| `Q`, `Delete`, `Backspace` | Delete the effective selected boxes or suggestions. Removing a whole frame is a separate confirmed operation and cannot be undone as a box edit. |
| `Ctrl+A` / `Ctrl+click` | Select objects on this frame / toggle one object in a group. |
| `Ctrl+C`, `Ctrl+X`, `Ctrl+V` | Task-local copy, cut and paste. Pasted boxes follow the mouse until a left click commits them or Escape cancels. |
| `Ctrl+B` | Copy the previous frame's boxes as manual annotation. Correct movement and remove objects no longer present. |
| `Ctrl+1…9` / `Ctrl+N` | Choose a label or change the effective selection's label / cycle to the next label. |
| `Ctrl+Z` / `Ctrl+Y`, `Ctrl+Shift+Z` | Undo / redo an edit. |
| `D/F` / `C/V` | Previous/next frame / move by the configured frame step. |
| `R`, mouse wheel, drag empty canvas | Reset view, zoom around the cursor and pan. |
| `Shift` during transform | Preserve resize proportions or snap rotation to 15° increments. Group transforms use common bounds. |
| `Alt+N` / `Shift+Alt+N` | Run the first available model on the current frame / whole task. |
| `Alt+1…9` / `Shift+Alt+1…9` | Run that model entry on the current frame / whole task. |

Annotate one class at a time if that reduces switching, and include every relevant visible instance. To correct a wrong class, relabel the existing box rather than redraw it. Copy/paste can reuse nearby shapes; for adjacent frames, copying previous boxes can save drawing time, but it does not validate the next image. Keep your class policy consistent: overlapping targets, partial objects and unwanted lookalikes still need deliberate annotation. Use a separate class or a consistent background policy for visually similar objects you do not want to select.

Simple, clearly bounded objects are easier to review. Even a solid-colour object needs a distinguishable visual cue; include negative images with similar colours to expose false positives. Keep enough context to distinguish objects. Very small objects may lose detail at training size; consider the capture region, image size or consistent effects, then test on held-out frames. Later **ML Find Class** size/area filters in EyeAuras select detections; they do not repair training labels. Detection export uses axis-aligned boxes, so use unrotated boxes for the first task rather than assuming OBB support.

</details>

## Use a model to propose the next boxes

Without a trained model, continue manually; this state does not block annotation.

![The editor can be used before any model is available](https://s3.eyeauras.net/media/2026/05/YoloEase_WpUxt25zLI.png)

1. In **Models**, add **Latest** to use the project's newest trained ONNX, or import your own compatible ONNX. **Latest** needs a real training output; it does not create a first model from label names.
2. Click **Load** to initialise it. Opening the editor or changing model settings does not implicitly start inference. Check the labels reported by this model.
3. Map each enabled model class to the intended project label. Disabled rows are skipped; numeric model indices are not project `LabelId` values.
4. Enable **Create suggestions**. For an initial review, set confidence to **25%** and IoU to **70%**, then click **Run current**. **Run all** applies that model to the task's frames; it is not an implicit chain of every configured model.

![A loaded model in the Models panel](https://s3.eyeauras.net/media/2026/05/YoloEase_jEFZb2nxWc.png)
![Model results ready for visual review](https://s3.eyeauras.net/media/2026/05/YoloEase_KMBzwXfQT9.png)

5. Check classes and box extents. **Accept** or **Accept all** turns correct suggestions into annotation; delete false positives with **Q**, **Delete** or **Backspace**, and draw missed objects.

![Removing a false positive before completing the task](https://s3.eyeauras.net/media/2026/05/YoloEase_UyYYi1dOFb.png)

6. Finish the review and click **Finish Job**. Unaccepted suggestions are temporary and do not enter saved training annotation. With **Create suggestions** disabled, results become boxes directly, which still require review.

<details>
<summary>Model ownership and reruns</summary>

Imported models are copied under `models/auto-annotation/<sha256>/`. The editor's native YoloDotNet CPU engine is separate from the Python training environment and EyeAuras ONNX parser; a file that loads in one is not automatically compatible with another.

A successful rerun replaces the automatic shapes owned by that model entry on the processed frame. It does not blindly replace manual boxes or another model entry's work. Editing an automatic box makes it manual. Cancel requests stop model work; editing and autosave pause while it is running. Completed merges can be undone as an edit operation. Predictions remain suggestions, not measured truth: always inspect them before accepting.

</details>

Continue with [Trainer](/en/YoloEase/features/trainer), [YOLO ONNX](/en/YoloEase/features/yolo-onnx) or [EyeAuras integration](/en/YoloEase/features/eyeauras-integration).
