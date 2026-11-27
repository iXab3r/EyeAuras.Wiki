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

Сравним, сколько времени уходит на подсчёт пикселей двумя способами: через индексатор Emgu CV и прямым проходом по BGR-байтам. Оба метода работают с **одним и тем же кадром** и считают по одной формуле. В журнале будут число совпадений и время. Ускорение заранее не обещано — смотрите на свои цифры.

Нужны настольный EyeAuras с OpenCV, Emgu CV и MiniProfiler и своё неподвижное окно с цветной картинкой. В SDK используются Emgu 4.9.0.5494 и MiniProfiler 4.3.8. Добавлять в тот же хост другую нативную версию Emgu не нужно. Весь код ниже — для верхнеуровневого `Script.csx`.

## Получить сопоставимые замеры

1. Откройте картинку и оставьте её окно видимым. Чтобы счётчик был не нулевым, задайте в коде цвет, который на картинке действительно есть. Ноль — тоже допустимый результат.
2. Создайте действие **C# Script**. Вставьте **оба блока** в один `Script.csx`: сначала программу, потом методы и структуру.

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

Методы ниже не обращаются к глобальным сервисам скрипта: изображение, цвет и допуск они получают параметрами.

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

3. Нажмите **Run** и укажите своё окно. После 10 пар проходов в журнале появятся размер кадра, два счётчика и шаги **Indexer**/**BGR rows** с временем в миллисекундах. Счётчики должны совпасть. Если они разные, сравнивать время нельзя.
4. Чтобы потом повторить опыт, запишите размер окна, цвет, допуск, число проходов и окружение. Не увеличивайте число проходов без нужды: каждый шаг добавляется в дерево профайлера. Выбор окна можно отменить. Stop проверяется между парами проходов.

| Условие | Что входит в сравнение |
| --- | --- |
| `frame = image.Copy()` | Одна своя копия захваченного BGR-кадра. Захват, эффекты, создание копии и её освобождение в замеры **Indexer**/**BGR rows** не входят. |
| `similarity = 100` | Допуск 0: все три BGR-компонента должны совпасть точно. Эти методы считают евклидово расстояние с допуском `(1 - similarity) × 255`. Это формула примера, а не общий контракт Color Search. |
| `iterations = 10` | По 10 замеренных вызовов каждого метода после прогрева. Порядок всегда один и тот же. Для серьёзного сравнения учитывайте порядок, кэши и нагрузку. |
| `image[y, x]` | Индексатор Emgu 4.9 вызывает `cvGet2D` для каждого пикселя. |
| `AsReadOnlySpan2D<byte>()` | Смотрит на строки Mat, которые ему не принадлежат, с учётом `Step`. У BGR три байта на пиксель. В конце строки бывают служебные байты — не потеряйте их, если переходите к структурам по 3 байта. |

Изображение в `ProcessPixels` доступно только на время функции. Скрипт освобождает созданную им `Copy`, а потом CV. Представление строк не выходит за пределы вспомогательного метода. Синхронный подсчёт не получает токен отмены. Запись в журнал в замеры не входит. ML, OCR, ввода и отрисовки OSD здесь нет.

Если тормозить может захват, эффекты или поиск, а не этот внутренний цикл, переходите к [профилированию цепочки CV](/ru/scripting/examples/advanced/profiling-cv). Сравнивайте на одном и том же источнике и области, прогрев и следующие проходы смотрите отдельно. Тот пример каждый раз берёт новый кадр, а не одну копию.

<details>
<summary>Как читать старый результат этой статьи</summary>

Ниже — вывод от 23 марта 2025 на **DESKTOP-PK81KT3**. Тогда методы вызывались на новых кадрах внутри `ProcessPixels`, а в замер **Refresh** попадал не только цикл сравнения. Оборудование, кадр и нагрузка полностью не описаны, поэтому 397.3ms и 163.31ms нельзя переносить на свой компьютер или напрямую сравнивать с новым тестом.

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

Ускорение через SIMD или GPU — отдельный эксперимент: там нужно замерять ещё преобразования, передачу данных и выделение памяти. Этот пример ничего такого не делает. [Исходник индексатора Emgu 4.9](https://github.com/emgucv/emgucv/blob/4.9.0/Emgu.CV/Core/Image.cs).

</details>
