---
title: AI Computer Vision — Images
description: AI-first map of image capture, image processing, OpenCV, and computer vision APIs.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, computer-vision, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Computer Vision / Images Discovery Map

Reference map for capture, image search, OCR, OpenCV, color checks, pixel
workflows, and CV debug overlays.

## User Intents

- Capture screen/window/region.
- Find image/template on screen.
- Search text with OCR.
- Search colors or pixels.
- Run CV from script.
- Display debug boxes over found regions.
- Profile CV operations and pixel-processing loops.

## Concept Model

- Capture produces frames from screen/window/region.
- `IComputerVisionExperimentalScriptingApi` is script entry point.
- `ICvAccessor` performs image/text/color/pixel operations.
- Aura workflows use trigger classes.
- Debug boxes/labels use [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay).
- ML-backed search belongs partly to [ml/ai.md](/en/scripting/api/ml/ai).
- Profiling/performance belongs to [computer-vision/profiling.md](/en/scripting/api/computer-vision/profiling).

## Read text from the primary screen

For a top-level EyeAuras C# Script with the OpenCV module loaded:

```csharp
using EyeAuras.OpenCVAuras.Scripting;

{
    var api = GetService<IComputerVisionExperimentalScriptingApi>();
    using var cv = api.ForScreen();
    var text = cv.TextSearch();
    Log.Info($"Распознанный текст: {text}");
}
```

The log receives the recognized string. `ForScreen()` selects the primary screen;
for a specific window, use `ForWindow(handle)` or `For(args)` with `WindowMatchParams`.
An installed, supported OCR engine is required. Missing engines and capture
errors can throw rather than return empty text. An empty string alone does not
prove that the screen contains no text.

The caller disposes the accessor. In an ordinary C# class, inject the API through
the constructor; `GetService` and `Log` belong to the script host. Referencing
an assembly does not start the capture module.

## Save a window frame as PNG

In a separate top-level script, select a window and save its frame to Documents.
You need a working OpenCV module, an available capture source and permission to
write to the selected directory:

```csharp
using System;
using System.IO;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Osd;

{
    var window = await GetService<IOsdSelectionService>().PickWindow();
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "window.png");
    cv.ProcessPixels(image => image.Save(path));
    Log.Info($"PNG сохранён: {path}");
}
```

`Save(path)` runs on `Emgu.CV.Image<Bgr, byte>` inside the callback while the
borrowed frame is available. The `.png` extension selects the file format.
No clone is needed here because the image is neither retained nor modified.
For deferred processing, clone it and dispose that clone separately. Do not
dispose the borrowed `image`.

### Settings used by ForWindow

In this source snapshot, `ForWindow(window)` creates `ComputerVisionAccessorArgs`
with a handle expression. Its internal trigger uses `MaxFramesPerSecond = 0`
(on-demand updates), `CaptureCursor = false`, `CaptureBorderless = false`,
and empty region/effect-chain settings. The host chooses an available capture
source; the name `ForWindow` does not select one. The accessor has no setters
for `CaptureSourceName` or `CaptureBorderless`; do not invent these properties
on `ComputerVisionAccessorArgs`.

This is the example's default configuration, not a Win32 client-area guarantee.
`(0, 0)` is the returned image's top-left pixel. Native bounds, borders and scaling
depend on the backend; use the raw result's actual matrices for screen conversion.
An OSD rectangle relative to `DwmFrameBounds` is not automatically an ROI in this
image. For manually configured capture settings, use the corresponding capture
trigger instead of an accessor setter that does not exist.

## Recognize a region with a selected OCR engine

This separate C# Script uses the same default capture configuration. It selects
English recognition. The engine must be available on your machine; check its ID
through `IRecognitionEngineProvider`:

```csharp
using System.Drawing;
using System.Linq;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.OpenCVAuras.Services;
using EyeAuras.Shared.Osd;

{
    var engines = GetService<IRecognitionEngineProvider>();
    var engineId = "Tesseract (eng)";
    if (!engines.TryResolveById(engineId, out _))
    {
        Log.Info($"Доступные движки: {string.Join(", ", engines.KnownEngines.Select(x => x.Id))}");
        return;
    }
    var window = await GetService<IOsdSelectionService>().PickWindow();
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var roi = new Rectangle(12, 24, 250, 64);
    var text = cv.TextSearch(region: roi, engineId: engineId);
    Log.Info($"Текст: {text}");
}
```

`TextSearch(Rectangle region = default, string engineId = null)` returns a string.
A null `engineId` uses the host's default engine selection; a nonempty ID is passed
to the internal `TextSearchTrigger`. For Russian text, choose a supported language
and engine from `KnownEngines`, such as an installed `Tesseract (rus)`. An ID in
this documentation does not install the engine.

`region` temporarily sets the internal trigger's capture region; it is not a
filter over words that have already been recognized. Here it selects part of
the original frame with an empty effect chain. After crop, resize or rotation,
convert the region through the actual frame matrices first. Do not add the
window's screen `Left/Top` to the ROI or assume OSD picker coordinates match
every backend. An empty `Rectangle` selects the entire region.

## Choose the result shape

