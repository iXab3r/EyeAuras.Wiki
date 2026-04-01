---
title: Экспериментальный API сценариев компьютерного зрения
description: Интерфейс экспериментального API для сценариев компьютерного зрения.
published: true
date: 2025-03-27T10:24:08.517Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-21T23:37:38.346Z
---
```csharp
/// <summary>
/// ВАЖНО! Этот API пока экспериментальный и может измениться. Возможны неудобства
/// и ломающие изменения.
/// Предоставляет методы для задач компьютерного зрения: поиск изображений,
/// поиск пикселей, распознавание текста и предсказания на основе ML
/// в указанных областях экрана.
/// </summary>
public interface IComputerVisionExperimentalScriptingApi : IScriptingApi
{
    /// <summary>
    /// Возвращает экземпляр CV API, который ОБХОДИТ механизм кеширования — в этом случае
    /// вы полностью отвечаете за последствия сами. Это может дать немного лучшую производительность,
    /// если у вас один Script управляет всем. Совершенно не подходит для использования в BT/Macros.
    /// </summary>
    /// <returns></returns>
    public IComputerVisionExperimentalScriptingApi WithoutCaching();
    
    /// <summary>
    /// Создаёт accessor ComputerVision для основного экрана
    /// </summary>
    /// <returns></returns>
    public ICvAccessor ForScreen();
    
    /// <summary>
    /// Создаёт accessor ComputerVision для окна, указанного через window handle
    /// </summary>
    /// <returns></returns>
    public ICvAccessor ForWindow(IWindowHandle targetWindow);

    /// <summary>
    /// Создаёт accessor ComputerVision для окна с определённым заголовком/process name/window и т. д.
    /// </summary>
    /// <param name="args">Содержит параметры, например целевое окно, FPS и т. д.</param>
    /// <returns></returns>
    public ICvAccessor For(ComputerVisionAccessorArgs args);
}

/// <summary>
/// ВАЖНО! Этот API пока экспериментальный и может измениться. Возможны неудобства
/// и ломающие изменения.
/// Предоставляет методы для задач компьютерного зрения: поиск изображений,
/// поиск пикселей, распознавание текста и предсказания на основе ML
/// в указанных областях экрана.
/// </summary>
public interface ICvAccessor : IDisposable
{
    /// <summary>
    /// Включает или отключает режим On-Screen Display (OSD) для визуализации найденных элементов в реальном времени.
    /// </summary>
    bool IsOsdEnabled { get; set; }

    /// <summary>
    /// Задаёт количество кадров в секунду (FPS) для режима On-Screen Display (OSD).
    /// Определяет, как часто обновляется OSD.
    /// </summary>
    float OsdFps { get; set; }

    /// <summary>
    /// Включает или отключает профилирование производительности. Полезно для поиска узких мест.
    /// </summary>
    bool IsProfilingEnabled { get; set; }

    /// <summary>
    /// Предоставляет доступ к механизму профилирования Computer-Vision, чтобы вы могли выполнять дополнительные замеры.
    /// </summary>
    MiniProfiler Profiler { get; }

    /// <summary>
    /// Ищет изображение в указанной области экрана.
    /// </summary>
    /// <param name="imageFilePath">Путь к файлу изображения, которое нужно найти.</param>
    /// <param name="similarityThreshold">Порог похожести изображения, 0-100, 100 = точное совпадение</param>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Rectangle с координатами найденного изображения. Если совпадение не найдено — Empty.</returns>
    WindowImageProcessedEventArgs<IImageSearchDetectionResult> ImageSearchRaw(
        string imageFilePath,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Ищет пиксель указанного цвета в заданной области экрана.
    /// </summary>
    /// <param name="color">Цвет для поиска.</param>
    /// <param name="similarityThreshold">Порог похожести пикселя, 0-100, 100 = точное совпадение</param>
    /// <param name="region">Область, в которой нужно искать цвет.</param>
    /// <returns>Координаты первого найденного пикселя. Если ничего не найдено, возвращает Point.Empty.</returns>
    WindowImageProcessedEventArgs<IColorSearchDetectionResult> PixelSearchRaw(
        Color color,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Извлекает текст из указанной области экрана с помощью Optical Character Recognition (OCR).
    /// </summary>
    /// <param name="includeTextSegments">Если включено, будут добавлены текстовые сегменты (~сегменты уровня слов)</param>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Строка с распознанным текстом.</returns>
    WindowImageProcessedEventArgs<ITextSearchDetectionResult> TextSearchRaw(
        bool includeTextSegments = false,
        Rectangle region = default);

    /// <summary>
    /// Выполняет предсказание модели машинного обучения (ML) в указанной области экрана.
    /// </summary>
    /// <param name="mlModelFilePath">Путь к файлу ML-модели.</param>
    /// <param name="confidenceThreshold">Порог уверенности: чем выше, тем точнее совпадение и тем меньше результатов</param>
    /// <param name="iouThreshold">Порог Intersection-over-Union. Подробнее: https://www.v7labs.com/blog/intersection-over-union-guide</param>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Массив найденных объектов с предсказаниями.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Percentage? confidenceThreshold = default,
        Percentage? iouThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Ищет изображение в указанной области экрана.
    /// </summary>
    /// <param name="imageFilePath">Путь к файлу изображения, которое нужно найти.</param>
    /// <param name="similarityThreshold">Порог похожести изображения, 0-100, 100 = точное совпадение</param>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Rectangle с координатами найденного изображения. Если совпадение не найдено — Empty.</returns>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Ищет пиксель указанного цвета в заданной области экрана.
    /// </summary>
    /// <param name="color">Цвет для поиска.</param>
    /// <param name="similarityThreshold">Порог похожести пикселя, 0-100, 100 = точное совпадение</param>
    /// <param name="region">Область, в которой нужно искать цвет.</param>
    /// <returns>Координаты первого найденного пикселя. Если ничего не найдено, возвращает Point.Empty.</returns>
    Point PixelSearch(
        Color color,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Подсчитывает количество пикселей в указанной области, которые совпадают с заданным цветом.
    /// </summary>
    /// <param name="color">Цвет, который нужно искать в указанной области.</param>
    /// <param name="similarityThreshold">
    /// Необязательный порог похожести, который определяет,
    /// насколько близко цвет пикселя должен совпадать с указанным цветом.
    /// Значение 100% требует точного совпадения, а меньшие значения допускают
    /// некоторое отклонение по цвету.
    /// </param>
    /// <param name="region">
    /// Необязательная прямоугольная область, ограничивающая поиск.
    /// Если область не указана, будет просканирована вся доступная область.
    /// </param>
    /// <returns>
    /// Общее количество пикселей, совпадающих с указанным цветом в заданной области.
    /// </returns>
    /// <remarks>
    /// Этот метод может быть полезен для определения областей сплошного цвета, поиска элементов UI
    /// или анализа визуального содержимого внутри захвата экрана.
    /// 
    /// Пример использования:
    /// <code>
    /// var redPixels = CountPixels(Color.Red, new Percentage(90), new Rectangle(0, 0, 800, 600));
    /// Console.WriteLine($"Found {redPixels} red pixels.");
    /// </code>
    /// </remarks>
    int CountPixels(
        Color color,
        Percentage? similarityThreshold = default,
        Rectangle region = default);


    /// <summary>
    /// Обрабатывает пиксели изображения с помощью переданной функции и возвращает её результат.
    /// </summary>
    /// <typeparam name="T">Тип значения, возвращаемого функцией обработки.</typeparam>
    /// <param name="imageProcessor">Функция, которая обрабатывает изображение и возвращает результат.</param>
    /// <param name="region">Конкретная область изображения для обработки. Если не указана, обрабатывается всё изображение.</param>
    /// <returns>Результат, возвращённый <paramref name="imageProcessor"/>.</returns>
    /// <remarks>
    /// Изображение, передаваемое в <paramref name="imageProcessor"/>, **используется совместно** несколькими компонентами системы.
    /// Пока выполняется функция imageProcessor, изображение остаётся стабильным и не изменяется. Однако если вам нужно
    /// изменить изображение или сохранить стабильную версию для дальнейшей обработки вне этой функции, следует клонировать изображение.
    ///
    /// Пример клонирования изображения для безопасного изменения:
    /// <code>
    /// ProcessPixels(image =>
    /// {
    ///     return image.Clone(); //you can do whatever you want with the clone
    /// });
    /// </code>
    ///
    /// Это гарантирует, что ваши изменения не повлияют на другие компоненты системы, которые также используют это же общее изображение.
    /// </remarks>
    T ProcessPixels<T>(Func<Image<Bgr, byte>, T> imageProcessor, Rectangle region = default);

    /// <summary>
    /// Обрабатывает пиксели изображения с помощью переданного действия. Значение не возвращается.
    /// </summary>
    /// <param name="imageProcessor">Действие, которое обрабатывает изображение.</param>
    /// <param name="region">Конкретная область изображения для обработки. Если не указана, обрабатывается всё изображение.</param>
    /// <remarks>
    /// Изображение, передаваемое в <paramref name="imageProcessor"/>, **используется совместно** несколькими компонентами системы.
    /// Пока выполняется функция imageProcessor, изображение остаётся стабильным и не изменяется. Однако если вам нужно
    /// изменить изображение или сохранить стабильную версию для дальнейшей обработки вне этой функции, следует клонировать изображение.
    ///
    /// Пример клонирования изображения для безопасного изменения:
    /// <code>
    /// ProcessPixels(image =>
    /// {
    ///     return image.Clone(); //you can do whatever you want with the clone
    /// });
    /// </code>
    ///
    /// Это гарантирует, что ваши изменения не повлияют на другие компоненты системы, которые также используют это же общее изображение.
    /// </remarks>
    void ProcessPixels(Action<Image<Bgr, byte>> imageProcessor, Rectangle region = default);

    /// <summary>
    /// Извлекает текст из указанной области экрана с помощью Optical Character Recognition (OCR).
    /// </summary>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Строка с распознанным текстом.</returns>
    string TextSearch(Rectangle region = default);

    /// <summary>
    /// Выполняет предсказание модели машинного обучения (ML) в указанной области экрана.
    /// </summary>
    /// <param name="mlModelFilePath">Путь к файлу ML-модели.</param>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Массив найденных объектов с предсказаниями.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Rectangle region)
    {
        return MLSearchRaw(mlModelFilePath, confidenceThreshold: default, iouThreshold: default, region: region);
    }

    /// <summary>
    /// Выполняет предсказание модели машинного обучения (ML) в указанной области экрана.
    /// </summary>
    /// <param name="mlModelFilePath">Путь к файлу ML-модели.</param>
    /// <param name="confidenceThreshold">Порог уверенности: чем выше, тем точнее совпадение и тем меньше результатов</param>
    /// <param name="iouThreshold">Порог Intersection-over-Union. Подробнее: https://www.v7labs.com/blog/intersection-over-union-guide</param>
    /// <param name="regionX">Координата X верхнего левого угла области</param>
    /// <param name="regionY">Координата Y верхнего левого угла области</param>
    /// <param name="regionWidth">Ширина области</param>
    /// <param name="regionHeight">Высота области</param>
    /// <returns>Массив найденных объектов с предсказаниями.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Percentage? confidenceThreshold,
        Percentage? iouThreshold,
        int regionX,
        int regionY,
        int regionWidth,
        int regionHeight)
    {
        return MLSearchRaw(mlModelFilePath, confidenceThreshold: confidenceThreshold, iouThreshold: iouThreshold, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Выполняет предсказание модели машинного обучения (ML) в указанной области экрана.
    /// </summary>
    /// <param name="mlModelFilePath">Путь к файлу ML-модели.</param>
    /// <param name="confidenceThreshold">Порог уверенности: чем выше, тем точнее совпадение и тем меньше результатов</param>
    /// <param name="region">Область экрана/внутри окна для анализа.</param>
    /// <returns>Массив найденных объектов с предсказаниями.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Percentage? confidenceThreshold,
        Rectangle region)
    {
        return MLSearchRaw(mlModelFilePath, confidenceThreshold: confidenceThreshold, iouThreshold: default, region: region);
    }

    /// <summary>
    /// Выполняет предсказание модели машинного обучения (ML) в указанной области экрана.
    /// </summary>
    /// <param name="mlModelFilePath">Путь к файлу ML-модели.</param>
    /// <param name="confidenceThreshold">Порог уверенности: чем выше, тем точнее совпадение и тем меньше результатов</param>
    /// <param name="regionX">Координата X верхнего левого угла области</param>
    /// <param name="regionY">Координата Y верхнего левого угла области</param>
    /// <param name="regionWidth">Ширина области</param>
    /// <param name="regionHeight">Высота области</param>
    /// <returns>Массив найденных объектов с предсказаниями.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Percentage? confidenceThreshold,
        int regionX,
        int regionY,
        int regionWidth,
        int regionHeight)
    {
        return MLSearchRaw(mlModelFilePath, confidenceThreshold: confidenceThreshold, iouThreshold: default, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет изображение в указанной области экрана.
    /// </summary>
    WindowImageProcessedEventArgs<IImageSearchDetectionResult> ImageSearchRaw(
        string imageFilePath,
        Percentage? similarityThreshold,
        int regionX,
        int regionY,
        int regionWidth,
        int regionHeight)
    {
        return ImageSearchRaw(imageFilePath, similarityThreshold, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет изображение в указанной области экрана.
    /// </summary>
    WindowImageProcessedEventArgs<IImageSearchDetectionResult> ImageSearchRaw(
        string imageFilePath,
        int regionX,
        int regionY,
        int regionWidth,
        int regionHeight)
    {
        return ImageSearchRaw(imageFilePath, similarityThreshold: default, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет изображение в указанной прямоугольной области, заданной координатами и размерами.
    /// </summary>
    Rectangle ImageSearch(
        string imageFilePath,
        Rectangle region)
    {
        return ImageSearch(imageFilePath, similarityThreshold: default, region: region);
    }

    /// <summary>
    /// Ищет изображение в указанной прямоугольной области, заданной координатами и размерами.
    /// </summary>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage similarityThreshold)
    {
        return ImageSearch(imageFilePath, similarityThreshold: similarityThreshold, region: default);
    }

    /// <summary>
    /// Ищет изображение в указанной прямоугольной области, заданной координатами и размерами.
    /// </summary>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage similarityThreshold,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return ImageSearch(imageFilePath, similarityThreshold: similarityThreshold, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет изображение в указанной прямоугольной области, заданной координатами и размерами.
    /// </summary>
    Rectangle ImageSearch(string imageFilePath, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return ImageSearch(imageFilePath, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет пиксель с указанным целочисленным значением цвета в заданной области.
    /// </summary>
    Point PixelSearch(Color color, Rectangle region)
    {
        return PixelSearch(color, similarityThreshold: default, region: region);
    }

    /// <summary>
    /// Ищет пиксель указанного цвета в заданной прямоугольной области.
    /// </summary>
    Point PixelSearch(Color color, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(color, similarityThreshold: default, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет пиксель указанного цвета в заданной прямоугольной области.
    /// </summary>
    Point PixelSearch(Color color, Percentage similarityThreshold, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(color, similarityThreshold: similarityThreshold, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет пиксель, используя значение цвета, представленное как integer.
    /// </summary>
    Point PixelSearch(int color)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: default, region: default);
    }

    /// <summary>
    /// Ищет пиксель, используя значение цвета, представленное как integer.
    /// </summary>
    Point PixelSearch(int color, Percentage similarityThreshold)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: similarityThreshold, region: default);
    }

    /// <summary>
    /// Ищет пиксель с указанным целочисленным значением цвета в заданной области.
    /// </summary>
    Point PixelSearch(int color, Rectangle region)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: default, region: region);
    }

    /// <summary>
    /// Ищет пиксель, используя значение цвета, представленное как integer.
    /// </summary>
    Point PixelSearch(int color, Percentage similarityThreshold, Rectangle region)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: similarityThreshold, region: region);
    }

    /// <summary>
    /// Ищет пиксель с указанным целочисленным значением цвета в заданной прямоугольной области.
    /// </summary>
    Point PixelSearch(int color, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: default, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Ищет пиксель с указанным целочисленным значением цвета в заданной прямоугольной области.
    /// </summary>
    Point PixelSearch(int color, Percentage similarityThreshold, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: similarityThreshold, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Выполняет распознавание текста в заданной прямоугольной области.
    /// </summary>
    string TextSearch(int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return TextSearch(new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Подсчитывает количество пикселей в указанной области, которые совпадают с заданным цветом.
    /// </summary>
    int CountPixels(
        Color color,
        Percentage? similarityThreshold,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(color, similarityThreshold: similarityThreshold, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Подсчитывает количество пикселей в указанной области, которые совпадают с заданным цветом.
    /// </summary>
    int CountPixels(
        Color color,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(color, similarityThreshold: default, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Подсчитывает количество пикселей в указанной области, которые совпадают с заданным цветом.
    /// </summary>
    int CountPixels(
        int colorArgb,
        Percentage? similarityThreshold,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(Color.FromArgb(colorArgb), similarityThreshold: similarityThreshold, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Подсчитывает количество пикселей в указанной области, которые совпадают с заданным цветом.
    /// </summary>
    int CountPixels(
        int colorArgb,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(Color.FromArgb(colorArgb), similarityThreshold: default, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Включает режим On-Screen Display (OSD) для визуализации найденных объектов в реальном времени.
    /// </summary>
    ICvAccessor EnableOsd()
    {
        IsOsdEnabled = true;
        return this;
    }

    /// <summary>
    /// Включает режим On-Screen Display (OSD) с указанной частотой кадров.
    /// </summary>
    /// <param name="fps">Кадров в секунду для обновления OSD.</param>
    ICvAccessor EnableOsd(float fps)
    {
        OsdFps = fps;
        return EnableOsd();
    }

    /// <summary>
    /// Отключает режим On-Screen Display (OSD).
    /// </summary>
    ICvAccessor DisableOsd()
    {
        IsOsdEnabled = false;
        return this;
    }

    /// <summary>
    /// Включает профилирование производительности.
    /// </summary>
    ICvAccessor EnableProfiling()
    {
        IsProfilingEnabled = true;
        return this;
    }

    /// <summary>
    /// Отключает профилирование производительности.
    /// </summary>
    ICvAccessor DisableProfiling()
    {
        IsProfilingEnabled = false;
        return this;
    }
}
```