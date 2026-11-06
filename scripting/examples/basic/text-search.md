---
title: How to Find Text
description: 
published: true
date: 2024-02-23T23:11:31.331Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-23T23:11:31.331Z
---

# Displaying Recognized Text

Run in a top-level EyeAuras C# Action beside a TextSearch aura. Configure its capture window/screen, ROI and an available OCR engine/language; verify capture and text in the trigger editor first.
> You can import a ready-made example from here: https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v
{.is-info}

1. Create an aura (named TextSearch in the example) and add a Text Search trigger to it.
2. Specify the recognition area, language, etc., in the trigger.
3. Create an aura with a script.
4. Copy and paste the script, run it, and if everything is fine, the script will print the recognized text.

```csharp
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using System.Linq;

var trigger = AuraTree.FindAuraByPath(@".\TextSearch")
    .Triggers.Items
    .OfType<ITextSearchTrigger>()
    .First();

var matchResult = trigger.Refresh();
var text = matchResult.Detected.Text;
if (string.IsNullOrWhiteSpace(text))
{
    Log.Warn("Text was not recognized; check capture and OCR settings");
    return;
}
Log.Info($"Text: {text}");
```

The Event Log receives recognized text or a warning. Detected.Text is OCR output; Detected.Success also depends on the trigger search conditions. Refresh is synchronous and takes no Run token. Do not dispose the borrowed tree trigger. Enable segments for [clicking recognized text](/en/scripting/examples/basic/click-on-text).
