---
title: How to Find Color
description: Explanation of how to find a color in a specific area using a script in C#.
published: true
date: 2024-02-23T23:03:50.178Z
tags: color, C#, script, coordinates, search, ai-translated
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---
# Locate a coloured block and log its screen position

Draw a red square at least **32×32 pixels** on a light background in your own image editor. Find a matching 8×8 block inside it and log the block's screen rectangle. The script reads captured pixels through **Color Search**, without moving the mouse.

You need working capture/OpenCV and an editable C# Script action. You can [import the original example](https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU); its window and colour still need configuring on your machine.

1. In one folder, create **ColorSearch** with a **Color Search** trigger and a sibling **Script** aura with **C# Script** in **On Enter**.
2. Select your image-editor window and a region containing the square. Keep image zoom at 100% and start without effects.
3. Set the options below, then click **Refresh Once**. The square should be visible in the preview and its colour should meet the threshold.

| Setting | Value and purpose |
| --- | --- |
| Target Color | Use **Pick Color from Preview Pane** on the red area to sample the actual captured colour. |
| Comparison Granularity | **Average Color of 8x8 Pixel Blocks** finds a local block rather than averaging the entire region. |
| Match Threshold | Lower bound 90%, upper bound 100%. Set both bounds if Min mode is enabled. |

4. Put the complete program in the sibling action's **Script.csx** and click **Run**:

```csharp
using System.Linq;
using EyeAuras.OpenCVAuras.Triggers.ColorSearch;

var trigger = AuraTree.GetAuraByPath(@".\ColorSearch")
    .Triggers.Items
    .OfType<IColorSearchTrigger>()
    .First();

var matchResult = await trigger.RefreshAsync(cancellationToken);

if (matchResult.Detected?.Success == null) {
    Log.Warn("Search did not run; check the source and trigger diagnostics");
    return;
}
if (matchResult.Detected.Success != true || matchResult.Detected.Bounds == null) {

    Log.Warn("Colored area not found");
    return;
}


var localRect = matchResult.Detected.Bounds.Value;


var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Colored area found @ {screenRect}");
```

On a match, **Colored area found @** reports a screen rectangle for a block. It need not outline the entire drawn square. Missing processing data prompts a source check; **Colored area not found** means the returned result did not satisfy the condition.

The threshold measures colour similarity under the selected comparison method, not the percentage of red pixels in the window. **Aggregate Average Color of Entire Area** is a different operation: it compares the region's average and returns that whole region on success. See [Color Search](/en/triggers/images/color-search).

| Code contract | Boundary |
| --- | --- |
| GetAuraByPath / First() | Require the configured aura and at least one IColorSearchTrigger. A structure error prevents the search. |
| RefreshAsync(cancellationToken) | Uses the trigger's settings and passes the token into frame/request handling. It is not instant native-operation cancellation. |
| Detected.Bounds → ToScreen | Converts processed-frame bounds using this result's transforms; do not add the window origin again. |

The top-level host provides **AuraTree**, **Log** and the token; pass services explicitly to ordinary helpers. The trigger is borrowed, and this refresh returns detection data without image buffers. A synchronous **Refresh(cancellationToken)** is also available, but blocks the caller.

For other result forms, see [CV results](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
