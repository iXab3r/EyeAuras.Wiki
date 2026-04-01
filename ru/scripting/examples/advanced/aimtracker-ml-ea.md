---
title: ML Aimbot+ESP для Aim Trainer 2D
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:22.410Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-27T21:35:22.410Z
---
# Что это такое?

Этот пример показывает, **как собрать простой 2D aimbot с ESP-оверлеем** (отрисовкой поверх экрана) с помощью **EyeAuras**.

## Что делает этот код

- Подключается к окну браузерной игры (`Aim Trainer`)
- Использует **предобученную ML-модель** для поиска цели в реальном времени
- Рисует прямоугольник и круг поверх найденной цели
- Перемещает курсор в центр цели
- Кликает по ней — готово 

---

## Пример кода

```csharp
//this is a simple 2D aimbot + ESP for https://aimtrainer.io/target-tracking

//we're going to work with a specific window, lets find it
var targetWindow = GetService<IWindowSelector>().GetWindow("Tracking - Aim Trainer");

//this API is used to do Computer Vision stuff (image/text/color/ml search)
var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow); //we're interested in this specific window

//this API is used to generate mouse movements
var sendInput = GetService<ISendInputScriptingApi>();

//pre-trained model we're going to use to find the target
var mlModelPath = @"https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";

var osd = GetService<IOnScreenCanvasScriptingApi>()
    .Create()
    .AddTo(ExecutionAnchors);


var windowRect = osd.AddRectangle()
    .WithBorderColor(Color.Purple)
    .WithBackground(Color.Transparent);
var targetRect = osd.AddRectangle()
    .WithBorderColor(Color.Red)
    .WithBackground(Color.Transparent);

while (true)
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

//wait until script stops or gets stopped
cancellationToken.WaitHandle.WaitOne();
```