---
title: Profiling CV API CountPixels
description: 
published: true
date: 2025-03-23T22:03:55.335Z
tags: 
editor: markdown
dateCreated: 2025-03-23T22:03:55.335Z
---

# What Are We Comparing?
We are comparing two methods for counting pixels of a specific color. Both methods are defined directly in the script and operate on BGR (blue-green-red) images.

## **CountPixelsNaive**
This method uses `Image<Bgr, byte>`'s `GetPixel(x, y)`, which internally relies on `CvInvoke.cvGet2D`.

## **CountPixelsNaiveMem**
This method reads data directly from memory.

Both methods use the same logic — calculating the "distance" between colors, pixel by pixel.

# Let's Jump to the Results
As shown, the memory-reading method (**163.31ms**) is more than **TWICE** as fast as `CvInvoke.cvGet2D` (**397.3ms**) — and this gap will only increase with larger image sizes. The code itself isn’t significantly more complex — the main change was introducing the additional `BgrByteColor` struct to represent color. The rest of the logic remains almost identical.

```bash
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

## Can It Be Even Faster?
Definitely! Modern CPUs have numerous useful instructions for efficient block operations (which is precisely our case). Another option is to move this calculation to the GPU; however, this introduces additional complexities — for example, transferring the image to the GPU also takes time, so performance testing is necessary. Furthermore, there are numerous optimization techniques available, but that's a topic for another article.

# Example Code
```csharp
using Emgu.CV;
using Emgu.CV.Structure;
using EyeAuras.OpenCVAuras.Scaffolding;
using StackExchange.Profiling;

var targetWindow = GetService<IWindowSelector>().GetWindow("Aim Trainer");

// This API is used to perform Computer Vision operations (image/text/color/ML search)
var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)
    .EnableProfiling();

var targetColor = Color.FromArgb(255, 88, 35);
var bgrTargetColor = new Bgr(targetColor.B, targetColor.G, targetColor.R);

// The first call is ALWAYS slower due to initialization
cv.ProcessPixels(img =>
{
    Log.Info("Initialization pass");
});

cv.ProcessPixels(img =>
{
    Log.Info($"Processing image via Naive method: {img.Size}");
    var countPixels = CountPixelsNaive(img, bgrTargetColor, 100);
});

cv.ProcessPixels(img =>
{
    Log.Info($"Processing image via Naive Mem method: {img.Size}");
    var countPixels = CountPixelsNaiveMem(img, bgrTargetColor, 100);
});

Log.Info($"Results:\n{cv.Profiler.RenderPlainText()}");

// Naive Method
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

// Memory-Based Method
static int CountPixelsNaiveMem(Image<Bgr, byte> image, Bgr color, Percentage similarity)
{
    var tolerance = (1 - similarity.ToDecimal()) * 255.0;
    var memory = image.Mat.AsReadOnlySpan2D<BgrByteColor>();
    var colorAsVector = new BgrByteColor((byte)color.Blue, (byte)color.Green, (byte)color.Red);

    var count = 0;
    for (var y = 0; y < memory.Height; y++)
    {
        for (var x = 0; x < memory.Width; x++)
        {
            var pixel = memory[row: y, column: x];
            if (IsColorMatch(pixel, colorAsVector, tolerance))
            {
                count++;
            }
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

