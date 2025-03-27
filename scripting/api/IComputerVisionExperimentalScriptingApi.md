---
title: IComputerVisionExperimentalScriptingApi
description: 
published: true
date: 2025-03-27T10:24:08.517Z
tags: 
editor: markdown
dateCreated: 2025-03-21T23:37:38.346Z
---

```csharp
/// <summary>
/// IMPORTANT! This API is a subject to change and is still experimental. Apologies for possible inconveniences
/// and potential breaking changes
/// Provides methods for performing computer vision-related tasks such as image search, 
/// pixel search, text recognition, and ML-based predictions within specified screen regions.
/// </summary>
public interface IComputerVisionExperimentalScriptingApi : IScriptingApi
{
    /// <summary>
    /// Returns instance of CV API which BYPASS caching mechanism - with it you are on your
    /// own. This will provide a bit better performance for a case when you have a single Script
    /// controlling everything. Absolutely not applicable for BTs/Macros usage.
    /// </summary>
    /// <returns></returns>
    public IComputerVisionExperimentalScriptingApi WithoutCaching();
    
    /// <summary>
    /// Creates ComputerVision accessor for a primary screen
    /// </summary>
    /// <returns></returns>
    public ICvAccessor ForScreen();
    
    /// <summary>
    /// Creates ComputerVision accessor for a window specified by window handle
    /// </summary>
    /// <returns></returns>
    public ICvAccessor ForWindow(IWindowHandle targetWindow);

    /// <summary>
    /// Creates ComputerVision accessor for a window with a specific title/process name/window/etc
    /// </summary>
    /// <param name="args">Contains parameters such as target window, FPS, etc</param>
    /// <returns></returns>
    public ICvAccessor For(ComputerVisionAccessorArgs args);
}

/// <summary>
/// IMPORTANT! This API is a subject to change and is still experimental. Apologies for possible inconveniences
/// and potential breaking changes
/// Provides methods for performing computer vision-related tasks such as image search, 
/// pixel search, text recognition, and ML-based predictions within specified screen regions.
/// </summary>
public interface ICvAccessor : IDisposable
{
    /// <summary>
    /// Enables or disables the On-Screen Display (OSD) mode for visualizing detected elements in real-time.
    /// </summary>
    bool IsOsdEnabled { get; set; }

    /// <summary>
    /// Specifies the frames per second (FPS) for the On-Screen Display (OSD) mode. 
    /// Controls how frequently OSD updates occur.
    /// </summary>
    float OsdFps { get; set; }

    /// <summary>
    /// Enables or disables performance profiling. Useful for finding out bottlenecks
    /// </summary>
    bool IsProfilingEnabled { get; set; }

    /// <summary>
    /// Provides access to Computer-Vision profiling mechanism, allowing you to do additional measures
    /// </summary>
    MiniProfiler Profiler { get; }

    /// <summary>
    /// Searches for an image within a specified region of the screen.
    /// </summary>
    /// <param name="imageFilePath">Path to the image file to search for.</param>
    /// <param name="similarityThreshold">Image similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>A Rectangle representing the matched image's location. Empty if no match is found.</returns>
    WindowImageProcessedEventArgs<IImageSearchDetectionResult> ImageSearchRaw(
        string imageFilePath,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Searches for a pixel of a specified color within a defined screen region.
    /// </summary>
    /// <param name="color">The color to search for.</param>
    /// <param name="similarityThreshold">Pixel similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region to scan for the color.</param>
    /// <returns>The location of the first found pixel. Returns Point.Empty if not found.</returns>
    WindowImageProcessedEventArgs<IColorSearchDetectionResult> PixelSearchRaw(
        Color color,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Extracts text from a specified region of the screen using Optical Character Recognition (OCR).
    /// </summary>
    /// <param name="includeTextSegments">If set, will include Text segments (~word-level segments)</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>A string containing the detected text.</returns>
    WindowImageProcessedEventArgs<ITextSearchDetectionResult> TextSearchRaw(
        bool includeTextSegments = false,
        Rectangle region = default);

    /// <summary>
    /// Performs machine learning (ML) model prediction within a specified screen region.
    /// </summary>
    /// <param name="mlModelFilePath">Path to the ML model file.</param>
    /// <param name="confidenceThreshold">Confidence threshold, higher - better match, lower number of results</param>
    /// <param name="iouThreshold">Intersection-over-Union threshold. More on it here https://www.v7labs.com/blog/intersection-over-union-guide</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>An array of detected objects with predictions.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Percentage? confidenceThreshold = default,
        Percentage? iouThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Searches for an image within a specified region of the screen.
    /// </summary>
    /// <param name="imageFilePath">Path to the image file to search for.</param>
    /// <param name="similarityThreshold">Image similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>A Rectangle representing the matched image's location. Empty if no match is found.</returns>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Searches for a pixel of a specified color within a defined screen region.
    /// </summary>
    /// <param name="color">The color to search for.</param>
    /// <param name="similarityThreshold">Pixel similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region to scan for the color.</param>
    /// <returns>The location of the first found pixel. Returns Point.Empty if not found.</returns>
    Point PixelSearch(
        Color color,
        Percentage? similarityThreshold = default,
        Rectangle region = default);

    /// <summary>
    /// Counts the number of pixels in the specified region that match the given color.
    /// </summary>
    /// <param name="color">The color to search for within the specified region.</param>
    /// <param name="similarityThreshold">
    /// An optional similarity threshold that determines how closely the pixel's color must match 
    /// the specified color. A value of 100% requires an exact match, while lower values allow for 
    /// some variance in the color.
    /// </param>
    /// <param name="region">
    /// An optional rectangular area to restrict the pixel count search. 
    /// If no region is specified, the entire area will be scanned.
    /// </param>
    /// <returns>
    /// The total number of pixels that match the specified color within the given region.
    /// </returns>
    /// <remarks>
    /// This method can be useful for identifying areas of solid color, detecting UI elements, 
    /// or analyzing visual content within a screen capture.
    /// 
    /// Example usage:
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
    /// Processes the image pixels using the provided function and returns the result of the function.
    /// </summary>
    /// <typeparam name="T">The return type of the processing function.</typeparam>
    /// <param name="imageProcessor">A function that processes the image and returns a result.</param>
    /// <param name="region">The specific region of the image to process. If omitted, the entire image is processed.</param>
    /// <returns>The result returned by the <paramref name="imageProcessor"/>.</returns>
    /// <remarks>
    /// The image provided to the <paramref name="imageProcessor"/> is **shared** across multiple system components.
    /// While inside the imageProcessor function, the image will remain stable and won't change. However, if you need to 
    /// modify the image or retain a stable version for further processing outside the function, you should clone the image. 
    ///
    /// Example of cloning the image for safe modification:
    /// <code>
    /// ProcessPixels(image =>
    /// {
    ///     return image.Clone(); //you can do whatever you want with the clone
    /// });
    /// </code>
    ///
    /// This ensures your modifications won’t interfere with other system components that are also using the same shared image.
    /// </remarks>
    T ProcessPixels<T>(Func<Image<Bgr, byte>, T> imageProcessor, Rectangle region = default);

    /// <summary>
    /// Processes the image pixels using the provided action. No value is returned.
    /// </summary>
    /// <param name="imageProcessor">An action that processes the image.</param>
    /// <param name="region">The specific region of the image to process. If omitted, the entire image is processed.</param>
    /// <remarks>
    /// The image provided to the <paramref name="imageProcessor"/> is **shared** across multiple system components.
    /// While inside the imageProcessor function, the image will remain stable and won't change. However, if you need to 
    /// modify the image or retain a stable version for further processing outside the function, you should clone the image. 
    ///
    /// Example of cloning the image for safe modification:
    /// <code>
    /// ProcessPixels(image =>
    /// {
    ///     return image.Clone(); //you can do whatever you want with the clone
    /// });
    /// </code>
    ///
    /// This ensures your modifications won’t interfere with other system components that are also using the same shared image.
    /// </remarks>
    void ProcessPixels(Action<Image<Bgr, byte>> imageProcessor, Rectangle region = default);

    /// <summary>
    /// Extracts text from a specified region of the screen using Optical Character Recognition (OCR).
    /// </summary>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>A string containing the detected text.</returns>
    string TextSearch(Rectangle region = default);

    /// <summary>
    /// Performs machine learning (ML) model prediction within a specified screen region.
    /// </summary>
    /// <param name="mlModelFilePath">Path to the ML model file.</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>An array of detected objects with predictions.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Rectangle region)
    {
        return MLSearchRaw(mlModelFilePath, confidenceThreshold: default, iouThreshold: default, region: region);
    }

    /// <summary>
    /// Performs machine learning (ML) model prediction within a specified screen region.
    /// </summary>
    /// <param name="mlModelFilePath">Path to the ML model file.</param>
    /// <param name="confidenceThreshold">Confidence threshold, higher - better match, lower number of results</param>
    /// <param name="iouThreshold">Intersection-over-Union threshold. More on it here https://www.v7labs.com/blog/intersection-over-union-guide</param>
    /// <param name="regionX">X coordinate of top-left corner of the region</param>
    /// <param name="regionY">Y coordinate of top-left corner of the region</param>
    /// <param name="regionWidth">Width of the region</param>
    /// <param name="regionHeight">Height of the region</param>
    /// <returns>An array of detected objects with predictions.</returns>
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
    /// Performs machine learning (ML) model prediction within a specified screen region.
    /// </summary>
    /// <param name="mlModelFilePath">Path to the ML model file.</param>
    /// <param name="confidenceThreshold">Confidence threshold, higher - better match, lower number of results</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>An array of detected objects with predictions.</returns>
    WindowImageProcessedEventArgs<IMLSearchDetectionResult> MLSearchRaw(
        string mlModelFilePath,
        Percentage? confidenceThreshold,
        Rectangle region)
    {
        return MLSearchRaw(mlModelFilePath, confidenceThreshold: confidenceThreshold, iouThreshold: default, region: region);
    }

    /// <summary>
    /// Performs machine learning (ML) model prediction within a specified screen region.
    /// </summary>
    /// <param name="mlModelFilePath">Path to the ML model file.</param>
    /// <param name="confidenceThreshold">Confidence threshold, higher - better match, lower number of results</param>
    /// <param name="regionX">X coordinate of top-left corner of the region</param>
    /// <param name="regionY">Y coordinate of top-left corner of the region</param>
    /// <param name="regionWidth">Width of the region</param>
    /// <param name="regionHeight">Height of the region</param>
    /// <returns>An array of detected objects with predictions.</returns>
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
    /// Searches for an image within a specified region of the screen.
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
    /// Searches for an image within a specified region of the screen.
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
    /// Searches for an image within a specified rectangular region defined by coordinates and size.
    /// </summary>
    Rectangle ImageSearch(
        string imageFilePath,
        Rectangle region)
    {
        return ImageSearch(imageFilePath, similarityThreshold: default, region: region);
    }

    /// <summary>
    /// Searches for an image within a specified rectangular region defined by coordinates and size.
    /// </summary>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage similarityThreshold)
    {
        return ImageSearch(imageFilePath, similarityThreshold: similarityThreshold, region: default);
    }

    /// <summary>
    /// Searches for an image within a specified rectangular region defined by coordinates and size.
    /// </summary>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage similarityThreshold,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return ImageSearch(imageFilePath, similarityThreshold: similarityThreshold, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for an image within a specified rectangular region defined by coordinates and size.
    /// </summary>
    Rectangle ImageSearch(string imageFilePath, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return ImageSearch(imageFilePath, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for a pixel with a specified integer color value within a defined region.
    /// </summary>
    Point PixelSearch(Color color, Rectangle region)
    {
        return PixelSearch(color, similarityThreshold: default, region: region);
    }

    /// <summary>
    /// Searches for a pixel of a specified color within a defined rectangular region.
    /// </summary>
    Point PixelSearch(Color color, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(color, similarityThreshold: default, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for a pixel of a specified color within a defined rectangular region.
    /// </summary>
    Point PixelSearch(Color color, Percentage similarityThreshold, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(color, similarityThreshold: similarityThreshold, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for a pixel using a color value represented as an integer.
    /// </summary>
    Point PixelSearch(int color)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: default, region: default);
    }

    /// <summary>
    /// Searches for a pixel using a color value represented as an integer.
    /// </summary>
    Point PixelSearch(int color, Percentage similarityThreshold)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: similarityThreshold, region: default);
    }

    /// <summary>
    /// Searches for a pixel with a specified integer color value within a defined region.
    /// </summary>
    Point PixelSearch(int color, Rectangle region)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: default, region: region);
    }

    /// <summary>
    /// Searches for a pixel using a color value represented as an integer.
    /// </summary>
    Point PixelSearch(int color, Percentage similarityThreshold, Rectangle region)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: similarityThreshold, region: region);
    }

    /// <summary>
    /// Searches for a pixel with a specified integer color value within a defined rectangular region.
    /// </summary>
    Point PixelSearch(int color, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: default, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for a pixel with a specified integer color value within a defined rectangular region.
    /// </summary>
    Point PixelSearch(int color, Percentage similarityThreshold, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(Color.FromArgb(color), similarityThreshold: similarityThreshold, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Performs text recognition within a defined rectangular region.
    /// </summary>
    string TextSearch(int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return TextSearch(new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Counts the number of pixels in the specified region that match the given color.
    /// </summary>
    int CountPixels(
        Color color,
        Percentage? similarityThreshold,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(color, similarityThreshold: similarityThreshold, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Counts the number of pixels in the specified region that match the given color.
    /// </summary>
    int CountPixels(
        Color color,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(color, similarityThreshold: default, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Counts the number of pixels in the specified region that match the given color.
    /// </summary>
    int CountPixels(
        int colorArgb,
        Percentage? similarityThreshold,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(Color.FromArgb(colorArgb), similarityThreshold: similarityThreshold, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Counts the number of pixels in the specified region that match the given color.
    /// </summary>
    int CountPixels(
        int colorArgb,
        int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return CountPixels(Color.FromArgb(colorArgb), similarityThreshold: default, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Enables On-Screen Display (OSD) mode to visualize detected objects in real-time.
    /// </summary>
    ICvAccessor EnableOsd()
    {
        IsOsdEnabled = true;
        return this;
    }

    /// <summary>
    /// Enables On-Screen Display (OSD) mode with a specified frame rate.
    /// </summary>
    /// <param name="fps">Frames per second for OSD updates.</param>
    ICvAccessor EnableOsd(float fps)
    {
        OsdFps = fps;
        return EnableOsd();
    }

    /// <summary>
    /// Disables On-Screen Display (OSD) mode.
    /// </summary>
    ICvAccessor DisableOsd()
    {
        IsOsdEnabled = false;
        return this;
    }

    /// <summary>
    /// Enables performance profiling.
    /// </summary>
    ICvAccessor EnableProfiling()
    {
        IsProfilingEnabled = true;
        return this;
    }

    /// <summary>
    /// Disables performance profiling.
    /// </summary>
    ICvAccessor DisableProfiling()
    {
        IsProfilingEnabled = false;
        return this;
    }
}
```