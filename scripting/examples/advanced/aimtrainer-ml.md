---
title: Aim Trainer 2D ML Aimbot+ESP ImGui
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:44.374Z
tags: scripting, ml, ai-translated
editor: markdown
dateCreated: 2025-06-27T21:27:31.399Z
---
# Draw a training target with native ImGui

This variant draws a box and a circle around the detected `Tgt` target with native ImGui. First check the picture, then turn on movement and clicking in the [Target Tracking](https://aimtrainer.io/target-tracking) trainer if you want. Unlike [the OSD version](/en/scripting/examples/advanced/aimtracker-ml-ea), everything here is drawn again in every ImGui frame callback.

You need desktop EyeAuras on Windows with OpenCV/ONNX Runtime and the **EyeAuras.ImGuiSdk 0.1.47** package from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json). The package targets .NET 8 Windows and depends on **EyeAuras.ClickableTransparentOverlay 11.5.28**. Do not add the earlier standalone `ImGui.NET 1.91.6.1` reference or another CTO version next to the SDK. `#r` gives you the types, and `ImGuiContainerExtensions` separately registers the API in the script container.

## Turn model output into a box

1. Open Target Tracking and click **Play**. For the first try, keep the browser on the primary monitor at 100% scale. Check that your window title matches `GetWindow`. The linked model must be available and the target must be visible on screen.
2. Add a **C# Script** action, paste the whole code into `Script.csx` and wait for the package to restore. Run it with `performInput = false` the first time:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Drawing;
using System.Linq;
using System.Numerics;
using EyeAuras.ImGuiSdk;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Services;
using ImGuiNET;
using PoeShared.Scaffolding;

{
    var window = GetService<IWindowSelector>().GetWindow("Tracking - Aim Trainer");
    if (window == null || !window.IsWindow) { Log.Warn("Training window not found"); return; }
    AddNewExtension<ImGuiContainerExtensions>();
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    using var imgui = GetService<IImGuiExperimentalApi>();
    var input = GetService<ISendInputScriptingApi>();
    var previousTarget = input.TargetWindow;
    var previousSimulator = input.InputSimulatorId;
    var previousNoActivate = imgui.NoActivate;
    var gate = new object();
    var stopped = false;
    const bool performInput = false;
    const string model = "https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";
    try
    {
        input.TargetWindow = window;
        input.InputSimulatorId = "Windows Input";
        imgui.NoActivate = true;
        using var rendering = imgui.AddRenderer(() =>
        {
            lock (gate)
            {
                if (stopped || cancellationToken.IsCancellationRequested || !window.IsForeground) return;
                var draw = ImGui.GetBackgroundDrawList();
                var bounds = window.DwmFrameBounds;
                draw.AddRect(new Vector2(bounds.Left, bounds.Top), new Vector2(bounds.Right, bounds.Bottom), Color.Purple.ToImGuiColor());
                var result = cv.MLSearchRaw(model, confidenceThreshold: 30, iouThreshold: 40);
                var targets = result.Detected.Predictions.Where(x => x.Label.Name == "Tgt").ToArray();
                if (targets.Length == 0) return;
                var prediction = targets[0];
                var screen = result.ToScreen(prediction.Rectangle);
                if (screen.IsEmpty) return;
                var center = screen.ToWinRectangle().Center();
                draw.AddRect(new Vector2(screen.Left, screen.Top), new Vector2(screen.Right, screen.Bottom), Color.AliceBlue.ToImGuiColor());
                draw.AddCircle(center.ToVector2(), 10, Color.Red.ToImGuiColor());
                if (performInput && window.IsForeground && !cancellationToken.IsCancellationRequested)
                {
                    input.MouseMoveTo(result.ToWindow(prediction.Rectangle).ToWinRectangle().Center());
                    input.MouseClick();
                }
            }
        });
        try { cancellationToken.WaitHandle.WaitOne(); }
        finally { lock (gate) stopped = true; }
    }
    finally
    {
        imgui.NoActivate = previousNoActivate;
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
    }
}
```

3. Click **Run** and activate the trainer window. The purple outline is the window, the AliceBlue box is the detected target and the red circle is its centre. If there is no matching `Tgt`, that frame has no target box.
4. Once you have checked the box, stop the script. If you want the automatic click, set `performInput = true`, click Run again and activate your trainer. Stop blocks further calls, waits for the current frame callback to finish, removes the registration and releases resources.

| Part | What happens |
| --- | --- |
| `performInput` | Off: the script only draws and does not move the mouse. On: adds Windows Input, which activates the selected window. |
| `AddRenderer` | Calls your callback on the native-context thread once the context is initialised. Do not call ImGui drawing APIs earlier or from another thread. |
| `NoActivate = true` | The native overlay should not activate when shown. This is a shared setting of the Main window, and the previous value is restored afterwards. |
| `30` / `40` | Confidence and IoU thresholds in percent. |
| `ToScreen` / `ToWindow` | The box in screen coordinates for ImGui and the centre in window coordinates for input to the window. |

Detection and input run synchronously inside the frame callback, so a slow model delays drawing. Focus can move to another window between the check and the action, so do not switch away from the trainer. Stop does not interrupt detection or input that has already started.

The linked model is an ONNX object detection model. Input is `images` 1×3×640×640, output is `output0` 1×5×8400, and the only class is `Tgt`. It was trained on images of this trainer. The file metadata lists Ultralytics 8.1.13 and AGPL-3.0. See the [author's license terms](https://www.ultralytics.com/license). Do not swap in an ordinary COCO model and expect the same class.

The loader stretches the frame to the model input size, and the result parser maps the boxes back to the processed image. `ToScreen`/`ToWindow` then account for the capture region and its transforms, so you do not need to scale the box by hand. `Score` from 0 to 1 is the model's score.

The script leaves the choice of execution provider to the host: Default tries the available DirectML session options and otherwise uses CPU.

`gate` keeps CV and ImGui from being released while a frame callback is running. The flag blocks new work, then the registration is removed. Only after that are the settings restored and the APIs disposed. A stuck callback can delay Stop. Result images do not belong to the script, so do not pass them or shared CV state to `Task.Run` without a separate owner. The SDK owns the shared native Main window, so do not close it manually. The global helpers in this example exist only in `Script.csx`: an ordinary class gets its services and token passed in explicitly. See [ImGui operations](/en/scripting/api/IImGuiExperimentalApi), [script runtime](/en/scripting/api/scripting/runtime), [capture ownership](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
