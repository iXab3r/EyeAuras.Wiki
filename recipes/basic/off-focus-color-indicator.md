---
title: "Show a color warning while you work in another window"
description: "Observe a known color in your own status window and display a separate reminder without focusing it."
published: true
date: 2026-11-10T16:05:04.371Z
tags: recipes, basic, ai-translated
editor: markdown
dateCreated: 2026-11-10T16:05:04.371Z
---

# Keep a separate status panel in view

Show **Check status panel** when a known warning color appears in your own source window, while you work in a different application. The source is the panel's captured pixels; the visible reminder is a separate Text overlay. Neither selecting that source nor displaying the reminder sends input or activates its window.

Prepare a source you can change between two known colors at the same position. A simple exercise uses two PNGs you create yourself, each 200 × 100: one solid red and one solid gray. Open them in one image viewer at a fixed zoom. Use a second, unrelated working window beside it. The Wiki supplies neither image. Keep the source restored and initially unobscured; the selected capture backend must continue supplying current frames when the source loses focus.

## Match the warning color

1. Right-click an empty area of the EyeAuras tree, choose **New Aura**, and name it **Panel warning**. In **Triggers**, click **+** and add **Color Search**.
2. Use the **Target Window** picker to select your source viewer, not the second working window. Check the selected window information. Set **Image Capture Rate** to **5 FPS** and open **Preview**.
3. Display the red source image. Use **Crop region** to select a small solid area away from edges or text. Leave **Effects** empty. Check that the cropped preview really changes when you switch between your red and gray images.
4. In **Color source - what to search for and how**, select **Comparison Granularity → Aggregate Average Color of Entire Area** and **Comparison Method → Human Perception**. Display red and click **Copy Captured Color to Target Color**.
5. In **Trigger activation conditions**, enable **Min**, set **Min 95%** and **Max 100%**, and use **Refresh Once** in each state. Red should give **Active**; gray should give **Not Active** on a valid frame. If they do not separate, first inspect the target, crop and actual colors.

| Setting | Value |
| --- | --- |
| Target Window | Your source viewer |
| Image Capture Rate | 5 FPS |
| Comparison Granularity | Aggregate Average Color of Entire Area |
| Match Threshold range | 95–100% |

## Put the answer beside your work

1. In **Overlays**, click **+** and add **Text**. Enter `Check status panel` in **Content**. Use **Font 24**, **Size to fit** off, **Font Color** red and **Window → Mode → Overlay**.
2. Turn **Locked** off, place a 400 × 70 overlay near your second working window, then turn **Locked** and **Clickthrough** on. Leave the action lists empty: this task only displays a reminder.
3. Keep the aura enabled and EyeAuras unpaused. Select a different aura and return to your working application. With the source red, expect the warning to be visible. Change the source to gray, return to the working application, and expect the warning to disappear. Restore red to see it return.
4. While the source is out of focus, confirm in Preview that it still supplies fresh frames as you change its state. Close Preview after setup. If capture becomes black, frozen or unavailable, choose an appropriate supported capture method or keep the source in a capturable state; do not interpret that failure as a normal gray state.

[Color Search](/en/triggers/images/color-search) compares the sampled area; [Text](/en/overlays/text) puts the answer where you need it; [capture settings](/en/triggers/images/imagecapturetriggers) determine whether observation is possible in the intended window state. The similarity range is not a percentage of warning pixels or an accuracy probability. This recipe does not guarantee minimized-window capture, and an editing preview or unlocked overlay can remain visible independently of the condition.
