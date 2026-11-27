---
title: Профилирование с использованием Computer Vision API
description: Измерение производительности
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-22T15:03:07.266Z
---
# Узнать, какой этап CV занимает время

Профилирование делит одну операцию на шаги: подготовку захвата, обработку кадра, поиск и показ результата. Начнём с 10 вызовов поиска цвета в своём окне. По отчёту в журнале видно, сколько ушло на первое создание ресурсов и сколько — на следующие проходы.

Нужен настольный EyeAuras с OpenCV и MiniProfiler. Для первого запуска хватит своего видимого окна с цветной картинкой — модель и файл образца не нужны.

## Записать ограниченную серию

1. Подготовьте окно и создайте действие **C# Script**. Вставьте весь код в `Script.csx`:

```csharp
using System;
using System.Drawing;
using System.Linq;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;
using StackExchange.Profiling;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    if (window == null || !window.IsWindow) { Log.Warn("Окно не выбрано или недоступно"); return; }
    cancellationToken.ThrowIfCancellationRequested();
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(window).EnableProfiling();
    const string operation = "color"; // color, image or ml
    const int iterations = 10;
    var roi = Rectangle.Empty; // whole selected window
    Point? lastPosition = null;
    using (cv.Profiler.Step("Warm-up")) lastPosition = FindCenter();
    try
    {
        for (var i = 0; i < iterations; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            using (cv.Profiler.Step($"Loop #{i + 1}"))
            {
                lastPosition = FindCenter();
            }
        }
        Log.Info(lastPosition.HasValue ? $"Last window position: {lastPosition}" : "No match in last frame");
    }
    finally
    {
        Log.Info(cv.Profiler.RenderPlainText());
    }

    Point? FindCenter()
    {
        switch (operation)
        {
            case "color":
                var point = cv.PixelSearch(Color.FromArgb(255, 87, 34), 95, roi);
                return point.IsEmpty ? null : point;
            case "image":
                var bounds = cv.ImageSearch(@"C:\Images\target.png", 95, roi);
                return bounds.IsEmpty ? null : bounds.Center();
            case "ml":
                var result = cv.MLSearchRaw(
                    "https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx",
                    confidenceThreshold: 30, iouThreshold: 40, region: roi);
                if (!result.Detected.Predictions.Any()) return null;
                return result.ToWindow(result.Detected.Predictions.First().Rectangle).ToWinRectangle().Center();
            default: throw new InvalidOperationException("Choose color, image or ml");
        }
    }
}
```

2. Нажмите **Run** и укажите своё окно. В журнале появятся `Warm-up`, 10 шагов `Loop` и внутренние этапы CV со временем в миллисекундах. Последняя позиция относится к выбранному окну.
3. Сначала смотрите на прогрев, потом на следующие проходы. Перед тем как сравнивать два запуска, запишите источник, размер окна, ROI, метод поиска, пороги и окружение. Каждый вызов берёт новый кадр, так что это замер всей цепочки CV, а не сравнение двух алгоритмов на одних и тех же пикселях.

| Настройка | Как выбрать |
| --- | --- |
| `operation = "color"` | Ищет первый пиксель RGB 255,87,34 с порогом 95%. Если такого цвета в окне нет, замеряется путь без совпадения. `Point.Empty` в этом API означает «не найдено», поэтому настоящую точку 0,0 от него не отличить. |
| `operation = "image"` | Заранее сохраните образец в `C:\Images\target.png` и покажите его в выбранном окне. Порог 95% — это сходство изображения. |
| `operation = "ml"` | Нужны учебный [Aim Trainer](/ru/scripting/examples/advanced/aimtracker-ml-ea) и совместимая среда выполнения ONNX. Ссылка ведёт на модель с классом `Tgt`. В первый вызов входит её загрузка и создание. |
| `roi` | `Rectangle.Empty` — весь захват окна. Свою область задавайте в оконных координатах, без экранного смещения. |
| `iterations` | 10 замеренных проходов после одного прогрева. Отчёт в `finally` выводит уже собранные шаги, даже если остановить скрипт внутри цикла. Ошибка в самом прогреве случается раньше этого блока. |

`EnableProfiling()` включает шаги, которые предусмотрены реализацией, и только для этого экземпляра CV. В `Refresh` могут входить захват, эффекты и распознавание: названия шагов не значат, что каждый этап замерен отдельно. В основном коде OSD отключён и ввода нет. [Подсчёт на одном кадре](/ru/scripting/examples/advanced/profiling-countpixels) — это другой пример.

Синхронные поиск и захват не принимают токен, Stop проверяется перед следующим проходом. Результаты и `Captured.InputImage` скрипту не принадлежат, отдельно освобождать их не нужно. CV освобождается после отчёта. Дерево замеров растёт в памяти.

<details>
<summary>Измерить отображение или собственную реакцию</summary>

Чтобы включить встроенную подсветку, замените создание CV на `.ForWindow(window).EnableProfiling().EnableOsd(fps: 10)`. В отчёте появятся шаги **OSD** — когда accessor действительно обновляет подсветку. Из-за ограничения FPS это происходит не на каждом проходе. Подсветка добавляет свою нагрузку.

