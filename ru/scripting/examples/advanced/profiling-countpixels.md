---
title: Профилирование CV API CountPixels
description: замеряем производительность
published: true
date: 2025-03-23T17:08:22.651Z
tags: 
editor: markdown
dateCreated: 2025-03-23T17:08:22.651Z
---

# Что будем сравнивать?
Два метода подсчета пикселей определенного цвета. Оба метода описаны прямо в теле скрипта и работают с BGR (blue-green-red) картинкой.

## CountPixelsNaive
Использует `Image<Bgr, byte>` `GetPixel(x,y)`, который под капотом использует `CvInvoke.cvGet2D`

## CountPixelsNaiveMem
Использует чтение из памяти напрямую

Алгоритм сравнения одинаковый - просчитываем "расстояние" между цветами, попиксельно. 

# Давайте сразу глянем на результаты
Как видно, метод с чтением памяти более чем **В ДВА РАЗА** быстрее, чем `CvInvoke.cvGet2D` и эта разница будет только увеличиваться с увеличением размера полотна. При этом код не значительно сложнее - потребовалось всего лишь объявить дополнительную структуру `BgrByteColor`, описывающую цвет, в остальном код почти такой же. 

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

## А можно ли быстрее? 
Однозначно можно - в процессоре есть огромное количество полезных инструкций, которые можно использовать для блочных операций (а у нас как раз такая). 
Еще один способ - делать этот же расчет на GPU, однако там начинаются неочевидные моменты, к примеру, картинку нужно сначала скопировать в GPU, а это тоже занимает время, так что нужно проводить измерения. А еще есть всякие полезные технологии, которые мы могли бы использовать, но эта тема сама по себе повод для отдельной статьи.

# Пример

```csharp
using Emgu.CV;
using Emgu.CV.Structure;
using EyeAuras.OpenCVAuras.Scaffolding;
using StackExchange.Profiling;

var targetWindow = GetService<IWindowSelector>().GetWindow("Aim Trainer");

//this API is used to do Computer Vision stuff (image/text/color/ml search)
var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)
    .EnableProfiling();

var targetColor = Color.FromArgb(255, 88, 35);
var bgrTargetColor = new Bgr(targetColor.B, targetColor.G, targetColor.R);

//first call will ALWAYS be a bit slower
cv.ProcessPixels(img =>
{

    Log.Info($"Initialization pass");
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


static int CountPixelsNaive(Image<Bgr, byte> image, Bgr color, Percentage similarity)
{
    var tolerance = (1 - similarity.ToDecimal()) * 255.0; // Convert percentage similarity to intensity threshold
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

static int CountPixelsNaiveMem(Image<Bgr, byte> image, Bgr color, Percentage similarity)
{
    var tolerance = (1 - similarity.ToDecimal()) * 255.0; // Convert percentage similarity to intensity threshold
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
