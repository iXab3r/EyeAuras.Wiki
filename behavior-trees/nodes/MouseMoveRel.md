---
title: MouseMove Rel
description:
published: true
date: 2025-08-17T08:52:43.668Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:52:43.668Z
---

# Mouse Move Rel. — move by an offset

Use `Mouse Move Rel.` for a displacement, not a destination point. Repeating this node adds another displacement. Absolute [Mouse Move](/en/behavior-trees/nodes/MouseMoveAbs) sets a destination anew on each call.

## Set a start point, then move right

Prepare your own separate text-editor window with enough room inside it. Put a test tree in a folder whose `Triggers/Actions/Overlays Defaults` has `Target Window` set to that window and, through `show more...`, `Input Simulator → Windows Input`. Check that the tree's Settings do not override them.

1. Keep `Activation → Is Loaded`, `Execution → When Activated → Do nothing`. Add `Sequence`, `Mouse Move` and `Mouse Move Rel.`, with Sequence's children connected left to right.
2. Set Mouse Move's `General → Mouse Position → X = 200`, `Y = 150`. That point from the visible frame must lie inside your window. Set Mouse Move Rel.'s `General → Offset → X = 40`, `Y = 0`. Leave Randomize at zero on both.
3. Check `Window` and `Simulator` on both nodes: the same own window and Windows Input. Add no key or mouse-button node.

```text
My Tree
└─ Sequence
   ├─ Mouse Move: X=200, Y=150
   └─ Mouse Move Rel.: X=40, Y=0
```

4. Click the upper `Tick BT Once` once. The window is activated; the pointer first receives the destination, then a rightward displacement, with no click. [Event Viewer](/en/features/event-viewer) distinguishes requested moves `To` and `By`; Sequence returns Success after normal call completion. The visible pointer movement remains the practical result to check.

Repeating this whole tree starts again at the absolute point. Repeating only the relative node keeps shifting the pointer. Actual travel depends on the backend and system mouse settings; X=40 is not a universal guarantee of exactly 40 physical pixels.

![Mouse Move Rel. X/Y offsets](https://s3.eyeauras.net/media/2025/08/EyeAuras_pkO20KJVhg.png)

| Setting | Effect |
| --- | --- |
| Offset — X | Horizontal displacement: positive right, negative left |
| Offset — Y | Vertical displacement: positive down, negative up |
| randomize... → Randomize — X ± / Y ± | Add scatter to the displacement; zero gives a fixed command |
| Window / Simulator | Inherited target/backend; Windows Input changes the system pointer position |

![Random scatter for relative movement](https://s3.eyeauras.net/media/2025/08/EyeAuras_fTb1fjQ6Sj.png)

With Windows Message API, relative movement starts at the last position sent to **that window through that backend**, not the system pointer. Send an absolute move through the same backend/window first. The target must support the resulting window message; choosing a window does not guarantee universal background input.

This node has no smoothing selector and does not forward the absolute node's smoother choice. Use absolute Mouse Move for a configurable trajectory. On Success it can execute a child and return that result; retained child Running resumes without another displacement. The template is shared by BT and Macro, whose surrounding control-flow rules still differ.
