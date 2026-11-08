---
title: How to Find Color
description: Explanation of how to find a color in a specific area using a script in C#.
published: true
date: 2024-02-23T23:03:50.178Z
tags: color, C#, script, coordinates, search, ai-translated
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---

# Displaying the Coordinates of the Found Color Rectangle

Run in a top-level EyeAuras C# Action beside a ColorSearch aura with a configured Color Search trigger. Set its capture target, ROI, color and similarity range. The operation logs a screen rectangle without moving the mouse.
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU
{.is-info}

1. Create an aura (named ColorSearch in the example) and add the Color Search trigger to it.
2. Specify the search parameters in the trigger, such as where to search and which color to look for.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is correct, the script will print the coordinates of the found area.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ColorSearch")
    .Triggers.Items
    .OfType<IColorSearchTrigger>()
    .First();

var matchResult = trigger.Refresh();

if (matchResult.Detected.Success != true || matchResult.Detected.Bounds == null) {

    Log.Warn("Colored area not found");
    return;
}


var localRect = matchResult.Detected.Bounds.Value;


var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Colored area found @ {screenRect}");
```

> **Important!** Note that in the color search trigger, the setting is to look for a colored rectangle: `Comparison Granularity = Average Color of 8x8 Pixel Blocks`.
> By default, `Color Search` averages the color of the **entire** selected region, which is not what we need.
{.is-warning}

`Detected` contains state and local bounds; ToScreen applies the transforms of that capture. No matching region produces a warning; inspect trigger diagnostics to distinguish capture errors. The threshold comes from this configured trigger. The tree trigger and returned images are borrowed, and synchronous Refresh does not take the Run token.
