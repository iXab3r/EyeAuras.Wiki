---
title: How to Find an Image
description: 
published: true
date: 2024-06-23T10:33:55.116Z
tags: image search, coordinates, script, Aura, ai-translated
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---
# Find your marker in a window and log its bounds

The script compares captured pixels with a template and logs the matching rectangle. Your marker must be visible in the chosen window; this does not read another application's internal resources.

Prepare a small PNG with a distinctive marker, save it as `C:\Templates\marker.png`, and display it in your own image editor at **100%**. Keep the whole marker visible. You need the running OpenCV module and a working capture method; no external NuGet package is needed.

1. Create your own **C# Script** action and open **Script.csx**.
2. Paste the complete program below, replacing the absolute PNG path if necessary.
3. Click **Run** and select the window displaying your marker with the on-screen picker.
4. **Event Log** should show `Found relative to the window` and a rectangle, or `No match`. This program does not move or click the mouse.

```csharp
using System.Drawing;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;

cancellationToken.ThrowIfCancellationRequested();
var window = await GetService<IOsdSelectionService>().PickWindow();
if (window == null || !window.IsWindow) { Log.Warn("Window unavailable"); return; }
cancellationToken.ThrowIfCancellationRequested();
{
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var found = cv.ImageSearch(
        @"C:\Templates\marker.png",
        similarityThreshold: new Percentage(90),
        region: Rectangle.Empty);
    Log.Info(found.IsEmpty ? "No match" : $"Found relative to the window: {found}");
}
```

The top-level EyeAuras host supplies **GetService**, **Log** and **cancellationToken**; ordinary C# helpers receive their dependencies explicitly. Escape or right-click cancels window picking. The picker itself does not take the Run token, so cancellation is checked around it.

| Value | Meaning |
| --- | --- |
| ForWindow(window) | Selects that window for on-demand capture, without the cursor, with an empty region and effect chain. The host chooses the capture method. |
| new Percentage(90) | A 90% similarity threshold, not 0.9. It is a template-comparison score, not a probability or percentage of the window's area. |
| Rectangle.Empty as input | Searches the whole captured frame. |
| Rectangle.Empty as output | No match. A file or capture error can instead interrupt the operation. |

The created CV accessor belongs to this use and is disposed inside the explicit block. Simple **ImageSearch** already converts its result to window coordinates; do not apply ToScreen to it again. Frame origin need not equal client-area origin. Borders, DPI and capture method matter; do not change image scale after preparing the template.

## Read a configured Image Search trigger

Use a trigger when the window, template and region are already configured in the tree. You can [import the original example](https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok) or prepare your own:

1. In one folder, create **ImageSearch** with an **Image Search** trigger, and a sibling **Script** aura with a C# Script action.
2. Select your window, use **Load...** to load the same PNG and set **Match Threshold = 90**. Start with the whole region and no effects.
3. Click **Refresh Once** and check that the preview shows your marker. See [Image Search](/en/triggers/images/image-search) for setup.
4. Replace the first program with this complete **Script.csx**, then click **Run**:

```csharp
using EyeAuras.OpenCVAuras.Triggers.ImageSearch;


var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");

var matchResult = await trigger.RefreshAsync(cancellationToken);

if (matchResult.Detected?.Success == null) {
    Log.Warn("Search did not run; check the source and trigger diagnostics");
    return;
}
if (matchResult.Detected.Success != true || matchResult.Detected.Bounds == null) {

    Log.Warn("Image not found");
    return;
}


var localRect = matchResult.Detected.Bounds.Value;


var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```

The log distinguishes a screen rectangle, `Image not found`, and a search that did not produce a result. The configured aura and trigger must exist: `.\ImageSearch` is relative to the script's tree context, not its disk directory.

**RefreshAsync(cancellationToken)** passes cancellation to frame acquisition and request handling; it does not promise instant interruption of native matching. Blocking **Refresh(cancellationToken)** also exists. Aura activation delays are separate from the result of this particular search.

Here **Detected.Bounds** is local to the processed frame. Use that result's **ToScreen** matrices for its region and effects, without manually adding the window position. The tree trigger is borrowed, and this refresh returns detection data without image buffers.

<details>
<summary>Raw results, pixel buffers and a separate reaction</summary>

For detailed accessor results, **ImageSearchRaw** exposes nullable Detected.Bounds and the corresponding capture transforms. Apply ToScreen to those raw local bounds, rather than an already converted simple result. A **ProcessPixels** image is borrowed only during its callback. Retain a **Clone()** with its own Dispose if you need it afterwards.

Searching does not send input. A screen point uses **TargetWindow = null** in the standard input controller; a non-null window adds a window-relative conversion. See [clicking text](/en/scripting/examples/basic/click-on-text) for an explicit controlled target, and the [CV map](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi) for resource and coordinate contracts.

</details>
