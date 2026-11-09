---
title: Play Sound
description: enables users to play specified sounds or notifications via the default output device
published: true
date: 2024-05-14T09:49:56.842Z
tags: 
editor: markdown
dateCreated: 2023-06-18T14:29:49.671Z
---

# Play Sound — hear when a condition becomes true

Play Sound can notify you when a program's window appears. [Window Exists](/en/triggers/window-exists) supplies the condition; Play Sound supplies the audio response.

## Play a notification when Notepad opens

1. Create an aura with one Window Exists trigger. Enter `notepad` in **Target Window** and check that it finds your Notepad window. If other windows also match, make the expression more specific.
2. Add Play Sound to **On Enter**.
3. Select Ping in **Audio notification** and set **Volume** to `50%`. Use the preview button beside the list to check that you can hear it.
4. Close all matching Notepad windows and wait for the aura to become inactive. Open Notepad again.

When the window appears and the aura becomes active, the sound plays once. On Enter does not repeat while the window stays found. For another notification, the aura must become inactive between appearances.

![Sound selection in the older editor](https://s3.eyeauras.net/media/2024/05/EyeAuras_Cd0NOjfW7gmIOFqx.png)

## Settings

| Setting | Effect |
|---|---|
| Audio notification | Selects a built-in sound. The older editor calls this Notification. |
| Load... | Loads your own WAV or MP3 file. The audio data is stored in the action, so renaming or deleting the original file does not remove the loaded sound. |
| Volume | Notification volume. Playback uses the default output device; also check the system volume. |
| Play in background | Enabled by default. Starts playback and immediately continues to the next action. Turn it off to wait until playback finishes. |

For a pause **after** the sound ends, disable Play in background and put [Delay](/en/actions/delay) next. With background playback, Delay starts counting while the sound may still be playing.

Use On Enter for a single notification. In While Active, the sound starts repeatedly while the aura is active.
