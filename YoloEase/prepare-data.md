---
title: Data Preparation
description: How to create a project, add labels and get frames from a video
published: true
date: 2026-05-08T12:00:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:00:00.000Z
---
# Create a project with images and classes

Here you create a project with images of your own targets and button. `tgt` and `btn` are two separate classes. You need real PNG frames or your own video.

You need YoloEase 2 on Windows x64. To build a dataset and train later, first go through [Prerequisites](/en/YoloEase/prerequisites). Source files must stay readable. The working folder must allow writing and creating symbolic links.

## Save the project and set the training inputs

1. Click **New...** and save `MyTargets.yeproj` in your local folder. YoloEase creates a `MyTargets` working folder next to it. To reopen the project later, click **Open existing...**.
2. Open **Settings**. Check that **Backend = Offline** and that **Workspace** points to your project. This is the built-in annotation editor, and it needs no CVAT account.
3. Under **Training settings**, set the values from the table.

| Setting | Value and purpose |
| --- | --- |
| `Yolo8/10+ base model` | `yolo11s.pt`, the starting weights. YoloEase looks for them in its model cache and downloads them if they are missing. The `...` button picks your own compatible `.pt`. |
| `Epochs` | `50`, the number of epochs. |
| `Model Size` | `640`, the `imgsz` value. It is not the size of the source video. |
| `Additional arguments` | Leave empty for the first setup. To train on the CPU explicitly, enter `device=cpu`. The arguments go to Ultralytics. |
| `Storage subfolder` / `Resolved storage` | The relative storage subfolder and the actual path. In a new project, keep the path as created. **Apply** changes the setting but does not move all existing files. |

![Project folder control, yolo11s.pt base model and model size of 640 in YoloEase 2.0.80](/assets/callouts/batch3/en/yolo-training-settings.png)

## Add labels and images

4. On **Project**, click **Add label**. Set **Label name** to `tgt`, choose a colour and click **Add**. Repeat for `btn`. The colour helps you tell the boxes apart.
5. The easiest way is to drop 10 of your own PNG files onto the data area. Or click **Add Folder...** and choose a folder with PNG/JPG/BMP files. For a folder, YoloEase keeps the external path and makes working copies during synchronisation. More in [data sources](/en/YoloEase/features/data-sources).

![Project tab with Add label, Add Video and Add Folder. One source appears below the class list](/assets/callouts/batch3/en/yolo-project-labels.png)

6. Open **Trainer**, click **Refresh** and check the number of available files. These frames can now go into **Create Task**. Boxes appear only after [annotation](/en/YoloEase/features/annotation-editor).

Use the same class names across the whole project. Do not count on the internal `LabelId` being the YOLO class number. Export writes the class names and their indices to `data.yaml`. A label with no annotated examples does not become a training class.

## If your source is video

7. Record your own test window or take a video you own. In EyeAuras, **Save Video** in the CV preview records the prepared image that recognition will see, with the selected region and effects.

![Save video and Image as is below the EyeAuras capture preview](/assets/callouts/batch3/en/yolo-capture-video.png)

8. In YoloEase, click **Add Video...** and choose a recording with at least 300 frames. A shorter one has no step of 5 on the slider. In **Extract frames**, set a frame range and **Frame step = 5**, then click **Extract frames**. Check the frame count shown. The step is counted in frames, not seconds.

![Extract frames shows a step of 2 for frames 0–243 and an estimate of 122 frames](/assets/callouts/batch3/en/yolo-extract-frames.png)

After extraction, the folder with PNG files opens and is added as a source under `local-sources`. You can split these frames into a small first task and later batches. Windows media support decodes the video, so not every file will open. More in [video extraction](/en/YoloEase/features/video-splitter).

Include different object positions and states, and empty background. Draw boxes by the same rules every time. Use the same image effects the finished detector will get. Annotate the system cursor or the browser frame only if you want them as classes. Keep validation scenes separate from near-identical training frames.

Move the `.yeproj` together with its working folder. External source folders do not move with it, so keep them available. Next, [annotate the first task and train](/en/YoloEase/annotate-and-train).
