---
title: Aim Trainer 2D ML аимбот+ESP ImGui
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:44.374Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-27T21:27:31.399Z
---
# Что это такое?

В этом примере показано, **как сделать простой 2D aimbot с ESP-оверлеем** (отрисовкой поверх экрана) с помощью **ImGui** — библиотеки для создания интерфейсов в играх и приложениях.

---

##  Что такое ImGui?

**ImGui** (*Immediate Mode GUI*) — это лёгкая библиотека для отрисовки кнопок, текста, фигур и различных оверлеев. Её часто используют в играх, внутренних инструментах и cheat engine-подобных проектах. Она работает очень быстро и перерисовывает интерфейс заново на каждом кадре.

---

##  Что делает этот код

* Подключается к окну браузерной игры (`Aim Trainer`)
* Использует **предобученную ML-модель** для поиска цели в реальном времени
* Рисует рамку и круг поверх найденной цели
* Перемещает курсор в центр цели
* Кликает по ней — готово 

---

##  Пример кода

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