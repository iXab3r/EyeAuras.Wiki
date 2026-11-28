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

Sometimes a browser or EyeAuras gets much slower while GTA 5 is running. This was reported with AltV and RageMP, but the client is not necessarily the cause. Below are two Windows settings worth checking.

You need Windows with these options and a delay that is easy to repeat. For example, the same browser page stops scrolling smoothly only while the game is open. First write down where the switches are now. Change one setting at a time.

## Compare one setting at a time

1. Trigger the delay the usual way and note what it looks like. Do not change the EyeAuras capture rate and Windows settings at the same time, or you will not know what helped.
2. Open **Settings → Gaming → Game Mode** and set **Game Mode** to **Off**. Repeat the same thing with the game open. If nothing changes, put it back.
3. A separate check for Windows 11: open **Settings → System → Display → Graphics**. Under **Custom options for apps**, select the game's executable, open **Options** and turn off **Optimizations for windowed games**. Click **Save** and restart the game. If Auto HDR is enabled, turn it off first.
4. Repeat the check. Keep the change only if things got clearly better. If not, restore the values you wrote down and restart the game after graphics-setting changes.

The windowed-games optimization works for compatible DirectX 10/11 games in windowed and borderless modes. [Microsoft describes the option](https://support.microsoft.com/en-us/windows/hardware/display-graphics/optimizations-for-windowed-games-in-windows-11) separately.

If only an image-based aura is slow, that is a different, narrower question. Leave the Windows settings alone for now. Open its [capture statistics](/en/triggers/images/imagecapturetriggers) and compare capture, effects and processing time with the requested rate.

Windows may show these labels in your language.

![Game Mode in Windows settings](https://s3.eyeauras.net/media/wiki/Lineage/GTA5/Discord_tRNKShE2GYG74pgRIecTtoNII.png)

| Setting | Scope of the change |
| --- | --- |
| `Game Mode` | Windows-wide gaming setting. Test it separately from per-app graphics options. |
| `Optimizations for windowed games` | In Windows 11 it can be changed for one game. Restart the game afterwards. |
| Original switch position | Write it down so you can undo a change that did not help. |

In the older screenshot the windowed-games optimization is in **Default graphics settings** and changes for all apps at once.

![Earlier global Default graphics settings page](https://s3.eyeauras.net/media/wiki/Lineage/GTA5/Discord_kvqBHaMReyO1ATkhWLoispdYu.png)
