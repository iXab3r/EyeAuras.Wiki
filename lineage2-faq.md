---
title: Lineage 2 FAQ
description: 
published: true
date: 2023-12-25T05:17:00.055Z
tags: 
editor: markdown
dateCreated: 2023-12-25T01:52:31.401Z
---

**EyeAuras - Lineage 2 Troubleshooting**

Problems
---

1. Key presses are not working in the game.
2. The camera in the game keeps spinning.
3. SendInput click on wrong position (click to img).

Answers
---

1. **Key Presses Issue:**
   - Download and install [ControlMyJoystick](https://tetherscript.com/controlmyjoystick-home/).
     ![ControlMyJoystick Download](https://cdn.discordapp.com/attachments/1170312651621023755/1188705778043994112/e8a00b2b6ad727f0f4eea.png)
     - Set it in your SendInput - SendSequence.
       ![SendSequence Setup](https://cdn.discordapp.com/attachments/1170312651621023755/1188709376765218836/9e43d528a6ea37fb91b74.png)

2. **Camera Spinning Issue:**
   1. *First Method - Disable in-game Gamepad Controller*
      ![Disable Gamepad Controller](https://cdn.discordapp.com/attachments/1170312651621023755/1188710828187340891/9a26fe68c922168601c58.png)
   2. *Method #2 - Uninstall Game Pad Driver*
      - Go to `C:\Program Files (x86)\ControlMyJoystick 5.5.78.50\Driver\Joystick` and run the file as admin.
        ![Uninstall Game Pad Driver](https://cdn.discordapp.com/attachments/1170312651621023755/1188711201761406986/fefb353adad928f84b570.png)

3. **SendInput Click Issue:**
   - Use Window mode or Window without borderless.
   - **Important:** NEVER use Window Snap (If you drag a window too close to the top or sides of the screen, it might automatically enlarge to fill half or the entire screen).
