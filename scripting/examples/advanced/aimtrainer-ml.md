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

Draw a box and centre circle around `Tgt` in your own [Target Tracking](https://aimtrainer.io/target-tracking) session, then optionally enable its training click. Unlike [the OSD version](/en/scripting/examples/advanced/aimtracker-ml-ea), this describes shapes again inside every ImGui frame callback.

Use desktop Windows EyeAuras with OpenCV/ONNX Runtime and a compatible **EyeAuras.ImGuiSdk 0.1.47** from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json). It targets .NET 8 Windows and depends on **EyeAuras.ClickableTransparentOverlay 11.5.28**. Do not force the earlier standalone `ImGui.NET 1.91.6.1` reference or another CTO version beside the SDK. `#r` supplies types; `ImGuiContainerExtensions` separately registers its script service.

## Turn model output into a box

1. Open your trainer and click **Play**. For the first exercise, use the primary monitor at 100% scale. Match the actual window title in `GetWindow`; the external model and visible target pixels must be available.
2. Add **C# Script**, paste the whole program into top-level `Script.csx` and let package restore complete. Keep `performInput = false`:

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

3. Click **Run** and activate your trainer. Purple outlines the window, AliceBlue outlines the predicted target and a red circle marks its centre. No matching `Tgt` means no target box in that frame.
4. Stop after verifying the box. To add the training click, change `performInput` to `true`, Run again and activate your own trainer. Stop prevents later callback work, waits for an active callback, removes registration and releases resources.

| Part | Meaning |
| --- | --- |
| `performInput` | Off: draw only. On: add Windows Input with target activation, not universal background clicking. |
| `AddRenderer` | Invokes the callback on the native-context thread after initialisation. Do not call ImGui drawing APIs from another thread or before that context exists. |
| `NoActivate = true` | Requests a non-activating shared overlay. The previous Main setting is restored; avoid other owners changing it during this exercise. |
| `30` / `40` | Confidence/IoU percentages, not speed or successful-click probabilities. |
| `ToScreen` / `ToWindow` | Screen box for ImGui; window centre for targeted input. No extra manual scaling/translation. |

Inference and optional input run synchronously in the callback, so a slow model delays drawing. This is a small teaching example without a separate worker or performance promise. Foreground checks do not pin focus permanently; keep your own training window stable. Stop cannot interrupt an already running inference/input call.

The original ONNX model detects objects, with input `images` 1×3×640×640 and output `output0` 1×5×8400. Its only class is `Tgt`; do not substitute an ordinary COCO model and expect that class. File metadata records Ultralytics 8.1.13 and AGPL-3.0; consult the [author's terms](https://www.ultralytics.com/license).

The loader stretches captured pixels to the model input, and its parser scales boxes back to the processed image. `ToScreen`/`ToWindow` then apply capture transforms, so no second manual resize or offset is needed. `Score` 0…1 is a model score, not image-area coverage or a measured probability of a correct click. A model/capture failure is distinct from an empty prediction list.

The script leaves execution-provider selection to the host: Default tries available DirectML session options, otherwise CPU. This does not promise recovery from model or inference errors.

The gate waits for the current callback before resources can be released and its flag prevents later work; the registration is removed before settings restoration and API disposal. A stuck callback can delay Stop. Result images are borrowed; do not pass them or shared CV state to `Task.Run` without a separate owner. SDK Main is shared and must not be closed manually. An ordinary helper receives its dependencies and token explicitly. See [ImGui operations](/en/scripting/api/IImGuiExperimentalApi), [script runtime](/en/scripting/api/scripting/runtime), [capture ownership](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
