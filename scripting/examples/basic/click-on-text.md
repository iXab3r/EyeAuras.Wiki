---
title: Clicking on the Recognized Word
description: 
published: true
date: 2024-09-11T21:04:35.270Z
tags: text search, OCR, scripting, mouse input, ai-translated
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---
# Clicking on the Recognized Word

Run in an EyeAuras C# Action beside a Test aura containing configured Text Search. Replace HVDK with the exact segment text. Choose capture target, ROI and OCR engine. This sends real mouse input through the selected simulator.

1. Create an aura and add a Text Search trigger to it.
2. Specify the capture zone in the trigger. Important! Don't forget to enable the `Include Text Segments` option - it's disabled by default for performance reasons.
3. Create an aura with a script.
4. Copy and paste the following code, adjusting the word search parameters as needed:

```csharp
var sendInput = GetService<ISendInputScriptingApi>();
sendInput.TargetWindow = null;

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
    Log.Info("No matching text segment found");
    return;
}

var textLocationOnScreen = data.ToScreen(textToClickOn.Region);
Log.Info($"Text: {textToClickOn.Text}, rel: {textToClickOn.Region}, screen: {textLocationOnScreen}");

sendInput.MouseMoveTo(textLocationOnScreen.Center());
sendInput.MouseClick();
```

A match logs the local and screen rectangles, moves the cursor to the center and clicks. Segments are not necessarily words; the comparison is case- and whitespace-sensitive. Disabled Include Text Segments is a configuration issue, distinct from no match. ToScreen uses this capture’s transforms. The tree trigger and result images are borrowed. Refresh and input are synchronous; Stop does not interrupt an operation already in progress.
