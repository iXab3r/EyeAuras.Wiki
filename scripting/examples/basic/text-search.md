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

**Text Search** recognizes text in a picture of the window, and the script writes it to the log. For this example, type **Build ready** in your text editor in a large dark font on a light background.

You need working capture/OpenCV and an installed OCR engine for English. First check that the option you need is listed in **OCR Symbols**. You can [import the original example](https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v).

1. In one folder, create a **TextSearch** aura with a **Text Search** trigger and, next to it, a **Script** aura with a C# Script action.
2. In the trigger, select your window and a small region around the line. Do not add effects yet.
3. Configure OCR and click **Refresh Once**. **Recognized text** should show your line. If it does not, fix capture, language or readability first.

| Setting | For this example |
| --- | --- |
| OCR Symbols | **Tesseract (eng)** if it is installed and listed. Otherwise the English OCR engine available on your installation. |
| Scale factor | **1** for large readable text. Increasing it changes the image that OCR gets. |
| Invert image / Binary threshold | Off at first. When you turn them on, check the recognized text after each change. |
| Include text segments | Not needed for the full line. Segment boxes are used in the [click example](/en/scripting/examples/basic/click-on-text). |

4. Paste the whole code into the neighbouring action's **Script.csx** and click **Run**:

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

**Event Log** shows `Text: Build ready`. OCR may add spaces and line breaks. A warning means no text came back. In that case check the capture diagnostics.

**Detected.Text** is the recognition result. **Detected.Success** also depends on the trigger's [text-matching condition](/en/features/text-match-expressions), so a line can be recognized even when the condition did not match.

| Part | What to know |
| --- | --- |
| AuraTree / Log / cancellationToken | Come from the top-level C# Script. Ordinary classes get their services passed in. |
| GetAuraByPath / First() | The aura and the trigger must already exist. |
| RefreshAsync(cancellationToken) | Passes the token to capture and request handling. Native OCR may not stop right away after Stop. |
| Refresh(cancellationToken) | The blocking version of the same call. |

You do not need to dispose a trigger taken from the tree. The refresh result comes without image buffers. All settings are in [Text Search](/en/triggers/images/text-search), the API description is in [CV images](/en/scripting/api/computer-vision/images).
