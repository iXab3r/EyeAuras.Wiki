---
title: Using Models in EyeAuras
description: From an ONNX model to ML Search and Behavior Tree
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Inspect your ONNX detector in EyeAuras without clicking

Load a YoloEase export into EyeAuras, select your own window and inspect the detected boxes. Configure input reactions separately, after recognition is behaving as intended.

You need a real `.onnx` from [successful training and export](/en/YoloEase/features/trainer), desktop EyeAuras with its OpenCV/ONNX Runtime components, and your own visible window containing the objects you annotated. Keep `.pt` for training: it is not a drop-in AI Search input. An SDK reference alone does not install a runtime provider.

## Load and inspect the model

1. In YoloEase, click **open...** at a successful training result. Locate the exported ONNX and keep it at a stable path. Its name can include the project and run.
2. Add **Machine Learning(AI) Search** to your own aura's triggers. The guides also call it **AI Search**. A behavior-tree **ML Search** node is a separate entrypoint.
3. Click **Load from file...**, select your `.onnx` and wait for model information and class names. A load error is different from a search that completed without suitable detections.
4. Select your own window and capture region using [capture settings](/en/triggers/images/imagecapturetriggers). Keep it visible. Apply the same effects as in training frames, without applying an already-recorded effect twice.
5. In **Search for**, select your actual class, for example `tgt`; **Any class** shows all classes. Start with **Confidence Threshold = 30** and **IoU Threshold = 40**, then open **Preview captured image**.
6. Show an object and then a frame without it. Inspect the actual boxes and labels; the trigger state reflects filtered findings. Keep this test aura free of input actions. A missing box is not a reason to add a click as a diagnostic.

![An earlier EyeAuras demonstration using a model and behavior tree](https://s3.eyeauras.net/media/2026/05/RuS1yziKuU.png)

The image shows the earlier ML Search demonstration. For the current trigger, use **Load from file...**, **Search for** and **Preview captured image** rather than treating every pictured control as the same editor.

| Setting or result | What to check |
| --- | --- |
| Class | A name from this model's metadata. `tgt` and `btn` exist only when annotated/exported; they are not built-in EyeAuras classes. |
| `Confidence Threshold` | A model-score threshold in percent, not object area or certainty that an action is correct. |
| `IoU Threshold` | Box-overlap threshold used for suppressing duplicates. |
| Window, region, effects | The actual input pixels, including any cropping and scaling. |
| Empty findings / error | No suitable detection and a failed operation are different outcomes; inspect preview and error output. |

## Check the export contract

This YoloEase route trains `detect` and exports with `opset=17`. Neither the extension nor the opset makes every YOLO version compatible. EyeAuras uses its ONNX Runtime and parser; the YoloEase annotation editor uses a separate YoloDotNet engine.

For the ordinary YOLO11 detect route, check input `images` in NCHW form and a detection output understood by the parser, with `names` metadata for classes. At size 640, the teaching export uses static input **1×3×640×640** and output **1×(4 + class count)×candidate count**. A different task, dynamic layout, embedded NMS, pose or OBB needs its own compatibility check; arbitrary ONNX files are not interchangeable.

EyeAuras stretches the captured image to the model input and scales boxes back to the processed image and capture region. Do not manually apply that model-size scaling a second time. This recognises pixels, not internal game data. Inspect boxes with the actual window sizes and effects you intend to use. See [AI Search](/en/triggers/images/ai-search-trigger) and [YOLO ONNX](/en/YoloEase/features/yolo-onnx).

<details>
<summary>Add a reaction later, or inspect the earlier example</summary>

In a behavior tree, **ML Search** produces detections, **ML Find Class** selects a class/object and can filter by width, height or area, **Mouse Move** receives its position, and **Key Press** adds a configured input action. **Enable OSD** on the CV node helps inspect boxes first. Loading ONNX into an aura trigger does not automatically create this tree.

If `btn` is a restart button and `tgt` a target, the tree decides what reaction is appropriate. Set the input target and coordinates for that window explicitly; finding a box does not establish universal background delivery. Continue with [behavior trees](/en/behavior-trees/gettings-started) and [integration](/en/YoloEase/features/eyeauras-integration).

The earlier complete example has a [recorded session](https://youtu.be/MdLETBZPeec), [EyeAuras pack](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o) and [ONNX](https://s3.eyeauras.net/media/2026/05/Qwe_yolo11s_202605072245262GXYDdJshE3b.onnx). That particular file records `btn`/`tgt`, input `images` **1×3×640×640**, output `output0` **1×6×8400**, `task=detect`, `opset=17` and no embedded NMS. These are metadata for the demonstration file, not results of your project's training. Inspect a shared configuration before enabling its reactions. For load or recognition failures, use [diagnostics](/en/YoloEase/features/diagnostics).

</details>
