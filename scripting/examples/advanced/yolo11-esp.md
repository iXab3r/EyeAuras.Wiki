---
title: Yolo 11 FullScreen ESP ImGui
description: 1.7.8532+
published: true
date: 2025-06-28T13:44:37.503Z
tags: scripting, ml, ai-translated
editor: markdown
dateCreated: 2025-06-28T09:04:25.549Z
---
# Label objects in your own image with YOLO11

Draw boxes and class names over your own photograph or training video on the primary screen. **F1** pauses detection; **F2** chooses a region. The script reads pixels, not another application's internal state, and sends no mouse movement or clicks.

Use desktop Windows EyeAuras with OpenCV/ONNX Runtime, compatible **EyeAuras.ImGuiSdk 0.1.47** and the available external ONNX model from the code. The [EyeAuras package](https://packages.eyeauras.net/v3/index.json) depends on **EyeAuras.ClickableTransparentOverlay 11.5.28**; do not add a conflicting [ImGui.NET](https://github.com/mellinoe/ImGui.NET) version. Start on the primary monitor at 100% scale.

## Select an image and show detections

1. Display a clear photograph you own containing a COCO class such as `person` or `bottle`. Make the object large enough to see. This model is not trained to detect every drawn training target.
2. Add **C# Script** and paste the full program into top-level `Script.csx`. Allow package restore to finish:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"

using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
using System;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Scripting.Api;
using EyeAuras.Shared.Services;
using PoeShared.Scaffolding;

private object StateGate { get; } = new object();

public bool IsEnabled { get; set; } = true;

public Rectangle CaptureRegion { get; set; }

{
    AddNewExtension<ImGuiContainerExtensions>();

    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForScreen();

    using var osd = GetService<IImGuiExperimentalApi>();

    var previousNoActivate = osd.NoActivate;

    var mlModelPath = @"https://s3.eyeauras.net/public/eyeauras-ml/yolo/yolov11s.onnx";

    Log.Info("Working...");
    var renderGate = new object();
    var renderStopped = false;
    try
    {
        osd.NoActivate = true;
        using var renderRegistration = osd.AddRenderer(() =>
        {
            lock (renderGate)
            {
                if (renderStopped || cancellationToken.IsCancellationRequested) return;
                bool enabled;
                Rectangle captureRegion;
                lock (StateGate)
                {
                    enabled = IsEnabled;
                    captureRegion = CaptureRegion;
                }
                var drawList = ImGui.GetBackgroundDrawList();

                //  Draw FPS in top-right corner of the capture area
                float fps = ImGui.GetIO().Framerate;
                var captureAreaBounds = captureRegion.IsEmpty
                    ? System.Windows.Forms.Screen.PrimaryScreen.Bounds
                    : captureRegion;
                drawList.AddRect(
                    new Vector2(captureAreaBounds.Left, captureAreaBounds.Top),
                    new Vector2(captureAreaBounds.Right, captureAreaBounds.Bottom),
                    Color.Purple.ToImGuiColor());

                string fpsText = $"FPS: {fps:F1}";
                float fontSize = ImGui.GetFontSize() * 3f; // x3 size
                var textSize = ImGui.CalcTextSize(fpsText) * 3f; // also scale position
                drawList.AddText(
                    ImGui.GetFont(),
                    fontSize,
                    new Vector2(captureAreaBounds.Right - textSize.X - 10, captureAreaBounds.Top + 10),
                    Color.Yellow.ToImGuiColor(),
                    fpsText);
                drawList.AddText(
                    ImGui.GetFont(),
                    fontSize,
                    new Vector2(captureAreaBounds.Left + 10, captureAreaBounds.Top + 10),
                    enabled ? Color.Purple.ToImGuiColor() : Color.Yellow.ToImGuiColor(),
                    $"F1 - {(enabled ? "Stop" : "Start")}, F2 - Select Region");

                if (!enabled)
                {
                    return;
                }

                // Search the selected screen region.
                var result = cv.MLSearchRaw(mlModelPath, confidenceThreshold: 30, iouThreshold: 40, region: captureRegion);

                var predictions = result.Detected.Predictions.Where(x => x.Score > 0.7).ToArray();

                if (!predictions.Any()) return;

                foreach (var prediction in predictions)
                {
                    var predictionBounds = result.ToScreen(prediction.Rectangle);
                    drawList.AddRect(
                        new Vector2(predictionBounds.Left, predictionBounds.Top),
                        new Vector2(predictionBounds.Right, predictionBounds.Bottom),
                        Color.AliceBlue.ToImGuiColor());

                    var topLeft = new Vector2(predictionBounds.Left, predictionBounds.Top);
                    var label = $"{prediction.Label.Name} ({prediction.Score:P1})";
                    drawList.AddText(topLeft, Color.White.ToImGuiColor(), label);
                }
            }
        });

        try
        {
            cancellationToken.WaitHandle.WaitOne();
        }
        finally
        {
            lock (renderGate)
            {
                // Wait for any current callback, then prevent all later work.
                renderStopped = true;
            }
        }
    }
    finally
    {
        osd.NoActivate = previousNoActivate;
    }
}

[Keybind(Hotkey = "F1", SuppressKey = true)]
public void HandleF1()
{
    lock (StateGate)
    {
        IsEnabled = !IsEnabled;
    }
}

[Keybind(Hotkey = "F2", SuppressKey = true)]
public async Task HandleF2(EyeAuras.Shared.Osd.IOsdSelectionService osdSelectionService)
{
    Log.Info($"F2 pressed");
    try
    {
        var selection = await osdSelectionService.PickRegion();
        Log.Info($"Selection result: {selection}");
        if (cancellationToken.IsCancellationRequested) return;
        lock (StateGate)
        {
            CaptureRegion = selection.Region;
        }
    }
    catch (OperationCanceledException)
    {
        Log.Info($"Selection cancelled");

    }
}
```

3. Click **Run**. Purple outlines the capture region; `class (score)` labels accompany retained predictions. The upper-right counter shows ImGui FPS. First use loads and creates the model.
4. Press **F1** to pause detection, then **F2** to select your photo **within the primary screen**. Escape/right-click cancels selection and retains the old region. F1 resumes detection; **Stop** finishes the script.

| Setting or display | Meaning |
| --- | --- |
| `IsEnabled = true` | Detection begins on Run; F1 pauses/resumes without ending the script. |
| `CaptureRegion` | Empty means `ForScreen()`'s primary-screen capture. F2 records a screen rectangle; this does not automatically capture all monitors. |
| `confidenceThreshold: 30` / `iouThreshold: 40` | CV score/overlap filtering, followed by this program's stricter `Score > 0.7` filter. |
| `Label.Name` / `Score` | Class and score 0…1. `P1` formats a percentage; it is not a measured probability of correctness. |
| `result.ToScreen(...)` | Converts processed-image boxes into screen coordinates with the selected region's transform. Do not resize them to 640×640 again. |
| `FPS` | ImGui frame rate, not separately measured inference throughput or video frame rate. The text still renders while detection is paused. |
| `NoActivate` | Temporarily changes shared Main's non-activation setting, restored after callback removal. Avoid concurrent owners changing it. |

This specific **YOLO11s detect** file records Ultralytics 8.3.8, 80 COCO classes, input `images` 1×3×640×640 and output `output0` 1×84×8400. It is not a classifier without boxes, a pose model or a detector trained for a particular game. Another file's YOLO name does not establish compatibility: input/output layouts, metadata, parser and installed ONNX execution provider must agree. Metadata records AGPL-3.0; see the author's [terms](https://www.ultralytics.com/license) and [YOLO11 family documentation](https://docs.ultralytics.com/models/yolo11/).

The loader stretches selected pixels to the model input; the parser scales boxes back to the processed image, then `ToScreen` applies capture position. Empty suitable predictions leave the region without boxes. A capture/model error is a separate outcome; absence of a box alone is not successful-load proof.

To investigate a slow detector, use [CV pipeline profiling](/en/scripting/examples/advanced/profiling-cv) with the same model, source and region. Its measured steps distinguish first-use setup from later searches; the ImGui FPS label here cannot identify which CV stage takes time.

The script leaves execution-provider selection to the host: Default tries available DirectML session options, otherwise CPU. This does not promise recovery from model or inference errors.

ImGui and ML run on the native frame thread after context creation. Slow inference delays that frame. F1/F2 update state under a lock and each callback copies a consistent region. Stop is checked between calls, not during synchronous inference. Region selection has its own cancellation; the Run token is checked after selection returns. `SuppressKey = true` intercepts F1/F2 while their handlers are registered, so choose unused keys for your test.

Cleanup sets `renderStopped` under the callback gate, waits for active work and removes its owned registration before restoring Main and disposing CV/ImGui. A stuck callback can delay cleanup. Captured/result images are borrowed and must not be disposed separately or sent to a worker. `Log`, `GetService`, the token and attributed methods are this `Script.csx` host context, not ordinary-class globals. See [ImGui operations](/en/scripting/api/IImGuiExperimentalApi), [script runtime](/en/scripting/api/scripting/runtime), [capture ownership](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).

<details>
<summary>Earlier demonstration and another teaching source</summary>

The [earlier demo](https://onelineplayer.com/player?autoplay=true&autopause=false&muted=true&loop=true&url=https%3A%2F%2Fs3.eyeauras.net%2Fmedia%2F2025%2F06%2FEyeAuras_Ysg57Vun9q2Hmuvu.mp4&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true) shows its original image/environment, not a promised FPS on your machine. For another input, use the [training video](https://www.youtube.com/watch?v=rTqg2hEjGdE), select its region and inspect actual classes/boxes. A COCO model need not treat every target in that video as a supported object.

</details>
