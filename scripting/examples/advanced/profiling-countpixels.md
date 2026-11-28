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

Let's compare how long it takes to count pixels in two ways: with the Emgu CV indexer and with a direct pass over BGR bytes. Both helpers work on **the same captured frame** and use the same colour-distance rule. The log shows the counts and the timings.

You need desktop EyeAuras with OpenCV, Emgu CV and MiniProfiler, and your own stationary window with a coloured image. The SDK uses **Emgu 4.9.0.5494** and **MiniProfiler 4.3.8**. Do not load a different native Emgu version into the same host. All the code below goes into top-level `Script.csx`.

## Make comparable measurements

1. Open your image and keep its window visible. For a nonzero count, set a colour in the code that is really in the image.
2. Add a **C# Script** action. Paste **both blocks** into one `Script.csx`: the program first, then the helper methods and the struct.

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

The helpers below do not use script globals: they get the image, colour and similarity as parameters.

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

3. Click **Run** and select your window. After 10 pairs of passes, the log shows the frame size, two counts and the **Indexer**/**BGR rows** steps with times in milliseconds. The counts should match. If they differ, the timings cannot be compared.
4. To repeat the experiment later, write down the image and window size, colour, similarity, number of passes and environment. Do not raise the number of passes without need: every pass adds profiler steps and uses memory. You can cancel the window picker. **Stop** is checked between pairs of passes.

| Setting or boundary | What is measured |
| --- | --- |
| `frame = image.Copy()` | One owned copy of the captured BGR frame. Capture, effects, creating the copy and disposing it are not part of the **Indexer**/**BGR rows** timings. |
| `similarity = 100` | Zero tolerance: all 3 BGR channels must match exactly. These helpers use Euclidean distance with a tolerance of `(1 - similarity) × 255`. |
| `iterations = 10` | Ten measured calls of each helper after both are warmed up once. The order is always the same. For a serious comparison, take order, caches and other load into account. |
| `image[y, x]` | The Emgu 4.9 indexer calls `cvGet2D` for every pixel. |
| `AsReadOnlySpan2D<byte>()` | Looks at Mat rows it does not own, taking `Step` into account. BGR has 3 bytes per pixel. Rows can end with padding bytes, so do not lose them if you switch to 3-byte structs. |

The image in `ProcessPixels` is available only for the duration of the callback. The script disposes the `Copy` it created, then CV. The row view stays inside the helper. The synchronous count gets no cancellation token. Logging is not part of the measured steps.

If the slow part may be capture, effects or search rather than this inner loop, go to the [CV pipeline profiling example](/en/scripting/examples/advanced/profiling-cv). Compare on the same source and region, and look at warm-up and later passes separately. That example takes a new frame every time instead of one copy.

<details>
<summary>Read the historical result</summary>

Below is the output from 23 March 2025 on **DESKTOP-PK81KT3**. Back then the helpers were called on new frames inside separate `ProcessPixels` calls, and the **Refresh** measurement included more than the comparison loop.

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

Speeding this up with SIMD or GPU is a separate experiment: you would also have to measure conversion, data transfer and allocation. See the [Emgu 4.9 indexer source](https://github.com/emgucv/emgucv/blob/4.9.0/Emgu.CV/Core/Image.cs).

</details>
