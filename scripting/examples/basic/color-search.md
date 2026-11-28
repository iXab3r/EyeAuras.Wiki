---
title: How to Find Color
description: How to find a color in an area of a window with a C# script.
published: true
date: 2024-02-23T23:03:50.178Z
tags: color, C#, script, coordinates, search, ai-translated
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---
# Locate a coloured block and log its screen position

The script looks for a coloured block in a window and logs its screen coordinates. For the example, draw a red square at least **32×32 pixels** on a light background in your own image editor. The script finds a matching 8×8 block inside it. It reads the window's pixels through the configured **Color Search** and does not move the mouse.

You need working capture/OpenCV and a C# Script action you can edit. You can [import the original example](https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU), but you still have to pick the window and colour on your machine.

1. In one folder, create a **ColorSearch** aura with a **Color Search** trigger, and next to it a **Script** aura with **C# Script** in **On Enter**.
2. Select your image-editor window and a region with the square. Keep image zoom at 100% and add no effects for the first search.
3. Set the options from the table and click **Refresh Once**. The square should be visible in the preview and the result should pass the threshold.

| Setting | Value and purpose |
| --- | --- |
| Target Color | Pick the red with **Pick Color from Preview Pane**. That way the sample comes from what is really captured. |
| Comparison Granularity | **Average Color of 8x8 Pixel Blocks** looks for a single block instead of the average colour of the whole region. |
| Match Threshold | Lower bound 90%, upper bound 100%. If Min mode is enabled, set both bounds. |

4. Paste the whole program into the **Script.csx** of the neighbouring action and click **Run**:

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

If the colour is found, the log shows **Colored area found @** with the screen rectangle of the block. If there is no data to search, the log asks you to check the source. **Colored area not found** means a result came back but did not pass the condition.

The threshold is how similar the colour is to the sample under the selected comparison method. It is not the percentage of red pixels in the window. **Aggregate Average Color of Entire Area** does a different job: it compares the average colour of the region and returns the whole region on success. More in [Color Search](/en/triggers/images/color-search).

| Code | What to know |
| --- | --- |
| GetAuraByPath / First() | The aura must exist and contain at least one IColorSearchTrigger. |
| RefreshAsync(cancellationToken) | Uses the trigger's settings and passes the token into the request. |
| Detected.Bounds → ToScreen | Bounds are in processed-frame coordinates. ToScreen already applies this result's region and effects, so do not add the window origin again. |

The trigger is borrowed. This RefreshAsync returns detection data without image buffers.

Other ways to read results are in [CV results](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
