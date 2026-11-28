---
title: Profiling with Computer Vision API
description: measuring performance
published: true
date: 2025-10-19T16:05:00.000Z
tags: scripting, profiling, ai-translated
editor: markdown
dateCreated: 2025-03-22T15:03:07.266Z
---
# Find which stage of a CV operation takes time

Profiling splits one operation into measured steps. Start with 10 colour searches in your own window. The report in the event log shows how much time went into creating resources on first use and how much into the later passes.

You need desktop EyeAuras with OpenCV and MiniProfiler. For the first run, a visible window of your own with a coloured image is enough. No model or template file is needed. This is a **C# Script** action, not an ordinary C# class.

## Record a bounded series

1. Prepare the window and add a **C# Script** action. Paste the whole code into `Script.csx`:

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
    if (window == null || !window.IsWindow) { Log.Warn("No valid window selected"); return; }
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

2. Click **Run** and select your window. The report has **Warm-up**, 10 **Loop** steps and the internal CV stages, with times in milliseconds. The last position is relative to the selected window. **No match** describes the last frame.
3. Look at warm-up first, then at the later passes. Before you compare two runs, write down the source, window size, ROI, operation, thresholds and environment. Every call takes a new frame, so this measures the whole CV pipeline, not two algorithms on the same pixels.

| Setting | How to choose it |
| --- | --- |
| `operation = "color"` | Finds the first RGB 255,87,34 pixel at 95% similarity. If the window has no such colour, the no-match path is measured. `Point.Empty` means "not found" in this API, so it cannot be told apart from a real match at 0,0. |
| `operation = "image"` | Save your template to `C:\Images\target.png` beforehand and show it in the selected window. The 95% threshold is image similarity. |
| `operation = "ml"` | Needs your own [Aim Trainer session](/en/scripting/examples/advanced/aimtracker-ml-ea), its external `Tgt` model and a compatible ONNX Runtime setup. The first call includes loading and creating the model. |
| `roi` | `Rectangle.Empty` is the whole capture of the selected window. Set your own region in window coordinates, without a desktop offset. |
| `iterations` | Ten measured passes after one warm-up. The report in `finally` prints the steps collected so far, even if you stop the script inside the loop. A failure in the warm-up itself happens before that block. |

`EnableProfiling()` turns on the timing points that the implementation provides, and only for this CV instance. A **Refresh** step can include capture, effects and detection: the step names do not mean every stage is timed separately. In the main code OSD is off and no input is sent. [Counting pixels on one frame](/en/scripting/examples/advanced/profiling-countpixels) is a different example.

Synchronous capture and search do not take the token. Stop is checked before the next pass. Results and `Captured.InputImage` do not belong to the script, so do not dispose them separately. CV is released after the report. The timing tree grows in memory.

<details>
<summary>Measure display or your own reaction</summary>

To turn on built-in highlighting, create CV with `.ForWindow(window).EnableProfiling().EnableOsd(fps: 10)`. The report gets **OSD** steps when the highlighting is actually updated. Because of the FPS limit, that does not happen on every pass. Highlighting adds its own load.

The following **fragment** goes into the main `for`, right after `lastPosition = FindCenter()` inside **Loop**. Then the reaction runs on every pass with a match. For a single reaction, put it after the loop while CV is still alive. Use it only in your own stable training window and with a verified result: Windows Input activates the window and moves and clicks the real cursor. Leave it out for a search-only measurement.

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

Movement and click are measured as separate steps. `TargetWindow` is set, so window coordinates are passed, and calling `ToScreen` again would convert twice. The active window can change between the check and the input. The token does not interrupt synchronous input. Put the reaction before the report output so that its finished steps are included.

For several scripts there is `IProfilerProvider.GetOrAdd(string name)`, a shared profiler with an explicit name. Keep independent runs out of that shared tree if you want to compare them. The implementation uses [MiniProfiler](https://miniprofiler.com/). See its [source](https://github.com/MiniProfiler/dotnet) and [Step guide](https://miniprofiler.com/dotnet/HowTo/ProfileCode).

</details>

<details>
<summary>Aggregate a report as text or HTML</summary>

Create `ProfileReport.cs` in the same script project with the full helper below. HTML output needs **Mason.FluentHtml 3.0.1**. That is the version in the current host, and another SDK host may not have it. If the reference is missing, add `#r "nuget:Mason.FluentHtml, 3.0.1"` at the top of `Script.csx`. MiniProfiler stays a host dependency (**4.3.8** in this setup).

After the loops, while CV is still alive, replace the report output in `finally` with this **fragment**:

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

The full `ProfileReport.cs`:

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

The helpers group by name the finished timings that sit directly under the root steps, skip unfinished `DurationMilliseconds` and take the 1st and 99th percentiles from the sorted list. If your nesting is different, adjust the selection to it. The ordinary class gets `MiniProfiler` as a parameter. The global `Log`/`GetService` are not available to it.

![HTML profiling report](https://s3.eyeauras.net/media/2025/03/JxiAlxDqzw9sxCOc.png)

</details>

<details>
<summary>Historical output from 22 March 2025</summary>

These numbers come from **DESKTOP-PK81KT3** and the earlier loop with ML, OSD, movement and click. One line in the excerpt is truncated. Treat them as an example of the timing tree and the summary format.

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
