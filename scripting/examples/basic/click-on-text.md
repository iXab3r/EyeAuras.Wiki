---
title: Clicking on the Recognized Word
description: 
published: true
date: 2024-09-11T21:04:35.270Z
tags: text search, OCR, scripting, mouse input
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---
## Clicking on the Recognized Word

1. Create an aura and add a Text Search trigger to it.
2. Specify the capture zone in the trigger. Important! Don't forget to enable the `Include Text Segments` option - it's disabled by default for performance reasons.
3. Create an aura with a script.
4. Copy and paste the following code, adjusting the word search parameters as needed:

```csharp
var sendInput = GetService<ISendInputUnstableScriptingApi>();

var ocr = AuraTree.GetTriggerByPath<ITextSearchTrigger>("./Test");

if (!ocr.IncludeTextSegments){
    throw new ArgumentException($"It seems that {nameof(ocr.IncludeTextSegments)} is disabled in TextSearch {ocr}, segments data is not available");
}

var data = ocr.Refresh();
Log.Info($"OCR chars: {data.Detected.Segments.DumpToTable()}");

var textToClickOn = 
    data.Detected
    .Segments
    .Where(x => x.Text == "HVDK") //or any other logic
    .FirstOrDefault();
if (textToClickOn == default){
    throw new ArgumentException("Failed to find text segment matching your conditions");
}

var textLocationOnScreen = data.ToScreen(textToClickOn.Region);
Log.Info($"Text: {textToClickOn.Text}, rel: {textToClickOn.Region}, screen: {textLocationOnScreen}");

sendInput.MouseMoveTo(textLocationOnScreen.Center());
sendInput.MouseClick();
```