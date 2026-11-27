---
title: How to Find Text
description: 
published: true
date: 2024-02-23T23:11:31.331Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-23T23:11:31.331Z
---
# Read a line from your own window

Display **Build ready** in a large dark font on a light background in your text editor. Text Search recognizes the window image, and the script logs the recognized text. This is OCR of visible pixels, not access to the document or application internals.

You need working capture/OpenCV and an installed OCR engine for English. Check **OCR Symbols** first: naming an engine in an example does not install its language files. You can [import the original example](https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v).

1. In one folder, create **TextSearch** with a **Text Search** trigger, and a sibling **Script** aura with a C# Script action.
2. Select your own window and a small region around the line. Start without effects.
3. Configure OCR and click **Refresh Once**. **Recognized text** should contain your line. If it does not, adjust capture, language or readability before adding the script.

| Setting | For this example |
| --- | --- |
| OCR Symbols | **Tesseract (eng)** if installed and listed, or an available English engine on your installation. |
| Scale factor | **1** for large readable text. Increasing it changes the image sent to OCR. |
| Invert image / Binary threshold | Start disabled; check recognized text after each change. |
| Include text segments | Not required for the full string. Segment boxes are used in [clicking text](/en/scripting/examples/basic/click-on-text). |

4. Replace the sibling action's **Script.csx** with this complete program and click **Run**:

```csharp
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using System.Linq;

var trigger = AuraTree.GetAuraByPath(@".\TextSearch")
    .Triggers.Items
    .OfType<ITextSearchTrigger>()
    .First();

var matchResult = await trigger.RefreshAsync(cancellationToken);
if (matchResult.Detected == null)
{ Log.Warn("OCR did not run; check capture diagnostics"); return; }
var text = matchResult.Detected.Text;
if (string.IsNullOrWhiteSpace(text))
{
    Log.Warn("Text was not recognized; check capture and OCR settings");
    return;
}
Log.Info($"Text: {text}");
```

**Event Log** should show `Text: Build ready`, possibly with OCR-added whitespace or line breaks. A warning means nonempty text was not obtained. Inspect diagnostics: empty output alone does not prove the text was absent.

**Detected.Text** is recognition output. **Detected.Success** also depends on the trigger's [text-matching condition](/en/features/text-match-expressions): text can be recognized without matching that condition. This example logs the string instead of reacting to the aura's state.

| Part | Contract |
| --- | --- |
| AuraTree / Log / cancellationToken | Supplied by top-level C# Script; ordinary classes receive dependencies explicitly. |
| GetAuraByPath / First() | Require the prepared aura and trigger. |
| RefreshAsync(cancellationToken) | Passes cancellation to capture/request handling. Native OCR need not stop instantly. |
| Refresh(cancellationToken) | Blocking alternative to the awaited call. |

The tree trigger is borrowed; this refresh returns detection data without image buffers. See [Text Search](/en/triggers/images/text-search) for the UI setup and [CV contracts](/en/scripting/api/computer-vision/images) for capture details.
