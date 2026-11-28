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

The script draws boxes and class names over your own photograph or training video on the primary screen. **F1** pauses detection. **F2** chooses a region.

You need desktop EyeAuras on Windows with OpenCV/ONNX Runtime, a compatible **EyeAuras.ImGuiSdk 0.1.47** and the ONNX model available at the address in the code. The [EyeAuras package](https://packages.eyeauras.net/v3/index.json) depends on **EyeAuras.ClickableTransparentOverlay 11.5.28**, so do not add a separate [ImGui.NET](https://github.com/mellinoe/ImGui.NET) version next to it. For the first run, use the primary monitor at 100% scale.

## Select an image and show detections

1. Open a clear photograph of your own with an object of a COCO class such as `person` or `bottle`. Enlarge it so the object is easy to see.
2. Add **C# Script** and paste the whole program into top-level `Script.csx`. Wait for the package to restore:

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

3. Click **Run**. The purple outline is the capture region. The `class (score)` labels are the predictions that were kept. The counter in the upper-right corner shows ImGui FPS. On first use the model is loaded and created.
4. Press **F1** to pause detection, then **F2** and select your photo **within the primary screen**. Escape or a right-click cancels the selection and keeps the old region. Press F1 again to resume. Click **Stop** to finish.

| Setting or display | Meaning |
| --- | --- |
| `IsEnabled = true` | Detection is on when you click Run. F1 toggles it without ending the script. |
| `CaptureRegion` | Empty means the primary screen from `ForScreen()`. F2 stores the screen rectangle you selected here. Other monitors are not captured automatically. |
| `confidenceThreshold: 30` / `iouThreshold: 40` | The first CV filter, by score and by box overlap. After it the example keeps only `Score > 0.7`. |
| `Label.Name` / `Score` | The model's class and a score from 0 to 1. `P1` only formats it as a percentage. |
| `result.ToScreen(...)` | Converts a box from the processed image into screen coordinates, taking the selected region into account. Do not resize it to 640×640 again. |
| `FPS` | ImGui frame rate. The text keeps rendering while detection is paused. |
| `NoActivate` | Temporarily changes a shared setting of the native Main window so the overlay does not activate when shown. The old value comes back once the frame callback is removed. |

The example uses one specific **YOLO11s detect** file. Its metadata says Ultralytics 8.3.8, 80 COCO classes, input `images` 1×3×640×640 and output `output0` 1×84×8400. Another model needs matching inputs, outputs, metadata and result parser. The metadata lists the AGPL-3.0 license. The author publishes the [terms](https://www.ultralytics.com/license) and the [YOLO11 family documentation](https://docs.ultralytics.com/models/yolo11/).

The loader stretches the selected pixels to the model input size. The parser scales boxes back to the processed image, and `ToScreen` applies its position. If there are no suitable predictions, the region simply stays without boxes.

If detection is slow, use [CV pipeline profiling](/en/scripting/examples/advanced/profiling-cv) with the same model, source and region. Its per-step timings separate first-use setup from later searches.

ImGui and ML run on the frame callback thread once the native context exists. Slow inference delays that frame. F1 and F2 change state under a lock, and the callback copies a consistent region. Stop is checked between calls: the token does not interrupt synchronous inference. An open region selection has its own cancellation, and the token is checked after the selection returns.

On Stop, a flag under `renderGate` blocks further work and waits for the current callback to finish. Then the registration is removed, the old setting comes back and the APIs are disposed. Captured and result images are borrowed: do not dispose them separately or pass them to a background thread. `Log`, `GetService` and `cancellationToken` exist only in `Script.csx`. Ordinary classes do not have these globals. See [ImGui operations](/en/scripting/api/IImGuiExperimentalApi), [script runtime](/en/scripting/api/scripting/runtime), [capture ownership](/en/scripting/api/computer-vision/images) and [CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).

<details>
<summary>Earlier demonstration and another teaching source</summary>

The [earlier demo](https://onelineplayer.com/player?autoplay=true&autopause=false&muted=true&loop=true&url=https%3A%2F%2Fs3.eyeauras.net%2Fmedia%2F2025%2F06%2FEyeAuras_Ysg57Vun9q2Hmuvu.mp4&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true). For another input, open the [training video](https://www.youtube.com/watch?v=rTqg2hEjGdE), select its region and see which classes and boxes appear.

</details>
