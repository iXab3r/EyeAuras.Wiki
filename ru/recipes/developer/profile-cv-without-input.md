---
title: "Отделить захват CV от десяти проходов по кадру"
description: "Измерьте отдельно десять захватов с поиском и десять подсчётов пикселей в одной сохранённой копии кадра."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Отделить захват CV от десяти проходов по кадру

Рецепт показывает, на что уходит время: на получение кадра или на обработку пикселей. Первая группа десять раз захватывает кадр и ищет в нём цвет. Вторая десять раз считает пиксели в одной сохранённой копии.

Нужен настольный EyeAuras с зарегистрированными CV и захватом и с совместимыми нативными зависимостями Emgu CV **4.9.0.5494** и MiniProfiler **4.3.8**. Берите сборки хоста и не добавляйте другую нативную версию Emgu. Источник — ваше собственное окно без чувствительных данных.

1. Сохраните **status.html** ниже в свою папку и откройте файл в браузере. Оранжевый прямоугольник должен быть виден. Размер окна и масштаб не меняйте, окно не перекрывайте и не сворачивайте.
2. Создайте `RecipeCvTiming` через **Add new → New Aura → Actions → On Enter → C# Script**. Целиком замените **Script.csx**. Запускайте вручную кнопкой **Run** и смотрите **Event Log** действия.
3. В появившемся выборе окна укажите окно с оранжевым образцом. Если живого окна нет, скрипт завершится, не создав accessor. Picker не принимает token, поэтому отмена проверяется сразу после его возврата.
4. Прочитайте записи capture/search, затем счётчики одного кадра и итоговый отчёт profiler. В каждой измеряемой группе ровно **10** проходов. Прогрев захвата и прогрев счёта в измерения не входят. Длительности в отчёте profiler — в миллисекундах.
5. Перед сравнением повторяйте опыт с тем же размером окна и теми же условиями захвата. **Stop** проверяется между синхронными операциями и может не прервать уже начатую. При выходе из блока скрипт освобождает свою копию кадра и accessor.

| Вывод | Как читать |
| --- | --- |
| `New capture/search` | Запрос свежего изображения окна и поиск точного цвета, с вложенными этапами profiler. |
| `Same owned frame/count` | Повторное чтение одной копии BGR. Новый захват сюда не входит. |
| Число оранжевых пикселей | Считаются точные байты `R=255, G=87, B=34`. Ноль возможен, если реальные пиксели отличаются. |

CSS-размер прямоугольника не задаёт точное число пикселей в захвате: влияют масштаб, DPI, метод захвата и остальное содержимое окна. Поиск по окну возвращает точки относительно окна. `Point.Empty` заодно означает «ничего не найдено», поэтому это не доказательство находки в левом верхнем углу.

Изображение в callback принадлежит хосту. Наружу выходит только собственная `image.Copy()`, и скрипт её освобождает. Синхронный метод учитывает шаг строк и держит byte span только внутри вызова, через await span не проходит. Если кадр неверный или чёрный, смотрите [настройки захвата](/ru/triggers/images/imagecapturetriggers). Как сравнивать алгоритмы — в [профилировании одного кадра](/ru/scripting/examples/advanced/profiling-countpixels).

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
