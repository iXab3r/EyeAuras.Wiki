---
title: IComputerVisionExperimentalScriptingApi
description: 
published: true
date: 2025-03-21T23:37:38.346Z
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
    /// Creates ComputerVision accessor for a primary screen
    /// </summary>
    /// <returns></returns>
    public IComputerVisionAccessor ForScreen();
    
    /// <summary>
    /// Creates ComputerVision accessor for a window specified by window handle
    /// </summary>
    /// <returns></returns>
    public IComputerVisionAccessor ForWindow(IWindowHandle targetWindow);

    /// <summary>
    /// Creates ComputerVision accessor for a window with a specific title/process name/window/etc
    /// </summary>
    /// <param name="args">Contains parameters such as target window, FPS, etc</param>
    /// <returns></returns>
    public IComputerVisionAccessor For(ComputerVisionAccessorArgs args);
}

/// <summary>
/// IMPORTANT! This API is a subject to change and is still experimental. Apologies for possible inconveniences
/// and potential breaking changes
/// Provides methods for performing computer vision-related tasks such as image search, 
/// pixel search, text recognition, and ML-based predictions within specified screen regions.
/// </summary>
public interface IComputerVisionAccessor : IDisposable
{
    /// <summary>
    /// Enables or disables the On-Screen Display (OSD) mode for visualizing detected elements in real-time.
    /// </summary>
    bool Osd { get; set; }

    /// <summary>
    /// Specifies the frames per second (FPS) for the On-Screen Display (OSD) mode. 
    /// Controls how frequently OSD updates occur.
    /// </summary>
    float OsdFps { get; set; }
    
    /// <summary>
    /// Searches for an image within a specified region of the screen.
    /// </summary>
    /// <param name="imageFilePath">Path to the image file to search for.</param>
    /// <param name="percentage">Image similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>A Rectangle representing the matched image's location. Empty if no match is found.</returns>
    WindowImageProcessedEventArgs<IImageSearchDetectionResult> ImageSearchRaw(
        string imageFilePath,
        Percentage? percentage = default,
        Rectangle region = default);

    /// <summary>
    /// Searches for a pixel of a specified color within a defined screen region.
    /// </summary>
    /// <param name="color">The color to search for.</param>
    /// <param name="percentage">Pixel similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region to scan for the color.</param>
    /// <returns>The location of the first found pixel. Returns Point.Empty if not found.</returns>
    WindowImageProcessedEventArgs<IColorSearchDetectionResult> PixelSearchRaw(
        Color color,
        Percentage? percentage = default,
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
    /// <param name="percentage">Image similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region on the screen/inside window to analyze.</param>
    /// <returns>A Rectangle representing the matched image's location. Empty if no match is found.</returns>
    Rectangle ImageSearch(
        string imageFilePath,
        Percentage? percentage = default,
        Rectangle region = default);

    /// <summary>
    /// Searches for a pixel of a specified color within a defined screen region.
    /// </summary>
    /// <param name="color">The color to search for.</param>
    /// <param name="percentage">Pixel similarity threshold, 0-100, 100 = exact match</param>
    /// <param name="region">The region to scan for the color.</param>
    /// <returns>The location of the first found pixel. Returns Point.Empty if not found.</returns>
    Point PixelSearch(
        Color color,
        Percentage? percentage = default,
        Rectangle region = default);

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
    /// Searches for an image within a specified rectangular region defined by coordinates and size.
    /// </summary>
    Rectangle ImageSearch(string imageFilePath, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return ImageSearch(imageFilePath, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for a pixel of a specified color within a defined rectangular region.
    /// </summary>
    Point PixelSearch(Color color, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(color, region: new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Searches for a pixel using a color value represented as an integer.
    /// </summary>
    Point PixelSearch(int color)
    {
        return PixelSearch(Color.FromArgb(color));
    }

    /// <summary>
    /// Searches for a pixel with a specified integer color value within a defined region.
    /// </summary>
    Point PixelSearch(int color, Rectangle region)
    {
        return PixelSearch(Color.FromArgb(color), region: region);
    }

    /// <summary>
    /// Searches for a pixel with a specified integer color value within a defined rectangular region.
    /// </summary>
    Point PixelSearch(int color, int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return PixelSearch(color, new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Performs text recognition within a defined rectangular region.
    /// </summary>
    string TextSearch(int regionX, int regionY, int regionWidth, int regionHeight)
    {
        return TextSearch(new Rectangle(regionX, regionY, regionWidth, regionHeight));
    }

    /// <summary>
    /// Enables On-Screen Display (OSD) mode to visualize detected objects in real-time.
    /// </summary>
    IComputerVisionAccessor EnableOsd()
    {
        Osd = true;
        return this;
    }

    /// <summary>
    /// Enables On-Screen Display (OSD) mode with a specified frame rate.
    /// </summary>
    /// <param name="fps">Frames per second for OSD updates.</param>
    IComputerVisionAccessor EnableOsd(float fps)
    {
        OsdFps = fps;
        return EnableOsd();
    }

    /// <summary>
    /// Disables On-Screen Display (OSD) mode.
    /// </summary>
    IComputerVisionAccessor DisableOsd()
    {
        Osd = false;
        return this;
    }
}
```