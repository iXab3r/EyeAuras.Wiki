---
title: How to Find an Image
description: 
published: true
date: 2024-06-23T10:33:55.116Z
tags: image search, coordinates, script, Aura, ai-translated
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---
# Find an image and report its coordinates

## Report the detected image coordinates

> Import the existing example from https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok
{.is-info}

## Search directly from a script

A one-off search does not require an aura trigger. In a running EyeAuras instance
with the OpenCV module, select a window and supply your own absolute PNG path.
This example uses standard `ForWindow`, the whole frame without an ROI, and an
explicit similarity threshold. See [capture and OCR](/en/scripting/api/computer-vision/images)
for accessor settings and source coordinates.

```csharp
using System.Drawing;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;

var window = await GetService<IOsdSelectionService>().PickWindow();
{
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var found = cv.ImageSearch(
        @"C:\Templates\marker.png",
        similarityThreshold: new Percentage(90),
        region: Rectangle.Empty);
    Log.Info(found.IsEmpty ? "No match" : $"Found relative to the window: {found}");
}
```

`Percentage(90)` means 90 percent, not `0.9`. An input `Rectangle.Empty` selects
the whole region; as a result, it means no match. The simple window-accessor
result is already converted to window coordinates. Do not apply raw `ToScreen`
to it again. For matrices, use `ImageSearchRaw`, check nullable `Detected.Bounds`,
and apply `ToScreen` to that raw result's local rectangle. File or capture errors
are not equivalent to a search with no match.

## Use a configured aura trigger

1. Create an aura named `ImageSearch` and add an **Image Search** trigger.
2. Select the window or screen, template and search region. Set the similarity
   threshold explicitly, for example to 90 percent. `Refresh()` uses this trigger's settings.
3. In the same folder, create an aura with a **C# Script** action and paste the
   code into its top-level file. `.\ImageSearch` resolves relative to the script
   context; the target aura must contain an `IImageSearchTrigger`.
4. Run the script to print the coordinates.

```csharp
using EyeAuras.OpenCVAuras.Triggers.ImageSearch;

var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");
var matchResult = trigger.Refresh();

if (!matchResult.Detected.Success || matchResult.Detected.Bounds == null) {
    Log.Warn("Image not found");
    return;
}

// Bounds belongs to the processed frame, including its ROI and scaling.
var localRect = matchResult.Detected.Bounds.Value;
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```

`Refresh()` captures and searches synchronously using the trigger's settings.
`Event Log` shows a screen rectangle or `Image not found`; inspect the trigger's
errors if capture does not work. The script does not own the trigger or its capture result.

To click the match, convert through `ToScreen` and pass the screen point to
`ISendInputScriptingApi` with `TargetWindow = null`. A non-null `TargetWindow`
in the standard controller enables activation and coordinate conversion; do not
convert a screen point twice. See [text search and clicking](/en/scripting/examples/basic/click-on-text)
and the [CV map](/en/scripting/api/computer-vision/images).
