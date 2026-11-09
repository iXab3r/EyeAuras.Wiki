---
title: AI Search
description: Find model-trained classes in captured window images
published: true
date: 2024-05-14T11:17:45.665Z
tags: 
editor: markdown
dateCreated: 2023-06-18T13:58:48.187Z
---

# AI Search — find classes learned by a model

A trained model can find a person in a photograph despite changes in pose or apparent size. AI Search sends a captured window image to that model and activates when a result of the requested class passes its confidence threshold.

The model determines what can be recognized. Typing a new class name does not train it, and loading an image sample is not the workflow used here.

## Find a person in your own photograph

Open your own photograph with a clearly visible person in an ordinary image viewer. The first preset download needs internet access. Use **Yolo 8 Nano** for this example, then confirm that the loaded model lists the COCO class **person**. You also need a supported capture source and a working available inference provider.

1. Add **AI Search** to an aura. Select the photo viewer in **Capture settings → Target Window**, with **Image Capture Rate = 1**.
2. Expand **Preview captured image** and use **Crop region** to keep the photograph without viewer controls. The person must be sufficiently visible. Fix [capture](/en/triggers/images/imagecapturetriggers) before proceeding if the frame is wrong.
3. Under **Neural network source - YOLO**, select **Yolo 8 Nano** and click **Download model**. Wait for **Model is loading...** to finish. **Model is not loaded** or a loading error means there is no ready model to search with.
4. Under **Inference performance tuning → Provider**, choose **Cpu** if listed. Leave thread counts unchanged for the first check; this example does not require a GPU provider.
5. Under **Trigger activation conditions → Search for**, select **person**. Set **Confidence Threshold = 50%**, **IoU Threshold = 45%**, then click **Refresh Once**.
6. Inspect the result list and preview. A retained person result with score **strictly above 50%** makes the trigger active. For detection models, enable preview **Bounding Boxes** and **Labels** to inspect the rectangle and class.
7. Open a photograph without people in the same viewer and refresh. With no qualifying result, the trigger should become inactive. Restore the first photograph and check again.

A model can miss a person or misclassify another object. Inspect the frame, selected class and scores; try a clearer photo before lowering the threshold. More weak results do not guarantee correct recognition.

## Model and input

| Control or information | Meaning |
| --- | --- |
| Download model | Fetches a preset. This source version lists Yolo 8, 10, 11, 12 and 12-turbo families in several sizes; an entry does not guarantee its remote file remains available. |
| Yolo 8 Classification / Segmentation variants | Different tasks: whole-frame classification or detections with masks. The example uses ordinary Yolo 8 Nano detection. |
| Load from file... | Loads a compatible ONNX model, not arbitrary ONNX or .pt weights. Input/output layout, task and parser must agree. |
| Save... / Clear | Saves a model file or removes it from the trigger. |
| Loaded-model information | Check task, input dimensions and labels. The example model has a 640×640 input; model preprocessing handles that size. |
| Search for | Class names from the loaded model. Any class accepts any qualifying class, not just person. |
| Confidence Threshold | Filters scores; the trigger requires a score strictly greater than its threshold. Confidence is a model score, not measured accuracy on your data. |
| IoU Threshold | Controls suppression of overlapping detections. It is not a confidence threshold or a measurement of overall model quality. |

Detection produces boxes; segmentation also produces masks; classification scores the image as a whole and need not locate objects. Activation checks the retained results of the selected class. Recognizing people does not imply knowledge of game inventory, resource values or behavior over time.

<details>
<summary>Compatibility, performance and diagnostic marks</summary>

| Setting or requirement | Check |
| --- | --- |
| ONNX layout | The loader expects an `images` input and supported output shapes/metadata. It selects classification for one rank-2 output, detection for one rank-3 output, or segmentation for two outputs with a rank-3 first output. The YOLO name alone does not establish compatibility. |
| Preprocessing | This implementation stretches the processed capture to model input size, then maps results back. Extra manual resize is not always needed and can lose small objects. |
| Calculation threads | Threads within model computation. More threads can raise CPU load; faster results are not guaranteed. |
| InterOp threads | Work between graph nodes. Change after measuring processing time. |
| Provider | Choose an available implementation. Cpu uses the CPU; Cuda, TensorRt and DirectML depend on hardware and installed components. A referenced SDK does not install or register them. |
| Image Capture Rate | Requested analysis rate. Start at 1 FPS; a model may not keep up with more frequent frames. |
| Preview Bounding Boxes / Labels / Masks | Inspect results; Masks applies to segmentation. |
| On-screen-display → Window / Region / Bounding Boxes / Labels / Masks | Separate diagnostic marks over the source window. Masks requires segmentation; disable unneeded marks afterwards. |

Check **Processing time** in the FPS tooltip. Keep result coordinates tied to their processed capture and its transformation rather than scaling them twice.

</details>

Prepare your own model outside this editor. The [Ultralytics documentation](https://docs.ultralytics.com/) and [detector training guide](https://docs.ultralytics.com/tasks/detect/#train) explain that process; their current models do not imply support in this installed EyeAuras parser. The [IoU explanation](https://www.pyimagesearch.com/2016/11/07/intersection-over-union-iou-for-object-detection/) describes box overlap, while this trigger uses it for result suppression.

After the photographs are reliably distinguished, add an **OnEnter** reaction such as [Play Sound](/en/actions/play-sound). It responds to the aura's state transition and does not correct a mistaken prediction.
