---
title: MouseMove Abs
description:
published: true
date: 2025-08-17T08:50:59.377Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:50:59.377Z
---

**MouseMove Abs** moves the mouse cursor to a specified point on the screen. In EyeAuras it's often used to automate clicks, interact with the interface or move the mouse to a desired element.

![MouseMove Abs](https://s3.eyeauras.net/media/2025/08/EyeAuras_DOrxeVBXrY.png)

# Main parameters
**Mouse Position** – coordinates where the cursor should move. You can set fixed X and Y values.

## Move to something section
This section allows moving the mouse not only to absolute coordinates but also to a search result (icon, text, last found object), an area (Width/Height), or to results of another aura (for example, `ImageSearch`).
- **Move to Variable:** use pre‑saved or calculated coordinates (for example, a search result on the screen).
- **Move to Linked Aura:** move the cursor to a specially linked aura.

You can also use the [Bindings](/features/bindings) mechanism—click the black square to the right of the coordinates to open the editor.

![MouseMove Abs - Move to someting section](https://s3.eyeauras.net/media/2025/08/EyeAuras_ttF92DbAou.png)

## Randomize section
Adds random offset to X and Y so mouse movements look more natural and not always identical. Specify the scatter range for both axes and the cursor will land slightly differently around the point each run.

![MouseMove Abs - Randomize section](https://s3.eyeauras.net/media/2025/08/EyeAuras_fTb1fjQ6Sj.png)

## Add click anchor section
Lets you choose an "anchor" within a rectangular area—where exactly relative to the found object the cursor should move. For example:
- Center
- Top-left
- Bottom-right
This is convenient when the area is large but you need to hit a specific spot inside it (center, corner, edge, etc.).

![MouseMove Abs - Click Anchor section](https://s3.eyeauras.net/media/2025/08/EyeAuras_7ewg0RoYQh.png)

## Add offset to mouse position section

Adds an additional offset to the final coordinates:
- **Offset X, Y:** shift the cursor relative to the already calculated position—useful for more precise or sequential mouse moves.

![MouseMove Abs - Offset section](https://s3.eyeauras.net/media/2025/08/EyeAuras_DMjOlNdH2h.png)
