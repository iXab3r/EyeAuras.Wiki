---
title: Профилирование с использованием Computer Vision API
description: Измерение производительности
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-22T15:03:07.266Z
---
# Сначала главное — что это такое

Начните с короткого блока «Быстрый старт» в верхнеуровневом `C# Script` EyeAuras: вход — окно `Aim Trainer`, выход — размер кадра и текстовый отчёт в журнале. Ниже сохранён расширенный учебный пример с движением мыши и форматированием отчёта; это отдельный вариант, запускать оба блока подряд не требуется.

Любую задачу обычно можно разбить на набор небольших шагов: найти изображение, передвинуть мышь, кликнуть, загрузить ML-модель и т. д. Каждый такой шаг потребляет ресурсы. Если точно измерять, сколько времени уходит на каждую операцию, становится понятно, где стоит подтянуть производительность, а где и так всё в порядке. Этот процесс называется профилированием.

## Посмотрим на результат

Профилирование записывает длительность отмеченных шагов. Подсчёт вызовов и статистику в этом примере строят вспомогательные методы ниже; незавершённые шаги без DurationMilliseconds пропускаются.

Причём формат вывода может быть любым — вы сами решаете, что именно хотите анализировать. Например, для аим-бота с циклом `while` можно измерять, сколько времени занимает каждая операция на каждой итерации.

```bash
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

А можно выводить агрегированные значения:

```bash
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

Или даже отображать те же данные в виде таблицы:

