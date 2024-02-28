## Finding Text

> You can import the ready-made example from here: [Text Search Example](https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v)
{.is-info}

1. Create an aura (named TextSearch in the example) and add the Text Search trigger to it.
2. Specify the recognition area, language, etc., in the trigger.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is correct, the script will print the recognized text.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\TextSearch") // find the aura by name
    .Triggers.Items // iterate through all triggers
    .OfType<ITextSearchTrigger>() // find triggers for "Text Search"
    .First(); // take the first one; an error will occur if not found

var matchResult = trigger.Refresh(); // instruct the trigger to perform the search
Log.Info($"Text: {matchResult.Detected.Text}");
```