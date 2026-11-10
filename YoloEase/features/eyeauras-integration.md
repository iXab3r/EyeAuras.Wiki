---
title: EyeAuras Integration
description: How to use an ONNX model in ML Search and Behavior Tree
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Check a detector against the actual EyeAuras capture

First inspect detections in your own window without input actions. YoloEase supplies weights and an ONNX export; EyeAuras analyses captured pixels. It does not obtain internal application objects or know which reaction you intend.

You need a compatible `detect` ONNX, its class names, desktop EyeAuras with the required capture/ONNX components, and your own window showing the annotated objects. Keep aura reactions and input nodes disabled for this first check. An SDK reference does not install every inference provider.

## Reproduce the training input

1. Set up [capture](/en/triggers/images/imagecapturetriggers) for your window and region. Note image size, crop, window border and effects.
2. If you need new data, use preview **Save Video**, record your own window states, then **YoloEase → Project → Add Video... → Extract frames**. [Annotate and train](/en/YoloEase/annotate-and-train) those frames.
3. After successful training and export, use **open...** on the Trainer result and take the `.onnx`. Keep `.pt` for training.
4. Add **Machine Learning(AI) Search** to your own aura. Set **Capture settings → Target Window**, restore the region/effects and select the file through **Yolo Model → Load from file...**.
5. In **Search for**, choose a real model class. Set **Confidence Threshold = 30** and **IoU Threshold = 40** for an initial comparison, then open **Preview captured image**. They are starting values, not accuracy guarantees.
6. Show and remove an object in that window. Check its actual class and box. **Active** means findings passed the filter; empty findings and a load/search error are different outcomes.

The result should be a correctly placed, correctly named detection on your capture, with the corresponding trigger state. Only then configure a separate reaction. [AI Search](/en/triggers/images/ai-search-trigger) covers the trigger editor in detail.

| Compare | Why it matters |
| --- | --- |
| Window and `Crop region` | The detector needs the same kind of image area as its annotated data. |
| Window border, title and size | Change geometry and object scale. |
| `Effects...` | Match recording and recognition transformations; do not apply an already-recorded effect twice. |
| `Search for` | Select a name from this model. **Any class** is broader than a check for one particular object. |
| `Confidence Threshold` | Filters model scores, not object area or measured probability of a correct action. |
| `IoU Threshold` | Suppresses overlapping boxes; it cannot repair a wrong capture region. |

YoloEase editor auto-annotation explicitly runs YoloDotNet on CPU. EyeAuras uses its own ONNX Runtime and parser. Its ordinary detection path stretches the frame to the input size, converts RGB to 0–1 and projects boxes back to the processed image. Do not assume identical padding/scaling across consumers or apply the model-size transform twice. For offset boxes, investigate capture geometry before changing confidence. [Export contracts](/en/YoloEase/features/yolo-onnx).

<details>
<summary>Use the result in a behavior tree</summary>

The tree's **ML Search** node is a separate entrypoint from an aura trigger editor. When ticked, it snapshots the search result into tree variables for following nodes. The target window comes from BT context/default binding, rather than automatically inheriting an unrelated aura capture selector.

![Loading ONNX and enabling OSD in the earlier ML Search node editor](https://s3.eyeauras.net/media/2026/05/RuS1yziKuU.png)

Place **ML Search** before **ML Find Class** in a **Sequence**. In **Filters → Class**, enter an actual model class and click **Add**. An empty class list does not restrict classes. Use the **On-screen display** group to inspect the search and selected region; the earlier editor called the option **Enable OSD**.

| ML Find Class setting | Choice and boundary |
| --- | --- |
| `Strategy` | **First in List**, **Highest Confidence**, or **Closest** to the selected reference. |
| `Closest To → Cursor` | Choose the nearest box relative to the cursor. **Center** is disabled in the current editor. |
| `Class` / `Add` | Add an actual class-name filter; `tgt` and `btn` belong to the demonstration model, not built-in EyeAuras knowledge. |
| Class confidence | An additional threshold, such as **70** for a previously checked `tgt`. It cannot recover detections already discarded by ML Search. |
| `Width`, `Height`, `Area` | Minimum/maximum box dimensions in processed-image pixels; a zero maximum leaves that upper bound unrestricted. |
| `On-screen display` | Inspect the selected box before adding input. |

The earlier simple tree appended **Mouse Move** and **Key Press MouseLeft**. These execute input and are unnecessary for checking boxes.

![The earlier search tree with separately configured movement and click nodes](https://s3.eyeauras.net/media/2026/05/GPkSA8SgJb.png)

For a later reaction in your own test window, pass the selected location through the documented [Mouse Move](/en/behavior-trees/nodes/MouseMoveAbs) coordinate settings, then configure [Key Press](/en/behavior-trees/nodes/KeyPress). Choose the input target and simulator explicitly. Capture selection alone does not determine delivery; correct detection does not establish background-click support.

The AimTrainer.io demo used a **Selector**: its `btn` branch prevented target actions when the end button appeared; another branch selected the closest `tgt`, with confidence 70 and size filters. This is that demo's logic, not built-in knowledge of game state.

![The historical Selector with separate btn and tgt checks](https://s3.eyeauras.net/media/2026/05/UZKOZgapba.png)

The [recorded session](https://youtu.be/MdLETBZPeec) and [demonstration pack](https://eyeauras.net/share/S20260507232328uRAOxLRumL6o) remain available as references. Inspect a shared configuration before enabling reactions. These images show the earlier runs, not expected accuracy for a new model:

![Results from the third generation in the earlier demonstration](https://s3.eyeauras.net/media/2026/05/8BS7YzZeka.png)
![The final result of that earlier demonstration](https://s3.eyeauras.net/media/2026/05/NM2dnxhLf6.png)

See [behavior trees](/en/behavior-trees/gettings-started), [Selector](/en/behavior-trees/nodes/selector) and [Sequence](/en/behavior-trees/nodes/sequence) for control flow.

</details>

## Feed a real error back into training

| Observation | Next step |
| --- | --- |
| False box on empty background | Add those real negative frames without fictitious boxes. |
| Missed object | Add similar positive frames and annotate the object. |
| Confused classes | Check labels and add counterexamples for both classes. |
| Inaccurate box | Correct comparable boxes in the [editor](/en/YoloEase/features/annotation-editor), then train again. |
| Only EyeAuras differs | Check the model file, pixels, region and effects with [diagnostics](/en/YoloEase/features/diagnostics) first. |

After correcting data, run [Trainer](/en/YoloEase/features/trainer) and reload the new ONNX. Model inference, object selection and reaction remain separate settings.