![Профилирование](https://s3.eyeauras.net/media/2025/03/JxiAlxDqzw9sxCOc.png)

Вариантов здесь много.

## Инструмент — MiniProfiler

В EyeAuras используется один из лучших «внутренних» профилировщиков — https://miniprofiler.com/.  
Его создала та же команда, что стоит за https://stackoverflow.com/, и он уже много лет проверен в реальных проектах. Подробнее можно почитать [здесь (github)](https://github.com/MiniProfiler/dotnet) или [здесь (docs)](https://miniprofiler.com/dotnet/HowTo/ProfileCode).

Чтобы начать им пользоваться, достаточно подключить namespace `using StackExchange.Profiling;`. Формально этого уже хватает для доступа ко всему API, но EyeAuras, как обычно, добавляет несколько удобных хелперов. Один из них встроен в [Computer Vision API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi).

## Быстрый старт

Чтобы включить профилирование для [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi), вызовите `EnableProfiling`. После этого accessor записывает предусмотренные реализацией внутренние шаги CV; это не перехват любого метода приложения.

```csharp
var targetWindow = GetService<IWindowSelector>().GetWindow("Aim Trainer");
using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)
    .EnableProfiling();
cv.ProcessPixels(image => Log.Info($"Frame: {image.Size}"));
Log.Info(cv.Profiler.RenderPlainText());
```

> Важно! `EnableProfiling` включает тайминги только для этого конкретного экземпляра [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi) и только в рамках текущего скрипта. Если вы хотите профилировать сразу несколько скриптов, используйте `IProfilerProvider` вместе с `MiniProfiler GetOrAdd(string name)` — выберите уникальное имя профайлера и используйте его совместно в нескольких скриптах.

## Как добавить замеры для своего кода

Если вы включили профилирование в [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi), EyeAuras начнёт автоматически записывать внутренние шаги каждого вызова. Но обычно, помимо внутренних этапов, хочется замерять и свои действия: движение мыши, вычисления, собственную логику и т. п.

Делается это очень просто: в [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi) используйте `Step` и оборачивайте измеряемый участок в `using`, например так:

```csharp
using(cv.Profiler.Step($"Mouse Move"))
{
    sendInput.MouseMoveTo(movePosition);
}
```

## Как вывести результаты

Все тайминги хранятся в памяти и организованы в виде дерева: у каждого измеренного шага может быть несколько вложенных подшагов.

В какой-то момент вы наверняка захотите отрисовать и проанализировать эти данные. Для этого можно использовать:

- встроенный метод `RenderPlainText`
- или написать свой рендерер — например, я добавил два хелпера: `RenderPerStepStatisticsHtml` и `RenderPerStepStatistics`

ChatGPT отлично справляется с такими задачами — оба этих метода были написаны им. Он знает MiniProfiler и умеет извлекать из него данные, поэтому вам достаточно просто описать желаемый формат вывода.

## Потребление памяти

Важно! Все результаты профилирования хранятся в памяти. Если ничего с этим не делать, память со временем закончится, поэтому запись обычно ограничивают либо по времени («хранить последние 10 минут»), либо по объёму («хранить до 500 MB»). В CV accessor срок 60 минут задан для storage-кэша отчётов; он не ограничивает автоматически дерево таймингов текущего живого профайлера. Не оставляйте запись бесконечной.

## Пример

Расширенный вариант рассчитан на учебный Aim Trainer, доступный ONNX по указанному URL и загруженные сборки `StackExchange.Profiling` и `Mason.FluentHtml` (пространство имён для `HtmlBuilder`). Последняя нужна только для HTML-таблицы; её наличие в произвольном хосте не предполагается. `MLSearchLoop` делает до 10 итераций; для альтернативы замените один вызов на `ImageSearchLoop` или `ColorSearchLoop`. Для поиска картинки заранее создайте `C:\Images\target.png`. Прямоугольники ROI в коде — входы для конкретного расположения окна, замените их своей областью.

```csharp
using System.Text;
using StackExchange.Profiling;
using Mason.FluentHtml;

Log.Info("Hello, World!");

//this is an example of a script
//which uses image search to find and follow a specific image inside a window
//It uses 2-times probing for optimization - if we know the previous location of the image
//it makes sense to repeat the search in that specific region first

//picking a window
var windowSelector = GetService<IWindowSelector>();
windowSelector.TargetWindow = "Aim Trainer";
var targetWindow = windowSelector.ActiveWindow ?? throw new InvalidOperationException("Window not found");

//this API is used to do Computer Vision stuff (image/text/color/ml search)
var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)  //for a specific window
    .EnableProfiling()
    .EnableOsd(fps: 10)
    .AddTo(ExecutionAnchors);

//this API is used to generate mouse movements
var sendInput = GetService<ISendInputScriptingApi>();
sendInput.TargetWindow = targetWindow; //for a specific window

//repeat until stopped
MLSearchLoop();
//or
//ImageSearchLoop();
//or
//ColorSearchLoop();

Log.Info($"Performance stats:\n{cv.Profiler.RenderPlainText()}");
Log.Info($"Performance stats(aggregated):\n{RenderPerStepStatistics(cv.Profiler)}");

GetService<IAuraEventLoggingService>()
    .LogMessage(new AuraEvent(){
        Text = RenderPerStepStatisticsHtml(cv.Profiler),
        IsHtml = true,
        Loglevel = FluentLogLevel.Info
    });

private void MLSearchLoop()
{
    //files could be either paths or URLs
    var mlModelPath = @"https://s3.eyeauras.net/media/2025/03/AimLab_20240213193604OOBfW2f00U5K.onnx";
   
    var loopIdx = 0;
    while (!cancellationToken.IsCancellationRequested && loopIdx < 10)
    {
        loopIdx++;
     
        using var _ = cv.Profiler.Step($"Loop #{loopIdx}");
     
        var result = cv.MLSearchRaw(mlModelPath, region: new Rectangle(719, 406, 988, 584));
        if (!result.Detected.Predictions.Any())
        {
            //not found
            continue;
        }

        var currentPosition = result.Detected.Predictions.First().Rectangle.Transform(result.ViewportTransforms.WorldToWindow);
        Log.Info($"Found via ML @ {currentPosition}");

        if (!currentPosition.IsEmpty)
        {
            //found the image - moving the mouse to the center
           
           var movePosition = currentPosition.ToWinRectangle().Center();
           using (cv.Profiler.Step($"Mouse Move"))
           {
               sendInput.MouseMoveTo(movePosition);
           }

           using (cv.Profiler.Step($"Mouse Click"))
           {
               sendInput.MouseLeftClick(0);
           }
        }
    }
}

private void ImageSearchLoop()
{
    var targetImagePath = @"C:\Images\target.png";

    var loopIdx = 0;
    while (!cancellationToken.IsCancellationRequested && loopIdx < 10)
    {
        loopIdx++;
      
        using var _ = cv.Profiler.Step($"Loop #{loopIdx}");
       
        var position = cv.ImageSearch(targetImagePath, region: new Rectangle(714, 397, 999, 598));
        if (position.IsEmpty)
        {
            //not found
            continue;
        }

        Log.Info($"Found via ImageSearch @ {position}");
        //found the image - moving the mouse to the center
        var movePosition = position.Center();
        using (cv.Profiler.Step($"Mouse Move"))
        {
            sendInput.MouseMoveTo(movePosition);
        }

        using (cv.Profiler.Step($"Mouse Click"))
        {
            sendInput.MouseLeftClick(0);
        }
    }
}


private void ColorSearchLoop()
{
    var targetImagePath = @"C:\Images\target.png";

    var loopIdx = 0;
    while (!cancellationToken.IsCancellationRequested && loopIdx < 10)
    {
        loopIdx++;

        using var _ = cv.Profiler.Step($"Loop #{loopIdx}");

        var position = cv.PixelSearch(Color.FromArgb(255, 87, 34), region: new Rectangle(714, 397, 999, 598));
        if (position.IsEmpty)
        {
            //not found
            continue;
        }

        Log.Info($"Found via ColorSearch@ {position}");
        //found the image - moving the mouse to the center

        using (cv.Profiler.Step($"Mouse Move"))
        {
            sendInput.MouseMoveTo(position);
        }

        using (cv.Profiler.Step($"Mouse Click"))
        {
            sendInput.MouseLeftClick(0);
        }
    }
}

public string RenderPerStepStatistics(MiniProfiler profiler)
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


public string RenderPerStepStatisticsHtml(MiniProfiler profiler)
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
```

В расширенном варианте `sendInput.TargetWindow` задан, поэтому ML-прямоугольник преобразуется через `WorldToWindow`. Упрощённые `ImageSearch`/`PixelSearch` для `ForWindow` также возвращают оконные координаты. Обёртка ввода переводит их в экранные; повторный `ToScreen` здесь был бы ошибкой. Пустой результат пропускает ввод, ошибки CV могут прервать скрипт. У ML без явных порогов confidence 30%, IoU 40%; у поиска картинки/цвета — 95%. Это пороги алгоритмов, а не гарантия правильного совпадения.

Остановка проверяется между проходами, не внутри синхронного распознавания или ввода. При обычном завершении 10 проходов печатается отчёт; при остановке/ошибке его вывод не гарантирован. Память дерева таймингов текущего профайлера и кэш хранения отчётов — разные вещи: TTL 60 минут у storage не обещает ограничение дерева живого профайлера. Для долгого наблюдения ограничивайте сам период сбора.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
