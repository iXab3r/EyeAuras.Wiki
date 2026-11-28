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

The script finds the target in the [Target Tracking](https://aimtrainer.io/target-tracking) trainer and draws a box around it. After that you can turn on mouse movement and clicking separately. The script looks at the pixels of the browser window, and the model returns a box for the `Tgt` class. The boxes are drawn by **EyeAuras OSD**, without ImGui.

You need desktop EyeAuras with OpenCV/ONNX Runtime, access to the model linked in the code and working capture of the visible browser window. Movement and clicking need the input module and **Windows Input**. For the first try, keep the browser on the primary monitor at 100% scale, do not move the window and open only one tab with the trainer.

## Check the detection first

1. Open Target Tracking and click **Play**. Look at the browser window title: the page title is **Tracking - Aim Trainer**, but your browser can append its own name. In `GetWindow`, set an expression that matches only your trainer window.
2. Add a **C# Script** action and paste the whole code into `Script.csx`. Keep `performInput = false`:

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

3. Click **Run** and go back to the trainer window. The purple box is the DWM frame of the window, and the red box is the detected target. The log gets `Tgt`, the score and the box in screen coordinates. If no target is found, the red box is removed. While another window is active, the script processes nothing.
4. Click **Stop**. If the box is in the right place, set `performInput = true`, click Run again and activate **only your own trainer**. Now the cursor moves to the centre of the target and left-clicks on every pass where a target is found. Stop ends the loop. If you switch away from the trainer window, processing pauses.

| Setting | What it changes |
| --- | --- |
| `performInput` | `false`: detection and boxes only. `true`: real movement and clicking as well. |
| `GetWindow(...)` | The window the script captures and sends input to. If the window is missing, the script logs that and exits. |
| `confidenceThreshold: 30` | Keeps scores above 30%, then only `Tgt` predictions. The script takes the first one from the list sorted by score. |
| `iouThreshold: 40` | Overlap threshold used to remove duplicate boxes. |
| `WaitOne(10)` | A 10 ms pause between passes. It can be cancelled. |

OSD gets screen coordinates through `ToScreen`. Input gets window coordinates through `ToWindow` because `TargetWindow` is set: Windows Input converts them to screen coordinates itself and activates the window. The active window can change between the check and the action, so do not switch away from the trainer. Detection and input are synchronous, so Stop does not interrupt a call that has already started.

If you need an aura condition instead of your own loop in a script, use the [AI Search trigger](/en/triggers/images/ai-search-trigger) with a compatible ONNX model that has the class you need. Check capture, class and boxes first, then set up the reaction to the aura's state separately.

The linked model is an ONNX object detection model. Input is `images` 1×3×640×640, output is `output0` 1×5×8400, and the only class is `Tgt`. It was trained on images of this trainer. The file metadata lists Ultralytics 8.1.13 and AGPL-3.0. See the [author's license terms](https://www.ultralytics.com/license). Do not swap in an ordinary COCO model and expect the same class.

The loader stretches the frame to the model input size, and the result parser maps the boxes back to the processed image. `ToScreen`/`ToWindow` then account for the capture region and its transforms, so you do not need to scale the box by hand. `Score` from 0 to 1 is the model's score.

The script leaves the choice of execution provider to the host: Default tries the available DirectML session options and otherwise uses CPU.

On exit the script cleans up after itself: it disposes its rectangles, then clears the canvas, restores the previous input settings and releases OSD and CV. The input service, the captured frames and the result images do not belong to the script, so do not dispose the images separately. `Log`, `GetService` and the token exist only in `Script.csx`, not in an ordinary C# class. See [runtime](/en/scripting/api/scripting/runtime), [capture ownership](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi). The same example with native drawing is [the ImGui variant](/en/scripting/examples/advanced/aimtrainer-ml).
