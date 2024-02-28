---
title: How to Find Color
description: Explanation of how to find a color in a specific area using a script in C#.
published: true
date: 2024-02-23T23:03:50.178Z
tags: color, C#, script, coordinates, search
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---

## Displaying the Coordinates of the Found Color Rectangle
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU
{.is-info}

1. Create an aura (named ColorSearch in the example) and add the Color Search trigger to it.
2. Specify the search parameters in the trigger, such as where to search and which color to look for.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is correct, the script will print the coordinates of the found area.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ColorSearch") // find the aura by name
    .Triggers.Items // iterate through all triggers
    .OfType<IColorSearchTrigger>() // find triggers of type "Color Search"
    .First(); // take the first one; an error will occur if not found

var matchResult = trigger.Refresh(); // force the trigger to perform the search

if (matchResult.Detected.Success == false) {
    // if not found, there is nothing more to do
    Log.Warn("Colored area not found");
    return;
}

// found the color, get the local (window) coordinates
var localRect = matchResult.Detected.Bounds.Value;

// convert to screen coordinates
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Colored area found @ {screenRect}");
```

> **Important!** Note that in the color search trigger, the setting is to look for a colored rectangle: `Comparison Granularity = Average Color of 8x8 Pixel Blocks`.
> By default, `Color Search` averages the color of the **entire** selected region, which is not what we need.
{.is-warning}