Следующий **фрагмент** вставляется в основной `for`, сразу после `lastPosition = FindCenter()` внутри шага `Loop`. Тогда реакция будет на каждом проходе, где есть совпадение. Если нужна одна реакция, вставьте его после цикла, пока `cv` ещё жив. Используйте его только в своём учебном окне, которое не меняется, и с проверенным результатом: Windows Input активирует окно и двигает настоящий курсор. Для первого замера поиска этот фрагмент не добавляйте.

```csharp
var input = GetService<EyeAuras.Roxy.Api.ISendInputScriptingApi>();
var previousTarget = input.TargetWindow;
var previousSimulator = input.InputSimulatorId;
try
{
    input.TargetWindow = window;
    input.InputSimulatorId = "Windows Input";
    if (lastPosition.HasValue && window.IsForeground)
    {
        cancellationToken.ThrowIfCancellationRequested();
        using (cv.Profiler.Step("Mouse Move")) input.MouseMoveTo(lastPosition.Value);
        using (cv.Profiler.Step("Mouse Click")) input.MouseLeftClick(0);
    }
}
finally
{
    input.TargetWindow = previousTarget;
    input.InputSimulatorId = previousSimulator;
}
```

Движение и клик замеряются отдельными шагами, а не как часть поиска. `TargetWindow` задан, поэтому передаются оконные координаты, и ещё раз вызывать `ToScreen` было бы ошибкой. Между проверкой и вводом активное окно может смениться. Токен синхронный ввод не прерывает. Вставьте реакцию **перед** выводом отчёта, чтобы её закрытые шаги в него попали.

