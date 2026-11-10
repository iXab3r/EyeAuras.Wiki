---
title: Text
description: Display your text as a condition-controlled reminder
published: true
date: 2023-06-18T16:46:29.776Z
tags:
editor: markdown
dateCreated: 2023-06-18T16:37:47.342Z
---

# Text — toggle a reminder with a key

Keep a short reminder such as “Check the microphone before recording” available while you work. Text displays the words you enter; a Hotkey Is Active trigger decides when they are visible.

## Show and hide a reminder with F7

1. Create an aura with just [Hotkey Is Active](/en/triggers/hotkey-is-active). Choose an unused **F7** and **Toggle Trigger state on Click**.
2. Under **Overlays**, add **Text**. Expand its Text section and enter “Check the microphone before recording” in **Content**. The older editor calls this field Text.
3. Set **Font** to `24` and turn **Size to fit** off. Choose white **Font Color**, then a black **Outline** with thickness `2`.
4. Turn **Locked** off, place the reminder and give it a wide enough rectangle, for example `500 × 80`. Enable Locked again and optionally Click-through.
5. Switch to your working application and press F7. Press it again to hide the reminder.

The first toggle activates the aura and shows the text; the second deactivates it. The selected aura's overlay may remain visible for editing, so test the toggle in another application.

For a visibility check without the key, replace Hotkey Is Active with [Fixed Value](/en/triggers/fixed-value). If the condition already lives in another aura, reuse its state through [Aura Is Active](/en/triggers/aura-is-active); keep the words you want to show in **Content**.

## Text settings

| Setting | What it does |
| --- | --- |
| Content | Your message. Enter text directly or use a [binding](/en/features/bindings) to another property or variable. |
| Font | Font size when Size to fit is off. Older label — FontSize. |
| Size to fit | Chooses a font size for the available display area. Older label — Fit to Size. Give long text enough space rather than relying on unlimited fitting. |
| Font Color | Letter color. |
| Outline | Character-outline thickness and color. Older separate fields — Outline Thickness and Outline Color. |
| Alignment | Text placement inside the overlay rectangle. Older label — Text Anchor. |

Alignment supports Center, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft and BottomRight. It places the text **inside** its rectangle; Position places the overlay itself.

Size, background, border, opacity and locking are covered in [Common Options](/en/overlays/common-options). To show a message when something changes, replace the hotkey with an appropriate trigger, such as [Text Search](/en/triggers/images/text-search). The trigger must obtain the condition from a configured source; Text does not read chat, health, loot, objectives or cooldowns by itself. The message and its activation condition are configured separately.
