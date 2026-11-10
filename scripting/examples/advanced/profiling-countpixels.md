---
title: Profiling CV API CountPixels
description: 
published: true
date: 2025-03-23T22:03:55.335Z
tags: scripting, profiling, ai-translated
editor: markdown
dateCreated: 2025-03-23T22:03:55.335Z
---
# Compare two ways to count coloured pixels

Measure the Emgu CV indexer and direct BGR-byte traversal on **the same captured frame**. Both helpers apply the same colour-distance rule. The log provides counts and timings, rather than a promised speedup.

Use desktop EyeAuras with OpenCV, Emgu CV and MiniProfiler, plus your own stationary window showing a coloured image. The SDK dependency versions here are **Emgu 4.9.0.5494** and **MiniProfiler 4.3.8**; do not load a different native Emgu version into that host. All code below belongs to top-level `Script.csx`.

## Make comparable measurements

1. Display your image and leave its window visible. For a nonzero count, choose an actual colour from that image; zero remains a valid result.
2. Add **C# Script**. Paste **both blocks** into one `Script.csx`: the program first, then the helper methods and struct.

```csharp
using System;
using System.Drawing;
using Emgu.CV;
using Emgu.CV.Structure;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.OpenCVAuras.Scaffolding;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;
using StackExchange.Profiling;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    if (window == null || !window.IsWindow) { Log.Warn("No valid window selected"); return; }
    cancellationToken.ThrowIfCancellationRequested();
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    using var frame = cv.ProcessPixels<Image<Bgr, byte>>(image => image.Copy());
    var target = new Bgr(35, 88, 255); // Color.FromArgb(255, 88, 35), stored BGR
    Percentage similarity = 100;
    const int iterations = 10;

    // Warm-up both algorithms outside the measured steps.
    CountPixelsNaive(frame, target, similarity);
    CountPixelsNaiveMem(frame, target, similarity);
    cv.EnableProfiling();
    int naive = 0, direct = 0;
    for (var i = 0; i < iterations; i++)
    {
        cancellationToken.ThrowIfCancellationRequested();
        using (cv.Profiler.Step("Indexer"))
            naive = CountPixelsNaive(frame, target, similarity);
        using (cv.Profiler.Step("BGR rows"))
            direct = CountPixelsNaiveMem(frame, target, similarity);
    }
    Log.Info($"Frame={frame.Size}; iterations={iterations}; indexer={naive}; BGR rows={direct}");
    Log.Info(cv.Profiler.RenderPlainText());
}
```

The helpers receive the image, colour and similarity explicitly; they do not access script globals.

```csharp
static int CountPixelsNaive(Image<Bgr, byte> image, Bgr color, Percentage similarity)
{
    var tolerance = (1 - similarity.ToDecimal()) * 255.0;
    var count = 0;

    for (var y = 0; y < image.Height; y++)
    {
        for (var x = 0; x < image.Width; x++)
        {
            var pixel = image[y, x];
            if (IsColorMatch(pixel, color, tolerance))
            {
                count++;
            }
        }
    }

    return count;
}

// Byte rows retain the Mat stride, including padding between BGR rows.
static int CountPixelsNaiveMem(Image<Bgr, byte> image, Bgr color, Percentage similarity)
{
    var tolerance = (1 - similarity.ToDecimal()) * 255.0;
    var memory = image.Mat.AsReadOnlySpan2D<byte>();
    var target = new BgrByteColor((byte)color.Blue, (byte)color.Green, (byte)color.Red);
    var count = 0;
    for (var y = 0; y < image.Height; y++)
    {
        for (var x = 0; x < image.Width; x++)
        {
            var offset = x * 3;
            var pixel = new BgrByteColor(memory[y, offset], memory[y, offset + 1], memory[y, offset + 2]);
            if (IsColorMatch(pixel, target, tolerance)) count++;
        }
    }
    return count;
}

// Color Matching Logic
private static bool IsColorMatch(Bgr pixel, Bgr targetColor, double tolerance)
{
    double distance = Math.Sqrt(
        Math.Pow(pixel.Blue - targetColor.Blue, 2) +
        Math.Pow(pixel.Green - targetColor.Green, 2) +
        Math.Pow(pixel.Red - targetColor.Red, 2)
    );
    return distance <= tolerance;
}

private static bool IsColorMatch(BgrByteColor pixel, BgrByteColor targetColor, double tolerance)
{
    double distance = Math.Sqrt(
        Math.Pow(pixel.Blue - targetColor.Blue, 2) +
        Math.Pow(pixel.Green - targetColor.Green, 2) +
        Math.Pow(pixel.Red - targetColor.Red, 2)
    );
    return distance <= tolerance;
}

// BgrByteColor Struct
private readonly record struct BgrByteColor
{
    public BgrByteColor(byte blue, byte green, byte red)
    {
        Blue = blue;
        Green = green;
        Red = red;
    }

    public readonly byte Blue;
    public readonly byte Green;
    public readonly byte Red;
}
```

