---
title: AI OSD: Screen Overlay
description: AI-first map of Blazor screen overlay and OSD canvas APIs.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd, overlay, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Screen Overlay / Blazor OSD Discovery Map

Reference map for drawing screen annotations through the Blazor-backed overlay
canvas: rectangles, HTML labels, Razor components, and CV debug boxes.

Interactive picking belongs to [osd/selection.md](/en/scripting/api/osd/selection).

## User Intents

- Draw a rectangle around a region.
- Show HTML label or badge over the desktop.
- Render a Razor component as a floating annotation.
- Display CV/ML bounding boxes.
- Open overlay WebView DevTools.

## Concept Model

- `IOnScreenService` creates owner-scoped canvases.
- `IOnScreenCanvasScriptingApi` is the script-facing canvas factory.
- `IOnScreenCanvas` owns `IOnScreenObject` instances by `OnScreenObjectId`.
- Canvas visibility is owner-scoped: hiding one canvas temporarily removes its
  objects from rendering without affecting other canvases or discarding the
  hidden owner's objects.
- Objects use desktop screen coordinates.
- Current rendered object contracts are `IOnScreenRectangle`,
  `IOnScreenHtml`, and `IOnScreenRazor`.
- The renderer uses a transparent click-through Blazor/WebView window
  internally; consumers should use canvas/object APIs.

## Show a frame for five seconds

In a top-level desktop EyeAuras C# Script, obtain the canvas factory from the script container. The UI module registers `IOnScreenService`; the scripting module registers `IOnScreenCanvasScriptingApi`. The host supplies `EyeAuras.Shared` and `EyeAuras.Blazor.Controls`.

```csharp
using System;
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    var api = GetService<IOnScreenCanvasScriptingApi>();
    using var canvas = api.Create();
    try
    {
        using var rectangle = canvas.AddRectangle();
        rectangle.Location = new Point(100, 100);
        rectangle.Size = new Size(240, 120);
        rectangle.Background = Color.Transparent;
        rectangle.BorderColor = Color.Red;
        rectangle.BorderThickness = 2;
        await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
    }
    finally
    {
        canvas.Clear();
    }
}
```

The red frame uses screen coordinates. On completion or cancellation the rectangle is disposed, then the canvas is cleared and disposed. App code uses an injected `IOnScreenService.Create()`. The shared window uses `PrimaryScreen.Bounds`; screen-coordinate inputs do not guarantee all-monitor coverage or uniform DPI.

## Register and remove an object

`AddRectangle()` creates and registers a rectangle. The overload `AddRectangle(builder)` only creates it and invokes the builder; call `canvas.AddOrUpdate(rectangle)` if the builder does not register it. `AddHtmlObject()` and `AddRazor<T>(dataContext)` register their objects immediately. A direct constructor requires explicit registration.

`Remove(object)` and `Clear()` remove registrations; they do not replace disposal of owned objects. Factory helpers attach deregistration to object disposal. Do not rely on `canvas.Dispose()` alone to dispose all children. `IOnScreenHtml.Html` is trusted markup, not automatically escaped text. Razor needs a real component and its dependencies; top-level script variables do not become component globals. These object contracts were checked at EyeAuras `20fd3d4`.

## Show a label until Stop

This independent top-level C# Script places a label at a known screen point:

```csharp
using System;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var label = canvas.AddHtmlObject();
        label.Location = new Point(320, 180);
        label.Size = new Size(180, 36);
        label.Html = "<div style='color:white;background:#222;padding:4px'>Object found</div>";
        label.IsVisible = true;
        try { await Task.Delay(Timeout.Infinite, cancellationToken); }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    }
    finally { canvas.Clear(); }
}
```

`Location` is a screen position, not a target-window or CV-frame position. Encode variable text with `System.Net.WebUtility.HtmlEncode` before placing it inside trusted markup.

## Update and temporarily hide one object

This separate C# Script moves one frame and hides it for four updates before showing it again. It models updates from your own data source:

```csharp
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var box = canvas.AddRectangle();
        box.Size = new Size(100, 60);
        box.Background = Color.Transparent;
        box.BorderColor = Color.Lime;
        box.BorderThickness = 2;
        for (var step = 0; step < 12; step++)
        {
            box.Location = new Point(100 + step * 10, 120);
            box.IsVisible = step < 4 || step >= 8;
            await Task.Delay(250, cancellationToken);
        }
    }
    finally { canvas.Clear(); }
}
```

Update the saved object’s properties instead of adding a new rectangle on every update. Its `Id` stays the same. `IsVisible = false` retains it for later display; disposal removes its registration. `Clear()` affects this owner’s canvas. Keep your own lifetime rather than borrowing another script’s global canvas.

## API Details

- `IOnScreenService` - runtime canvas factory and DevTools hook.
- `IOnScreenCanvasScriptingApi` - script-facing canvas factory.
- `IOnScreenCanvas` - `ObjectsById`, `IsVisible`, `AddOrUpdate`, `Remove`,
  `Clear`, `ShowDevTools`.
- `IOnScreenObject` - `Id`, `Location`, `Size`, `Opacity`, `IsVisible`.
- `IOnScreenRectangle` - `Background`, `BorderColor`, `BorderThickness`.
- `IOnScreenHtml` - raw trusted `Html`.
- `IOnScreenRazor` - `ViewType` and `DataContext`.
- `OnScreenCanvasExtensions` - `AddRectangle`, `AddHtmlObject`,
  `AddRazor<T>`.

## Prefer

- Prefer `IOnScreenCanvasScriptingApi` for script-owned overlays.
- Prefer `IOnScreenService` for app/runtime code.
- Prefer `AddRectangle`, `AddHtmlObject`, and `AddRazor<T>` for built-in
  objects.
- Prefer disposing objects/canvas for cleanup.
- Prefer [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows) for real windows.
- Prefer [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk) for ImGui UI.

## Avoid

- Avoid creating custom transparent WebView windows for simple annotations.
- Avoid untrusted HTML in `IOnScreenHtml`.
- Avoid using screen overlay as an input picker.

## Research Anchors

- `IOnScreenCanvas`, `IOnScreenCanvasScriptingApi`, `IOnScreenService`,
  `IOnScreenObject`, `IOnScreenRectangle`, `IOnScreenHtml`,
  `IOnScreenRazor`, `OnScreenCanvasExtensions`, `AddRectangle`,
  `AddHtmlObject`, `AddRazor`, `OnScreenOverlayComponent`.

## Search Synonyms

- screen overlay
- Blazor OSD
- desktop overlay
- click-through overlay
- bounding box overlay
- debug overlay
- HTML overlay
- Razor overlay
- screen annotation

## Related Maps

- [osd/selection.md](/en/scripting/api/osd/selection)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)
- [computer-vision/images.md](/en/scripting/api/computer-vision/images)
