---
title: Aim Trainer 2D ML Aimbot+ESP 
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:22.410Z
tags: scripting, ml, ai-translated
editor: markdown
dateCreated: 2025-06-27T21:35:22.410Z
---
# Outline a training target, then add a click

Find `Tgt` in your own [Target Tracking](https://aimtrainer.io/target-tracking) session. First show its box, then optionally enable movement and clicking. Data comes from browser-window pixels; this version draws through **EyeAuras OSD**, without ImGui or access to browser/game internals.

Use desktop EyeAuras with OpenCV/ONNX Runtime, the available external model from the code, visible browser capture, the input module and **Windows Input**. For the first exercise, keep one training tab in a stable window on the primary monitor at 100% scale.

## Check the detection first

1. Open your Target Tracking session and click **Play**. Its base page title is **Tracking - Aim Trainer**; your browser can append its name. Set `GetWindow` to an expression matching your actual training window.
2. Add **C# Script** and paste the full program into top-level `Script.csx`. Keep `performInput = false`:

```csharp
using System;
using System.Drawing;
using System.Linq;
using EyeAuras.Blazor.Controls.ScreenOverlay;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Shared.Services;
using PoeShared.Scaffolding;

{
    var window = GetService<IWindowSelector>().GetWindow("Tracking - Aim Trainer");
    if (window == null || !window.IsWindow) { Log.Warn("Training window not found"); return; }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    using var osd = GetService<IOnScreenCanvasScriptingApi>().Create();
    var input = GetService<ISendInputScriptingApi>();
    var previousTarget = input.TargetWindow;
    var previousSimulator = input.InputSimulatorId;
    const bool performInput = false;
    const string model = "https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";
    try
    {
        input.TargetWindow = window;
        input.InputSimulatorId = "Windows Input";
        using var windowRect = osd.AddRectangle().WithBorderColor(Color.Purple).WithBackground(Color.Transparent);
        using var targetRect = osd.AddRectangle().WithBorderColor(Color.Red).WithBackground(Color.Transparent);
        while (!cancellationToken.WaitHandle.WaitOne(10))
        {
            targetRect.WithRect(Rectangle.Empty);
            windowRect.WithRect(Rectangle.Empty);
            if (!window.IsForeground) continue;
            windowRect.WithRect(window.DwmFrameBounds);
            var result = cv.MLSearchRaw(model, confidenceThreshold: 30, iouThreshold: 40);
            var targets = result.Detected.Predictions.Where(x => x.Label.Name == "Tgt").ToArray();
            if (targets.Length == 0) continue;
            var prediction = targets[0];
            var screenBounds = result.ToScreen(prediction.Rectangle).ToWinRectangle();
            if (screenBounds.IsEmpty) continue;
            targetRect.WithRect(screenBounds);
            Log.Info($"Tgt: score={prediction.Score:F3}; screen={screenBounds}");
            if (performInput && window.IsForeground && !cancellationToken.IsCancellationRequested)
            {
                var windowBounds = result.ToWindow(prediction.Rectangle).ToWinRectangle();
                input.MouseMoveTo(windowBounds.Center());
                input.MouseClick();
            }
        }
    }
    finally
    {
        osd.Clear();
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
    }
}
```

3. Click **Run** and return to your training window. Purple outlines its DWM frame; red outlines a detected target. The log records `Tgt`, score and screen bounds. No match clears the target box; another foreground window pauses processing.
4. Click **Stop** after checking the box. If you want the training click, set `performInput = true`, Run again and activate **only your own trainer**. Each suitable pass now moves to the target centre and left-clicks. Stop ends the loop; switching away pauses processing.

| Setting | Effect |
| --- | --- |
| `performInput` | `false`: detection and boxes. `true`: also real movement/click, after you have verified the window and box. |
| `GetWindow(...)` | Capture/input recipient. A missing or invalid window ends the program with a log message instead of selecting the desktop. |
| `confidenceThreshold: 30` | Filters scores above 30%, then the script keeps `Tgt`. The first matching prediction comes from score-descending results; that does not establish a correct target. |
| `iouThreshold: 40` | Overlap threshold for duplicate-box suppression, not a target-area threshold. |
| `WaitOne(10)` | Cancellable 10 ms pause between passes. Capture, inference, logging and input add time; this does not promise 100 FPS. |

OSD receives screen bounds through `ToScreen`. Input receives window coordinates through `ToWindow` because `TargetWindow` is set; Windows Input converts those to screen and activates the recipient. This is not background delivery. Keep the training window stable: focus can change between checking and acting. Stop does not interrupt an already running synchronous search or input call.

If the goal is an aura condition rather than a script-owned search loop, use the [AI Search guide](/en/triggers/images/ai-search-trigger) with a compatible ONNX model containing the required class. Verify its capture, class and boxes first, then configure a separate reaction to the aura’s state; loading a model does not add the click from this script.

The original ONNX model detects objects, with input `images` 1×3×640×640 and output `output0` 1×5×8400. Its only class is `Tgt`; do not substitute an ordinary COCO model and expect that class. File metadata records Ultralytics 8.1.13 and AGPL-3.0; consult the [author's terms](https://www.ultralytics.com/license).

The loader stretches captured pixels to the model input, and its parser scales boxes back to the processed image. `ToScreen`/`ToWindow` then apply capture transforms, so no second manual resize or offset is needed. `Score` 0…1 is a model score, not image-area coverage or a measured probability of a correct click. A model/capture failure is distinct from an empty prediction list.

The script leaves execution-provider selection to the host: Default tries available DirectML session options, otherwise CPU. This does not promise recovery from model or inference errors.

This Run owns its rectangles: they are disposed before canvas clearing, input settings are restored, then canvas/CV are released. The input service and captured/result images are borrowed; do not dispose the images separately. `Log`, `GetService` and the token are `Script.csx` capabilities, not ordinary-class globals. See [runtime](/en/scripting/api/scripting/runtime), [capture ownership](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi). For native drawing use [the ImGui variant](/en/scripting/examples/advanced/aimtrainer-ml).
