---
title: Profiling with Computer Vision API
description: measuring performance
published: true
date: 2025-10-19T16:05:00.000Z
tags: 
editor: markdown
dateCreated: 2025-03-22T15:03:07.266Z
---

# First things first — what is it?
Any task is usually broken down into a set of small steps — find an image, move the mouse, click, load an ML model, etc. Each step costs some amount of resources. By measuring exactly how much time we spend on each operation, we can understand where to tighten the screws or optimize, and where things are already fine. This process is called profiling.

# Let’s look at the results right away
With profiling you can get precise measurements — how many times a method was called, average call time, distribution of results, etc.

Moreover, the output format can be anything you want — you decide what’s interesting to you. For example, for our aim bot that uses a while loop, we can measure how much time each operation takes on each iteration.
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

Or we can measure aggregated values:
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

Or even render the same results as a table:
![Profiling](https://s3.eyeauras.net/media/2025/03/JxiAlxDqzw9sxCOc.png)

There are plenty of options.

# Tool — MiniProfiler
EyeAuras uses one of the best "internal" profilers available — https://miniprofiler.com/.
It was created by the same team behind https://stackoverflow.com/ and is battle-tested over the years.
You can read more [here (github)](https://github.com/MiniProfiler/dotnet) or [here (docs)](https://miniprofiler.com/dotnet/HowTo/ProfileCode).

To start using it, just add the namespace `using StackExchange.Profiling;`. Technically that already gives you full access to its API, but EyeAuras, as usual, offers a few extra helpers to make life easier. One of these helpers is built into the [Computer Vision API](/scripting/api/IComputerVisionExperimentalScriptingApi).

## Getting started
To enable profiling for the [CV API](/scripting/api/IComputerVisionExperimentalScriptingApi), simply call `EnableProfiling`, and it will start recording timings for all methods of this API — every operation will be recorded.

```csharp
var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)  
    .EnableProfiling() // enable profiling
    .EnableOsd(fps: 10); 
```

> Important! `EnableProfiling` turns on timings only for this particular [CV API](/scripting/api/IComputerVisionExperimentalScriptingApi) instance, in this specific script. If you want to profile several scripts at once, use `IProfilerProvider` with `MiniProfiler GetOrAdd(string name)` — pick a unique name for your profiler and share it across multiple scripts.

## Add timings for your own code
If you enabled profiling in the [CV API](/scripting/api/IComputerVisionExperimentalScriptingApi), EyeAuras will start recording internal steps on each call. Usually, besides these internal steps, you’ll want to record your own actions too, like mouse movement, logic calculations, etc.
This is extremely simple — in the [CV API](/scripting/api/IComputerVisionExperimentalScriptingApi) just use `Step` and wrap the section being measured in a `using` block, for example:

```csharp
using(cv.Profiler.Step($"Mouse Move"))
{
    sendInput.MouseMoveTo(movePosition);
}
```

## Outputting results
All timings are kept in memory and structured as a tree — each measured step can have several substeps measured separately.
At some point you’ll probably want to render and analyze these data. To do that you can use:
- Built-in method `RenderPlainText`
- Or write your own renderer — for example, I’ve added two helpers `RenderPerStepStatisticsHtml` and `RenderPerStepStatistics`
ChatGPT handles tasks like this very well — both methods were authored by it. It knows MiniProfiler and how to extract data, so you only need to describe the output you want.

## Memory consumption
Important! All profiling results are stored in memory. If you do nothing, that memory will eventually be exhausted, which is why recording is usually limited either by time ("store the last 10 minutes") or by memory ("store up to 500 MB"). By default, the profiler configured in the [CV API](/scripting/api/IComputerVisionExperimentalScriptingApi) keeps the last `60 minutes`. Configuration knobs for this will be added later.

# Example

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
    .EnableOsd(fps: 10); //with enabled on-screen-display refreshed @ 10 fps

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
    while (true)
    {
        loopIdx++;
     
        using var _ = cv.Profiler.Step($"Loop #{loopIdx}");
     
        var result = cv.MLSearchRaw(mlModelPath, new Rectangle(719, 406, 988, 584));
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
    var targetImagePath = @"C:\\Users\\Xab3r\\Documents\\ShareX\\Screenshots\\2025-03\\uupb4m3RQkfHa8sv.png";

    var loopIdx = 0;
    while (true)
    {
        loopIdx++;
      
        using var _ = cv.Profiler.Step($"Loop #{loopIdx}");
       
        var position = cv.ImageSearch(targetImagePath, new Rectangle(714, 397, 999, 598));
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
    var targetImagePath = @"C:\\Users\\Xab3r\\Documents\\ShareX\\Screenshots\\2025-03\\uupb4m3RQkfHa8sv.png";

    var loopIdx = 0;
    while (true)
    {
        loopIdx++;

        using var _ = cv.Profiler.Step($"Loop #{loopIdx}");

        var position = cv.PixelSearch(Color.FromArgb(255, 87, 34), new Rectangle(714, 397, 999, 598));
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