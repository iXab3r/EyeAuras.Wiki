## Finding Image Coordinates

> You can import the ready-made example from here: [Image Search Example](https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok)
{.is-info}

1. Create an aura (named ImageSearch in the example) and add the Image Search trigger to it.
2. Specify what to search for, where, etc., in the trigger.
3. Create an aura with a script.
4. Copy and paste the code, run it, and if everything is correct, the script will print the coordinates.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ImageSearch") // find the aura by name
    .Triggers.Items // iterate through all triggers
    .OfType<IImageSearchTrigger>() // find triggers for "Image Search"
    .First(); // take the first one; an error will occur if not found

var matchResult = trigger.Refresh(); // instruct the trigger to perform the search

if (matchResult.Detected.Success == false) {
    // if not found, nothing more to do
    Log.Warn("Image not found");
    return;
}

// found the image, get the local (window) coordinates
var localRect = matchResult.Detected.Bounds.Value;

// convert to screen coordinates
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```