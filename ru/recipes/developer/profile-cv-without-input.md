---
title: "Отделить захват CV от десяти проходов по кадру"
description: "Прогрейте захват отдельно, измерьте десять новых поисков, затем десять раз посчитайте пиксели одной собственной копии."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Отделить захват CV от десяти проходов по кадру

Выясните, уходит ли время на получение кадра или обработку пикселей. Первая группа запрашивает десять операций захвата и поиска; вторая десять раз считает одну сохранённую копию. Это разные измерения.

Нужен настольный EyeAuras с зарегистрированными CV/захватом и совместимыми нативными зависимостями Emgu CV **4.9.0.5494**, MiniProfiler **4.3.8**. Используйте имеющиеся сборки хоста, не добавляйте другую нативную версию Emgu. Источник — собственное окно без чувствительных данных.

1. Сохраните полный **status.html** ниже в свою папку и откройте физический файл браузером. Держите оранжевый прямоугольник видимым, размер окна и масштаб постоянными; не перекрывайте и не сворачивайте источник. Модель и внешний сайт не нужны.
2. Создайте `RecipeCvTiming` через **Add new → New Aura → Actions → On Enter → C# Script**. Полностью замените **Script.csx**. Используйте ручную **Run** и **Event Log** действия.
3. В появившемся выборе окна укажите свой оранжевый образец. При отсутствии живого окна скрипт завершится до создания accessor. У picker нет параметра token; отмена проверяется сразу после его возврата.
4. Прочтите записи capture/search, затем счётчики одного кадра и итоговый отчёт profiler. В каждой измеряемой группе ровно **10** проходов. Прогрев захвата и прогрев счёта вынесены за соответствующие измеряемые группы. Длительности profiler выражены в миллисекундах.
5. Перед сравнением повторяйте опыт с тем же размером окна и условиями захвата. **Stop** проверяется между синхронными операциями и не обязан прерывать уже начатую. Выход из блока освобождает собственную копию кадра и accessor.

| Вывод | Как читать |
| --- | --- |
| `New capture/search` | Включает запрос обновлённого изображения окна и поиск точного цвета с вложенными этапами profiler. Это не измерение одного цикла по пикселям. |
| `Same owned frame/count` | Повторно читает одну копию BGR; новый захват в эти шаги не входит. |
| Число оранжевых пикселей | Точные байты `R=255, G=87, B=34`; ноль допустим, если реальные пиксели отличаются. |

CSS-размер прямоугольника не задаёт точное число пикселей захвата: влияют масштаб, DPI, метод и остальное содержимое окна. Поиск по окну возвращает относительные к окну точки. `Point.Empty` одновременно служит признаком отсутствия результата, поэтому это не доказательство находки в левом верхнем углу. Счётчик возвращает количество, не confidence.

Изображение callback заимствовано. За его пределы выходит только собственная `image.Copy()`, которую скрипт освобождает. Синхронный метод учитывает шаг строк и держит byte span только внутри вызова; span не пересекает await. Неверный или чёрный кадр разбирайте через [настройки захвата](/ru/triggers/images/imagecapturetriggers), сравнение алгоритмов — через [профилирование одного кадра](/ru/scripting/examples/advanced/profiling-countpixels).

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
