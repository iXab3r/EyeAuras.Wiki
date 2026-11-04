---
title: Аргументы события обработки изображения окна
description: Аргументы события триггера обработки изображения с результатами распознавания и преобразованиями для перевода локальных координат в экранные.
published: true
date: 2026-04-21T00:00:00.000Z
tags: image processing, event arguments, coordinates transformation, ai-translated
editor: markdown
dateCreated: 2024-04-13T11:37:08.113Z
---
> Для AI-first навигации см. [AI Computer Vision / Images](./computer-vision/images) — там описаны события обработки изображений, поверхности захвата и связанные workflow в стиле OpenCV.
{.is-info}

# Перевести результат распознавания в координаты экрана

`WindowImageProcessedEventArgs<TDetectionResult>` связывает найденные объекты
с матрицами того же захвата. Для EyeAuras `20fd3d4` используйте преобразование
из самого результата, а не вручную прибавленный угол окна.

## Получить экранную точку найденного пикселя

Верхнеуровневый C# Script получает сервис из OpenCV-модуля приложения.
Пример захватывает основной экран и выводит точку в лог, не выполняя клик:

```csharp
using System.Drawing;
using EyeAuras.OpenCVAuras.Scripting;

{
    var api = GetService<IComputerVisionExperimentalScriptingApi>();
    using var cv = api.ForScreen();
    var processed = cv.PixelSearchRaw(Color.Red);
    if (processed.Detected.Bounds is { } localBounds)
    {
        var screenBounds = processed.ToScreen(localBounds);
        var screenPoint = processed.ToScreenPoint(localBounds);
        Log.Info($"Область: {screenBounds}, центр: {screenPoint}");
    }
    else
    {
        Log.Info("Совпадений нет");
    }
}
```

`ToScreen` применяет `WorldToScreen`: обратные эффекты изображения, смещение
ROI и положение окна. `ToScreenPoint` по умолчанию выбирает центр уже
преобразованного прямоугольника; другой `RegionAnchorType` задаётся явно.
Не применяйте этот перевод к уже преобразованным результатам простых
`ImageSearch` / `PixelSearch`.

`Detected` — результат поиска, а `Captured` — общее изменяемое состояние
захвата, **не принадлежащий вам снимок**. Оно может обновляться другим
триггером или скриптом. Не освобождайте его изображения и не передавайте их
фоновому обработчику как стабильные данные. Для собственной копии используйте
`ProcessPixels(image => image.Clone())` и освободите клон после работы —
[пример владения](IComputerVisionExperimentalScriptingApi).
Если получаете события через `WhenImageProcessed`, отдельно освобождайте свою
Rx-подписку. Сам объект события не заменяет время жизни источника.

## Контракт среза

В листинге `WinRectangle`, `WinPoint` и варианты `F` обозначают типы
`System.Drawing`; `SharpRectangle` — `SharpDX.Rectangle`. Полную актуальную
поверхность сверяйте с SDK/XML своей версии. Имена отдельных полей матриц не
доказывают направление преобразования; для перевода результата используйте
методы ниже. DPI и поведение захвата проверяются в целевом окружении.

