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

Этот вариант рисует рамку и круг вокруг найденной цели `Tgt` через нативный ImGui. Сначала проверим картинку, а потом при желании включим движение и клик в тренажёре [Target Tracking](https://aimtrainer.io/target-tracking). В отличие от [варианта с OSD](/ru/scripting/examples/advanced/aimtracker-ml-ea), здесь всё рисуется заново в функции каждого кадра ImGui.

Нужен настольный EyeAuras на Windows с OpenCV/ONNX Runtime и пакет **EyeAuras.ImGuiSdk 0.1.47** из [источника пакетов](https://packages.eyeauras.net/v3/index.json). Пакет зависит от EyeAuras.ClickableTransparentOverlay 11.5.28 и .NET 8 Windows. Не добавляйте рядом другую ImGui.NET или CTO. Ссылка `#r` даёт типы, а `ImGuiContainerExtensions` отдельно регистрирует API в контейнере скрипта.

## От модели к рамке

1. Откройте Target Tracking и нажмите **Play**. Для первого раза держите браузер на основном мониторе с масштабом 100%. Проверьте, что заголовок вашего окна подходит под `GetWindow`. Модель по ссылке должна быть доступна, а цель — видна на экране.
2. Создайте действие **C# Script**, вставьте весь код в `Script.csx` и дождитесь, пока восстановится пакет. Первый раз запускайте с `performInput = false`:

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

3. Нажмите **Run** и активируйте окно тренажёра. Фиолетовый контур — окно, светлая рамка — найденная цель, красный круг — её центр. Если подходящей `Tgt` нет, в этом кадре рамки цели не будет.
4. Проверили рамку — остановите скрипт. Если нужен автоматический клик, поставьте `performInput = true`, снова нажмите Run и активируйте тренажёр. Stop запрещает следующие вызовы, ждёт конца текущей функции кадра, снимает регистрацию и освобождает ресурсы.

| Часть | Что происходит |
| --- | --- |
| `performInput` | Пока выключено, скрипт только рисует и мышь не двигает. Когда включено, добавляется Windows Input, который активирует выбранное окно. Это не универсальный фоновый клик. |
| `AddRenderer` | Вызывает вашу функцию в потоке нативного контекста, когда тот уже инициализирован. `GetBackgroundDrawList` нельзя вызывать раньше или из другого потока. |
| `NoActivate = true` | Нативный оверлей не должен активироваться при показе. Это общее свойство окна Main, прежнее значение потом возвращается. |
| `30` / `40` | Пороги confidence и IoU в процентах. Это не оценка скорости и не вероятность успешного клика. |
| `ToScreen` / `ToWindow` | Рамка в экранных координатах для ImGui и центр в оконных — для ввода в окно. Ещё раз масштабировать или сдвигать вручную ничего не нужно. |

Распознавание и ввод выполняются синхронно прямо в функции кадра, поэтому медленная модель задержит отрисовку. Это простой учебный вариант: отдельного рабочего потока нет, скорость не гарантируется. Между проверкой активности и действием фокус может уйти на другое окно, поэтому не переключайтесь с тренажёра. Stop не прерывает уже начатый поиск или ввод.

Модель по ссылке — ONNX для обнаружения объектов. Вход `images` 1×3×640×640, выход `output0` 1×5×8400, класс один — `Tgt`. Она обучена на картинке этого тренажёра и не читает данные браузера или игры. В метаданных указаны Ultralytics 8.1.13 и AGPL-3.0, [условия лицензии](https://www.ultralytics.com/license) смотрите у автора. Не подставляйте вместо неё обычную COCO-модель в расчёте на тот же класс.

Загрузчик растягивает кадр до размера входа модели, а обработчик результата возвращает рамки в координаты обработанного изображения. `ToScreen`/`ToWindow` затем учитывают область захвата и её преобразования, так что масштабировать рамку вручную не нужно. `Score` от 0 до 1 — это оценка модели, а не доля площади и не вероятность правильного клика. Ошибка загрузки или захвата — не то же самое, что пустой список предсказаний.

`gate` не даёт освободить CV и ImGui, пока идёт функция кадра. Флаг запрещает новую работу, затем снимается регистрация. Только после этого возвращаются настройки и освобождаются API. Кадры и изображения результата скрипту не принадлежат. Общим нативным окном Main владеет SDK — не закрывайте его вручную. Глобальные возможности из этого примера есть только в `Script.csx`: обычному классу сервисы и токен передают явно. [Как устроен ImGui SDK](/ru/scripting/api/nuget/imgui-sdk).
