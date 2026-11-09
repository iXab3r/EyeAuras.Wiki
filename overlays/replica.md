---
title: Replica
description: allows to monitor a window or specific region of it in real-time, within an overlay
published: true
date: 2023-06-18T16:54:28.187Z
tags:
editor: markdown
dateCreated: 2023-06-18T16:54:27.099Z
---

# Replica — keep a useful window region in view

A long-running operation may show progress in one small part of a large window. Replica copies that region into an overlay above your working application. Its source is the window's visible image, not separate progress values or remaining-time data.

For the first check, keep the source application open and restored. Choose an area that really changes, such as its status line or progress bar.

## Mirror a progress region

1. Create an aura with [Fixed Value](/en/triggers/fixed-value) set to **Is Active** and add **Replica** under **Overlays**.
2. Under **Replica → Target Window**, select the source application's window. Check the displayed target; refine its [window matching expression](/en/features/window-matching-expressions) if needed.
3. Under **Source region**, click **Select region** and select a rectangle around the indicator in that window. Leave **Source offset** at zero, **Source anchors** at their defaults and **Linked auras** empty.
4. In the common overlay settings, disable **Locked**, move the copy into view and set its size. Enable **Aspect Ratio** to preserve proportions, then enable Locked again.
5. Switch to your working application and wait for the source indicator to change.

The same region should update in the overlay. Source region chooses **what to copy**; the common Position controls **where and how large to display it**. Select the region again if the source application's layout changes.

## Source settings

| Setting | What it does |
| --- | --- |
| Target Window | The window being copied, not the application beneath the overlay. |
| Source region / Select region | Selects a region relative to the source window's client area, in pixels. |
| Reset | Clears source geometry, offsets, anchors and links. An empty region means the whole source window. |
| Source offset | X, Y, Width and Height adjustments to the copied region. |
| Source anchors | Reference points for the region and its content; see [coordinates](/en/features/coordinate-system). |
| Linked auras | Obtains the source window and region from another aura, such as Image Search. Older label — Link Aura. |

To follow an [Image Search](/en/triggers/images/image-search) result, first verify its found rectangle, then add that aura under Linked auras. Replica follows the supplied region and window. With multiple links it uses the first available source with bounds, not a guaranteed order of activation times. Start with one link for an unambiguous setup.

## Visibility and limits

Fixed Value keeps the example active, so the locked copy stays visible. Replace it with [Hotkey Is Active](/en/triggers/hotkey-is-active) for key-controlled visibility. [Common Options](/en/overlays/common-options) covers locking, click-through and normal-window mode.

Replica displays an image; it does not create another interactive instance of the source application. Clicking the copy does not send a click to the source. Click-through targets the window **under the overlay**.

A closed window cannot be copied. A minimized or capture-protected window may not update as expected; restore it for the first check. If no copy appears, check Target Window, Source region dimensions and the overlay's message, such as **No window matched**. A temporary handle may stop matching after the window is recreated. Updating a live copy is work, so use the region and size you need; there is no fixed CPU/GPU cost promised for every window.