3. Click **Run** and select your window. After 10 pairs of measured passes, the log shows frame size, two counts and **Indexer**/**BGR rows** timings in milliseconds. The counts should match; different results invalidate a timing comparison.
4. Record image/window size, colour, similarity, iterations and environment before repeating. More passes add profiler steps and memory use. Cancel the window picker or use **Stop**, checked between pass pairs.

| Setting or boundary | What is measured |
| --- | --- |
| `frame = image.Copy()` | One owned copy of a captured BGR frame. Capture, effects, copy allocation and disposal sit outside **Indexer**/**BGR rows** timings. |
| `similarity = 100` | Zero tolerance: all 3 BGR channels match exactly. These helpers use Euclidean distance with tolerance `(1 - similarity) × 255`, not the general Color Search contract. |
| `iterations = 10` | Ten measured calls per helper after warming both once. Order is fixed; cache, ordering and other load affect serious comparisons. |
| `image[y, x]` | The Emgu 4.9 indexer calls `cvGet2D` per pixel. |
| `AsReadOnlySpan2D<byte>()` | Borrows Mat rows with their `Step`. BGR uses 3 bytes per pixel; a 3-byte struct view must not lose padding at row boundaries. |

`ProcessPixels` lends its image only for the callback. Dispose the created `Copy`, then CV, and keep the borrowed row view inside the helper. The synchronous count receives no cancellation token. Logging occurs after the measured steps. This experiment performs no ML, OCR, input or OSD rendering.

<details>
<summary>Read the historical result</summary>

The retained output below was recorded on 23 March 2025 on **DESKTOP-PK81KT3**. It used new frames inside separate `ProcessPixels` calls; **Refresh** included more than the comparison loop. Full hardware, image and load details are absent. Its 397.3 ms and 163.31 ms are not current-host measurements and are not directly comparable to the controlled-frame program above.

```text
DESKTOP-PK81KT3 at 3/23/2025 4:54:39 PM
Test1\FindColor CV Profiler 0ms
>> MLSearchRaw - RawPixelsKey { ThreadId = 81 } - Creation 23.41ms
>> ProcessPixels - RawPixelsKey { ThreadId = 81 } - Preparations 0ms
>> ProcessPixels - RawPixelsKey { ThreadId = 81 } - Refresh 1,616.5ms
>> MLSearchRaw - RawPixelsKey { ThreadId = 81 } - Resolution 0ms
>> ProcessPixels - RawPixelsKey { ThreadId = 81 } - Preparations 0ms
>> ProcessPixels - RawPixelsKey { ThreadId = 81 } - Refresh 397.3ms
>> MLSearchRaw - RawPixelsKey { ThreadId = 81 } - Resolution 0ms
>> ProcessPixels - RawPixelsKey { ThreadId = 81 } - Preparations 0ms
>> ProcessPixels - RawPixelsKey { ThreadId = 81 } - Refresh 163.31ms
```

SIMD or GPU processing would be a separate experiment, including conversion, transfer and allocation costs. This program does not perform either. See the [Emgu 4.9 indexer source](https://github.com/emgucv/emgucv/blob/4.9.0/Emgu.CV/Core/Image.cs).

</details>
