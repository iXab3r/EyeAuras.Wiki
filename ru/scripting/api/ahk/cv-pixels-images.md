---
title: Миграция с AutoHotkey — CV, пиксели и изображения
description: Как сопоставить CoordMode, PixelGetColor, PixelSearch и ImageSearch из AutoHotkey с CV API в EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, cv, pixels, images, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Переход с AutoHotkey: CV, пиксели и изображения

Эта страница поможет перенести сценарии, где используются `CoordMode`, `PixelGetColor`, `PixelSearch` и `ImageSearch`.

## Краткое соответствие

| Что нужно в AutoHotkey | AHK API | Чем заменить в EyeAuras | Первый вариант на C# | Оценка | Примечание |
|---|---|---|---|---|---|
| Поиск пикселей или изображений | `PixelGetColor`, `PixelSearch`, `ImageSearch`, `CoordMode` | `IComputerVisionExperimentalScriptingApi`, `ICvAccessor`, `IOsdSelectionService` | `CV.ForScreen().PixelSearch(Color.Red, new Percentage(90), region)` | Более явно, чем в AHK, но тяжелее. | `ForScreen()` и `ForWindow(window)` заменяют неявные режимы координат из AHK. API Computer Vision помечен как experimental. |

## Сначала найти пиксель, потом кликнуть

AutoHotkey v2:

```ahk
CoordMode "Pixel", "Screen"
CoordMode "Mouse", "Screen"
if PixelSearch(&x, &y, 0, 0, 800, 600, 0xFF0000, 10)
    Click x, y
```

Скрипт EyeAuras:

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

Если нужен поиск относительно окна, сначала выберите или получите `IWindowHandle`, а затем используйте `CV.ForWindow(window)`, чтобы модель координат была задана явно.

**Рекомендация:** В целом подходит, но получается тяжелее, чем в AHK. В EyeAuras различие между координатами экрана и окна сделано понятнее, но для миграции всё ещё не хватает отдельной таблицы соответствия для `CoordMode`.

## Ссылки для проверки

- Документация AHK:
  [CoordMode](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/CoordMode.htm),
  [PixelGetColor](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/PixelGetColor.htm),
  [PixelSearch](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/PixelSearch.htm),
  [ImageSearch](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ImageSearch.htm).
- Исходники AHK:
  [pixel.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/pixel.cpp),
  [script_autoit.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/script_autoit.cpp).
- Документация EyeAuras:
  [Computer Vision / Images](../computer-vision/images),
  [IComputerVisionExperimentalScriptingApi](../IComputerVisionExperimentalScriptingApi),
  [OSD Selection](../osd/selection).
- Исходники EyeAuras:
  [IComputerVisionExperimentalScriptingApi.cs](../../../../../Sources/EyeAuras.OpenCVAuras.Shared/Scripting/IComputerVisionExperimentalScriptingApi.cs),
  [ICvAccessor.cs](../../../../../Sources/EyeAuras.OpenCVAuras.Shared/Scripting/ICvAccessor.cs),
  [CvAccessor.cs](../../../../../Sources/EyeAuras.OpenCVAuras/Scripting/CvAccessor.cs).