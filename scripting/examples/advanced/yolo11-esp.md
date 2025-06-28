---
title: Yolo 11 FullScreen ESP ImGui
description: 1.7.8527+
published: true
date: 2025-06-28T09:04:25.549Z
tags: 
editor: markdown
dateCreated: 2025-06-28T09:04:25.549Z
---

# What Is This?

This example shows **how to create a fullscreen ESP overlay** using **ImGui** and a **YOLO v11s ML model** for real-time object detection. It draws bounding boxes and labels over detected objects and displays the current FPS.

---

## ⚙️ What This Code Does

* Loads a **pretrained YOLO model** for object detection
* Runs inference on the **entire screen**
* Draws a **bounding box and label** over each prediction
* Shows **FPS counter** in the top-right corner
* All UI is rendered using **ImGui** and **EyeAuras SDK**

---

## 🧪 Example Code

```csharp
//this is a simple fullscreen ESP using Yolo 11s model for https://aimtrainer.io/target-tracking

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

osd.AddRenderer(() =>
{
    var drawList = ImGui.GetBackgroundDrawList();

    // ➕ Draw FPS in top-right corner
    float fps = ImGui.GetIO().Framerate;
    var screenBounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
    osd.DrawFrame(screenBounds, Color.Purple);

    string fpsText = $"FPS: {fps:F1}";
    float fontSize = ImGui.GetFontSize() * 3f; // x3 size
    var textSize = ImGui.CalcTextSize(fpsText) * 3f; // also scale position
    var pos = new Vector2(screenBounds.Right - textSize.X - 10, 10);
    drawList.AddText(ImGui.GetFont(), fontSize, pos, Color.Yellow.ToImGuiColor(), fpsText);

    // Perform ML-search
    var result = cv.MLSearchRaw(mlModelPath);
    var predictions = result.Detected.Predictions.Where(x => x.Score > 0.7).ToArray();

    if (!predictions.Any()) return;

    foreach (var prediction in predictions)
    {
        osd.DrawFrame(prediction.Rectangle, Color.AliceBlue);

        var topLeft = new Vector2(prediction.Rectangle.Left, prediction.Rectangle.Top);
        var label = $"{prediction.Label.Name} ({prediction.Score:P1})";
        drawList.AddText(topLeft, Color.White.ToImGuiColor(), label);
    }
});

cancellationToken.WaitHandle.WaitOne();
```