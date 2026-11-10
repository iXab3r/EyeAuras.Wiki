---
title: Image / Text / Color / AI Search
description: 
published: true
date: 2024-05-14T11:17:19.122Z
tags: 
editor: markdown
dateCreated: 2022-12-20T17:43:40.363Z
---

# Capture the right pixels before searching

Before searching for an icon, color or text, make sure EyeAuras sees the right part of your application. A black frame, a neighboring window or an oversized region can spoil the search before you choose any threshold.

Image Search, Color Search, Text Search and AI Search share these capture settings. Capture supplies the image; each trigger then analyzes it differently. Sound, input and other reactions are separate aura actions.

## Capture one changing indicator

Open an application with a visible status indicator. The aim here is a preview containing that indicator, without the rest of its panel.

1. Leave the indicator visible and add **Color Search** to an aura.
2. Under **Capture settings → Target Window**, select the application. Check the selected window beside the field; use a [matching expression](/en/features/window-matching-expressions) if several windows are eligible.
3. Set **Image Capture Rate = 5 Frames Per Second** as a starting point for a mostly static indicator.
4. Expand **Preview captured image**. If the frame is empty or wrong, click **Show more...** and inspect **Capture Source**. Start with **Windows Graphics** when available, or compare the alternatives below.
5. Set **Crop region → X, Y, Width, Height** to keep the indicator. These values belong to the selected source image, not automatically to desktop coordinates. Follow the preview; **Reset** removes the crop.
6. Change the indicator in the source application. The same region should change in the preview.

That correct frame is the result of this setup. A visible image alone is not a search match: Active depends on the selected trigger's condition.

## Capture settings

| Setting | Why change it |
| --- | --- |
| Target Window | Source of pixels. Narrow multiple matches to the intended window. |
| Image Capture Rate — formerly Max FPS | Desired capture/analysis rate. 5 FPS is roughly one check per 200 ms; 30 FPS per 33 ms. These are targets, not latency guarantees. |
| Settings → Max Capture FPS | Shared rate limit; the editor shows MAX … FPS when it constrains a trigger. |
| Crop region | Restricts the analyzed image. A smaller useful region reduces unrelated candidates and usually work. |
| Capture Mouse Cursor | Includes the cursor with backends that support it. Usually leave it out of a static icon sample. |
| Do not capture Title/Borders | Excludes title/borders where the source supports it; recheck the crop afterwards. |
| Low-latency | Changes frame acquisition behavior. Compare the actual frame and load on your application. |
| Effects... | Changes captured pixels before analysis, such as resizing or grayscaling. |

The FPS tooltip separates capture, effects and processing time, and shows frame age and output dimensions. A 100 ms operation does not become 33 ms merely because you request 30 FPS. Reduce the region, unnecessary effects or rate first. Preview zoom changes how you view the image; Crop and resize effects change the actual pixels and their coordinates.

## Choose a capture source

Availability depends on Windows, graphics components and the source application. Check correctness before comparing load.

| Capture Source | When to try it |
| --- | --- |
| Windows Graphics | System window capture. This implementation requires Windows 10 build 19041 or later and a supported Graphics Capture session. |
| Shared Surface | Obtains the window surface through the graphics subsystem; an alternative if Windows Graphics gives a wrong frame. |
| Desktop duplication | GPU desktop capture. Overlapping windows can appear in the selected area. |
| Print Window | Older window capture; hardware-rendered applications may return a blank or incomplete image. |
| Copy Device Context | GDI window-context copying for compatible ordinary windows. |
| Copy From Screen | Copies visible screen pixels; window placement and occlusion matter. |

There is no universal fastest or lowest-memory ordering for every frame size and environment. Recheck the region after switching methods. Closed, minimized or inaccessible windows are not reliable sources of current pixels. Capture/processing failure can yield Unknown rather than a normal no-match; cancellation is not evidence that the image contains no target.

<details>
<summary>Preview, one-shot checks and older Min FPS configurations</summary>

| Control | Meaning |
| --- | --- |
| Refresh Once in a search editor | Requests one analysis pass for setup without a high continuous rate. |
| MIN … FPS (only in Preview) | A minimum rate while preview is open; it can raise the effective rate. Close preview when measuring normal load. |
| Image as is / w/o debug data / w/o effects | Compare the annotated result, the result without debug marks, and the frame without effects. |
| from file | Substitutes a file image for preview. Return to the normal source afterwards. |
| Older Min FPS | Previously described a result-expiry/Unknown mechanism. It is not exposed as that control in the current editor; do not rely on a saved value as a guaranteed freshness timer. |

The preview minimum is not the old Min FPS result lifetime. Request/processing timing and unavailable frames are separate from whether a condition matched.

</details>

For searches needed only in one mode, use [Enabling Conditions](/en/features/enabling-conditions) on the aura or its folder. An ordinary false trigger does not by itself stop the other capture/search triggers; check normal behavior after leaving the editor preview.

Continue with [Image Search](/en/triggers/images/image-search), [Color Search](/en/triggers/images/color-search), [Text Search](/en/triggers/images/text-search) or [AI Search](/en/triggers/images/ai-search-trigger). Use [Effects](/en/triggers/images/effects) when the pixels themselves need preprocessing.
