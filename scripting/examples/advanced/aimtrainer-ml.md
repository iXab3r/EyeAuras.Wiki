---
title: Aim Trainer 2D Aimbot+ESP ImGui
description: 
published: true
date: 2025-06-27T21:27:31.399Z
tags: 
editor: markdown
dateCreated: 2025-06-27T21:27:31.399Z
---

# What Is This?

This example shows **how to build a simple 2D aimbot with an ESP overlay** (drawing on screen) using **EyeAuras**, a scripting SDK, and **ImGui**, a library for building UIs in games or apps.

---

## 🎮 What is ImGui?

**ImGui** (short for *Immediate Mode GUI*) is a lightweight library used to draw things like buttons, text, shapes, and overlays — often used in games, tools, and cheat engines. It's super fast and works by drawing the UI fresh every frame.

---


## ⚙️ What This Code Does

* Connects to a browser game window (`Aim Trainer`)
* Uses a **pre-trained ML model** to detect a target in real time
* Draws a box and circle over the detected target
* Moves the mouse to the center of the target
* Clicks it — boom! 🎯

---

## 🧪 Example Code

```csharp
//this is a simple 2D aimbot + ESP for https://aimtrainer.io/target-tracking

#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
#r "nuget:ImGui.NET, 1.91.6.1"
 
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
AddNewExtension<ImGuiContainerExtensions>();

var targetWindow = GetService<IWindowSelector>().GetWindow("Aim Trainer");

var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow);

var sendInput = GetService<ISendInputScriptingApi>();

var osd = GetService<IImGuiExperimentalApi>() 
    .AddTo(ExecutionAnchors);

var mlModelPath = @"https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";

osd.AddRenderer(() =>
{
    if (!targetWindow.IsForeground) return;

    var windowBounds = targetWindow.DwmFrameBounds;
    osd.DrawFrame(windowBounds, Color.Purple);
 
    var result = cv.MLSearchRaw(mlModelPath);
    if (!result.Detected.Predictions.Any()) return;

    var currentPosition = result
      .Detected
      .Predictions
      .First()
      .Rectangle
      .Transform(result.ViewportTransforms.WorldToScreen);

    Log.Info($"Found via ML @ {currentPosition}");

    if (!currentPosition.IsEmpty)
    {
        var targetCenter = currentPosition.ToWinRectangle().Center();

        osd.DrawFrame(currentPosition, Color.AliceBlue);
        
        var drawList = ImGui.GetBackgroundDrawList();
        drawList.AddCircle(targetCenter.ToVector2(), 10, Color.Red.ToImGuiColor());

        sendInput.MouseMoveTo(targetCenter);
        sendInput.MouseClick();
    }
});

cancellationToken.WaitHandle.WaitOne(); 
```

---

Let me know if you want a visual explanation or diagram next!
