---
title: Aim Trainer 2D ML аимбот+ESP ImGui
description: 1.7.8523+
published: true
date: 2025-06-27T21:35:44.374Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-27T21:27:31.399Z
---
# Показать цель тренажёра нативной рамкой ImGui

Этот вариант рисует рамку и круг вокруг найденной `Tgt` через нативный ImGui. Сначала проверим изображение, затем при желании подключим движение и клик в собственном [Target Tracking](https://aimtrainer.io/target-tracking). В отличие от [варианта OSD](/ru/scripting/examples/advanced/aimtracker-ml-ea), рисование выполняется заново в функции каждого кадра ImGui.

Нужен настольный Windows-хост EyeAuras с OpenCV/ONNX Runtime и совместимый **EyeAuras.ImGuiSdk 0.1.47** из [источника пакетов](https://packages.eyeauras.net/v3/index.json). Он зависит от EyeAuras.ClickableTransparentOverlay 11.5.28 и .NET 8 Windows. Не добавляйте рядом другую ImGui.NET/CTO. Ссылка `#r` предоставляет типы, а `ImGuiContainerExtensions` отдельно регистрирует API в контейнере скрипта.

## От модели к рамке

1. Откройте свой Target Tracking, нажмите **Play**. Для первого опыта оставьте браузер на основном мониторе с масштабом 100%; уточните заголовок своего окна в `GetWindow`. Нужны доступная модель по ссылке и видимые пиксели цели.
2. Создайте действие **C# Script**, вставьте весь код в `Script.csx`, дождитесь восстановления пакета. Первый запуск оставьте с `performInput = false`:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Drawing;
using System.Linq;
using System.Numerics;
using EyeAuras.ImGuiSdk;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Services;
using ImGuiNET;
using PoeShared.Scaffolding;

{
    var window = GetService<IWindowSelector>().GetWindow("Tracking - Aim Trainer");
    if (window == null || !window.IsWindow) { Log.Warn("Учебное окно не найдено"); return; }
    AddNewExtension<ImGuiContainerExtensions>();
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    using var imgui = GetService<IImGuiExperimentalApi>();
    var input = GetService<ISendInputScriptingApi>();
    var previousTarget = input.TargetWindow;
    var previousSimulator = input.InputSimulatorId;
    var previousNoActivate = imgui.NoActivate;
    var gate = new object();
    var stopped = false;
    const bool performInput = false;
    const string model = "https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";
    try
    {
        input.TargetWindow = window;
        input.InputSimulatorId = "Windows Input";
        imgui.NoActivate = true;
        using var rendering = imgui.AddRenderer(() =>
        {
            lock (gate)
            {
                if (stopped || cancellationToken.IsCancellationRequested || !window.IsForeground) return;
                var draw = ImGui.GetBackgroundDrawList();
                var bounds = window.DwmFrameBounds;
                draw.AddRect(new Vector2(bounds.Left, bounds.Top), new Vector2(bounds.Right, bounds.Bottom), Color.Purple.ToImGuiColor());
                var result = cv.MLSearchRaw(model, confidenceThreshold: 30, iouThreshold: 40);
                var targets = result.Detected.Predictions.Where(x => x.Label.Name == "Tgt").ToArray();
                if (targets.Length == 0) return;
                var prediction = targets[0];
                var screen = result.ToScreen(prediction.Rectangle);
                if (screen.IsEmpty) return;
                var center = screen.ToWinRectangle().Center();
                draw.AddRect(new Vector2(screen.Left, screen.Top), new Vector2(screen.Right, screen.Bottom), Color.AliceBlue.ToImGuiColor());
                draw.AddCircle(center.ToVector2(), 10, Color.Red.ToImGuiColor());
                if (performInput && window.IsForeground && !cancellationToken.IsCancellationRequested)
                {
                    input.MouseMoveTo(result.ToWindow(prediction.Rectangle).ToWinRectangle().Center());
                    input.MouseClick();
                }
            }
        });
        try { cancellationToken.WaitHandle.WaitOne(); }
        finally { lock (gate) stopped = true; }
    }
    finally
    {
        imgui.NoActivate = previousNoActivate;
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
    }
}
```

3. Нажмите **Run**, активируйте своё учебное окно. Фиолетовый контур показывает окно, светлая рамка — предсказанную цель, красный круг — её центр. Нет подходящей `Tgt` — нет рамки цели в этом кадре.
4. После проверки рамки остановите скрипт. Если нужен автоматический учебный клик, установите `performInput = true`, снова Run и активируйте тренажёр. Stop запрещает следующие вызовы, ожидает текущую функцию кадра, снимает регистрацию и освобождает ресурсы.

| Часть | Что происходит |
| --- | --- |
| `performInput` | В выключенном режиме рисование не двигает мышь. Во включённом добавляется Windows Input с активацией выбранного окна; это не универсальный фоновый клик. |
| `AddRenderer` | Вызывает функцию на потоке нативного контекста после его инициализации. `GetBackgroundDrawList` нельзя вызывать до этого или из произвольного потока. |
| `NoActivate = true` | Нативный оверлей не должен активироваться при показе. Это общее свойство окна Main; прежнее значение восстанавливается. |
| `30` / `40` | Пороги confidence и IoU в процентах; не оценка скорости или вероятности успешного клика. |
| `ToScreen` / `ToWindow` | Экранная рамка для ImGui и оконный центр для адресного ввода. Повторного ручного масштабирования/смещения нет. |

Распознавание и необязательный ввод синхронно выполняются в функции кадра: медленная модель задержит отрисовку. Это простой учебный вариант, без отдельного рабочего потока и обещаний скорости. Проверка активности не фиксирует окно навсегда; между ней и действием фокус может смениться. Держите собственное учебное окно стабильным. Stop не прерывает уже начатый поиск или ввод.

Модель по исходной ссылке — ONNX для обнаружения объектов, с входом `images` 1×3×640×640 и выходом `output0` 1×5×8400, единственный класс — `Tgt`. Она обучена для такого учебного изображения, не извлекает данные браузера или игры. Метаданные указывают Ultralytics 8.1.13 и AGPL-3.0; [условия модели](https://www.ultralytics.com/license) смотрите у автора. Не подменяйте её обычной COCO-моделью, ожидая тот же класс.

Загрузчик растягивает кадр до входа модели; обработчик результата возвращает рамки обратно в координаты обработанного изображения. `ToScreen`/`ToWindow` затем учитывают область захвата и её преобразования — масштабировать рамку вручную ещё раз не нужно. `Score` 0…1 — оценка модели, не доля площади и не измеренная вероятность правильного клика. Ошибка загрузки или захвата отличается от пустого списка предсказаний.

`gate` не даёт освободить CV/ImGui во время текущей функции кадра; флаг запрещает позднюю работу, затем снимается регистрация. Только после неё восстанавливаются настройки и освобождаются API. Кадры/изображения результата заимствованы. Общее нативное окно Main принадлежит SDK; не закрывайте его вручную. Обычному классу передают сервисы и токен явно — глобальные возможности этого примера принадлежат `Script.csx`. [Устройство ImGui SDK](/ru/scripting/api/nuget/imgui-sdk).
