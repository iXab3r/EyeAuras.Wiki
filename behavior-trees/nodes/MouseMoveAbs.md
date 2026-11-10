---
title: MouseMove Abs
description:
published: true
date: 2025-08-17T08:50:59.377Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:50:59.377Z
---

# Mouse Move — go to a specified point

Use `Mouse Move` to place the pointer at a chosen point. Here, absolute means a destination point rather than a displacement from the current position. The coordinate origin depends on the target and backend. This node does not click.

## Move within your own window

Open your own separate text-editor window. Make it large enough that X=200, Y=150 from the visible frame's top-left corner lies inside it. Use a new node without search links or coordinate bindings for this first example.

1. Put a separate tree in a folder. In `Triggers/Actions/Overlays Defaults`, enable `Target Window` for your editor and, through `show more...`, `Input Simulator → Windows Input`. Do not override that target in the tree's local Settings.
2. Keep `Activation → Is Loaded`, `Execution → When Activated → Do nothing`. Add `Mouse Move` and connect it to the entry.
3. Set `General → Mouse Position → X = 200`, `Y = 150`. Keep randomization and offset at zero. Check the displayed `Window` and `Simulator`: your own window and Windows Input.
4. Click the upper `Tick BT Once` once. The chosen window is activated and the pointer should move to the specified point inside it, without a click. On normal call completion the node returns Success.

The earlier image shows X/Y and the optional groups, now under General:

![Mouse Move coordinates and optional groups](https://s3.eyeauras.net/media/2025/08/EyeAuras_DOrxeVBXrY.png)

| Setting | Purpose |
| --- | --- |
| Mouse Position — X / Y | Destination point; Width / Height also appear for a source region |
| Crosshair button | Pick a point using the screen tool and current window context |
| Window / Simulator | Inherited target and backend; check them before running |
| Input Smoother | Inherited [smoothing](/en/actions/sendinput/mouseinputsmoothing) for supported absolute movement |

With Windows Input, the window's screen `DwmFrameBounds` origin is added to X/Y. This is the visible frame origin, **not the client-area origin**. Without a window the coordinates would be screen coordinates; an empty target is not selection of your own window. In this path, X=0,Y=0 is treated as an empty point and causes no move. Success alone therefore does not prove movement.

Windows Message API sends client-coordinate window messages instead of moving the system pointer in the same way. Do not transfer values between backends or multiply by a guessed DPI factor; see [coordinate systems](/en/features/coordinate-system).

<details>
<summary>Use a found region or another source</summary>

Choose `move to something...` to expose the X/Y/Width/Height region and sources:

| Choice | Position source |
| --- | --- |
| Move to — Variable → Last Found Result | Bind the last found region in this tree's context; the relevant search must run first |
| Move to — Linked Aura → Links | Region supplied by a configured linked aura, such as Image Search |
| Property binding indicator | A custom coordinate or region [binding](/en/features/bindings); earlier UI shows a black square beside the property |
| Unlink / Unbind | Remove a source connection before returning to fixed coordinates |

![Mouse Move region and source choices](https://s3.eyeauras.net/media/2025/08/EyeAuras_ttF92DbAou.png)

For a **Linked Aura** source, first configure and inspect your own [Image Search](/en/triggers/images/image-search) aura. Put [Aura Is Active](/en/behavior-trees/nodes/aura-is-active), linked to that same aura with expected state Active, before Mouse Move in a [Sequence](/en/behavior-trees/nodes/sequence) to require the search condition before moving.

The found region must belong to the intended window and coordinate system. Verify its bounds, capture region and processing scale before adding movement. A link or Last Found Result is not proof of a valid match in this pass; gate movement on the actual search result. Do not add the window origin twice to coordinates already mapped to the screen.

</details>

<details>
<summary>Randomization, anchor and offset</summary>

| Group | Effect |
| --- | --- |
| randomize... → Randomize — X ± / Y ± | Add random scatter to the final point within each axis range; zero disables it |
| add click anchor... → Anchor | Choose a point within the region, such as center, top-left or bottom-right; despite the button name, no click is added |
| add offset to mouse position... → Offset | Add X/Y to the calculated position; region mode also exposes size offsets |

![Random scatter on both axes](https://s3.eyeauras.net/media/2025/08/EyeAuras_fTb1fjQ6Sj.png)

![Choosing the center, edge or corner of a region](https://s3.eyeauras.net/media/2025/08/EyeAuras_7ewg0RoYQh.png)

![Additional position offset](https://s3.eyeauras.net/media/2025/08/EyeAuras_DMjOlNdH2h.png)

The source region, anchor and Offset produce a point, then Randomize is applied. This does not correct DPI or mismatched sources. A successful move can admit a connected child; retained child Running resumes without another move. For displacement from the current position, use [Mouse Move Rel.](/en/behavior-trees/nodes/MouseMoveRel).

</details>
