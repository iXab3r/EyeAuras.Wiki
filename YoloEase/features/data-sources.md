---
title: Importing Data
description: How to add folders, images, and videos to a YoloEase project
published: true
date: 2026-05-08T12:30:00.000Z
tags: yoloease, machine-learning, ai-translated
editor: markdown
dateCreated: 2026-05-08T12:30:00.000Z
---
# Add your own images and keep their sources available

Connect a folder, refresh the project and inspect the images available for annotation tasks. A source identifies where images come from; working images and annotations live in project storage. They have different lifetimes.

You need a saved YoloEase 2 `.yeproj` and readable images. Adding a folder does not run a model. Predictions and training additionally need the [prepared environment](/en/YoloEase/prerequisites).

## Connect a folder

1. In **Project**, click **Add Folder...** and choose your folder of PNG/JPG/BMP files. Its path appears in **Data sources**.
2. Click the source's **Open** to inspect that folder, then **Trainer → Refresh** to update the file list and working copies.
3. Check the available count in Trainer. **Create Task** opens a selected batch in the [annotation editor](/en/YoloEase/features/annotation-editor), where you can see the actual frames.

![A source path beside the project labels](https://s3.eyeauras.net/media/2026/05/YoloEase_CeXbLsliGW.png)

| Input or control | Storage and effect |
| --- | --- |
| `Add Folder...` or a dropped folder | Retains the external path. Synchronisation recursively copies supported images to `assets/training`. |
| Dropped individual images | Copies them into `local-sources/<date-time>` and adds that folder as a source. |
| `Add Video...` or a dropped video | Opens **Extract frames**. PNGs go under `local-sources/<video-name>/<range> x<step>`, then become a source. The video itself is not a set of training images. |
| `Remove` | Removes the source from the list after confirmation, without deleting its original external folder. It changes later project synchronisation. |
| `Missing` | The path is unavailable and is skipped. Restore it before **Refresh** if the images are still needed. |

The folder synchroniser includes `.png`, `.jpg` and `.bmp`; another image extension being readable elsewhere does not make it part of this import. The video picker includes MP4/M4V/MOV/AVI/MKV/WMV/WEBM/MPG/MPEG, with decoding limited by available Windows codecs. See [video extraction](/en/YoloEase/features/video-splitter).

## Match the detector's eventual input

EyeAuras **Save Video** records your own selected CV preview, which you can open through **Add Video...**. This avoids unintentionally training on the whole desktop when recognition will use a smaller region.

![Saving the prepared CV image as video in EyeAuras](https://s3.eyeauras.net/media/2026/05/eg2kO3Tv2P.png)

Use the same effects before recognition as before recording. Background, scale, borders and overlays change the pixels. Keep distinct recordings or projects when comparing different pipelines; do not apply an already-recorded effect twice.

![Effects changing the image before recording](https://s3.eyeauras.net/media/2026/05/9C9JTjRZAV.png)

The earlier example removes unwanted background with effects. Colour replacement, contrast or channel selection can also change the prepared pixels; choose the actual [effect](/en/triggers/images/effects) for your input and inspect its output. These are transformations, not guarantees of better recognition.

Prefer varied, understandable frames over many near-duplicates. Use separate labels for objects that need different handling, and review empty scenes, menus or similar colours without the target as negative examples. A negative frame enters training only as part of a completed task, without invented boxes.

<details>
<summary>Copies, deduplication and moving a project</summary>

| Location | Contents |
| --- | --- |
| `.yeproj` | Project settings and source references. |
| Neighbouring working folder | Tasks, annotations, models, prepared datasets and local sources. |
| `local-sources` | Imported individual images and extracted frames. Move it with the project. |
| `assets/training` | Working images, with source prefixes and flattened relative paths in their names. |

Synchronisation compares working files with the sources found now and deletes working copies no longer listed. Removing, renaming or losing an external folder therefore does not leave a dependable project archive. An existing destination is also not automatically overwritten when a source changes under the same name.

Storage-name deduplication is not visual or content-based duplicate detection. Near-identical video frames can still leak between training and validation. Refresh is an explicit operation; do not assume every external change is watched and imported immediately.

For a portable project, import individual images or keep extracted frames in `local-sources`, then preserve the `.yeproj` and working folder together. Keep any external sources accessible separately. **Settings → Workspace/Resolved storage** shows the actual location. If a source disappears, restore its path before refreshing. See [diagnostics](/en/YoloEase/features/diagnostics).

</details>
