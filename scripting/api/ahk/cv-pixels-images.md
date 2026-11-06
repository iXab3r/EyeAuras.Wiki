---
title: AutoHotkey Migration: CV, Pixels, And Images
description: Mapping AutoHotkey CoordMode, PixelGetColor, PixelSearch, and ImageSearch to EyeAuras CV APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, cv, pixels, images, ai-translated
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

{
    using var screen = CV.ForScreen();
    var point = screen.PixelSearch(
        Color.FromArgb(255, 255, 0, 0),
        new Percentage(90),
        new Rectangle(0, 0, 800, 600));

    if (!point.IsEmpty)
    {
        SendInput.MouseLeftClick(point.X, point.Y);
    }
}
```

Run this in a C# Action with CV and Roxy available. A match produces one click through the default `Windows Input` simulator. The accessor is owned by this scope.

`Percentage(90)` is an EyeAuras threshold, not a conversion of AHK variation `10`. AHK variation permits an absolute difference in each RGB channel; its coordinate default is the active window's client area until `CoordMode` changes it. The example explicitly sets both Pixel and Mouse to Screen.

`PixelSearch` uses `Point.Empty` for no match, so `IsEmpty` also skips a real match at `(0, 0)`. When that point matters, use `PixelSearchRaw` and check nullable `Detected.Bounds`. Capture or trigger errors can throw.

For window-relative work, resolve an `IWindowHandle` and use `CV.ForWindow(window)`. Do not pass its point directly to absolute desktop input: the simple result uses `WorldToWindow`, while screen search uses `WorldToScreen`. This does not promise Win32 client coordinates or equivalence to every AHK coordinate mode.

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
- EyeAuras source at `c8b2304ac`: [ICvAccessor](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.OpenCVAuras.Shared/Scripting/ICvAccessor.cs), [CvAccessor](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.OpenCVAuras/Scripting/CvAccessor.cs).
