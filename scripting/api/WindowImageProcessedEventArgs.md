---
title: WindowImageProcessedEventArgs
description: Represents the event arguments for an image processing trigger, containing the results and transformations required to map detected objects from local to screen coordinates.
published: true
date: 2025-03-21T23:35:26.504Z
tags: image processing, event arguments, coordinates transformation
editor: markdown
dateCreated: 2024-04-22T09:26:21.746Z
---

```csharp
/// <summary>
/// Represents the event arguments for an image processing trigger, containing the results
/// and transformations required to map detected objects from local to screen coordinates.
/// </summary>
/// <typeparam name="TDetectionResult">The type of the trigger result, encapsulating details about detected objects.</typeparam>
public sealed record WindowImageProcessedEventArgs<TDetectionResult> where TDetectionResult : ICaptureTriggerDetectionResult
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