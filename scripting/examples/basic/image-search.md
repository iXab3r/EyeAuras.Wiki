---
title: How to Find an Image
description: Guide on how to locate an image
published: true
date: 2024-02-23T23:07:10.725Z
tags: image, search, coordinates, script
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---

## Displaying the Coordinates of the Found Image
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok
{.is-info}

1. Create an aura (named ImageSearch in the example) and add an Image Search trigger to it.
2. Specify what to search for in the trigger settings.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is correct, the script will print the coordinates.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ImageSearch") // finding the aura by name
    .Triggers.Items // iterating through all triggers
    .OfType<IImageSearchTrigger>() // finding triggers of type "Image Search"
    .First(); // selecting the first one; an error will occur if none is found

var matchResult = trigger.Refresh(); // instructing the trigger to perform the search

if (matchResult.Detected.Success == false) {
    // if not found, nothing more to do
    Log.Warn("Image not found");
    return;
}

// found the image, obtaining local (window) coordinates
var localRect = matchResult.Detected.Bounds.Value;

// converting to screen coordinates
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```