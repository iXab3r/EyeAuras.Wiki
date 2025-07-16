---
title: IImGuiExperimentalApi
description: Interface providing methods for creating/drawing custom elements on the screen
published: true
date: 2025-07-16T10:42:20.621Z
tags: 
editor: markdown
dateCreated: 2025-07-16T10:36:31.172Z
---

> IMPORTANT! This API is shipped as a separate NuGet package which you have to reference in the script first! Recommend to pick the latest available version.
{.is-info}

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
#r "nuget:ImGui.NET, 1.91.6.1"
```


```csharp
/// <summary>
/// Experimental API for rendering custom UI and overlays using ImGui in EyeAuras.
/// Provides low-level drawing and layout utilities as well as access to render loop.
/// </summary>
public interface IImGuiExperimentalApi : IDisposable
{
    /// <summary>
    /// Adds a custom renderer that gets called every ImGui frame.
    /// </summary>
    /// <param name="handler">An action that receives the current API instance for rendering.</param>
    /// <returns>An <see cref="IDisposable"/> that removes the handler when disposed.</returns>
    IDisposable AddRenderer(Action<IImGuiExperimentalApi> handler);

    /// <summary>
    /// Adds a basic render callback that does not require API context.
    /// </summary>
    /// <param name="handler">An action to invoke each ImGui frame.</param>
    /// <returns>An <see cref="IDisposable"/> that removes the handler when disposed.</returns>
    IDisposable AddRenderer(Action handler) => AddRenderer(_ => handler());

    /// <summary>
    /// If true, the window will not gain focus when interacted with.
    /// Useful for overlays or passive UI components.
    /// </summary>
    bool NoActivate { get; set; }

    /// <summary>
    /// Controls whether the ImGui window appears in the taskbar.
    /// </summary>
    bool ShowInTaskbar { get; set; }

    /// <summary>
    /// Measures the size (in pixels) that the specified text would occupy using the current font and styling.
    /// </summary>
    /// <param name="text">The text to measure.</param>
    /// <returns>The size of the text as a <see cref="Vector2"/> (width and height).</returns>
    Vector2 MeasureText(string text);

    /// <summary>
    /// Measures the size of the given text using a custom height constraint.
    /// </summary>
    /// <param name="text">The text to measure.</param>
    /// <param name="height">The height in pixels to simulate for layout.</param>
    /// <returns>The estimated size as a <see cref="Vector2"/>.</returns>
    Vector2 MeasureText(string text, int height);

    /// <summary>
    /// Draws a filled box (rectangle) with the specified color.
    /// </summary>
    /// <param name="rect">The rectangle to fill.</param>
    /// <param name="color">The fill color.</param>
    void DrawBox(RectangleF rect, Color color);

    /// <summary>
    /// Draws a filled box with optional corner rounding.
    /// </summary>
    /// <param name="p1">Top-left corner of the rectangle.</param>
    /// <param name="p2">Bottom-right corner of the rectangle.</param>
    /// <param name="color">The fill color.</param>
    /// <param name="rounding">Corner radius for rounded edges (default: 0).</param>
    void DrawBox(Vector2 p1, Vector2 p2, Color color, float rounding = 0);

    /// <summary>
    /// Draws a filled box with corner rounding.
    /// </summary>
    /// <param name="rect">Rectangle to fill.</param>
    /// <param name="color">The fill color.</param>
    /// <param name="rounding">Radius for rounded corners.</param>
    void DrawBox(RectangleF rect, Color color, float rounding);

    /// <summary>
    /// Draws an outlined rectangle (frame) with the given thickness and color.
    /// </summary>
    /// <param name="p1">Top-left corner of the frame.</param>
    /// <param name="p2">Bottom-right corner of the frame.</param>
    /// <param name="color">Color of the outline.</param>
    /// <param name="thickness">Line thickness in pixels (default: 1).</param>
    void DrawFrame(Vector2 p1, Vector2 p2, Color color, int thickness = 1);

    /// <summary>
    /// Draws an outlined rectangle with rounding and custom ImDrawFlags.
    /// </summary>
    /// <param name="p1">Top-left corner.</param>
    /// <param name="p2">Bottom-right corner.</param>
    /// <param name="color">Outline color.</param>
    /// <param name="rounding">Corner radius for rounded corners.</param>
    /// <param name="thickness">Line thickness.</param>
    /// <param name="flags">ImGui draw flags (e.g., which corners to round).</param>
    void DrawFrame(Vector2 p1, Vector2 p2, Color color, float rounding, int thickness, ImDrawFlags flags);

    /// <summary>
    /// Draws a rectangle outline with rounding, thickness, and draw flags.
    /// </summary>
    /// <param name="rect">Rectangle bounds.</param>
    /// <param name="color">Color of the frame.</param>
    /// <param name="rounding">Radius for corner rounding.</param>
    /// <param name="thickness">Line thickness.</param>
    /// <param name="flags">Optional drawing flags for ImGui rendering behavior.</param>
    void DrawFrame(RectangleF rect, Color color, float rounding, int thickness, ImDrawFlags flags);

    /// <summary>
    /// Draws an outlined rectangle with specified thickness and no rounding.
    /// </summary>
    /// <param name="rect">Rectangle bounds.</param>
    /// <param name="color">Outline color.</param>
    /// <param name="thickness">Line thickness (default: 1).</param>
    void DrawFrame(RectangleF rect, Color color, int thickness = 1);

    /// <summary>
    /// Draws a filled circle at the specified center point with a given radius and color.
    /// </summary>
    /// <param name="center">Center of the circle.</param>
    /// <param name="radius">Radius in pixels.</param>
    /// <param name="color">Fill color.</param>
    void DrawCircleFilled(Vector2 center, float radius, Color color);
}
```