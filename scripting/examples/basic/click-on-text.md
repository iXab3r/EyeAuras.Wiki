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

For a first attempt, display just **READY** in your own stable test window, away from submit buttons or other consequential controls. The script logs the detected box first. After you inspect it, you can permit one click. You need working OCR/OpenCV and **Windows Input**.

1. Create **Test** with a Text Search trigger and a sibling aura with a C# Script action.
2. In the trigger, select your test window, restrict the region to the word, and verify **Recognized text** with **Refresh Once**.

| Setting | For this example |
| --- | --- |
| OCR Symbols | An available English engine. |
| Include text segments | Enabled: individual boxes are required. |
| Scale factor | **1**, with no effects for this first attempt. |
| click in the program | Start at **false** for log-only inspection. |

3. Paste the complete program into top-level **Script.csx**. Click **Run** and select **the same test window** configured in the trigger:

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

4. With **click = false**, check the logged window, text and screen box against your visible word. If OCR splits it into several segments, adjust the language or region first.
5. Keep the window in place, set **click = true**, and run again, selecting that same window. The cursor should move to the detected box's centre and make one left click. Return the flag to false afterwards.

The conversion is explicit at each stage: local **Region → ToScreen → subtract DwmFrameBounds origin** for targeted input. The standard controller activates the selected window and adds that origin back. These are not client coordinates or a background click. Keep the window, zoom and display scale stable. OCR ScaleFactor other than 1 requires an additional segment-box conversion before ToScreen.

The trigger and services are borrowed. The previous input target is restored in **finally**. The token reaches the OCR request and is checked before input; an already started synchronous click is not instantly cancelled. Escape or right-click cancels window selection. The top-level host supplies AuraTree/GetService/Log/token; helpers need explicit dependencies.

<details>
<summary>Inspect individual OCR segments</summary>

After checking data.Detected, add `Log.Info(data.Detected.Segments.DumpToTable());` to inspect the raw segments, preserving this program's **PoeShared.Scaffolding** import. Segments depend on the engine and need not be words. Exact string comparison is case- and whitespace-sensitive; replace READY with your own unique target if needed. Disabled Include text segments is a setup issue, not proof that no matching word exists.

OCR Score is an engine estimate, not an area percentage or a correctness guarantee. See [capture and coordinates](/en/scripting/api/computer-vision/images), [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi) and [input](/en/scripting/api/ISendInputScriptingApi) for the separate contracts.

</details>
