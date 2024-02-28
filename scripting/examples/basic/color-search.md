## Finding Color Coordinates

> You can import the ready-made example from here: [Color Search Example](https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU)
{.is-info}

1. Create an aura (named ColorSearch in the example) and add the Color Search trigger to it.
2. Specify the search location, color, etc., in the trigger.
3. Create an aura with a script.
4. Copy and paste the code, run it, and if everything is correct, the script will print the coordinates of the found area.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ColorSearch") // find the aura by name
    .Triggers.Items // iterate through all triggers
    .OfType<IColorSearchTrigger>() // find triggers for "Color Search"
    .First(); // take the first one; an error will occur if not found

var matchResult = trigger.Refresh(); // instruct the trigger to perform the search

if (matchResult.Detected.Success == false) {
    // if not found, nothing more to do
    Log.Warn("Colored area not found");
    return;
}

// found the color, get the local (window) coordinates
var localRect = matchResult.Detected.Bounds.Value;

// convert to screen coordinates
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Colored area found @ {screenRect}");
```

> Important! Note that in the trigger for color search, it is specified to look for a colored rectangle `Comparison Granularity = Average Color of 8x8 Pixel Blocks`. By default, `Color Search` averages the color of the **entire** selected region, which is not what we need.
{.is-warning}