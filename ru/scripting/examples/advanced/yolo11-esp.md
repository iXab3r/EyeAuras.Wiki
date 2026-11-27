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

Покажем рамки и имена классов поверх собственной фотографии или учебного видео на основном экране. **F1** приостанавливает распознавание, **F2** выбирает область. Скрипт получает пиксели, а не внутренние данные приложения; он ничего не нажимает и не двигает реальную мышь.

Нужны настольный Windows-хост EyeAuras с OpenCV/ONNX Runtime, совместимый **EyeAuras.ImGuiSdk 0.1.47** и доступная ONNX-модель из кода. Пакет из [источника EyeAuras](https://packages.eyeauras.net/v3/index.json) зависит от EyeAuras.ClickableTransparentOverlay 11.5.28; отдельную чужую версию [ImGui.NET](https://github.com/mellinoe/ImGui.NET) рядом не добавляйте. Для первого опыта используйте основной монитор с масштабом 100%.

## Подготовить изображение и включить рамки

1. Откройте собственную чёткую фотографию с объектом одного из классов COCO, например `person` или `bottle`. Увеличьте её так, чтобы объект был хорошо виден. Модель не обязана находить произвольную нарисованную мишень.
2. Создайте действие **C# Script**, вставьте всю программу в верхнеуровневый `Script.csx`. Дождитесь восстановления пакета:

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

3. Нажмите **Run**. Фиолетовая рамка обозначит область, подписи `class (score)` — оставшиеся предсказания. В правом верхнем углу показана частота кадров ImGui. При первом обращении загружается и создаётся модель.
4. Нажмите **F1**, чтобы приостановить поиск, затем **F2** и выделите свою фотографию **в пределах основного экрана**. Выделение можно отменить Escape/правой кнопкой; прежняя область останется. Снова F1 возобновит обработку. Нажмите **Stop** для завершения.

| Настройка или показание | Как понимать |
| --- | --- |
| `IsEnabled = true` | Распознавание включено при Run; F1 переключает его без завершения скрипта. |
| `CaptureRegion` | Пустое значение — основной экран из `ForScreen()`. F2 записывает экранный прямоугольник. Это не автоматический захват всех мониторов. |
| `confidenceThreshold: 30` / `iouThreshold: 40` | Первичная фильтрация оценок и перекрывающихся рамок в CV. Затем пример дополнительно оставляет только `Score > 0.7`. |
| `prediction.Label.Name` / `Score` | Класс модели и оценка0…1. Формат `P1` только показывает её как процент; это не измеренная вероятность верного распознавания. |
| `result.ToScreen(...)` | Перевод локальной рамки обработанного изображения на экран с учётом выбранной области. Повторно масштабировать её к640×640 не нужно. |
| `FPS` | Частота кадров ImGui, не отдельное число ML-операций в секунду и не скорость видео. При паузе отрисовка надписей продолжается. |
| `NoActivate` | Временно меняет общее свойство нативного окна Main, чтобы оверлей не активировался при показе; после снятия функции кадра прежнее значение восстанавливается. |

Здесь используется конкретный **YOLO11s detect**: метаданные файла указывают Ultralytics 8.3.8, 80 классов COCO, вход `images` 1×3×640×640 и выход `output0` 1×84×8400. Это не классификатор без рамок, не pose и не модель, обученная на конкретной игре. Название файла само по себе не гарантирует совместимость другой модели: нужны подходящие входы, выходы, метаданные, обработчик результата и установленный механизм ONNX Runtime. Метаданные указывают AGPL-3.0; [условия](https://www.ultralytics.com/license) и [описание семейства YOLO11](https://docs.ultralytics.com/models/yolo11/) опубликованы автором.

Загрузчик растягивает выбранные пиксели к размеру входа; обработчик результата возвращает рамки к размеру обработанного изображения, а `ToScreen` учитывает его положение. Пустой список подходящих предсказаний просто оставляет область без рамок. Ошибка модели/захвата — отдельная ошибка; отсутствие рамки не доказывает, что файл загрузился успешно.

Чтобы разобраться с медленным распознаванием, используйте [профилирование цепочки CV](/ru/scripting/examples/advanced/profiling-cv) с теми же моделью, источником и областью. Замеры шагов позволяют отделить первоначальную подготовку от последующих поисков; надпись FPS ImGui сама не показывает, какой этап CV занимает время.

Вызовы ImGui и ML выполняются на потоке функции кадра после создания нативного контекста. Медленное распознавание задерживает этот кадр. F1/F2 меняют состояние под lock, функция копирует согласованную область. Stop проверяется между вызовами; синхронное распознавание не прерывается токеном. Открытый выбор области имеет свою отмену; токен проверяется после его завершения.

При Stop флаг под `renderGate` запрещает позднюю работу и дожидается текущей функции; затем снимается регистрация, восстанавливается свойство и освобождаются API. `Captured`/изображения результата заимствованы, отдельно их не освобождают и не передают в фоновый поток. `Log`, `GetService` и `cancellationToken` — контекст `Script.csx`, не глобальные API обычного класса. [Подробнее об ImGui SDK](/ru/scripting/api/nuget/imgui-sdk).

<details>
<summary>Прежняя демонстрация и другой учебный источник</summary>

[Демонстрационный ролик](https://onelineplayer.com/player?autoplay=true&autopause=false&muted=true&loop=true&url=https%3A%2F%2Fs3.eyeauras.net%2Fmedia%2F2025%2F06%2FEyeAuras_Ysg57Vun9q2Hmuvu.mp4&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true) показывает исторический результат с прежним изображением и окружением, а не обещание числа FPS на вашем компьютере. Для другого входа можно открыть [учебное видео](https://www.youtube.com/watch?v=rTqg2hEjGdE), выбрать его область и смотреть фактические классы/рамки. Наличие видео не означает, что COCO-модель будет считать каждую мишень целевым объектом.

</details>
