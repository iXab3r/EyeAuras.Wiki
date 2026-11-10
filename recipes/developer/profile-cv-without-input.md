---
title: "Separate CV capture cost from ten same-frame passes"
description: "Warm up capture separately, measure ten new-frame searches and then count pixels ten times on one owned copy."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Separate CV capture cost from ten same-frame passes

Find out whether time is spent obtaining a frame or processing its pixels. The first group requests ten capture/search operations; the second counts the same saved frame ten times. They answer different questions.

You need desktop EyeAuras with its registered CV/capture services and compatible native Emgu CV **4.9.0.5494** and MiniProfiler **4.3.8** dependencies. Use the host's existing assemblies rather than adding a different native Emgu package. Prepare a local, non-sensitive window you own.

1. Save the complete **status.html** below in your own folder and open that physical file in your browser. Keep its orange rectangle visible at a fixed zoom and window size, unobscured and not minimized. No model or external website is needed.
2. Create `RecipeCvTiming` through **Add new → New Aura → Actions → On Enter → C# Script**. Replace **Script.csx** with the complete file below. Use manual **Run** and the action's **Event Log**.
3. When the window picker appears, select the window containing your orange sample. A missing or invalid selection ends the script before creating a window accessor. The picker has no token parameter; cancellation is checked immediately after it returns.
4. Read the capture/search entries, then the same-frame counts and final profiler report. Each measured group has exactly **10** passes; capture warm-up and count warm-up are outside their respective measured groups. Profiler durations are in milliseconds.
5. Repeat with the same window size and capture conditions before comparing results. **Stop** is checked between synchronous operations. It need not interrupt an operation already running; leaving the block releases the owned frame copy and accessor.

| Output | Interpretation |
| --- | --- |
| `New capture/search` | Includes requesting a refreshed window image and exact-color search, with nested profiler stages. It is not a pixel-loop-only benchmark. |
| `Same owned frame/count` | Reads one copied BGR image repeatedly, excluding new capture from those steps. |
| Orange count | Exact bytes `R=255, G=87, B=34`; zero is valid if the actual captured pixels differ. |

The rectangle's CSS dimensions do not prescribe an exact screenshot pixel count: zoom, DPI, capture method and surrounding window content matter. The window search returns window-relative points; `Point.Empty` is also its no-result marker and should not be interpreted as a confirmed top-left detection. The counting helper returns a count, not a confidence score.

The callback image is borrowed. Only `image.Copy()` leaves the callback, and the script disposes that copy. The synchronous helper respects row stride and keeps its byte span inside the call; no span crosses an await. Use [capture settings](/en/triggers/images/imagecapturetriggers) to resolve a wrong/black frame, and [same-frame profiling](/en/scripting/examples/advanced/profiling-countpixels) for algorithm comparisons.

## status.html

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Owned CV sample</title>
<style>
body { margin: 32px; background: #000; color: #fff; }
#sample { width: 80px; height: 40px; background: rgb(255, 87, 34); }
</style>
<div id="sample"></div>
<p>Owned orange sample</p>
</html>
```

## Script.csx

```csharp
using System;
using System.Drawing;
using Emgu.CV;
using Emgu.CV.Structure;
using EyeAuras.OpenCVAuras.Scaffolding;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Osd;
using StackExchange.Profiling;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    cancellationToken.ThrowIfCancellationRequested();
    if (window == null || !window.IsWindow)
    {
        Log.Info("No live source window selected");
        return;
    }
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(window).EnableProfiling();
    var target = Color.FromArgb(255, 87, 34);
    try
    {
        using (cv.Profiler.Step("Warm-up: capture and search"))
            cv.PixelSearch(target, 100, Rectangle.Empty);
        for (var i = 1; i <= 10; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            Point point;
            using (cv.Profiler.Step($"New capture/search {i}"))
                point = cv.PixelSearch(target, 100, Rectangle.Empty);
            Log.Info($"Capture/search {i}: {point}");
        }
        cancellationToken.ThrowIfCancellationRequested();
        using var frame = cv.ProcessPixels<Image<Bgr, byte>>(image => image.Copy());
        CountOrange(frame);
        for (var i = 1; i <= 10; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int count;
            using (cv.Profiler.Step($"Same owned frame/count {i}"))
                count = CountOrange(frame);
            Log.Info($"Frame {frame.Size}; pass {i}; exact orange pixels: {count}");
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally { Log.Info(cv.Profiler.RenderPlainText()); }
}

static int CountOrange(Image<Bgr, byte> image)
{
    var rows = image.Mat.AsReadOnlySpan2D<byte>();
    var count = 0;
    for (var y = 0; y < image.Height; y++)
        for (var x = 0; x < image.Width; x++)
        {
            var offset = x * 3;
            if (rows[y, offset] == 34 && rows[y, offset + 1] == 87 &&
                rows[y, offset + 2] == 255) count++;
        }
    return count;
}
```