```csharp
/// <summary>
/// Represents the event arguments for an image processing trigger, containing the results
/// and transformations required to map detected objects from local to screen coordinates.
/// </summary>
/// <typeparam name="TDetectionResult">The type of the trigger result, encapsulating details about detected objects.</typeparam>
public sealed class WindowImageProcessedEventArgs<TDetectionResult> where TDetectionResult : ICaptureTriggerDetectionResult
{
    /// <summary>
    /// Gets the transformation matrices used to convert coordinates from the local viewport (the region of the window where the image was captured)
    /// to screen coordinates. This includes scaling, rotation, and offset transformations.
    /// </summary>
    public ViewportTransformationMatrices ViewportTransforms { get; init; }
    
    /// <summary>
    /// Gets the result of the image processing trigger, containing detailed information about detected objects,
    /// such as their locations in local coordinates.
    /// </summary>
    /// <example>
    /// This could be an instance of <see cref="IColorSearchDetectionResult"/>, <see cref="IImageSearchDetectionResult"/>,
    /// <see cref="IMLSearchDetectionResult"/>, or <see cref="ITextSearchDetectionResult"/>, depending on the specific trigger used.
    /// </example>
    public TDetectionResult Detected { get; init; } 
    
    /// <summary>
    /// Gets images which were processed by the trigger. They are not included by default and are NOT thread-safe.
    /// You are responsible for making sure that they will not be updated by any other trigger or script.
    /// This will be changed in the future versions.
    /// </summary>
    public ICaptureTriggerState Captured { get; init; }
    
    /// <summary>
    /// Converts a rectangle from local viewport coordinates to screen coordinates.
    /// </summary>
    /// <param name="local">The rectangle in local viewport coordinates to convert.</param>
    /// <returns>The rectangle in screen coordinates.</returns>
    public WinRectangle ToScreen(SharpRectangle local)
    {
        var screenRect = local.ToWinRectangle();
        return ToScreen(screenRect);
    }
    
    /// <summary>
    /// Converts a rectangle from local viewport coordinates to screen coordinates.
    /// </summary>
    /// <param name="local">The rectangle in local viewport coordinates to convert.</param>
    /// <returns>The rectangle in screen coordinates.</returns>
    public WinRectangle ToScreen(WinRectangle local)
    {
        return local.Transform(ViewportTransforms.WorldToScreen);
    }

    /// <summary>
    /// Converts a rectangle from local viewport coordinates to screen coordinates, allowing for fractional pixel values.
    /// </summary>
    /// <param name="local">The rectangle in local viewport coordinates to convert, with floating-point precision.</param>
    /// <returns>The rectangle in screen coordinates, with floating-point precision.</returns>
    public WinRectangleF ToScreen(WinRectangleF local)
    {
        return local.Transform(ViewportTransforms.WorldToScreen);
    }
    
    /// <summary>
    /// Converts a rectangle from local viewport coordinates to screen coordinates.
    /// </summary>
    /// <param name="local">The rectangle in local viewport coordinates.</param>
    /// <param name="anchorType">The anchor type specifying which part of the rectangle to align with the screen coordinates. Default is <see cref="RegionAnchorType.Center"/>.</param>
    /// <returns>A point in screen coordinates.</returns>
    public WinPoint ToScreenPoint(SharpRectangle local, RegionAnchorType anchorType = RegionAnchorType.Center)
    {
        var screenRect = ToScreen(local);
        var screenRectF = screenRect.ToRectangleF();
        return screenRectF.ToPointInRegion(anchorType).ToPoint();
    }

    /// <summary>
    /// Converts a rectangle from local viewport coordinates to screen coordinates.
    /// </summary>
    /// <param name="local">The rectangle in local viewport coordinates.</param>
    /// <param name="anchorType">The anchor type specifying which part of the rectangle to align with the screen coordinates. Default is <see cref="RegionAnchorType.Center"/>.</param>
    /// <returns>A point in screen coordinates.</returns>
    public WinPoint ToScreenPoint(WinRectangle local, RegionAnchorType anchorType = RegionAnchorType.Center)
    {
        var screenRect = ToScreen(local);
        var screenRectF = screenRect.ToRectangleF();
        return screenRectF.ToPointInRegion(anchorType).ToPoint();
    }
     
    /// <summary>
    /// Converts a rectangle from local viewport coordinates to screen coordinates, allowing for fractional pixel values.
    /// </summary>
    /// <param name="local">The rectangle in local viewport coordinates.</param>
    /// <param name="anchorType">The anchor type specifying which part of the rectangle to align with the screen coordinates. Default is <see cref="RegionAnchorType.Center"/>.</param>
    /// <returns>A point in screen coordinates.</returns>
    public WinPointF ToScreenPoint(WinRectangleF local, RegionAnchorType anchorType = RegionAnchorType.Center)
    {
        var screenRectF = ToScreen(local);
        return screenRectF.ToPointInRegion(anchorType);
    }
}

```
