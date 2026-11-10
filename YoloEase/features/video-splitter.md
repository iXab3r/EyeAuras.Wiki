---
title: Extracting Frames from Video
description: How to split a video into frames directly in YoloEase
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Extract a small set of PNG frames from your own video

Use a short recording of your test window to prepare images for annotation. YoloEase writes PNGs into project storage and adds their folder as a source; no separate Python or FFmpeg script is needed.

You need an open project and a video readable by the installed Windows codecs. The picker accepts `.mp4`, `.m4v`, `.mov`, `.avi`, `.mkv`, `.wmv`, `.webm`, `.mpg` and `.mpeg`. An accepted extension does not establish decoding support. Extraction uses Windows Media.

## Prepare the first task's frames

1. In **Project**, click **Add Video...** or drop your video onto the source area. Each video opens a separate **Extract frames** window.
2. Wait for **Reading video metadata...**. If decoding fails, check that file and codec before attempting extraction; training Python components do not provide this decoder.
3. Set **Frame step = 5** and a short **Range of frames to extract** using the sliders. For a recording with at least **300 frames**, range **0–45** requests **10** frames: `0, 5, …, 45`. A shorter video's slider can cap the step below 5.

![Frame step and range in the earlier YoloEase 2.0.80 interface](https://s3.eyeauras.net/media/2026/05/YoloEase_sFCEGiqTnK.png)

The earlier image shows extraction inside Project. The current route opens a separate window with the same **Frame step** and **Range of frames to extract** labels.

4. Check **You are going to get ~… frames using these settings**, then click **Extract frames**.
5. On successful completion, the output folder opens and appears as a project source. Inspect several PNGs for readable objects and different states.
6. Use **Trainer → Refresh**, then create a small task through [data preparation](/en/YoloEase/prepare-data). These are real images, still without annotation until you use the [editor](/en/YoloEase/features/annotation-editor).

| Setting or result | Meaning |
| --- | --- |
| `Range of frames to extract` | Zero-based indices. Both bounds are included; the end is selected if the step reaches it. |
| `Frame step` | Every Nth frame from the chosen start, not seconds. Minimum 1, initial value 5; slider maximum is `max(1, floor(frameCount / 60))`. A step of 1 requests every frame in the range. |
| Estimated count | For a valid nonempty range, `floor((end − start) / step) + 1`. Existing/name-matched files can reduce the number newly added. |
| Full range | `0` through `frameCount − 1`. Metadata estimates the count from duration and frame rate rather than decoding every frame first. |
| `Cancel` or closing | Requests cancellation. Files already written can remain; cancellation is not proof of a complete series or rollback. |

Use a smaller range or available step on short recordings. More adjacent frames can mean more duplicates to review. Do not automatically remove menus, pauses or empty backgrounds if the model must distinguish them; review them as negatives or annotate their intended class.

## Locate files and understand repeats

The storage path is:

`local-sources/<video-name>/<start>-<end> x<step>/<video-name> #<index>.png`

The video is not copied wholesale into that PNG folder. Windows Media requests the nearest frame at `index / FPS`; variable frame rate or imprecise metadata can prevent exact frame-number identity.

The extractor skips existing files. The window then compares names with project files and removes output files it considers already added. This is name-based deduplication, not a visual-content comparison. Do not reuse identical names for different videos or treat repeated extraction as an independent archive. If nothing remains, the message suggests changing the range or step.

A successful new series becomes a source; [source synchronisation](/en/YoloEase/features/data-sources) later supplies working images in `assets/training`. On failure, read the window error and the application-data `logs/` files described in [diagnostics](/en/YoloEase/features/diagnostics). Partial PNGs alone do not establish source addition or success.

Start with 5–20 varied frames you can review manually. Later use dozens or hundreds only when model suggestions are helpful, and add actual error cases rather than more near-identical frames. Continue with [Trainer](/en/YoloEase/features/trainer).
