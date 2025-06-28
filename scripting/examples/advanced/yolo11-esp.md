---
title: Yolo 11 FullScreen ESP ImGui
description: 1.7.8527+
published: true
date: 2025-06-28T13:43:54.832Z
tags: 
editor: markdown
dateCreated: 2025-06-28T09:04:25.549Z
---

# What Is This?

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

- [EyeAuras.ImGuiSdk](https://www.nuget.org/packages/EyeAuras.ImGuiSdk)
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
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
#r "nuget:ImGui.NET, 1.91.6.1"

using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
AddNewExtension<ImGuiContainerExtensions>();

var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForScreen();

var osd = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);

var mlModelPath = @"https://s3.eyeauras.net/public/eyeauras-ml/yolo/yolov11s.onnx";

Log.Info("Working...");
osd.AddRenderer(() =>
{
    var drawList = ImGui.GetBackgroundDrawList();

    // ➕ Draw FPS in top-right corner of the capture area
    float fps = ImGui.GetIO().Framerate;
    var captureAreaBounds = CaptureRegion.IsEmpty
        ? System.Windows.Forms.Screen.PrimaryScreen.Bounds
        : CaptureRegion;
    osd.DrawFrame(captureAreaBounds, Color.Purple);

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
        IsEnabled ? Color.Purple.ToImGuiColor() : Color.Yellow.ToImGuiColor(),
        $"F1 - {(IsEnabled ? "Stop" : "Start")}, F2 - Select Region");

    if (!IsEnabled)
    {
        Sleep(10);
        return;
    }

    // Perform ML-search
    //or you can use Context Menu => Pick region to insert custom region - this will drastically improve quality
    var result = cv.MLSearchRaw(mlModelPath, CaptureRegion);

    var predictions = result.Detected.Predictions.Where(x => x.Score > 0.7).ToArray();

    if (!predictions.Any()) return;

    foreach (var prediction in predictions)
    {
        var predictionBounds = result.ToScreen(prediction.Rectangle);
        osd.DrawFrame(predictionBounds, Color.AliceBlue);

        var topLeft = new Vector2(predictionBounds.Left, predictionBounds.Top);
        var label = $"{prediction.Label.Name} ({prediction.Score:P1})";
        drawList.AddText(topLeft, Color.White.ToImGuiColor(), label);
    }
});

cancellationToken.WaitHandle.WaitOne();

public bool IsEnabled { get; set; } = true;

public Rectangle CaptureRegion { get; set; }

[Keybind(Hotkey = "F1", SuppressKey = true)]
public void HandleF1()
{
    var newIsEnabled = !IsEnabled;
    Log.Info($"F1 pressed, IsEnabled: {IsEnabled} => {newIsEnabled}");
    IsEnabled = newIsEnabled;
}

[Keybind(Hotkey = "F2", SuppressKey = true)]
public async Task HandleF2(EyeAuras.Shared.Osd.IOsdSelectionService osdSelectionService)
{
    Log.Info($"F2 pressed");
    try
    {
        var selection = await osdSelectionService.PickRegion();
        Log.Info($"Selection result: {selection}");
        CaptureRegion = selection.Region;
        Log.Info($"New capture region: {CaptureRegion}");
    }
    catch (OperationCanceledException)
    {
        Log.Info($"Selection cancelled");

    }
}
```