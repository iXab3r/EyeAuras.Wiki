---
title: GTA5
description: 
published: true
date: 2024-09-11T15:08:44.386Z
tags: 
editor: markdown
dateCreated: 2024-09-11T15:06:23.936Z
---

# Compare background responsiveness while GTA 5 is open

If a browser or EyeAuras becomes much slower while GTA 5 is running, compare the same task with two Windows settings. The earlier report mentioned AltV and RageMP. Those names do not identify the cause, and disabling a setting is an experiment on your computer rather than a universal optimization.

You need Windows with the relevant options and a repeatable observation, such as the same browser page scrolling poorly only while the game is open. Record the original switch positions and change one setting at a time.

## Compare one setting at a time

1. Observe the delay during your usual task. Keep EyeAuras capture rate and other settings unchanged so the comparison has a clear meaning.
2. Open **Settings → Gaming → Game Mode** and set **Game Mode** to **Off**. Repeat the same observation with the game open. Restore the original value if it makes no useful difference.
3. For a separate Windows 11 comparison, open **Settings → System → Display → Graphics**. Under **Custom options for apps**, select the game's executable, open **Options**, turn off **Optimizations for windowed games**, and click **Save**. Restart the game. If Auto HDR is enabled, it must be turned off before disabling this optimization.
4. Repeat the original observation. Keep a change only when its effect is clear; otherwise restore the recorded values and restart the game after graphics-setting changes.

The result is a comparison of responsiveness in one scenario, not proof of an FPS gain or a fix for every aura delay. [Microsoft describes the option](https://support.microsoft.com/en-us/windows/hardware/display-graphics/optimizations-for-windowed-games-in-windows-11) for compatible DirectX 10/11 games in windowed and borderless modes.

If only an image-based aura is slow, first inspect its [capture statistics](/en/triggers/images/imagecapturetriggers): compare capture, effects and processing time with the requested rate. Keep Windows settings unchanged during that check. It answers a narrower question than the browser-responsiveness comparison above.

The 2024 illustration shows `Game Mode`; Windows may localize its labels.

![Game Mode in the earlier Windows settings](http://files.eyesquad.net/screenshots/11-09-2024/Discord_tRNKShE2GYG74pgRIecTtoNII.png)

| Setting | Scope of the comparison |
| --- | --- |
| `Game Mode` | Windows-wide gaming setting, tested separately from per-app graphics options. |
| `Optimizations for windowed games` | Can be changed for one game in Windows 11; restart it afterwards. |
| Original switch position | Lets you undo a change that did not help. |

The second older screenshot uses **Default graphics settings**, where the switch was global. The per-app route above starts with one game instead.

![Earlier global Default graphics settings page](http://files.eyesquad.net/screenshots/11-09-2024/Discord_kvqBHaMReyO1ATkhWLoispdYu.png)
