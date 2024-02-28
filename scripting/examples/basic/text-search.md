---
title: How to Find Text
description: 
published: true
date: 2024-02-23T23:11:31.331Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:11:31.331Z
---

## Displaying Recognized Text
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v
{.is-info}

1. Create an aura (named TextSearch in the example) and add a Text Search trigger to it.
2. Specify the recognition area, language, etc., in the trigger.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is fine, the script will print the recognized text.

```csharp
var trigger = AuraTree.FindAuraByPath(@".\TextSearch") // find the aura by name
    .Triggers.Items // iterate through all triggers
    .OfType<ITextSearchTrigger>() // find triggers of type "Text Search"
    .First(); // take the first one; an error will occur if not found

var matchResult = trigger.Refresh(); // force the trigger to perform the search
Log.Info($"Text: {matchResult.Detected.Text}");
```