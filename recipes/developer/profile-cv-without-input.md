---
title: "Separate CV capture cost from ten same-frame passes"
description: "Warm up capture separately, time ten searches on new frames, then count pixels ten times on one saved copy."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Separate CV capture cost from ten same-frame passes

This recipe shows where the time goes: getting a frame or processing its pixels. The first group captures a frame and searches it for a colour ten times. The second counts pixels in one saved copy ten times.

You need desktop EyeAuras with its registered CV and capture services and compatible native Emgu CV **4.9.0.5494** and MiniProfiler **4.3.8** dependencies. Use the host's assemblies and do not add a different native Emgu package. The source is a local window of your own with no sensitive data.

1. Save **status.html** below in your own folder and open the file in your browser. The orange rectangle must be visible. Do not change the zoom or window size, and do not cover or minimize the window.
2. Create `RecipeCvTiming` through **Add new → New Aura → Actions → On Enter → C# Script**. Replace the whole **Script.csx** with the file below. Start it by hand with **Run** and watch the action's **Event Log**.
3. When the window picker appears, select the window with your orange sample. If the selection is missing or invalid, the script ends without creating a window accessor. The picker takes no token, so cancellation is checked right after it returns.
4. Read the capture/search entries, then the same-frame counts and the final profiler report. Each measured group has exactly **10** passes. Capture warm-up and count warm-up are not part of the measurements. Profiler durations are in milliseconds.
5. Before comparing results, repeat the run with the same window size and capture conditions. **Stop** is checked between synchronous operations and may not interrupt one that is already running. On leaving the block, the script releases its frame copy and the accessor.

| Output | How to read it |
| --- | --- |
| `New capture/search` | A request for a fresh window image plus an exact-colour search, with nested profiler stages. |
| `Same owned frame/count` | Repeated reading of one copied BGR image. New capture is not included. |
| Orange count | Counts the exact bytes `R=255, G=87, B=34`. Zero is possible if the real captured pixels differ. |

The rectangle's CSS size does not set an exact pixel count in the capture: zoom, DPI, capture method and the rest of the window all matter. The window search returns points relative to the window. `Point.Empty` also means "nothing found", so it does not prove a match in the top-left corner.

The image in the callback belongs to the host. Only the script's own `image.Copy()` leaves the callback, and the script disposes it. The synchronous helper respects row stride and keeps its byte span inside the call, so no span crosses an await. If the frame is wrong or black, see [capture settings](/en/triggers/images/imagecapturetriggers). For comparing algorithms, see [same-frame profiling](/en/scripting/examples/advanced/profiling-countpixels).

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
