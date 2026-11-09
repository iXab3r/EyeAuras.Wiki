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

Найдём цель в собственном сеансе [Target Tracking](https://aimtrainer.io/target-tracking), сначала покажем рамку, затем отдельно включим движение и клик. Источник данных — пиксели окна браузера; модель возвращает рамку класса `Tgt`. Подсветку здесь рисует **OSD EyeAuras**, без ImGui.

Нужны настольный EyeAuras с OpenCV/ONNX Runtime, доступная модель по ссылке в коде и работающий захват видимого браузерного окна. Для необязательного ввода нужен **Windows Input**. На первый опыт используйте основной монитор с масштабом 100%, стабильное собственное окно и одну открытую вкладку тренажёра.

## Сначала увидеть результат поиска

1. Откройте Target Tracking, нажмите **Play**. Посмотрите заголовок своего окна: исходный заголовок страницы — **Tracking - Aim Trainer**, браузер может добавить своё имя. В коде укажите выражение, которое выбирает именно ваше учебное окно.
2. Создайте действие **C# Script** и вставьте всю программу в `Script.csx`. Оставьте `performInput = false`:

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

3. Нажмите **Run** и вернитесь в своё учебное окно. Фиолетовая рамка показывает его DWM-границу, красная — найденную цель; журнал содержит `Tgt`, score и экранную рамку. Если совпадения нет, красная рамка убирается. При другом активном окне обработка пропускается.
4. Нажмите **Stop**. После проверки правильной рамки можно заменить `performInput` на `true`, снова Run и активировать **только свой тренажёр**. Теперь курсор идёт к центру цели и выполняет левый клик на каждом подходящем проходе. Stop завершает цикл; выход из учебного окна приостанавливает обработку.

| Настройка | Что меняет |
| --- | --- |
| `performInput` | `false` — поиск и рамки; `true` — дополнительно реальное движение и клик. Предпосылка второго режима — уже проверенные окно и рамка. |
| `GetWindow(...)` | Адресат захвата и ввода. Отсутствие окна заканчивает программу с записью в журнале, а не переключает её на рабочий стол. |
| `confidenceThreshold: 30` | Пропускает оценки выше 30%; затем остаются только предсказания класса `Tgt`. Первое берётся из отсортированного по Score результата, но правильность цели этим не гарантируется. |
| `iouThreshold: 40` | Порог перекрытия для удаления дублирующих рамок, не порог площади цели. |
| `WaitOne(10)` | Ожидание10ms между проходами с отменой; захват, распознавание, лог и ввод добавляют своё время. Это не обещание100 кадров/с. |

OSD получает экранные координаты через `ToScreen`. Ввод получает **оконные** через `ToWindow`, потому что `TargetWindow` задан; Windows Input переводит их на экран и активирует адресата. Это не фоновый ввод. Между проверкой активности и действием возможна смена окна; держите учебное окно стабильным. Stop не прерывает уже начатый синхронный поиск или ввод.

Модель по исходной ссылке — ONNX для обнаружения объектов, с входом `images` 1×3×640×640 и выходом `output0` 1×5×8400, единственный класс — `Tgt`. Она обучена для такого учебного изображения, не извлекает данные браузера или игры. Метаданные указывают Ultralytics 8.1.13 и AGPL-3.0; [условия модели](https://www.ultralytics.com/license) смотрите у автора. Не подменяйте её обычной COCO-моделью, ожидая тот же класс.

Загрузчик растягивает кадр до входа модели; обработчик результата возвращает рамки обратно в координаты обработанного изображения. `ToScreen`/`ToWindow` затем учитывают область захвата и её преобразования — масштабировать рамку вручную ещё раз не нужно. `Score` 0…1 — оценка модели, не доля площади и не измеренная вероятность правильного клика. Ошибка загрузки или захвата отличается от пустого списка предсказаний.

Прямоугольники принадлежат этому запуску: при выходе они освобождаются, затем canvas очищается, восстанавливаются настройки заимствованного API ввода и освобождаются OSD/CV. Кадры и изображения результата заимствованы — отдельно их не освобождают. `Log`, `GetService` и токен принадлежат `Script.csx`, не обычному C# классу. Для нативного варианта отрисовки есть [такой же учебный путь на ImGui](/ru/scripting/examples/advanced/aimtrainer-ml).
