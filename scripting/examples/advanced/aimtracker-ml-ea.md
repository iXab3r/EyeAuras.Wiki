---
title: Aim Trainer 2D ML Aimbot+ESP 
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:22.410Z
tags: scripting, ml, ai-translated
editor: markdown
dateCreated: 2025-06-27T21:35:22.410Z
---

# What Is This?

Run this as a top-level EyeAuras C# script for your own Aim Trainer session. Open target-tracking, match the window title in GetWindow and provide access to the ONNX URL. Window capture, ML runtime and the selected input simulator must be available. The model is an external input, not an embedded script resource.

This example shows **how to build a simple 2D aimbot with an ESP overlay** (drawing on screen) using **EyeAuras** 

## ⚙️ What This Code Does

* Connects to a browser game window (`Aim Trainer`)
* Uses a **pre-trained ML model** to detect a target in real time
* Draws a rectangle over the detected target
* Moves the mouse to the center of the target
* Clicks it — boom! 🎯

---

## 🧪 Example Code

```csharp

//this is a simple 2D aimbot + ESP for https://aimtrainer.io/target-tracking

using System.Drawing;
using System.Linq;
using EyeAuras.Blazor.Controls.ScreenOverlay;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Shared.Services;
using PoeShared.Scaffolding;

//we're going to work with a specific window, lets find it
var targetWindow = GetService<IWindowSelector>().GetWindow("Tracking - Aim Trainer");

{
    //this API is used to do Computer Vision stuff (image/text/color/ml search)
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(targetWindow); // selected window

    //this API is used to generate mouse movements
    var sendInput = GetService<ISendInputScriptingApi>();
    sendInput.TargetWindow = null; // use desktop coordinates below

    //pre-trained model we're going to use to find the target
    var mlModelPath = @"https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";

    using var osd = GetService<IOnScreenCanvasScriptingApi>()
        .Create();

    try
    {
        using var windowRect = osd.AddRectangle()
            .WithBorderColor(Color.Purple)
            .WithBackground(Color.Transparent);
        using var targetRect = osd.AddRectangle()
            .WithBorderColor(Color.Red)
            .WithBackground(Color.Transparent);

        while (!cancellationToken.WaitHandle.WaitOne(10))
        {
            if (!targetWindow.IsForeground)
            {
                //do nothing if the window is not in the foreground
                continue;
            }
            //this method will be called many-many times per second, until OSD is closed
            windowRect.WithRect(targetWindow.DwmFrameBounds);

            //get predictions from the model
            var result = cv.MLSearchRaw(mlModelPath);
            if (!result.Detected.Predictions.Any())
            {
                //not found
                continue;
            }

            var currentPosition = result //WindowImageProcessedEventArgs
              .Detected //get detection results
              .Predictions //get predictions
              .First() //more specifically, first one
              .Rectangle //get bounding box of that prediction IN LOCAL(aka World) coordinates
              .Transform(result.ViewportTransforms.WorldToScreen); //transform World coordinates to Screen coordinates
            Log.Info($"Found via ML @ {currentPosition}");

            if (!currentPosition.IsEmpty)
            {
                //found the image
                var targetCenter = currentPosition.ToWinRectangle().Center();

                targetRect.WithRect(currentPosition.ToWinRectangle());

                sendInput.MouseMoveTo(targetCenter);
                sendInput.MouseClick();
            }
        }
    }
    finally
    {
        osd.Clear();
    }
}
```

`MLSearchRaw` returns `Detected.Predictions` and capture transforms. Defaults are confidence 30% and IoU 40%. The first prediction is not guaranteed to be the best or a correct target. An empty list means no detection; model/capture errors are separate. Convert capture rectangles with `WorldToScreen` before input; a non-null input `TargetWindow` would apply another conversion.

The script moves the real cursor and clicks only when the training window is foreground, although focus can change between checking and clicking. Stop is observed between iterations/frames; it does not interrupt synchronous inference or input already in progress. Captured images are borrowed and must not be disposed separately.

Leaving the try scope disposes the rectangles; finally clears the canvas while its proxy is attached, then the outer using scope disposes canvas and CV.

See [runtime contexts](/en/scripting/api/core/app-runtime-contexts), [capture and result ownership](/en/scripting/api/computer-vision/images), and the [CV API](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