Для нескольких скриптов есть `IProfilerProvider.GetOrAdd(string name)` — общий профайлер с явным именем. Не смешивайте его с отдельным `cv.Profiler`, если хотите сравнивать независимые запуски. [MiniProfiler](https://miniprofiler.com/), [исходники](https://github.com/MiniProfiler/dotnet), [Step](https://miniprofiler.com/dotnet/HowTo/ProfileCode).

</details>

<details>
<summary>Сводная статистика текстом и HTML</summary>

Функции отчёта лежат в отдельном файле `ProfileReport.cs` в проекте скрипта. Для HTML нужна сборка **Mason.FluentHtml 3.0.1**. Это версия из текущего Blazor-хоста, в другом SDK-приложении её может не быть. Если ссылки нет, добавьте `#r "nuget:Mason.FluentHtml, 3.0.1"` в начало `Script.csx`. MiniProfiler остаётся зависимостью хоста.

После циклов, пока `cv` жив, замените текстовый вывод в `finally` этим **фрагментом**:

```csharp
Log.Info(cv.Profiler.RenderPlainText());
Log.Info(ProfileReport.RenderPerStepStatistics(cv.Profiler));
GetService<EyeAuras.Shared.Services.IAuraEventLoggingService>().LogMessage(
    new EyeAuras.Shared.Services.AuraEvent
    {
        Text = ProfileReport.RenderPerStepStatisticsHtml(cv.Profiler),
        IsHtml = true,
        Loglevel = PoeShared.Logging.FluentLogLevel.Info
    });
```

Полный `ProfileReport.cs`:

```csharp
using System.Linq;
using System.Text;
using StackExchange.Profiling;
using Mason.FluentHtml;

public static class ProfileReport
{
    public static string RenderPerStepStatistics(MiniProfiler profiler)
    {
        if (profiler == null || profiler.Root == null)
        {
            return "No profiling data available.";
        }

        // Aggregate data across all loops
        var timingsByStep = profiler.Root.Children
            .SelectMany(loopTiming => loopTiming.Children)
            .GroupBy(t => t.Name)
            .ToDictionary(
                group => group.Key,
                group => group
                    .Select(t => t.DurationMilliseconds)
                    .Where(duration => duration.HasValue)
                    .Select(duration => duration.Value)
                    .ToList()
            );

        if (!timingsByStep.Any())
        {
            return "No valid step data found.";
        }

        var reportBuilder = new StringBuilder();
        reportBuilder.AppendLine("---- PER-STEP PROFILING STATS ----");

        foreach (var (stepName, durations) in timingsByStep)
        {
            if (!durations.Any()) continue;

            // Statistics calculations
            var totalIterations = durations.Count;
            var totalDuration = durations.Sum();
            var average = durations.Average();
            var min = durations.Min();
            var max = durations.Max();

            // Percentile Calculation
            var sortedDurations = durations.OrderBy(x => x).ToList();
            var percentile1 = sortedDurations[(int)(totalIterations * 0.01)];
            var percentile99 = sortedDurations[(int)(totalIterations * 0.99)];

            reportBuilder.AppendLine($@"
    [{stepName}]
    Total Iterations: {totalIterations}
    Total Duration: {totalDuration:F2} ms
    Average Duration: {average:F2} ms
    Min Duration: {min:F2} ms
    Max Duration: {max:F2} ms
    1% Percentile: {percentile1:F2} ms
    99% Percentile: {percentile99:F2} ms
    ---------------------------");
        }

        return reportBuilder.ToString();
    }


    public static string RenderPerStepStatisticsHtml(MiniProfiler profiler)
    {
        if (profiler == null || profiler.Root == null)
        {
            return "<p>No profiling data available.</p>";
        }

        var timingsByStep = profiler.Root.Children
            .SelectMany(loopTiming => loopTiming.Children)
            .GroupBy(t => t.Name)
            .ToDictionary(
                group => group.Key,
                group => group
                    .Select(t => t.DurationMilliseconds)
                    .Where(duration => duration.HasValue)
                    .Select(duration => duration.Value)
                    .ToList()
            );

        if (!timingsByStep.Any())
        {
            return "<p>No valid step data found.</p>";
        }

        var htmlBuilder = new HtmlBuilder();

        htmlBuilder.Table(new { @class = "table table-striped table-bordered" }, table =>
        {
            table.Thead(thead =>
            {
                thead.Tr(tr =>
                {
                    tr.Th(th => th.Content("Step Name"));
                    tr.Th(th => th.Content("Iterations"));
                    tr.Th(th => th.Content("Total Duration (ms)"));
                    tr.Th(th => th.Content("Average (ms)"));
                    tr.Th(th => th.Content("Min (ms)"));
                    tr.Th(th => th.Content("Max (ms)"));
                    tr.Th(th => th.Content("1% Percentile (ms)"));
                    tr.Th(th => th.Content("99% Percentile (ms)"));
                });
            });

            table.Tbody(tbody =>
            {
                foreach (var (stepName, durations) in timingsByStep)
                {
                    if (!durations.Any()) continue;

                    var totalIterations = durations.Count;
                    var totalDuration = durations.Sum();
                    var average = durations.Average();
                    var min = durations.Min();
                    var max = durations.Max();

                    var sortedDurations = durations.OrderBy(x => x).ToList();
                    var percentile1 = sortedDurations[(int)(totalIterations * 0.01)];
                    var percentile99 = sortedDurations[(int)(totalIterations * 0.99)];

                    tbody.Tr(tr =>
                    {
                        tr.Td(td => td.Content(stepName));
                        tr.Td(td => td.Content(totalIterations.ToString()));
                        tr.Td(td => td.Content(totalDuration.ToString("F2")));
                        tr.Td(td => td.Content(average.ToString("F2")));
                        tr.Td(td => td.Content(min.ToString("F2")));
                        tr.Td(td => td.Content(max.ToString("F2")));
                        tr.Td(td => td.Content(percentile1.ToString("F2")));
                        tr.Td(td => td.Content(percentile99.ToString("F2")));
                    });
                }
            });
        });

        return htmlBuilder.ToString();
    }
}
```

Функции группируют по имени шаги, которые лежат сразу под шагами корня, пропускают незавершённые `DurationMilliseconds` и берут 1-й и 99-й процентили из отсортированного списка. Если вложенность у вас другая, поправьте выборку под неё. Обычный класс получает `MiniProfiler` параметром, глобальные `Log`/`GetService` ему недоступны.

![HTML-отчёт из прежнего примера](https://s3.eyeauras.net/media/2025/03/JxiAlxDqzw9sxCOc.png)

</details>

<details>
<summary>Исторический вывод от 22 марта 2025</summary>

Эти числа получены на **DESKTOP-PK81KT3** в прежнем цикле с ML, OSD, движением и кликом. Одна строка в отрывке сокращена. Смотрите на них как на пример дерева и сводного формата.

```text
[Script] Performance stats:
DESKTOP-PK81KT3 at 3/22/2025 2:28:50 PM
Test1\ImageFind CV Profiler 0ms
>> Loop #1 3,084.42ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Creation 2,272.84ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Preparations 2.19ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Refresh 744.23ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - OSD 24.12ms
>>>> Mouse Move 22.17ms
>>>> Mouse Click 13.5ms
>> Loop #2 33.77ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Resolution 0.46ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Preparations 0.15ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Refresh 24.69ms
>>>> Mouse Move 0.73ms
>>>> Mouse Click 7.38ms
>> Loop #3 24.11ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Resolution 0ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Preparations 0.1ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Refresh 16.32ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - OSD 0.79ms
>>>> Mouse Mov...ations 0.11ms
>>>> MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Refresh 21.66ms
>>>> Mouse Move 0.58ms
>>>> Mouse Click 10.52ms
```

```text
[Mouse Click]
Total Iterations: 766
Total Duration: 5672.19 ms
Average Duration: 7.40 ms
Min Duration: 1.33 ms
Max Duration: 28.64 ms
1% Percentile: 4.14 ms
99% Percentile: 14.05 ms
---------------------------

[MLSearchRaw - FindMLKey { ThreadId = 63, ModelPathOrUrl = https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx } - Resolution]
Total Iterations: 769
Total Duration: 2.29 ms
Average Duration: 0.00 ms
Min Duration: 0.00 ms
Max Duration: 0.46 ms
1% Percentile: 0.00 ms
99% Percentile: 0.08 ms
```

</details>
