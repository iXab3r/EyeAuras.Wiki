---
title: How to Find an Image
description: 
published: true
date: 2024-06-23T10:33:55.116Z
tags: image search, coordinates, script, Aura
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---
## Displaying the coordinates of the found image
> You can import a ready-made example from here: [https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok](https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok)
{.is-info}

1. Create an aura (named ImageSearch in the example) and add an Image Search trigger to it.
2. Specify what to search for and where in the trigger settings.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is fine, the script will print the coordinates.

```csharp
// Find the aura by name and then find the "Image Search" trigger inside it
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");

var matchResult = trigger.Refresh(); // Trigger the search

if (matchResult.Detected.Success == false) {
    // If not found, there's nothing more to do
    Log.Warn("Image not found");
    return;
}

// Found the color, get the local (window) coordinates
var localRect = matchResult.Detected.Bounds.Value;

// Convert to screen coordinates
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```