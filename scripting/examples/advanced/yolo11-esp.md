---
title: Yolo 11 FullScreen ESP ImGui
description: 1.7.8532+
published: true
date: 2025-06-28T13:44:37.503Z
tags: scripting, ml, ai-translated
editor: markdown
dateCreated: 2025-06-28T09:04:25.549Z
---

# What Is This?

Run this as a top-level EyeAuras C# script to visualize detections on your desktop or a training video. It does not send game input. The ONNX URL is an external input; capture and a compatible ML runtime are prerequisites.

This example demonstrates how to build a **fullscreen ESP overlay** using **YOLOv11s** (a machine learning model for object detection) with **ImGui**, a real-time UI library. It runs on top of your desktop and highlights objects detected in a specific screen region.

It also features a hotkey (F1) to enable or disable detection live while it's running.

> Seen it in action here: [Demo](https://onelineplayer.com/player?autoplay=true&autopause=false&muted=true&loop=true&url=https%3A%2F%2Fs3.eyeauras.net%2Fmedia%2F2025%2F06%2FEyeAuras_Ysg57Vun9q2Hmuvu.mp4&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true)

> 📺 Try it on a video: [Target Tracking - YouTube](https://www.youtube.com/watch?v=rTqg2hEjGdE)

---

## 💡 Key Features

- `F1` Toggle capture/processing on/off
- `F2` Manually select capture area
- Uses **YOLOv11s ONNX model** for fast ML object detection
- Shows **bounding boxes + labels** over detected targets
- Renders an **FPS counter** (top-right)
- Only scans a **defined screen region** for performance

---

## 🧰 Technologies Used

- [EyeAuras.ImGuiSdk](https://packages.eyeauras.net/v3/index.json)
- [ImGui.NET](https://github.com/mellinoe/ImGui.NET)
- EyeAuras APIs: CV (Computer Vision), ImGui, Input, Logging

---

## 🔍 What to Expect

When enabled, the script:

- Continuously scans a defined region of your screen or the entire screen
- Uses ML to detect targets in that area
- Draws bounding boxes and labels using **ImGui**
- Displays a real-time FPS counter
- Lets you pause/resume detection with `F1`

---


## 🧪 Example Code

```csharp

//this is a simple fullscreen ESP using Yolo 11s model for https://aimtrainer.io/target-tracking
//open this YT video https://www.youtube.com/watch?v=rTqg2hEjGdE
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"

using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
using System;
using System.Drawing;
using System.Linq;
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

    var mlModelPath = @"https://s3.eyeauras.net/public/eyeauras-ml/yolo/yolov11s.onnx";

    Log.Info("Working...");
    var renderGate = new object();
    var renderStopped = false;
    var renderRegistration = osd.AddRenderer(() =>
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

            // Perform ML-search
            //or you can use Context Menu => Pick region to insert custom region - this will drastically improve quality
            var result = cv.MLSearchRaw(mlModelPath, region: captureRegion);

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
        renderRegistration.Dispose();
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
`MLSearchRaw` receives the ROI through named argument `region`. An empty ROI leaves capture to `ForScreen`; the displayed outline uses the primary screen and is not proof of the same capture area on every monitor setup. Default thresholds are confidence 30% and IoU 40%, then this script filters `Score > 0.7`. Empty predictions are not a model-loading error. Each rectangle passes through `result.ToScreen` before drawing.

F1/F2 state is copied under one lock so Rectangle reads do not race with writes. Inference remains in the frame callback and can delay rendering; FPS measures ImGui frames, not separate ML throughput. The user may cancel PickRegion; this code checks the script token after selection but does not claim token cancellation of the selector. Finally sets renderStopped under the callback's gate and unsubscribes before API/CV disposal. An active callback finishes before cleanup; late callbacks cannot start work. Borrowed images must not be passed to background workers.

This listing uses `EyeAuras.ImGuiSdk 0.1.47`, whose published assembly contains the rendering API. Keep its transitive ImGui dependencies aligned with the host instead of forcing the historical `ImGui.NET 1.91.6.1` reference. Native model inference and graphics execution are separate from source/package verification. See the [package version map](/en/scripting/api/nuget/imgui-sdk).

See [runtime contexts](/en/scripting/api/core/app-runtime-contexts), [capture and result ownership](/en/scripting/api/computer-vision/images), and the [CV API](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
