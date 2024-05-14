---
title: Image / Text / Color / AI Search
description: 
published: true
date: 2024-05-14T11:17:19.122Z
tags: 
editor: markdown
dateCreated: 2022-12-20T17:43:40.363Z
---

This group of triggers is all about capturing image of an app/screen and further analysis. 

### Configuration

-   **Mouse Cursor** \- for some Capture methods this option allows you either to include mouse cursor onto capture image or not
-   **Settings => Max Capture FPS** \- This is not part of each-and-every trigger configuration, but a shared option in application Settings, which hard-caps Max FPS
-   **Max FPS** - specifies desired number of frames per second which EyeAuras will try to capture and analyse. More FPS => more performance-hungry your trigger is. In many cases real FPS shown in the program will be less than Target because actual processing takes quite a lot of time.
-   **Min FPS** -  changes trigger behavior when real FPS is less than expected, this can happen when there are not enough resources to reach selected FPS and/or calculations are just too complicated, as they are, for example, in Text Search. Basically MinFPS adds time-to-live to each individual frame and, when frame is considered obsolete, switches trigger to Unknown state, which will trigger OnExits (if trigger was **Active**) of all linked auras. 
    -   E.g. MaxFPS (aka Target FPS) = 30 **(FrameTime is 1000/ 30 = 33ms)**, real FPS 30 - ok, system is able to handle the load, nothing to worry about
    -   MaxFPS = 30 **(33ms)**, real FPS = 10 **(100ms)** - not ok, this means that there are not enough system resources to reach desired FPS. You may want to apply some image effects or lower image size/resolution to reach desired FPS
    -   MinFPS = 15 **(66ms)**, MaxFPS = 30 **(33ms)**, real FPS = 30 - ok, works absolutely the same as with MinFPS = 0, as in this case real fps is much higher than MinFPS
    -   MinFPS = 15 **(66ms)**, MaxFPS = 30 **(33ms)**, real FPS = 10 **(100ms)**, - in this case trigger will detect, that processing/capture of each individual frame takes too much time and will switch to Unknown state occasionally. More specifically, after **66ms** passes, trigger will switch to Unknown state for **34ms.** Exact time will differ from frame to frame, for example, if calculations for specific frame took **200ms** (which leads us to 5 FPS), trigger will switch to Unknown after 66ms and will stay that way for **134ms** until it gets calculations result, which will switch it back to either **Active** or **Inactive** state

### Capture methods

All-in-all, two best methods are Windows Graphics and Shared Surface. These are the fastest and will work well in most cases.

-   **Windows Graphics** - this method uses official Windows API and is not available on OS versions lower than **10.0.19041.0**
-   **Shared Surface** - GPU-based capture method which works directly with GPU RAM
-   **Desktop Duplication** - GPU-based capture method which works directly with GPU RAM
-   **Print Window** - uses quite old but stable Windows API to capture images. This method is not able to capture some windows, e.g. browsers and is considered Legacy
-   **Copy Device Context** \- uses legacy Windows API to capture window context
-   **Copy From Screen** - uses legacy Windows API to copy full screen and is extremely resource inefficient

###### Capture methods sorted by performance (1st place is the fastest)

Windows Graphics ~= Shared Surface > Desktop Duplication > Print Window > Copy Device Context

###### **Capture methods sorted by memory consumptions (1st place uses least amount of memory):**

Print Window > Windows Graphics > Shared Surface > Copy Device Context > Desktop Duplication > Copy From Screen