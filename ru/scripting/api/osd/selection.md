---
title: AI OSD и выбор
description: AI-ориентированная карта сервисов выбора на базе OSD и данных о выбранном окне.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта поиска для OSD-выбора

Справочная карта для интерактивного выбора на экране: окно, область, точка или цвет.

Постоянные аннотации и отрисовка поверх экрана описаны в [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay).

## Что пользователь хочет сделать

- Выбрать целевое окно.
- Выбрать область на экране.
- Выбрать точку на экране.
- Выбрать цвет под курсором.
- Использовать PID выбранного окна в сценариях CV, memory или input.

## Модель

- `IOsdSelectionService` — пользовательский сервис выбора.
- Выбор выполняется интерактивно и действует временно.
- `PickWindow()` возвращает `IWindowHandle`.
- Выбор области, точки и цвета можно ограничить конкретным окном.
- При выборе области можно получить преобразования координат между экраном и окном.

## API

- `IOsdSelectionService`
  - `PickWindow()`
  - `PickRegion(IWindowHandle targetWindow = default)`
  - `PickPoint(IWindowHandle targetWindow = default)`
  - `PickColor(IWindowHandle targetWindow = default)`
- `OsdRegionSelectionResult` — выбранная область, матрицы преобразования и окно под курсором.
- `OsdRegionTransformationMatrices` — `ScreenToWindow` и `WindowToScreen`.
- `OsdPointSelectionResult` — `Point`, `Matrices`, `WindowUnderCursor`.
- `OsdColorSelectionResult` — `Color`, `Point`, `Matrices`, `WindowUnderCursor`.

## Выбрать окно и область внутри него

Создайте C# Script в EyeAuras. Сервис выбора доступен через контейнер хоста; обычному C# классу нужно передать `IOsdSelectionService` явно.

```csharp
using EyeAuras.Shared.Osd;

var selection = GetService<IOsdSelectionService>();
var window = await selection.PickWindow();
var result = await selection.PickRegion(window);
Log.Info($"Окно: {window.Title}; область: {result.Region}");
```

Сначала укажите окно левой кнопкой мыши, затем выделите прямоугольник. В логе появится выбранная область. Перед вторым выбором сервис активирует переданное окно. `WindowUnderCursor` в результате — окно под курсором во время выбора; это отдельное поле, оно не заменяет переданный `window`.

Правая кнопка мыши или `Escape` отменяет выбор: ожидаемый `Task` переходит в отменённое состояние. Параметра `CancellationToken` у этих методов нет. Не запускайте несколько выборов одновременно через один сервис: повторный запрос во время выбора бросает `InvalidOperationException`. После завершения или отмены окно выбора скрывается.

## Выбрать точку или цвет на экране

Для выбора без привязки к окну выполните отдельный C# Script:

```csharp
using System;
using EyeAuras.Shared.Osd;

var selection = GetService<IOsdSelectionService>();
try
{
    var point = await selection.PickPoint();
    Log.Info($"Точка: {point.Point}");
    var underCursor = point.WindowUnderCursor;
    Log.Info(underCursor == null || !underCursor.IsWindow
        ? "Окно под курсором недоступно"
        : $"Окно под курсором: {underCursor.Title}, PID: {underCursor.ProcessId}");

    var color = await selection.PickColor();
    var c = color.Color;
    Log.Info($"RGB({c.R}, {c.G}, {c.B}), HEX #{c.R:X2}{c.G:X2}{c.B:X2}; точка: {color.Point}");
}
catch (OperationCanceledException)
{
    Log.Info("Выбор отменён пользователем");
}
```

Без `targetWindow` матрицы единичные, координаты остаются экранными. Выбор цвета использует снимок рабочего стола, сделанный при начале этого выбора. Это разовая интерактивная операция, а не поток захвата для CV.

`WindowUnderCursor` есть у всех трёх структур результатов, а не только у
выбора области. Оно получено при завершении выбора и может быть `null` или
уже устареть. Это заимствованное окно под курсором, **не** переданный
`targetWindow`. Передача целевого окна задаёт привязку координат; без неё
`Point` экранная, с ней — относительно начала `DwmFrameBounds` цели через
`Matrices.WindowToScreen` этого среза. `Matrices` не содержит настройки
источника изображения для OCR: для перевода в его ROI нужны ещё преобразования
конкретного захвата.

## Координаты и версия контракта

В исходниках EyeAuras `20fd3d424d886f6c99b979536a148774d289d110` имена матриц расходятся с направлением, описанным в XML-комментариях. Реализация создаёт `ScreenToWindow` как перенос на положительные `X/Y` из `targetWindow.DwmFrameBounds`, а `WindowToScreen` — как обратный перенос. Возвращаемые `Region` и `Point` преобразуются именно через `WindowToScreen`, то есть из экранных координат вычитается начало рамки окна. Это не обещание координат клиентской области или коррекции DPI.

Для примера: при начале рамки `(100, 200)` экранная точка `(130, 240)` возвращается как `(30, 40)`. Повторно вычитать начало окна из результата не нужно. При переносе такого кода между версиями проверяйте реализацию, а не только названия свойств.

Источники контракта: [IOsdSelectionService и структуры результатов](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Shared/Osd/IOsdSelectionService.cs), [OsdSelectionService и преобразования](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Blazor.Controls/Osd/OsdSelectionService.cs).

## Что предпочтительно

- Для выбора пользователем используйте `IOsdSelectionService`.
- Вместо сырых хэндлов предпочитайте `IWindowHandle`, полученный из `PickWindow()`.
- Для преобразования и сопоставления хэндлов используйте [windows-subsystems/window-handles.md](/ru/scripting/api/windows-subsystems/window-handles).
- Для постоянных overlay-элементов используйте [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay).

## Чего лучше избегать

- Не используйте собственный polling курсора или скриншоты для поведения picker-а.
- Не используйте OSD selection как рендерер постоянных overlay-элементов.
- Не рассчитывайте на то, что выбранные окна останутся активными или вообще продолжат существовать.

## Опорные сущности для поиска

- `IOsdSelectionService`, `PickWindow`, `PickRegion`, `PickPoint`,
  `PickColor`, `OsdRegionSelectionResult`, `WindowUnderCursor`,
  `OsdRegionTransformationMatrices`.

## Синонимы для поиска

- select window
- pick window
- OSD picker
- region picker
- point picker
- color picker
- screen selection
- window under cursor

## Связанные карты

- [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay)
- [windows-subsystems/window-handles.md](/ru/scripting/api/windows-subsystems/window-handles)
- [computer-vision/images.md](/ru/scripting/api/computer-vision/images)
- [memory/processes.md](/ru/scripting/api/memory/processes)
