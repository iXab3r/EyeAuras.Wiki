---
title: Aim Trainer 2D ML аимбот+ESP ImGui
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:44.374Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-27T21:27:31.399Z
---
# Найти цель в учебном Aim Trainer

Это верхнеуровневый `C# Script` внутри EyeAuras для собственного учебного сеанса Aim Trainer. Откройте страницу target-tracking, проверьте заголовок окна в `GetWindow` и доступность указанного ONNX-файла. URL модели — вход примера, а не встроенный ресурс; первая загрузка требует доступа к нему. Нужны рабочие захват окна, ML runtime и выбранный симулятор ввода. Совместимость модели и внешних пакетов отдельно не проверена.

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
    sendInput.TargetWindow = null; // ниже передаём экранные координаты

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

`MLSearchRaw` возвращает оболочку с `Detected.Predictions` и матрицами захвата. Без явных порогов используются confidence 30% и IoU 40%; первая запись не означает гарантированно лучшую или правильную цель. Пустой список — цель не найдена, ошибка загрузки/захвата — отдельная ошибка. Прямоугольник переводится из координат захвата через `WorldToScreen` до отправки ввода. При ненулевом `TargetWindow` оконная обёртка ввода сделала бы ещё одно преобразование.

Скрипт меняет реальный курсор и кликает только при активном учебном окне. Между проверкой активности и кликом окно может измениться. Остановка проверяется между итерациями/кадрами; синхронное распознавание и уже начатый ввод токен не прерывает. Регистрация отрисовки снимается в `finally`, затем блок `using` освобождает ImGui API и CV; `Captured` и изображения результата заимствованы, освобождать их отдельно нельзя.

Распознавание выполняется прямо в callback отрисовки ImGui. Медленный вызов задержит кадр; это простой учебный вариант без отдельного рабочего потока. Не переносите общий CV/ImGui-контекст в `Task.Run` без отдельного согласования владения.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

В примере выбран `EyeAuras.ImGuiSdk 0.1.47`; опубликованная сборка содержит используемый API отрисовки. Его зависимости ImGui должны соответствовать хосту, поэтому отдельная историческая ссылка на `ImGui.NET 1.91.6.1` убрана. Контракты CV сверены с исходниками, но это не проверка запуска модели и графики. [Различия версий SDK](/ru/scripting/api/nuget/imgui-sdk).
