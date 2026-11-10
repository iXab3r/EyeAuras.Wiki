---
title: "Check a colored panel only while holding a key"
description: "Use an enabling condition to inspect your own color panel on demand and show a matching label."
published: true
date: 2026-11-10T16:05:04.371Z
tags: recipes, basic
editor: markdown
dateCreated: 2026-11-10T16:05:04.371Z
---

# Hold F8 to inspect a colored panel

Keep a color check behind a held key so it runs when you ask for it. A child aura shows **Green state found** only when the captured panel matches the sampled green color. Releasing the key removes permission for that group to work.

You need a visible panel in your own application with two known states: a solid green patch and a distinctly different gray patch at the same position and size. For a simple local exercise, prepare two of your own 200 × 100 PNGs, one green and one gray, and display them in one image viewer at the same zoom. These files are not supplied by the Wiki. Keep the viewer window open and restored, with a capture method that supplies its current pixels. Use F8 only if it is unused in your test application; otherwise choose another unused key.

## Build and tune the color check first

1. Right-click an empty part of the tree and create **New folder**, named **Inspect panel**. Right-click that folder, choose **New Aura**, and name the child **Green panel**.
2. In the child's **Triggers**, click **+** and add **Color Search**. Select your viewer in **Target Window** with the window picker and verify the selected window information. Set **Image Capture Rate** to **5 FPS** and open **Preview**. Display the green image and confirm that Preview shows the current panel.
3. Use **Crop region** to select a small area entirely inside the solid patch, excluding borders, labels and shadows. Keep the effects list empty. This region is in the captured source image, not a desktop destination for input.
4. Under **Color source - what to search for and how**, set **Comparison Granularity** to **Aggregate Average Color of Entire Area** and **Comparison Method** to **Human Perception**. Click **Copy Captured Color to Target Color** while the patch is green.
5. Under **Trigger activation conditions**, enable **Min** and use the range below. Click **Refresh Once** with green displayed; then show gray and refresh again. Green should match and gray should not. If both match, correct the source and crop before changing the range.

| Color Search setting | Value |
| --- | --- |
| Image Capture Rate | 5 FPS |
| Match Threshold → Min | 95% |
| Match Threshold → Max | 100% |
| Effects | Empty |

6. In the child's **Overlays**, add **Text**. Set **Content** to `Green state found`, **Font** to **24**, **Size to fit** off, and **Window → Mode** to **Overlay**. Turn **Locked** off to place a readable 400 × 70 area, then turn **Locked** and **Clickthrough** on.

## Put the group behind the held key

1. Select the **Inspect panel** folder. In **Enabling Conditions**, click **+** and add **Hotkey Is Active**. Assign **F8**, choose **Hold**, and leave **Suppress Key** off. Do not put this key in the child's ordinary Triggers list.
2. Select an aura outside this folder; create a separate empty **Setup** aura at the root if necessary. Leave the editor for your viewer. Keep the folder and child loaded, and EyeAuras unpaused.
3. With green displayed, hold F8: the label should appear. Release F8: it should disappear. With gray displayed, holding F8 should not produce the label. Release the key between comparisons.

[Enabling conditions](/en/features/enabling-conditions) control whether the group may work; an ordinary false trigger only contributes a false condition and does not by itself stop the other triggers from calculating. Selected items can still be evaluated or displayed for editing, so the outside-folder selection matters. [Color Search](/en/triggers/images/color-search) supplies the match, [Hotkey Is Active](/en/triggers/hotkey-is-active) supplies the held-key condition, and [Text](/en/overlays/text) supplies the visible answer.

The 95–100% range is a starting comparison range, not a probability of correctness or a required percentage of green pixels. A missing capture or Unknown result is not a confirmed gray state. If Preview is blank or stale, repair the [capture source](/en/triggers/images/imagecapturetriggers) rather than lowering the threshold.
