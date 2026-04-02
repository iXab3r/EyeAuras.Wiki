---
title: WindowImageProcessedEventArgs
description: Аргументы события для триггера обработки изображений: содержат результаты обработки и преобразования для перевода координат обнаруженных объектов из локальной системы в экранную.
published: true
date: 2025-03-21T23:35:26.504Z
tags: image processing, event arguments, coordinates transformation, ai-translated
editor: markdown
dateCreated: 2024-04-13T11:37:08.113Z
---
```csharp
/// <summary>
/// Представляет аргументы события для триггера обработки изображения.
/// Содержит результаты обработки и преобразования, необходимые для перевода обнаруженных объектов
/// из локальных координат в экранные.
/// </summary>
/// <typeparam name="TDetectionResult">Тип результата триггера, содержащий сведения об обнаруженных объектах.</typeparam>
public sealed record WindowImageProcessedEventArgs<TDetectionResult> where TDetectionResult : ICaptureTriggerDetectionResult
{
    /// <summary>
    /// Возвращает матрицы преобразования, используемые для перевода координат из локального viewport
    /// (области окна, в которой был захвачен кадр) в экранные координаты.
    /// Включает масштабирование, поворот и смещение.
    /// </summary>
    public ViewportTransformationMatrices ViewportTransforms { get; init; }
    
    /// <summary>
    /// Возвращает результат триггера обработки изображения с подробной информацией об обнаруженных объектах,
    /// например об их расположении в локальных координатах.
    /// </summary>
    /// <example>
    /// Это может быть экземпляр <see cref="IColorSearchDetectionResult"/>, <see cref="IImageSearchDetectionResult"/>,
    /// <see cref="IMLSearchDetectionResult"/> или <see cref="ITextSearchDetectionResult"/> — в зависимости от используемого триггера.
    /// </example>
    public TDetectionResult Detected { get; init; } 
    
    /// <summary>
    /// Возвращает изображения, обработанные триггером. По умолчанию они не включаются и НЕ являются потокобезопасными.
    /// Вы сами отвечаете за то, чтобы эти данные не обновлялись другим триггером или скриптом.
    /// Это поведение будет изменено в будущих версиях.
    /// </summary>
    public ICaptureTriggerState Captured { get; init; }
    
    /// <summary>
    /// Преобразует прямоугольник из локальных координат viewport в экранные координаты.
    /// </summary>
    /// <param name="local">Прямоугольник в локальных координатах viewport, который нужно преобразовать.</param>
    /// <returns>Прямоугольник в экранных координатах.</returns>
    public WinRectangle ToScreen(SharpRectangle local)
    {
        var screenRect = local.ToWinRectangle();
        return ToScreen(screenRect);
    }
    
    /// <summary>
    /// Преобразует прямоугольник из локальных координат viewport в экранные координаты.
    /// </summary>
    /// <param name="local">Прямоугольник в локальных координатах viewport, который нужно преобразовать.</param>
    /// <returns>Прямоугольник в экранных координатах.</returns>
    public WinRectangle ToScreen(WinRectangle local)
    {
        return local.Transform(ViewportTransforms.WorldToScreen);
    }

    /// <summary>
    /// Преобразует прямоугольник из локальных координат viewport в экранные координаты,
    /// сохраняя дробные значения пикселей.
    /// </summary>
    /// <param name="local">Прямоугольник в локальных координатах viewport с точностью float.</param>
    /// <returns>Прямоугольник в экранных координатах с точностью float.</returns>
    public WinRectangleF ToScreen(WinRectangleF local)
    {
        return local.Transform(ViewportTransforms.WorldToScreen);
    }
    
    /// <summary>
    /// Преобразует прямоугольник из локальных координат viewport в экранные координаты.
    /// </summary>
    /// <param name="local">Прямоугольник в локальных координатах viewport.</param>
    /// <param name="anchorType">Тип привязки, указывающий, какая часть прямоугольника должна использоваться для вычисления экранной точки. По умолчанию — <see cref="RegionAnchorType.Center"/>.</param>
    /// <returns>Точка в экранных координатах.</returns>
    public WinPoint ToScreenPoint(SharpRectangle local, RegionAnchorType anchorType = RegionAnchorType.Center)
    {
        var screenRect = ToScreen(local);
        var screenRectF = screenRect.ToRectangleF();
        return screenRectF.ToPointInRegion(anchorType).ToPoint();
    }

    /// <summary>
    /// Преобразует прямоугольник из локальных координат viewport в экранные координаты.
    /// </summary>
    /// <param name="local">Прямоугольник в локальных координатах viewport.</param>
    /// <param name="anchorType">Тип привязки, указывающий, какая часть прямоугольника должна использоваться для вычисления экранной точки. По умолчанию — <see cref="RegionAnchorType.Center"/>.</param>
    /// <returns>Точка в экранных координатах.</returns>
    public WinPoint ToScreenPoint(WinRectangle local, RegionAnchorType anchorType = RegionAnchorType.Center)
    {
        var screenRect = ToScreen(local);
        var screenRectF = screenRect.ToRectangleF();
        return screenRectF.ToPointInRegion(anchorType).ToPoint();
    }
     
    /// <summary>
    /// Преобразует прямоугольник из локальных координат viewport в экранные координаты,
    /// сохраняя дробные значения пикселей.
    /// </summary>
    /// <param name="local">Прямоугольник в локальных координатах viewport.</param>
    /// <param name="anchorType">Тип привязки, указывающий, какая часть прямоугольника должна использоваться для вычисления экранной точки. По умолчанию — <see cref="RegionAnchorType.Center"/>.</param>
    /// <returns>Точка в экранных координатах с точностью float.</returns>
    public WinPointF ToScreenPoint(WinRectangleF local, RegionAnchorType anchorType = RegionAnchorType.Center)
    {
        var screenRectF = ToScreen(local);
        return screenRectF.ToPointInRegion(anchorType);
    }
}

```