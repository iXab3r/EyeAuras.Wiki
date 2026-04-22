---
title: AutoHotkey Migration: CV, Pixels, And Images
description: Mapping AutoHotkey CoordMode, PixelGetColor, PixelSearch, and ImageSearch to EyeAuras CV APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, cv, pixels, images
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: CV, Pixels, And Images

Use this page for `CoordMode`, `PixelGetColor`, `PixelSearch`, and
`ImageSearch`.

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Find pixels or images | `PixelGetColor`, `PixelSearch`, `ImageSearch`, `CoordMode` | `IComputerVisionExperimentalScriptingApi`, `ICvAccessor`, `IOsdSelectionService` | `CV.ForScreen().PixelSearch(Color.Red, new Percentage(90), region)` | More explicit than AHK, but heavier. | `ForScreen()` and `ForWindow(window)` replace implicit AHK coordinate modes. The CV API is marked experimental. |

## Pixel Search Then Click

AutoHotkey v2:

```ahk
CoordMode "Pixel", "Screen"
CoordMode "Mouse", "Screen"
if PixelSearch(&x, &y, 0, 0, 800, 600, 0xFF0000, 10)
    Click x, y
```

EyeAuras script:

```csharp
IComputerVisionExperimentalScriptingApi CV { get; init; }
ISendInputScriptingApi SendInput { get; init; }

var point = CV.ForScreen().PixelSearch(
    Color.FromArgb(0xFF0000),
    new Percentage(90),
    new Rectangle(0, 0, 800, 600));

if (!point.IsEmpty)
{
    SendInput.MouseLeftClick(point.X, point.Y);
}
```

For window-relative work, select or resolve an `IWindowHandle` first and use
`CV.ForWindow(window)` so the coordinate model is explicit.

**Recommendation:** Good enough, but heavier than AHK. EyeAuras is clearer
about screen vs window coordinates; migration still needs a dedicated
`CoordMode` mapping table.

## Verification Links

- AHK docs:
  [CoordMode](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/CoordMode.htm),
  [PixelGetColor](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/PixelGetColor.htm),
  [PixelSearch](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/PixelSearch.htm),
  [ImageSearch](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ImageSearch.htm).
- AHK source:
  [pixel.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/pixel.cpp),
  [script_autoit.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/script_autoit.cpp).
- EyeAuras docs:
  [Computer Vision / Images](../computer-vision/images),
  [IComputerVisionExperimentalScriptingApi](../IComputerVisionExperimentalScriptingApi),
  [OSD Selection](../osd/selection).
- EyeAuras source:
  [IComputerVisionExperimentalScriptingApi.cs](../../../../../Sources/EyeAuras.OpenCVAuras.Shared/Scripting/IComputerVisionExperimentalScriptingApi.cs),
  [ICvAccessor.cs](../../../../../Sources/EyeAuras.OpenCVAuras.Shared/Scripting/ICvAccessor.cs),
  [CvAccessor.cs](../../../../../Sources/EyeAuras.OpenCVAuras/Scripting/CvAccessor.cs).
