---
title: Yolo 11 — полноэкранный ESP на ImGui
description: 1.7.8532+
published: true
date: 2025-06-28T13:44:37.503Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-28T09:04:25.549Z
---
# Подсветить объекты на экране через YOLO

Запускайте код как верхнеуровневый `C# Script` EyeAuras. Он только визуализирует найденные объекты рабочего стола/учебного видео и не отправляет ввод в игру. Нужны указанные версии `EyeAuras.ImGuiSdk` и `ImGui.NET`, доступ к ONNX-файлу по URL, рабочие захват экрана и ML runtime. Файл модели не встроен в скрипт; доступность URL и совместимость нативных компонентов здесь не проверены.

Этот пример показывает, как собрать **полноэкранный ESP-оверлей** с помощью **YOLOv11s** (модели машинного обучения для обнаружения объектов) и **ImGui** — библиотеки для UI в реальном времени. Он работает поверх рабочего стола и подсвечивает объекты, найденные в выбранной области экрана.

Также в примере есть горячая клавиша `F1`, которая позволяет включать и отключать распознавание прямо во время работы.

> Посмотреть в действии: [Demo](https://onelineplayer.com/player?autoplay=true&autopause=false&muted=true&loop=true&url=https%3A%2F%2Fs3.eyeauras.net%2Fmedia%2F2025%2F06%2FEyeAuras_Ysg57Vun9q2Hmuvu.mp4&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true)

>  Попробовать на видео: [Target Tracking - YouTube](https://www.youtube.com/watch?v=rTqg2hEjGdE)

---

## Основные возможности

- `F1` — включение и выключение захвата/обработки
- `F2` — ручной выбор области захвата
- Используется **YOLOv11s ONNX model** для быстрого ML-распознавания объектов
- Отображаются **bounding boxes + labels** поверх найденных целей
- Рисуется **счетчик FPS** (в правом верхнем углу)
- Для производительности анализируется только **заданная область экрана**

---

## Используемые технологии

- [EyeAuras.ImGuiSdk](https://www.nuget.org/packages/EyeAuras.ImGuiSdk)
- [ImGui.NET](https://github.com/mellinoe/ImGui.NET)
- API EyeAuras: CV (Computer Vision), ImGui, Input, Logging

---

## Что делает скрипт

Когда скрипт включен, он:

- непрерывно сканирует заданную область экрана или весь экран
- использует ML для поиска целей в этой области
- рисует bounding boxes и подписи через **ImGui**
- показывает FPS в реальном времени
- позволяет приостанавливать и возобновлять распознавание клавишей `F1`

---

## Пример кода

```csharp
//this is a simple fullscreen ESP using Yolo 11s model for https://aimtrainer.io/target-tracking
//open this YT video https://www.youtube.com/watch?v=rTqg2hEjGdE
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
#r "nuget:ImGui.NET, 1.91.6.1"

using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
AddNewExtension<ImGuiContainerExtensions>();

var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForScreen()
    .AddTo(ExecutionAnchors);

var osd = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);

var mlModelPath = @"https://s3.eyeauras.net/public/eyeauras-ml/yolo/yolov11s.onnx";

Log.Info("Working...");
osd.AddRenderer(() =>
{
    if (cancellationToken.IsCancellationRequested) return;
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
    osd.DrawFrame(captureAreaBounds, Color.Purple);

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

    // Perform ML-search
    //or you can use Context Menu => Pick region to insert custom region - this will drastically improve quality
    var result = cv.MLSearchRaw(mlModelPath, region: captureRegion);

    var predictions = result.Detected.Predictions.Where(x => x.Score > 0.7).ToArray();

    if (!predictions.Any()) return;

    foreach (var prediction in predictions)
    {
        var predictionBounds = result.ToScreen(prediction.Rectangle);
        osd.DrawFrame(predictionBounds, Color.AliceBlue);

        var topLeft = new Vector2(predictionBounds.Left, predictionBounds.Top);
        var label = $"{prediction.Label.Name} ({prediction.Score:P1})";
        drawList.AddText(topLeft, Color.White.ToImGuiColor(), label);
    }
});

cancellationToken.WaitHandle.WaitOne();

private object StateGate { get; } = new object();

public bool IsEnabled { get; set; } = true;

public Rectangle CaptureRegion { get; set; }

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

`MLSearchRaw` получает ROI именованным аргументом `region`. При пустом ROI захват определяется `ForScreen`, а рамка в этом примере берётся с основного экрана; это не утверждение, что они совпадают при любой конфигурации мониторов. Порог CV по умолчанию — confidence 30%, IoU 40%, затем код дополнительно оставляет `Score > 0.7`. Пустой список означает отсутствие подходящих предсказаний, а не ошибку загрузки модели. Каждый прямоугольник проходит через `result.ToScreen` перед отрисовкой.

Состояние F1/F2 копируется под одним lock, чтобы `Rectangle` не читался одновременно с записью. Само распознавание остаётся в callback ImGui и может задерживать кадр. FPS показывает частоту ImGui, не отдельную скорость ML. `PickRegion` может быть отменён пользователем; токен проверяется после выбора, но этот вызов не объявляется отменяемым токеном скрипта. CV и ImGui освобождаются через `ExecutionAnchors`; нельзя передавать заимствованные кадры в фоновый поток или считать общий CV-контекст потокобезопасным.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
