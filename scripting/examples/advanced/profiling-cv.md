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

Profiling breaks work into measured steps. Start with 10 colour searches in your own window: the event-log report separates first-use resource creation from later passes, without adding mouse movement to the measurement.

Use desktop EyeAuras with OpenCV and MiniProfiler. The first run needs only a visible coloured image in your own window; no model or template file. This is a **C# Script** action, not an ordinary C# class.

## Record a bounded series

1. Prepare the window and add **C# Script**. Paste the complete program into `Script.csx`:

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

2. Click **Run** and select your window. The report contains **Warm-up**, 10 **Loop** steps and instrumented CV stages, in milliseconds. The last position is window-relative; **No match** describes the last frame.
3. Compare warm-up separately from later passes. Record source, window size, ROI, operation, thresholds and environment. Each call gets a new frame: this measures a CV pipeline, not two algorithms on identical pixels.

| Setting | How to choose it |
| --- | --- |
| `operation = "color"` | Finds the first RGB 255,87,34 pixel at 95% similarity. An absent colour measures the no-match path. `Point.Empty` is this API's no-result marker and is ambiguous with a match at 0,0. |
| `operation = "image"` | Save your actual template to `C:\Images\target.png` and show it in the selected window. The 95% threshold is image similarity. |
| `operation = "ml"` | Requires your own [Aim Trainer session](/en/scripting/examples/advanced/aimtracker-ml-ea), its external `Tgt` model and compatible ONNX Runtime setup. The first call includes loading/creation. |
| `roi` | `Rectangle.Empty` means the whole selected-window capture. Your custom region uses window coordinates, without a desktop offset. |
| `iterations` | Ten measured passes after one warm-up. `finally` reports collected steps on exit from the loop, including cancellation; a warm-up failure occurs before that block. |

`EnableProfiling()` enables implemented timing points on this accessor. A **Refresh** step can include capture, effects and detection; its name does not mean each sub-operation has a separate timer. The main program has OSD disabled and sends no input. [Count pixels on one frame](/en/scripting/examples/advanced/profiling-countpixels) for a different comparison.

Synchronous capture/search receives no Run token: Stop is checked before the next pass. Results and `Captured.InputImage` are borrowed and must not be disposed separately. CV is released after reporting. The live timing tree grows in memory; the report storage's 60-minute TTL does not bound that tree.

<details>
<summary>Measure display or your own reaction</summary>

To include built-in highlighting, create CV with `.ForWindow(window).EnableProfiling().EnableOsd(fps: 10)`. **OSD** steps appear when highlighting actually updates; its FPS limit means this need not happen on every pass. Rendering adds work.

The following **fragment** goes in the main `for`, immediately after `lastPosition = FindCenter()` inside **Loop**, for a reaction on each suitable pass. For one reaction, place it after the loop while CV remains alive. Add it only after verifying the result in your own stable training window: Windows Input activates its recipient and moves/clicks the real cursor. Leave it out for a search-only measurement.

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

Movement and click get separate steps. The input target is set, so these are window coordinates; another `ToScreen` would convert twice. Focus can change after checking it, and the synchronous input cannot be interrupted by the Run token. Put the reaction before report output so its completed steps are included.

For several scripts, `IProfilerProvider.GetOrAdd(string name)` provides an explicitly named shared profiler. Keep independent runs separate from that shared tree. The implementation uses [MiniProfiler](https://miniprofiler.com/); see its [source](https://github.com/MiniProfiler/dotnet) and [Step guide](https://miniprofiler.com/dotnet/HowTo/ProfileCode). A namespace import supplies types/extensions, not every runtime service in an arbitrary host.

</details>

<details>
<summary>Aggregate a report as text or HTML</summary>

Create `ProfileReport.cs` in the same script project with the full helper below. HTML output requires **Mason.FluentHtml 3.0.1**, the host's dependency version rather than a promise for every SDK host. If missing, put `#r "nuget:Mason.FluentHtml, 3.0.1"` at the beginning of `Script.csx`. MiniProfiler remains a host dependency (**4.3.8** in this setup).

After the loops, while CV is alive, replace the `finally` report output with this **fragment**:

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

Complete `ProfileReport.cs`:

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

The helpers group completed direct child timings of root steps by name, skip unfinished `DurationMilliseconds`, and choose sorted-sample indices for the 1st/99th percentiles. That is one aggregation strategy, not universal statistics for every tree depth. Change the selection deliberately for another nesting. The ordinary class receives `MiniProfiler`; it has no ambient `Log`/`GetService`.

![HTML report from the earlier example](https://s3.eyeauras.net/media/2025/03/JxiAlxDqzw9sxCOc.png)

</details>

<details>
<summary>Historical output from 22 March 2025</summary>

These numbers from **DESKTOP-PK81KT3** belong to the earlier ML/OSD/move/click loop. One line is truncated in the original excerpt; frame, hardware and load are not fully recorded. It illustrates timing-tree and aggregate formats, not a run of this page's current program or a speed target for your host.

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
