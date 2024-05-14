---
title: Volume Level
description: 
published: true
date: 2024-05-14T11:17:58.384Z
tags: 
editor: markdown
dateCreated: 2023-03-21T23:23:51.953Z
---

### FAQ

-   **How it works?**
    -   It allows you to select specific audio device (input/output), captures audio and measures Min/Max/Average value of played audio samples. In most cases analysis in done in 50ms "frames". If peak value in some frame is high enough ( ≥ **Min Level**) then the trigger is switched on. As soon as peak level decreases it automatically switches off.
-   **Is it able to detect a specific sound like click, footsteps or alarm?**
    -   No, this requires some fancy algorithms which I do not have time to research/implement atm. Maybe at some point in the future if demand will be high enough.

UI is a subject to change, alpha version looks like this:

![](https://i.imgur.com/EIBI5kg.png)