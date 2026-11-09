---
title: Common Options
description:
published: true
date: 2023-06-18T16:39:19.091Z
tags:
editor: markdown
dateCreated: 2023-06-18T16:39:17.957Z
---

# Common Options — place an overlay and control visibility

A reminder should be easy to read without blocking the application beneath it. Common overlay options control its position, size, transparency and mouse behavior.

The overlay supplies the content: [Text](/en/overlays/text) shows your words, [Image](/en/overlays/image) a loaded picture, and [Replica](/en/overlays/replica) a copy of another window. The aura's state normally controls visibility.

## Place a reminder and let clicks pass through

1. In an aura with [Fixed Value](/en/triggers/fixed-value) set to Is Active, add Text and set **Content** to “Check the microphone”.
2. Leave **Window → Mode** on **Overlay**. Under **Position**, turn **Locked** off, drag the reminder into place and resize it by its edge. You can also enter X, Y, Width and Height numerically.
3. Under **Visual style**, set **Opacity** to `1` — displayed as **100%** — and choose a readable **Background**.
4. Enable **Locked**, then **Click-through**. Switch to your own application and click one of its controls beneath the reminder: the click should reach that application.
5. Set Fixed Value to Is NOT Active, select another aura in the tree, then return to your working application.

The reminder hides. Set the aura active again and it returns to the saved position. An unlocked overlay stays visible for placement, and the selected aura can show its overlay while the EyeAuras editor is active. Check normal visibility outside the editor.

## Position and appearance

| Setting | What it does |
| --- | --- |
| Locked | Prevents normal movement and resizing. Called IsLocked in older interfaces. |
| Position / Screen bounds | Overlay X, Y, Width and Height. |
| Offset | Adjusts position and size. With the standard anchors, position `(100, 100)` plus offset `(10, 20)` gives `(110, 120)`. |
| Anchors | Sets the reference points for placement and content. Start with the defaults; see [coordinates](/en/features/coordinate-system) for other arrangements. |
| Opacity | Transparency of the whole overlay. `0` is invisible; `1` is fully opaque. |
| Background | Background color, including transparent. Older label — Background Color. |
| Border / Border Thickness | Border color and thickness. |
| Click-through | Passes clicks to the window underneath while locked. The active EyeAuras editor can temporarily restore mouse interaction for editing. |
| Aspect Ratio | Keeps the content's proportions when known. Unavailable while position is linked to a source. |

<details>
<summary>Show the content as a normal window</summary>

Choose **Window → Mode — Window** for a title bar and a taskbar entry. The content remains owned by the aura.

| Setting | What it does |
| --- | --- |
| Mode — Overlay | Borderless overlay above other windows. |
| Mode — Window | Normal window with a title and taskbar entry. |
| Title | Window-mode title text. |
| Stacking — Always on top | Keeps the normal window above other windows. |
| Movement — Movable even if locked | Allows moving a locked window. Click-through still sends mouse input through it. |
| Minimum Size / Maximum Size | Limits resizing. Pick current uses the current size; Reset removes that limit. |
| Window Icon | Load from file... selects an icon; Clear removes it. |

</details>

To reposition an overlay, disable Locked in its editor. Placement locking, opacity and aura activation are separate: a transparent overlay can still belong to an active aura.
