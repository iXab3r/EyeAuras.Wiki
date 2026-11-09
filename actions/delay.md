---
title: Delay
description: allows users to control the timing between actions, including an option for randomizing delay durations
published: true
date: 2024-05-14T18:37:33.237Z
tags: 
editor: markdown
dateCreated: 2023-06-18T14:34:33.370Z
---

# Delay — pause between actions

To separate two sound notifications, put Delay between them. It waits for the configured interval before the next action in the same group starts.

## Play two sounds one second apart

You need one aura and working audio output. Use [Fixed Value](/en/triggers/fixed-value) to start the example manually.

1. Add a Fixed Value trigger and select **Is NOT Active**. Leave other triggers out of this example.
2. In **On Enter**, add [Play Sound](/en/actions/play-sound), select Ping and turn off **Play in background**. The delay will then start after the sound finishes.
3. Add Delay next in the same group. Disable random timing: **Randomize** in the older editor, or the crossed-arrows button in the newer one. Set **Delay, ms** to `1000`.
4. Add another Play Sound after Delay and select Bell. The order is Play Sound → Delay → Play Sound.
5. Change Fixed Value to **Is Active** and leave the aura active until the second sound finishes.

You should hear Ping, a pause of about one second after it finishes, then Bell. To repeat, switch Fixed Value to Is NOT Active and back to Is Active. In **While Active**, the chain would repeat while the aura remains active.

![Delay settings in the older editor](https://s3.eyeauras.net/media/2024/05/EyeAuras_18f7NSJLeiMFPOCD.png)

## Settings

| Setting | Effect |
|---|---|
| Delay, ms | Pause duration in milliseconds. `1000` ms is one second. |
| Randomize | Picks a new duration from the configured range on each execution. The newer editor uses the crossed-arrows button. |
| Min / Max | Lower and upper random-delay bounds. For example, `800` and `1200` give a pause of roughly 0.8–1.2 seconds. |

Delay waits for time to pass, not for an event in another application. To wait for a window to appear, check it separately with [Window Exists](/en/triggers/window-exists). Other auras keep working during the pause.
