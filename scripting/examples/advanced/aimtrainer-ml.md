---
title: Aim Trainer 2D ML Aimbot+ESP ImGui
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:44.374Z
tags: scripting, ml, ai-translated
editor: markdown
dateCreated: 2025-06-27T21:27:31.399Z
---

# What Is This?

Run this as a top-level EyeAuras C# script for your own Aim Trainer session. Open target-tracking, match the window title in GetWindow and provide access to the ONNX URL. Window capture, ML runtime and the selected input simulator must be available. The model is an external input, not an embedded script resource.

This example shows **how to build a simple 2D aimbot with an ESP overlay** (drawing on screen) using **ImGui**, a library for building UIs in games or apps.

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

{
    AddNewExtension<ImGuiContainerExtensions>();

    var targetWindow = GetService<IWindowSelector>().GetWindow("Aim Trainer");

    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(targetWindow);

    var sendInput = GetService<ISendInputScriptingApi>();
    sendInput.TargetWindow = null; // use desktop coordinates below

    using var osd = GetService<IImGuiExperimentalApi>();

    var mlModelPath = @"https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";

    var renderGate = new object();
    var renderStopped = false;
    var renderRegistration = osd.AddRenderer(() =>
    {
        lock (renderGate)
        {
            if (renderStopped || cancellationToken.IsCancellationRequested || !targetWindow.IsForeground) return;

            var windowBounds = targetWindow.DwmFrameBounds;
            var drawList = ImGui.GetBackgroundDrawList();
            drawList.AddRect(
                new Vector2(windowBounds.Left, windowBounds.Top),
                new Vector2(windowBounds.Right, windowBounds.Bottom),
                Color.Purple.ToImGuiColor());

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

                drawList.AddRect(
                    new Vector2(currentPosition.Left, currentPosition.Top),
                    new Vector2(currentPosition.Right, currentPosition.Bottom),
                    Color.AliceBlue.ToImGuiColor());

                drawList.AddCircle(targetCenter.ToVector2(), 10, Color.Red.ToImGuiColor());

                sendInput.MouseMoveTo(targetCenter);
                sendInput.MouseClick();
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
```


`MLSearchRaw` returns `Detected.Predictions` and capture transforms. Defaults are confidence 30% and IoU 40%. The first prediction is not guaranteed to be the best or a correct target. An empty list means no detection; model/capture errors are separate. Convert capture rectangles with `WorldToScreen` before input; a non-null input `TargetWindow` would apply another conversion.

The script moves the real cursor and clicks only when the training window is foreground, although focus can change between checking and clicking. Stop is observed between iterations/frames; it does not interrupt synchronous inference or input already in progress. Captured images are borrowed and must not be disposed separately.

Inference runs inside the ImGui callback in this simple example and can delay frames. The render gate waits for an active callback, prevents later work, then removes the registration before API/CV disposal. Do not move borrowed frames or shared CV state into Task.Run without defining a separate owner.

This listing uses `EyeAuras.ImGuiSdk 0.1.47`, whose published assembly contains the rendering API. Keep its transitive ImGui dependencies aligned with the host instead of forcing the historical `ImGui.NET 1.91.6.1` reference. Native model inference and graphics execution are separate from source/package verification. See the [package version map](/en/scripting/api/nuget/imgui-sdk).

See [runtime contexts](/en/scripting/api/core/app-runtime-contexts), [capture and result ownership](/en/scripting/api/computer-vision/images), and the [CV API](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
