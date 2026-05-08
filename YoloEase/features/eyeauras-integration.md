---
title: EyeAuras Integration
description: How to use an ONNX model in ML Search and Behavior Tree
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# EyeAuras Integration

YoloEase prepares the model. EyeAuras captures the image from the screen, runs `ML Search`, selects the detected class, and performs actions through a Behavior Tree.

On older or related EyeAuras pages, you may still see the name `AI Search Trigger`. For this workflow, it means the same core idea: a computer vision trigger that loads an ONNX model and returns detected objects.

## Useful links

- [Recorded session](https://youtu.be/MdLETBZPeec)
- [Ready-made EyeAuras pack](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o)
- [AI Search Trigger](/triggers/images/ai-search-trigger)
- [Image capture triggers](/triggers/images/imagecapturetriggers)
- [Behavior Trees](/behavior-trees/gettings-started)
- [Selector node](/behavior-trees/nodes/selector)
- [Sequence node](/behavior-trees/nodes/sequence)
- [Mouse Move node](/behavior-trees/nodes/MouseMoveAbs)
- [Key Press node](/behavior-trees/nodes/KeyPress)

## Recommended workflow

1. In EyeAuras, open the preview for the CV trigger that can see the area you need.
2. Click `Save Video` and record a short real gameplay clip.
3. In YoloEase, add the video with `Add Video...`.
4. Extract frames with `Extract frames`.
5. Label the first tasks and train the model.
6. In `Trainer`, click `Open` on the result and find the `.onnx`.
7. In EyeAuras, load that `.onnx` into `ML Search`.
8. Turn on `Enable OSD` and verify the boxes before enabling any clicks.
9. Configure `ML Find Class` for the label you need, for example `tgt`.
10. Start by moving the mouse to the detected object, then add the click action.

`.pt` is not used by `ML Search` - that file is for training and fine-tuning. In EyeAuras, select the `.onnx`.

## Load the ONNX model

In EyeAuras, add or open `ML Search`, click the model load button, and select the `.onnx` file from the YoloEase output folder.

![Load model in EyeAuras](https://s3.eyeauras.net/media/2026/05/RuS1yziKuU.png)

After loading, check that:

- model status is `Loaded`;
- the capture region matches what was used in the training data;
- the correct window is selected;
- `Enable OSD` is turned on for debugging.

If the capture region is very different from the frames the model was trained on, quality can drop sharply. The model sees pixels, not user intent.

If effects were enabled in EyeAuras while recording the video, enable the same effects before `ML Search` during real detection. Otherwise the model will see a different input, and quality can drop even if training metrics look good.

## ML Find Class

`ML Search` only detects objects. To use a specific class in the tree, add `ML Find Class`.

For `tgt`, these settings are usually useful:

- `Class` or `Label` = `tgt`;
- `Selection Strategy` = `Closest` if you want the target nearest to the cursor;
- `Closest To` = `Cursor`;
- confidence threshold around `70%` or higher after your first checks;
- `Width Min` and `Height Min` to filter out tiny false positives.

For `btn`, you can create a separate `ML Find Class` and use it as a blocking condition: if the button is visible, the game is already over and there is no need to click `tgt`.

## Basic Behavior Tree

Minimal setup:

1. `ML Search` updates predictions.
2. `ML Find Class` finds the required label.
3. `Mouse Move` moves the cursor to the detected object.
4. `Key Press MouseLeft` clicks.

![Basic ML clicking tree](https://s3.eyeauras.net/media/2026/05/GPkSA8SgJb.png)

This is enough for simple cases, but real scenarios almost always need conditions.

Make the first run safe: start with OSD only, then add `Mouse Move`, and only add clicking after you verify the result. That lets you catch model mistakes before the automation starts acting on them.

## Final demo logic

In AimTrainer.io, you cannot just click any detected object:

- if the `btn` button is visible, the game is already over and targets should not be clicked;
- very small detections may be false positives;
- it is usually more convenient to choose the target closest to the cursor.

The final Behavior Tree uses a `Selector`, a separate `btn` check, `tgt` detection, a confidence filter, and size filters.

![Final behavior tree](https://s3.eyeauras.net/media/2026/05/UZKOZgapba.png)

Useful `ML Find Class` settings for `tgt`:

- `Selection Strategy` = `Closest`;
- `Closest To` = `Cursor`;
- confidence threshold around `70%` or higher;
- `Width Min` and `Height Min` to filter out tiny false positives.

## Verify the result

First, watch the OSD and make sure the boxes are placed on the correct objects. Only then enable click actions.

![Third generation result](https://s3.eyeauras.net/media/2026/05/8BS7YzZeka.png)

Final demo result:

![Final accuracy](https://s3.eyeauras.net/media/2026/05/NM2dnxhLf6.png)

If EyeAuras makes mistakes, the tree is not always the problem. Often you need to go back to YoloEase, add frames with those mistakes, fix the annotations, and train a new model generation.

## Error-fixing loop

| Problem in EyeAuras | What to do in YoloEase |
| --- | --- |
| The model sees a target where there is none. | Record a short video showing the mistake and add negative frames without extra boxes. |
| The model misses a target. | Add similar real frames and label the target. |
| The box is positioned incorrectly. | Fix the boxes on similar frames and fine-tune the model. |
| The model confuses `btn` and `tgt`. | Add counterexamples for both classes and make sure the labels are not mixed up. |
| Everything looks good in YoloEase, but bad in EyeAuras. | Check the capture region, window scale, effects, OSD, and that the latest `.onnx` is loaded. |

See also: [YOLO ONNX and model weights](/YoloEase/features/yolo-onnx), [Trainer](/YoloEase/features/trainer), [annotation editor](/YoloEase/features/annotation-editor), [diagnostics](/YoloEase/features/diagnostics).