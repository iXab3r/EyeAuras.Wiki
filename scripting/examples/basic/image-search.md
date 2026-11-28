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

The script looks for a picture by a template and logs its rectangle. It compares captured pixels, so the template must be visible in the chosen window.

For the example, make a small PNG with a distinctive marker, save it as `C:\Templates\marker.png` and open it in your image editor at **100%**. The whole marker must fit in the window. You need the running OpenCV module and a working capture method. No external NuGet packages are needed.

1. Create your own **C# Script** action and open **Script.csx**.
2. Paste the program below. If the file is somewhere else, replace the absolute path.
3. Click **Run** and select the window with your marker in the on-screen picker.
4. **Event Log** shows `Found relative to the window` with a rectangle, or `No match`.

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

The top-level EyeAuras host gives you **GetService**, **Log** and **cancellationToken**. An ordinary C# class needs its services passed in explicitly. Escape or a right-click cancels window picking. The picker itself does not take the Run token.

| Value | Meaning |
| --- | --- |
| ForWindow(window) | The source is the selected window. Capture is on demand, without the cursor, with an empty region and an empty effect chain. The program chooses the capture method. |
| new Percentage(90) | A 90% similarity threshold, not 0.9. |
| Rectangle.Empty as input | Search the whole captured frame. |
| Rectangle.Empty as output | No match. A PNG read error or capture error can interrupt the call instead, and that is a different outcome. |

The CV accessor belongs to this use and is disposed inside the explicit block. Simple **ImageSearch** already returns window coordinates, so do not apply ToScreen to them. The frame origin may differ from the client-area origin: borders, DPI and the capture method all matter. Do not change the image scale after you prepare the template.

## Read a configured Image Search trigger

If the window, template and region are already set up in an aura, use its trigger. You can [import the original example](https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok) or prepare your own:

1. In one folder, create an **ImageSearch** aura with an **Image Search** trigger, and next to it a **Script** aura with a C# Script action.
2. Select your window, load the same PNG with **Load...** and set **Match Threshold = 90**. For the first search keep the whole region and no effects.
3. Click **Refresh Once** and check that the preview shows your marker. Full setup is in [Image Search](/en/triggers/images/image-search).
4. Replace the first program with this **Script.csx**, then click **Run**:

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

The log shows a screen rectangle, `Image not found`, or a separate message that the search did not run.

**RefreshAsync(cancellationToken)** passes cancellation to frame acquisition and request handling. There is also a synchronous **Refresh(cancellationToken)**, but it blocks the calling thread.

Here **Detected.Bounds** is in processed-frame coordinates. That result's **ToScreen** converts it with its own matrices for the region and effects, so do not add the window position by hand. The trigger comes from the tree and must not be disposed. This refresh returns detection data without image buffers.

<details>
<summary>Raw results, pixel buffers and a separate reaction</summary>

**ImageSearchRaw** gives the detailed result of a separate CV accessor. Check the nullable Detected.Bounds and convert the local bounds with the matrices of that same result. A **ProcessPixels** frame is available only during its callback. To keep a copy you need **Clone()** and a separate Dispose.

Searching does not send input. For a screen point the standard input controller needs **TargetWindow = null**. If you set a window, coordinates are converted relative to its frame. For an example that picks the target explicitly, see [clicking text](/en/scripting/examples/basic/click-on-text). Coordinates and resources are covered in the [CV map](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).

</details>
