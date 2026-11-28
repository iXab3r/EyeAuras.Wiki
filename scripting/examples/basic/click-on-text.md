---
title: Clicking on the Recognized Word
description: 
published: true
date: 2024-09-11T21:04:35.270Z
tags: text search, OCR, scripting, mouse input, ai-translated
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---
# Find a word, check its bounds and click once

The script finds a word on the screen and logs its box. When you allow it, it clicks that word once. For a first attempt, show just **READY** in your own test window that does not change and has no submit buttons or other important controls. You need working OCR/OpenCV and **Windows Input**.

1. Create an aura named **Test** with a Text Search trigger, and next to it an aura with a C# Script action.
2. In the trigger, select your test window, narrow the region to the word and check **Recognized text** with **Refresh Once**.

| Setting | For this example |
| --- | --- |
| OCR Symbols | An available English engine. |
| Include text segments | Enabled: the script needs individual boxes. |
| Scale factor | **1**. Leave the effects empty for the first attempt. |
| click in the program | Start with **false**: the result is only logged. |

3. Paste the whole program into top-level **Script.csx**. Click **Run** and select **the same test window** as in the trigger:

```csharp
using System.Linq;
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;

var click = false;
var target = await GetService<IOsdSelectionService>().PickWindow();
if (target == null || !target.IsWindow) { Log.Warn("Window unavailable"); return; }
var ocr = AuraTree.GetTriggerByPath<ITextSearchTrigger>("./Test");
var data = await ocr.RefreshAsync(cancellationToken);
if (data.Detected == null || data.Detected.Segments.IsDefaultOrEmpty)
{ Log.Warn("No OCR segments"); return; }

var matches = data.Detected.Segments.Where(x => x.Text == "READY").ToArray();
if (matches.Length != 1) { Log.Info("Exactly one READY segment is required"); return; }
var box = data.ToScreen(matches[0].Region);
var frame = target.DwmFrameBounds;
if (box.IsEmpty || !frame.Contains(box)) { Log.Warn("Bounds are outside the selected window"); return; }
Log.Info($"Window: {target.Title}; text: {matches[0].Text}; screen bounds: {box}");
if (!click) return;

cancellationToken.ThrowIfCancellationRequested();
var input = GetService<ISendInputScriptingApi>();
input.InputSimulatorId = "Windows Input";
var previousTarget = input.TargetWindow;
try
{
    input.TargetWindow = target;
    var point = box.Center();
    input.MouseMoveTo(point.X - frame.X, point.Y - frame.Y);
    input.MouseClick();
}
finally { input.TargetWindow = previousTarget; }
```

4. While **click = false**, check the window, text and box in the log against your word. If OCR split the word into several segments, fix the language or region first.
5. Do not move the window. Set **click = true** and run again, selecting the same window. The cursor moves to the centre of the detected box and makes one left click. Set the flag back to false afterwards.

If you need to sort out recognition first, start with the [Text Search guide](/en/triggers/images/text-search) and the [log-only text example](/en/scripting/examples/basic/text-search).

Coordinates are converted once at each step: local **Region → ToScreen → subtract DwmFrameBounds origin**, because the input is aimed at the window. The standard controller activates the selected window and adds that origin back. Do not move the window or change the zoom during the test. If the OCR ScaleFactor is not 1, convert the segment box once more before ToScreen.

The trigger and services are borrowed. The previous input target is restored in **finally**. The token goes into the OCR request and is checked before input, but a synchronous click that has already started is not cancelled right away. Escape or a right-click cancels window selection.

<details>
<summary>Inspect individual OCR segments</summary>

Right after the data.Detected check you can add `Log.Info(data.Detected.Segments.DumpToTable());`. What ends up in Segments depends on the engine: they are not always words. String comparison is case- and whitespace-sensitive.

More on the API: [capture and coordinates](/en/scripting/api/computer-vision/images), [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi) and [input](/en/scripting/api/ISendInputScriptingApi).

</details>
