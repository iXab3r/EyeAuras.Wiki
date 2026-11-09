---
title: Профилирование CV API CountPixels
description: 
published: true
date: 2025-03-23T22:03:55.335Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T17:08:22.651Z
---
# Сравнить два способа подсчёта пикселей

Измерим, сколько времени занимают индексатор Emgu CV и прямой просмотр BGR-байтов на **одном и том же кадре**. Оба вспомогательных метода считают пиксели по одинаковой формуле; журнал покажет число совпадений и длительности, а не заранее обещанное ускорение.

Нужны настольный EyeAuras с OpenCV, Emgu CV и MiniProfiler, а также своё неподвижное окно с цветной картинкой. В исходном SDK используются Emgu 4.9.0.5494 и MiniProfiler 4.3.8; добавлять другую нативную версию Emgu в тот же хост не нужно. Весь код ниже предназначен для верхнеуровневого `Script.csx`.

## Получить сопоставимые замеры

1. Откройте свою картинку, оставьте её окно видимым. Для ненулевого счётчика задайте в коде цвет, который действительно есть на изображении; нулевой результат тоже допустим.
2. Создайте действие **C# Script**. Вставьте **оба блока** в один `Script.csx`: сначала программу, затем определения методов и структуры.

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
    if (window == null || !window.IsWindow) { Log.Warn("Окно не выбрано или недоступно"); return; }
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

Методы ниже не обращаются к глобальным сервисам скрипта: изображение, цвет и допуск передаются явно.

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

3. Нажмите **Run** и укажите своё окно. После 10 пар проходов в журнале появятся размер кадра, два счётчика и шаги **Indexer**/**BGR rows** с длительностями в миллисекундах. Оба счётчика должны совпасть; сравнивать время при разном результате нельзя.
4. Для повторения опыта запишите размер окна, цвет, допуск, число проходов и окружение. Увеличивайте число проходов осознанно: каждый шаг добавляется в дерево профайлера. Выбор окна можно отменить, Stop проверяется между парами проходов.

| Условие | Что входит в сравнение |
| --- | --- |
| `frame = image.Copy()` | Одна собственная копия захваченного BGR-кадра. Захват, эффекты, выделение копии и её освобождение находятся вне замеров **Indexer**/**BGR rows**. |
| `similarity = 100` | Допуск0: точное совпадение трёх BGR-компонентов. Формула этих методов — евклидово расстояние с допуском `(1 - similarity) × 255`, не общий контракт Color Search. |
| `iterations = 10` | По 10 измеренных вызовов каждого метода после прогрева. Порядок здесь всегда один; для серьёзного сравнения учитывайте влияние порядка, кэшей и нагрузки. |
| `image[y, x]` | Индексатор Emgu 4.9 обращается к `cvGet2D` для каждого пикселя. |
| `AsReadOnlySpan2D<byte>()` | Смотрит на заимствованные строки Mat с учётом `Step`. У BGR три байта на пиксель; служебные байты в конце строки нельзя терять при переходе к структурам по 3 байта. |

Изображение в `ProcessPixels` заимствовано только на время функции; освобождаем именно созданную `Copy`, затем CV. Представление строк не выходит из вспомогательного метода. Синхронный подсчёт не получает токен отмены, логирование находится за пределами измеренных шагов. Здесь нет ML, OCR, ввода или отрисовки OSD.

<details>
<summary>Как читать старый результат этой статьи</summary>

Ниже сохранён вывод от 23 марта 2025 на **DESKTOP-PK81KT3**. Тогда методы вызывались на новых кадрах, внутри `ProcessPixels`, а измерение **Refresh** включало не только отдельный цикл сравнения. Полного описания оборудования, кадра и нагрузки нет, поэтому числа397.3ms и163.31ms нельзя переносить на текущий хост или сравнивать напрямую с новым тестом.

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

Ускорение через SIMD или GPU — отдельный эксперимент: нужно измерять также преобразования, передачу данных и выделения памяти. Этот пример ничего из этого не выполняет. [Исходник индексатора Emgu 4.9](https://github.com/emgucv/emgucv/blob/4.9.0/Emgu.CV/Core/Image.cs).

</details>
