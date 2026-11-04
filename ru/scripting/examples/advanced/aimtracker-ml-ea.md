---
title: ML Aimbot+ESP для Aim Trainer 2D
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:22.410Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-27T21:35:22.410Z
---
# Найти цель в учебном Aim Trainer

Это верхнеуровневый `C# Script` внутри EyeAuras для собственного учебного сеанса Aim Trainer. Откройте страницу target-tracking, проверьте заголовок окна в `GetWindow` и доступность указанного ONNX-файла. URL модели — вход примера, а не встроенный ресурс; первая загрузка требует доступа к нему. Нужны рабочие захват окна, ML runtime и выбранный симулятор ввода. Совместимость модели и внешних пакетов отдельно не проверена.

Этот пример показывает, **как собрать простой 2D aimbot с ESP-оверлеем** (отрисовкой поверх экрана) с помощью **EyeAuras**.

## Что делает этот код

- Подключается к окну браузерной игры (`Aim Trainer`)
- Использует **предобученную ML-модель** для поиска цели в реальном времени
- Рисует прямоугольник поверх найденной цели
- Перемещает курсор в центр цели
- Кликает по ней — готово 

---

## Пример кода

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
    sendInput.TargetWindow = null; // ниже передаём экранные координаты

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

`MLSearchRaw` возвращает оболочку с `Detected.Predictions` и матрицами захвата. Без явных порогов используются confidence 30% и IoU 40%; первая запись не означает гарантированно лучшую или правильную цель. Пустой список — цель не найдена, ошибка загрузки/захвата — отдельная ошибка. Прямоугольник переводится из координат захвата через `WorldToScreen` до отправки ввода. При ненулевом `TargetWindow` оконная обёртка ввода сделала бы ещё одно преобразование.

Скрипт меняет реальный курсор и кликает только при активном учебном окне. Между проверкой активности и кликом окно может измениться. Остановка проверяется между итерациями/кадрами; синхронное распознавание и уже начатый ввод токен не прерывает. Прямоугольники освобождаются при выходе из `try`; затем `finally` очищает canvas, пока прокси ещё подключён, и внешняя область `using` освобождает canvas и CV; `Captured` и изображения результата заимствованы, освобождать их отдельно нельзя.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
