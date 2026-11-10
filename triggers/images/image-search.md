---
title: Image Search
description: Find a saved template in captured window pixels
published: true
date: 2024-05-14T11:17:25.420Z
tags: 
editor: markdown
dateCreated: 2023-06-18T13:24:03.149Z
---

# Image Search — notice a familiar icon

Save an image of a completion icon once, then look for that template in new frames of your application. Image Search compares pixels; it does not know what the icon means inside the source program.

Use a real visible icon and a second state where it is absent. Keep its interface scale, theme and size consistent. Configure any reaction separately.

## Capture a template and check both states

1. Open your application's completed state and add **Image Search** to an aura.
2. Select its window under **Capture settings → Target Window**, set **Image Capture Rate = 5**, then expand **Preview captured image**. If the icon is missing from the frame, fix [capture](/en/triggers/images/imagecapturetriggers) first.
3. Use **Crop region** to keep the area where the icon appears, with a little room for movement but without similar neighbors.
4. In preview, choose **w/o debug data**, then under **Template source - what to search for**, click **Load from Preview Pane**. This copies the whole preview image.
5. Click **Edit...**, use **Crop** to keep the icon, then **Save**. Exclude changing percentages, times and filenames. See the [template editor](/en/triggers/images/image-editor) for cleanup and transparency.
6. Under **Trigger activation conditions**, set **Match Threshold = 95%** and click **Refresh Once**. Inspect the actual **Similarity** and found region. 95% is a starting value to test on your icon.
7. Switch the source application to its state without the icon and refresh again. The match should disappear and the trigger become inactive. Restore the icon and verify that the match returns.

If a visible icon is missed, compare its scale and captured appearance with the sample. If it matches while absent, narrow the region or choose a more distinctive template. Lowering the threshold admits more candidates, including false matches.

## Template and result

| Control or value | Use |
| --- | --- |
| Load... | Loads a template from a file. Stored data belongs to the trigger; later disk-file edits do not update it. |
| Load from Preview Pane | Copies the current preview; trim it with Edit... afterwards. |
| Load from Clipboard / Copy to Clipboard | Transfers the template image through the clipboard. |
| Edit... / Save... / Clear | Edits the embedded sample, saves a separate file, or removes it. |
| Transparent sample pixels | Excluded from comparison. Remove a background or changing corner while keeping distinctive opaque detail. |
| Match Threshold | Minimum similarity for a successful match, including the threshold itself. |
| Similarity | Actual candidate similarity, not a probability that the application completed its task. |

The template is not automatically fitted to arbitrary rotations or new sizes. Prepare a matching sample for another scale. [AI Search](/en/triggers/images/ai-search-trigger) instead recognizes classes learned by a compatible model; it is not a universal rotation-proof version of this template search.

<details>
<summary>Several matches and diagnostic outlines</summary>

| Setting | Effect |
| --- | --- |
| Match Collection → Include All Matches | Collects multiple eligible results instead of just the best one. |
| IoU Threshold | Suppresses overlapping results; it does not replace Match Threshold. |
| On-screen-display → Window / Region / Bounding Boxes | Shows source and found-region outlines on screen for diagnosis. |

For “at least one icon is present”, start with the normal single-result search. Even a no-match frame can require substantial work, so restrict the region to useful pixels.

</details>

A result rectangle belongs to the captured/processed image and its coordinate mapping. Cropping and scaling affect that mapping; do not treat a preview pixel as a desktop click position. Configure the [coordinate system](/en/features/coordinate-system) and any input target separately.

To keep the found area visible while working elsewhere, use [Replica](/en/overlays/replica) and link this search aura as its source. First check the found rectangle; Replica displays that region rather than sending input to the source window.

Once both states are reliable, add a reaction to the aura's **OnEnter**, such as [Play Sound](/en/actions/play-sound). With this as the only trigger, the sound follows the transition to a match rather than every frame. Other triggers and enabling conditions also affect the aura's combined state.
