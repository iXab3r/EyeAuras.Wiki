---
title: Volume Level
description: Historical alpha audio-threshold behavior and the limits of its unavailable current editor
published: true
date: 2024-05-14T11:17:58.384Z
tags: 
editor: markdown
dateCreated: 2023-03-21T23:23:51.953Z
---

# Volume Level — historical alpha

This page describes **Volume Level**, an alpha feature for comparing captured audio samples with a threshold. Its purpose was to notice sound from a selected source, such as lighting an indicator while that source produces audio. It measures audio data, not the Windows volume slider and not a particular tune or alarm.

The current element registrations do not expose this trigger with a current editor. Adding it is therefore not a reproducible current-interface path. An old aura or remaining class does not establish that audio capture works in your installed version; the following preserves the old configuration's meaning.

## If you have an older aura

1. Check whether your compatible installed version actually opens a **Volume Level** editor, rather than merely retaining an unknown configuration item. Without that editor, this page does not supply a replacement setup route.
2. In a compatible older version, identify the capture source and select your own device. A playback output and a microphone input are different sources.
3. Find **Min Level** and the level display. Compare the readings before, during and after a short sound on that source. Choose the threshold from that version's readings, not the Windows volume percentage.
4. Check whether activity follows the sound and becomes inactive when the measured level falls. Only then attach a separate indicator or other reaction. These steps depend on the older editor and functioning capture; they do not replace current trigger creation.

## What the values mean

| Setting or measurement | Meaning and limits |
| --- | --- |
| Device source | Captured device audio; the saved model distinguishes default input, default output and a specific device |
| Process source | The saved model also describes process capture selected through a window. That model does not establish a current editor for it |
| Min Level | Threshold compared with the maximum sample value of each received buffer, not a device-volume percentage |
| Minimum / maximum / average | Statistics of the samples. Average uses absolute sample values; activation uses the maximum rather than the average |
| State | Received data with maximum at least the threshold activates the trigger; a lower value deactivates it. No new data does not itself establish silence or guarantee a reset |

The capture determines buffer duration; do not treat it as a guaranteed 50 ms polling interval. Nor is the old display automatically a calibrated decibel meter.

This threshold cannot identify a click, a voice or a particular warning sound. Even with functioning older capture, it answers only a level question about the selected source.
