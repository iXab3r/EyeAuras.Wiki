---
title: Экспериментальный API компьютерного зрения
description: Документация по экспериментальному API компьютерного зрения для скриптов
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-21T23:37:38.346Z
---
# Компьютерное зрение из скрипта

`IComputerVisionExperimentalScriptingApi` создаёт `ICvAccessor` для захвата и
анализа изображения. API экспериментальный; ниже — поведение EyeAuras `20fd3d4`.
OpenCV-модуль регистрирует сервис и провайдер кэша в работающем приложении.

## Найти красный пиксель на основном экране

Этот законченный пример запускается как верхнеуровневый C# Script в EyeAuras.
Нужен доступный захват основного экрана; внешние окна, драйверы и DPI зависят от
окружения. Для этого примера не нужен файл изображения или ML-модель.

```csharp
using System.Drawing;
using EyeAuras.OpenCVAuras.Scripting;

var api = GetService<IComputerVisionExperimentalScriptingApi>();
using var cv = api.ForScreen();
var result = cv.PixelSearchRaw(Color.Red);
if (result.Detected.Bounds is { } bounds)
{
    Log.Info($"Красный пиксель на экране: {result.ToScreenPoint(bounds)}");
}
else
{
    Log.Info("Красный пиксель не найден");
}
```

`ForScreen()` относится к **основному экрану**, не ко всему виртуальному рабочему
столу. `Bounds == null` означает отсутствие совпадения. Ошибка захвата или
обработки не превращается в «не найдено»: API может выбросить исключение.
Accessor принадлежит вызывающему коду; `using` возвращает его аренду кэша.

## Выбрать источник и пороги

`ForWindow(IWindowHandle)` задаёт окно по handle из API окон. Для выражения
сопоставления задайте `ComputerVisionAccessorArgs.WindowMatchParams` и вызовите
`For(args)` — синтаксис описан в [карте окон](windows-subsystems/window-handles).
`For(ComputerVisionAccessorArgs)` позволяет задать `WindowMatchParams` и пороги.
Приоритет порога: аргумент операции → настройки accessor → встроенный default.

| Настройка | Default |
|---|---|
| `ImageSimilarityThreshold` | 95% |
| `PixelSimilarityThreshold` | 95% |
| `MLConfidenceThreshold` | 30% |
| `MLIoUThreshold` | 40% |

`region = default` означает отсутствие дополнительного ROI. Непустой
`System.Drawing.Rectangle` ограничивает область источника: для окна это область
в его координатах, для экранного источника — область экрана. Raw-результат
хранит локальные координаты обработанного изображения; используйте его
`ToScreen` / `ToScreenPoint`, чтобы учесть ROI и преобразования.

## Выбрать результат операции

| Операция | Результат и существенное условие |
|---|---|
| `ImageSearch(path, ...)` | `Rectangle`, пустой при отсутствии совпадения; нужен существующий файл или доступный ресурс шаблона |
| `PixelSearch(color, ...)` | `Point`, default при отсутствии; `(0, 0)` также может быть настоящим результатом |
| `TextSearch(region)` | распознанная строка; нужен доступный OCR-движок |
| `ImageSearchRaw`, `PixelSearchRaw`, `TextSearchRaw`, `MLSearchRaw` | `WindowImageProcessedEventArgs<TDetectionResult>`, не прямоугольник, строка или массив |
| `CountPixels(color, ...)` | число подходящих пикселей |
| `ProcessPixels(callback, ...)` | результат callback или `void`; изображение заимствованное |

Простые `ImageSearch` и `PixelSearch` возвращают экранные координаты для
экранного источника и координаты окна для оконного. Не применяйте к ним
преобразования raw-результата повторно. Для точного различения найденного пикселя
в начале координат и отсутствия результата используйте nullable `Detected.Bounds`.

`TextSearchRaw(includeTextSegments: false, ...)` по умолчанию не запрашивает
сегменты слов. ML требует доступной модели и совместимого runtime; одно имя
файла не доказывает совместимость формата. Полные поля результатов смотрите
в SDK/XML и [карте изображений](computer-vision/images).

## Обработать кадр и сохранить свою копию

В том же скриптовом контексте:

```csharp
using EyeAuras.OpenCVAuras.Scripting;

var api = GetService<IComputerVisionExperimentalScriptingApi>();
using var cv = api.ForScreen();
using var snapshot = cv.ProcessPixels(image => image.Clone());
Log.Info($"Размер копии: {snapshot.Width} x {snapshot.Height}");
```

Callback получает общий `Image<Bgr, byte>`: не освобождайте и не сохраняйте
исходный объект для дальнейшей работы. Копией владеет ваш код. `Captured` в
raw-событии также не является независимым снимком и не даёт гарантий потокобезопасности.
`CountPixels` и `ProcessPixels` синхронно ожидают обработку до 30 секунд;
у этих вызовов нет аргумента `CancellationToken`. Не ставьте их в UI-обработчик
и не запускайте параллельно над общим состоянием без собственной синхронизации.

## Кэш, отладка и измерения

Обычный API создаёт accessor с арендованным общим кэшем. `WithoutCaching()`
возвращает отдельную поверхность без этого механизма; это не обещание ускорения.
Для макросов и деревьев сохраняйте обычный путь с кэшем.

`EnableOsd()` включает встроенную отрисовку для **оконного** accessor; для
полноэкранного захвата реализация отклоняет этот режим. Default `OsdFps` — 10,
OSD и профилирование изначально выключены. `EnableProfiling()` и `Profiler`
описаны в [профилировании CV](computer-vision/profiling).
