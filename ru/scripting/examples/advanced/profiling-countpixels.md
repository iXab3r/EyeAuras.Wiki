---
title: Профилирование CV API CountPixels
description: 
published: true
date: 2025-03-23T22:03:55.335Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T17:08:22.651Z
---
# Что именно мы сравниваем?

В `C# Script` EyeAuras откройте окно с заголовком `Aim Trainer` либо замените строку в `GetWindow`. Нужны доступные Emgu CV и захват окна. Скрипт выполняет прогрев, затем два прохода по новым кадрам и печатает число пикселей и отчёт; кадры могут отличаться. Для сравнения самих алгоритмов используйте одинаковый неподвижный кадр.

Мы сравниваем два способа подсчёта пикселей заданного цвета. Оба метода определены прямо в скрипте и работают с изображениями в формате BGR (blue-green-red).

## CountPixelsNaive

Этот метод использует `Image<Bgr, byte>` и вызов `GetPixel(x, y)`, который внутри опирается на `CvInvoke.cvGet2D`.

## CountPixelsNaiveMem

Этот метод читает данные напрямую из памяти.

В обоих случаях используется одна и та же логика: для каждого пикселя вычисляется «расстояние» между цветами.

## Исторический результат

Как видно, метод с чтением из памяти (**163.31ms**) работает более чем **в 2 раза** быстрее, чем `CvInvoke.cvGet2D` (**397.3ms**). Это результат конкретного запуска, а не гарантия ускорения на другом изображении или компьютере.

При этом сам код не становится заметно сложнее: основное изменение — добавление вспомогательной структуры `BgrByteColor` для представления цвета. Вся остальная логика остаётся почти такой же.

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

## Можно ли сделать ещё быстрее?

Да. Современные CPU поддерживают множество полезных инструкций для эффективной работы с блоками данных — а это как раз наш случай. Ещё один вариант — перенести вычисления на GPU, но здесь появляются дополнительные нюансы. Например, передача изображения на GPU тоже занимает время, поэтому без замеров производительности не обойтись.

Кроме того, существует много других техник оптимизации, но это уже тема для отдельной статьи.

## Пример кода

```csharp
using Emgu.CV;
using Emgu.CV.Structure;
using EyeAuras.OpenCVAuras.Scaffolding;
using StackExchange.Profiling;

var targetWindow = GetService<IWindowSelector>().GetWindow("Aim Trainer");

// This API is used to perform Computer Vision operations (image/text/color/ML search)
var cv = GetService<IComputerVisionExperimentalScriptingApi>()
    .ForWindow(targetWindow)
    .EnableProfiling()
    .AddTo(ExecutionAnchors);

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
    Log.Info($"Naive pixels: {countPixels}");
});

cv.ProcessPixels(img =>
{
    Log.Info($"Processing image via Naive Mem method: {img.Size}");
    var countPixels = CountPixelsNaiveMem(img, bgrTargetColor, 100);
    Log.Info($"Span pixels: {countPixels}");
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

`ProcessPixels` передаёт заимствованное `Image<Bgr, byte>` только на время callback. Не освобождайте его и не сохраняйте `AsReadOnlySpan2D` за пределами вызова. Нулевой счётчик — ни один пиксель не прошёл сравнение. Здесь `similarity = 100` даёт допуск 0, то есть точное равенство BGR; формула с евклидовым расстоянием принадлежит этим двум helper, а не задаёт общий контракт Color Search. ROI не указан — обрабатывается захват выбранного окна. Синхронный проход не прерывается токеном отмены. Логи и прогрев тоже влияют на измерение.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
