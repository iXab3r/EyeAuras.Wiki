---
title: Color Search
description: Compare captured colors and test a similarity range
published: true
date: 2024-05-14T11:17:37.160Z
tags: 
editor: markdown
dateCreated: 2023-06-17T12:25:45.794Z
---

# Color Search — detect an indicator's color change

Color Search can notice a gray indicator becoming green for “ready”. It receives pixels from the chosen window, compares them with **Target Color**, and checks whether similarity falls within the configured range. It does not read the application's internal status value.

Choose a mostly uniform area and an application where you can switch between both states. Exclude lettering, borders and panel background from the region: they change its average color.

## Check a green indicator

1. Open the application with its indicator green and add **Color Search** to an aura.
2. Select the window in **Capture settings → Target Window**, set **Image Capture Rate = 5** and expand **Preview captured image**.
3. Use **Crop region** to keep the solid center of the indicator. If its color is wrong in preview, fix the [capture source](/en/triggers/images/imagecapturetriggers) first.
4. Set **Comparison Granularity — Aggregate Average Color of Entire Area** and **Comparison Method — Human Perception**.
5. Click **Copy Captured Color to Target Color**. Check that Target Color now contains the current average color.
6. Under **Match Threshold**, enable **Min** to display both limits. Set **Min = 95%**, **Max = 100%**. With the indicator unchanged, Similarity should be near 100% and the trigger active.
7. Switch the indicator to gray or its other normal state. Similarity should leave the range and the trigger become inactive. Restore green and check activation again.

If both states pass, inspect the region and each state's actual similarity, then choose a boundary between them. Antialiasing, effects and hover highlighting mean one 95% setting will not suit every application.

## Choose the color and comparison

| Setting | Meaning |
| --- | --- |
| Target Color | Reference color; can also be entered manually. |
| Captured Color | Average of the whole captured area. In local modes it need not be the color of the found patch. |
| Copy Captured Color to Target Color | Uses that whole-area average as the reference. |
| Pick Color from Preview Pane | Selects a particular preview color instead of the whole area's average. |
| Human Perception | CIEDE2000 comparison, accounting for human perception of color differences. |
| Mathematical | Euclidean distance in RGB channels. |
| Match Threshold | Inclusive similarity range, such as 95–100% for a close match. A low-similarity range can test dissimilarity. |
| Similarity | Current comparison score; it is not generally the percentage of pixels having the target color. |

Comparison Method applies to the whole-area average. Individual-pixel and block modes use color-template matching instead, so a threshold tuned for CIEDE2000 does not transfer automatically. Neither method guarantees better speed or accuracy in every setup.

## Whole area, pixel or block

| Comparison Granularity | Use |
| --- | --- |
| Aggregate Average Color of Entire Area | Overall state of a small fixed region; every pixel contributes to the average. |
| Individual Pixel Color | At least one suitable pixel inside the region; a noisy pixel can also match. |
| Average Color of 2x2 / 4x4 / 4x8 / 8x4 / 8x8 / 16x16 / 32x32 Pixel Blocks | A local patch of the selected size, which must fit in the frame. This is not the whole window's average. |

Use a small fixed region for a stationary indicator, or a local mode for a colored mark that moves within a panel. A similar color elsewhere can also activate an unrestricted search.

<details>
<summary>Measure a visual bar's filled fraction</summary>

The white-filled/black-empty technique is useful for a simple visual progress bar. Use [Effects...](/en/triggers/images/effects) to map the two colors to white and black, exclude borders and text, then compare the whole-area average with white using **Mathematical**. For an ideal binary bar, similarity reflects the fraction of white pixels.

Check known empty, half-filled and full states first. Gradients, glow, lettering and rounded corners break the ideal relationship. This measures the bar's pixels, not an internal HP, MP or progress value. Color Removal/Replacement inversion changes the prepared pixels; it is distinct from the trigger's inclusive similarity range.

</details>

After both states are distinguishable, add a reaction to **OnEnter**, such as [Play Sound](/en/actions/play-sound). Color Search changes trigger state; the action follows the combined aura's state transition.
