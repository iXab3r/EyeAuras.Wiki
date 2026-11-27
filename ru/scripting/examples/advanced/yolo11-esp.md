---
title: Yolo 11 — полноэкранный ESP на ImGui
description: 1.7.8532+
published: true
date: 2025-06-28T13:44:37.503Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-28T09:04:25.549Z
---
# Подписать объекты на своём изображении через YOLO11

Скрипт рисует рамки и имена классов поверх вашей фотографии или учебного видео на основном экране. **F1** ставит распознавание на паузу, **F2** выбирает область.

Нужны настольный EyeAuras на Windows с OpenCV/ONNX Runtime, совместимый **EyeAuras.ImGuiSdk 0.1.47** и ONNX-модель, доступная по адресу из кода. Пакет из [источника EyeAuras](https://packages.eyeauras.net/v3/index.json) зависит от EyeAuras.ClickableTransparentOverlay 11.5.28, поэтому отдельную чужую версию [ImGui.NET](https://github.com/mellinoe/ImGui.NET) рядом не добавляйте. Для первого раза возьмите основной монитор с масштабом 100%.

## Подготовить изображение и включить рамки

1. Откройте свою чёткую фотографию с объектом одного из классов COCO, например `person` или `bottle`. Увеличьте её, чтобы объект был хорошо виден.
2. Создайте действие **C# Script** и вставьте всю программу в верхнеуровневый `Script.csx`. Дождитесь, пока восстановится пакет:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"

using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
using System;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Scripting.Api;
using EyeAuras.Shared.Services;
using PoeShared.Scaffolding;

private object StateGate { get; } = new object();

public bool IsEnabled { get; set; } = true;

public Rectangle CaptureRegion { get; set; }

{
    AddNewExtension<ImGuiContainerExtensions>();

    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForScreen();

    using var osd = GetService<IImGuiExperimentalApi>();

    var previousNoActivate = osd.NoActivate;
    osd.NoActivate = true;

    var mlModelPath = @"https://s3.eyeauras.net/public/eyeauras-ml/yolo/yolov11s.onnx";

    Log.Info("Working...");
    var renderGate = new object();
    var renderStopped = false;
    var renderRegistration = osd.AddRenderer(() =>
    {
        lock (renderGate)
        {
            if (renderStopped || cancellationToken.IsCancellationRequested) return;
            bool enabled;
            Rectangle captureRegion;
            lock (StateGate)
            {
                enabled = IsEnabled;
                captureRegion = CaptureRegion;
            }
            var drawList = ImGui.GetBackgroundDrawList();

            //  Draw FPS in top-right corner of the capture area
            float fps = ImGui.GetIO().Framerate;
            var captureAreaBounds = captureRegion.IsEmpty
                ? System.Windows.Forms.Screen.PrimaryScreen.Bounds
                : captureRegion;
            drawList.AddRect(
                new Vector2(captureAreaBounds.Left, captureAreaBounds.Top),
                new Vector2(captureAreaBounds.Right, captureAreaBounds.Bottom),
                Color.Purple.ToImGuiColor());

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
                enabled ? Color.Purple.ToImGuiColor() : Color.Yellow.ToImGuiColor(),
                $"F1 - {(enabled ? "Stop" : "Start")}, F2 - Select Region");

            if (!enabled)
            {
                return;
            }

            // Search the selected screen region.
            var result = cv.MLSearchRaw(mlModelPath, confidenceThreshold: 30, iouThreshold: 40, region: captureRegion);

            var predictions = result.Detected.Predictions.Where(x => x.Score > 0.7).ToArray();

            if (!predictions.Any()) return;

            foreach (var prediction in predictions)
            {
                var predictionBounds = result.ToScreen(prediction.Rectangle);
                drawList.AddRect(
                    new Vector2(predictionBounds.Left, predictionBounds.Top),
                    new Vector2(predictionBounds.Right, predictionBounds.Bottom),
                    Color.AliceBlue.ToImGuiColor());

                var topLeft = new Vector2(predictionBounds.Left, predictionBounds.Top);
                var label = $"{prediction.Label.Name} ({prediction.Score:P1})";
                drawList.AddText(topLeft, Color.White.ToImGuiColor(), label);
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
        osd.NoActivate = previousNoActivate;
    }
}

[Keybind(Hotkey = "F1", SuppressKey = true)]
public void HandleF1()
{
    lock (StateGate)
    {
        IsEnabled = !IsEnabled;
    }
}

[Keybind(Hotkey = "F2", SuppressKey = true)]
public async Task HandleF2(EyeAuras.Shared.Osd.IOsdSelectionService osdSelectionService)
{
    Log.Info($"F2 pressed");
    try
    {
        var selection = await osdSelectionService.PickRegion();
        Log.Info($"Selection result: {selection}");
        if (cancellationToken.IsCancellationRequested) return;
        lock (StateGate)
        {
            CaptureRegion = selection.Region;
        }
    }
    catch (OperationCanceledException)
    {
        Log.Info($"Selection cancelled");

    }
}
```

3. Нажмите **Run**. Фиолетовая рамка показывает область поиска, подписи `class (score)` — оставшиеся предсказания. В правом верхнем углу видна частота кадров ImGui. При первом обращении модель загружается и создаётся.
4. Нажмите **F1**, чтобы поставить поиск на паузу, затем **F2** и выделите свою фотографию **в пределах основного экрана**. Выделение отменяется Escape или правой кнопкой — тогда останется прежняя область. Ещё одно нажатие F1 возобновит обработку. Чтобы закончить, нажмите **Stop**.

| Настройка или показание | Как понимать |
| --- | --- |
| `IsEnabled = true` | При Run распознавание включено. F1 переключает его, скрипт при этом не завершается. |
| `CaptureRegion` | Пустое значение — основной экран из `ForScreen()`. F2 записывает сюда выбранный прямоугольник экрана. Все мониторы автоматически не захватываются. |
| `confidenceThreshold: 30` / `iouThreshold: 40` | Первый отсев в CV: по оценке и по перекрытию рамок. Потом пример оставляет только `Score > 0.7`. |
| `prediction.Label.Name` / `Score` | Класс модели и оценка от 0 до 1. Формат `P1` только показывает её в процентах. |
| `result.ToScreen(...)` | Переводит рамку из обработанного изображения в координаты экрана с учётом выбранной области. Ещё раз масштабировать её к 640×640 не нужно. |
| `FPS` | Частота кадров ImGui. На паузе надписи продолжают рисоваться. |
| `NoActivate` | Временно меняет общее свойство нативного окна Main, чтобы оверлей не активировался при показе. Когда функция кадра снята, прежнее значение возвращается. |

В примере используется конкретный **YOLO11s detect**. По метаданным файла это Ultralytics 8.3.8, 80 классов COCO, вход `images` 1×3×640×640 и выход `output0` 1×84×8400. Другой модели нужны подходящие входы, выходы, метаданные и обработчик результата. В метаданных указана лицензия AGPL-3.0. [Условия](https://www.ultralytics.com/license) и [описание семейства YOLO11](https://docs.ultralytics.com/models/yolo11/) опубликованы автором.

Загрузчик растягивает выбранные пиксели до размера входа. Обработчик результата возвращает рамки к размеру обработанного изображения, а `ToScreen` учитывает его положение. Если подходящих предсказаний нет, область просто остаётся без рамок.

Если распознавание работает медленно, возьмите [профилирование цепочки CV](/ru/scripting/examples/advanced/profiling-cv) с теми же моделью, источником и областью. Замеры по шагам отделяют первую подготовку от следующих поисков.

ImGui и ML вызываются в потоке функции кадра, когда нативный контекст уже создан. Медленное распознавание задерживает этот кадр. F1 и F2 меняют состояние под lock, а функция кадра копирует согласованную область. Stop проверяется между вызовами: синхронное распознавание токен не прерывает. У открытого выбора области своя отмена, а токен проверяется после того, как выбор завершится.

При Stop флаг под `renderGate` запрещает дальнейшую работу и ждёт, пока завершится текущая функция. Затем снимается регистрация, возвращается прежнее свойство и освобождаются API. `Captured` и изображения результата заимствованы: отдельно их не освобождают и в фоновый поток не передают. `Log`, `GetService` и `cancellationToken` есть только в `Script.csx`, в обычном классе этих глобальных API нет. [Подробнее об ImGui SDK](/ru/scripting/api/nuget/imgui-sdk).

<details>
<summary>Прежняя демонстрация и другой учебный источник</summary>

[Демонстрационный ролик](https://onelineplayer.com/player?autoplay=true&autopause=false&muted=true&loop=true&url=https%3A%2F%2Fs3.eyeauras.net%2Fmedia%2F2025%2F06%2FEyeAuras_Ysg57Vun9q2Hmuvu.mp4&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true). Для другого входа откройте [учебное видео](https://www.youtube.com/watch?v=rTqg2hEjGdE), выберите его область и посмотрите, какие классы и рамки появятся.

</details>
