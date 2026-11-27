---
title: ML Aimbot+ESP для Aim Trainer 2D
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:22.410Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-27T21:35:22.410Z
---
# Обвести учебную цель и подключить клик

Скрипт находит цель в тренажёре [Target Tracking](https://aimtrainer.io/target-tracking) и обводит её рамкой. Потом можно отдельно включить движение мыши и клик. Скрипт смотрит на пиксели окна браузера, а модель возвращает рамку класса `Tgt`. Рамки рисует **OSD EyeAuras**, без ImGui.

Нужны настольный EyeAuras с OpenCV/ONNX Runtime, доступ к модели по ссылке в коде и работающий захват видимого окна браузера. Для движения и клика нужен **Windows Input**. Для первого раза держите браузер на основном мониторе с масштабом 100%, не двигайте окно и откройте одну вкладку с тренажёром.

## Сначала увидеть результат поиска

1. Откройте Target Tracking и нажмите **Play**. Посмотрите заголовок окна браузера: у страницы он **Tracking - Aim Trainer**, но браузер может дописать своё имя. В коде укажите выражение, под которое подходит только ваше окно с тренажёром.
2. Создайте действие **C# Script** и вставьте весь код в `Script.csx`. Оставьте `performInput = false`:

```csharp
using System;
using System.Drawing;
using System.Linq;
using EyeAuras.Blazor.Controls.ScreenOverlay;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Shared.Services;
using PoeShared.Scaffolding;

{
    var window = GetService<IWindowSelector>().GetWindow("Tracking - Aim Trainer");
    if (window == null || !window.IsWindow) { Log.Warn("Учебное окно не найдено"); return; }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    using var osd = GetService<IOnScreenCanvasScriptingApi>().Create();
    var input = GetService<ISendInputScriptingApi>();
    var previousTarget = input.TargetWindow;
    var previousSimulator = input.InputSimulatorId;
    const bool performInput = false;
    const string model = "https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";
    try
    {
        input.TargetWindow = window;
        input.InputSimulatorId = "Windows Input";
        using var windowRect = osd.AddRectangle().WithBorderColor(Color.Purple).WithBackground(Color.Transparent);
        using var targetRect = osd.AddRectangle().WithBorderColor(Color.Red).WithBackground(Color.Transparent);
        while (!cancellationToken.WaitHandle.WaitOne(10))
        {
            targetRect.WithRect(Rectangle.Empty);
            windowRect.WithRect(Rectangle.Empty);
            if (!window.IsForeground) continue;
            windowRect.WithRect(window.DwmFrameBounds);
            var result = cv.MLSearchRaw(model, confidenceThreshold: 30, iouThreshold: 40);
            var targets = result.Detected.Predictions.Where(x => x.Label.Name == "Tgt").ToArray();
            if (targets.Length == 0) continue;
            var prediction = targets[0];
            var screenBounds = result.ToScreen(prediction.Rectangle).ToWinRectangle();
            if (screenBounds.IsEmpty) continue;
            targetRect.WithRect(screenBounds);
            Log.Info($"Tgt: score={prediction.Score:F3}; screen={screenBounds}");
            if (performInput && window.IsForeground && !cancellationToken.IsCancellationRequested)
            {
                var windowBounds = result.ToWindow(prediction.Rectangle).ToWinRectangle();
                input.MouseMoveTo(windowBounds.Center());
                input.MouseClick();
            }
        }
    }
    finally
    {
        osd.Clear();
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
    }
}
```

3. Нажмите **Run** и вернитесь в окно тренажёра. Фиолетовая рамка — DWM-граница окна, красная — найденная цель. В журнал пишутся `Tgt`, score и рамка в экранных координатах. Если цель не найдена, красная рамка убирается. Пока активно другое окно, скрипт ничего не обрабатывает.
4. Нажмите **Stop**. Если рамка стоит правильно, замените `performInput` на `true`, снова нажмите Run и активируйте **только свой тренажёр**. Теперь курсор идёт к центру цели и делает левый клик на каждом проходе, где цель найдена. Stop завершает цикл. Если уйти из окна тренажёра, обработка приостановится.

| Настройка | Что меняет |
| --- | --- |
| `performInput` | `false` — только поиск и рамки. `true` — ещё и настоящее движение и клик. |
| `GetWindow(...)` | Окно, которое скрипт захватывает и в которое отправляет ввод. Если окна нет, скрипт пишет об этом в журнал и завершается. |
| `confidenceThreshold: 30` | Оставляет оценки выше 30%, затем — только предсказания класса `Tgt`. Берётся первое из отсортированных по Score. |
| `iouThreshold: 40` | Порог перекрытия, по которому убираются дубли рамок. |
| `WaitOne(10)` | Пауза 10 мс между проходами, её можно отменить. |

OSD получает экранные координаты через `ToScreen`. Ввод получает **оконные** через `ToWindow`, потому что задан `TargetWindow`: Windows Input сам переводит их в экранные и активирует окно. Между проверкой активности и действием окно может смениться, поэтому не переключайтесь с тренажёра. Поиск и ввод синхронные: уже начатые Stop не прерывает.

Если вместо своего цикла в скрипте нужно условие ауры, возьмите [триггер AI Search](/ru/triggers/images/ai-search-trigger) с совместимой ONNX-моделью нужного класса. Сначала проверьте захват, класс и рамки, а потом отдельно настройте реакцию на состояние ауры.

Модель по ссылке — ONNX для обнаружения объектов. Вход `images` 1×3×640×640, выход `output0` 1×5×8400, класс один — `Tgt`. Она обучена на картинке этого тренажёра. В метаданных указаны Ultralytics 8.1.13 и AGPL-3.0, [условия лицензии](https://www.ultralytics.com/license) смотрите у автора. Не подставляйте вместо неё обычную COCO-модель в расчёте на тот же класс.

Загрузчик растягивает кадр до размера входа модели, а обработчик результата возвращает рамки в координаты обработанного изображения. `ToScreen`/`ToWindow` затем учитывают область захвата и её преобразования, так что масштабировать рамку вручную не нужно. `Score` от 0 до 1 — это оценка модели.

При выходе скрипт убирает за собой: освобождает свои прямоугольники, затем очищает canvas, возвращает прежние настройки API ввода и освобождает OSD и CV. Кадры и изображения результата скрипту не принадлежат — отдельно их не освобождают. `Log`, `GetService` и токен есть только в `Script.csx`, в обычном C#-классе их нет. Тот же пример с нативной отрисовкой — [вариант на ImGui](/ru/scripting/examples/advanced/aimtrainer-ml).