Simple `ImageSearch` / `PixelSearch` return geometry in screen coordinates for
screen capture and window coordinates for window capture. `Rectangle.Empty`
means no image was found; `Point.Empty` is ambiguous because a matching pixel
may be at `(0, 0)`. Raw methods return `WindowImageProcessedEventArgs<T>` with
nullable `Detected.Bounds` and capture matrices. Apply `ToScreen` to that
result's local bounds to account for ROI and effects, not to an already
transformed result.

For custom OpenCV code, `ProcessPixels` borrows an image for the callback only.
To retain or modify it, use `Clone()` and dispose the clone. An event's `Captured`
is not an independent snapshot. Built-in `EnableOsd()` works with a window
accessor; the full-screen path rejects it. You can create a separate OSD canvas
for custom annotations.

Exact defaults, minimal examples and ownership are in the
[CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi);
transformations are in the [result contract](/en/scripting/api/WindowImageProcessedEventArgs).
These rules describe EyeAuras `20fd3d4`; check native capture, DPI and specific
ML-model availability in your own environment.

## API Details

- `IComputerVisionExperimentalScriptingApi` - script CV entry point.
- `ICvAccessor` - main script CV operation surface.
- `ImageSearchTrigger` - image/template matching trigger.
- `TemplateImageMatcher` - stable template matching.
- `FeatureImageMatcher` - feature-based matching.
- `TextSearchTrigger`, `IRecognitionEngineProvider` - OCR.
- `ColorSearchTrigger`, `IColorSimilarityCalculator` - color/pixel workflows.
- `WindowCaptureService`, `WindowImageSource`,
  `WindowCaptureTriggerBase` - capture infrastructure.
- `PoeShared.Native.IClipboardManager` (`PoeShared.Native`) - image clipboard
  transfer through an injected service. `SetImage` publishes PNG preserving
  transparency plus a legacy Bitmap representation; call it on an STA thread.
  `GetImage` prefers PNG and falls back to Bitmap when PNG is unavailable or
  rejected by the decoder;
  dispose the returned image. `ContainsImage` checks format availability only.
  The input image remains caller-owned and may be disposed after `SetImage`.

## Prefer

- Prefer `IComputerVisionExperimentalScriptingApi` and `ICvAccessor` for script
  CV work.
- Prefer built-in triggers for aura workflows.
- Prefer existing capture services over custom screenshot plumbing.
- Prefer [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay) for debug regions.
- Prefer [computer-vision/profiling.md](/en/scripting/api/computer-vision/profiling) before guessing where a CV loop is
  slow.

## Avoid

- Avoid hardcoding OCR engines when provider lookup exists.
- Avoid custom frame capture before checking capture services.
- Avoid mixing ML model logic into deterministic matching unless needed.

## Research Anchors

- `IComputerVisionExperimentalScriptingApi`, `ICvAccessor`,
  `ImageSearchTrigger`, `TemplateImageMatcher`, `FeatureImageMatcher`,
  `TextSearchTrigger`, `IRecognitionEngineProvider`, `ColorSearchTrigger`,
  `WindowCaptureService`, `WindowCaptureTriggerBase`.

## Image search, OCR and screen capture

For image search / template match, create a window or screen `ICvAccessor`
through `IComputerVisionExperimentalScriptingApi`, call `ImageSearchRaw`, and
check nullable `Detected.Bounds`. The caller owns the accessor; the raw result
provides coordinate conversion matrices.
The [complete image-search example](/en/scripting/examples/basic/image-search)
shows accessor creation, template loading, the result and cleanup.

For text recognition / OCR, use `TextSearch` with an available engine. For
window capture / screen capture and custom OpenCV or Emgu CV processing, use
`ProcessPixels`. Its callback borrows the frame; keeping a copy requires
`Clone()` and separate disposal. Complete OCR and PNG-saving examples appear
above. Feature match, color search and pixel search use the corresponding
[CV operations](/en/scripting/api/IComputerVisionExperimentalScriptingApi).

## Related Maps

- [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay)
- [computer-vision/profiling.md](/en/scripting/api/computer-vision/profiling)
- [ml/ai.md](/en/scripting/api/ml/ai)
- [osd/selection.md](/en/scripting/api/osd/selection)
- [windows-subsystems/window-handles.md](/en/scripting/api/windows-subsystems/window-handles)

## OCR availability and file encoding

`IRecognitionEngineProvider.KnownEngines` is built when the provider is created. Windows OCR depends on WinRT support and installed languages. Tesseract discovers `.traineddata` under tessdata folders in user data, application data, application base and the OpenCV module. The `WellKnownOcrEngines.English` constant does not install a language. With a null engine ID the trigger selects its first known engine; an unknown ID does not resolve. Check the IDs available in your installation.

Emgu.CV `4.9.0.5494` XML describes `Image.Save(path)` as selecting the format from the filename extension; use `.png` for the PNG example. `ToJpegData(int quality)` returns JPEG bytes. These are package contracts, not a test of installed native codecs.

[OCR provider](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.OpenCVAuras/Services/RecognitionEngineProvider.cs) · [Trigger engine selection](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.OpenCVAuras/Triggers/TextSearch/TextSearchTrigger.cs).
