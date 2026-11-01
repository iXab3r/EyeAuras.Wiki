---
title: AI Computer Vision — работа с изображениями
description: AI-ориентированная карта API для захвата изображений, их обработки, OpenCV и компьютерного зрения.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, computer-vision, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта раздела Computer Vision / Images

Краткая карта по захвату экрана, поиску изображений, OCR, OpenCV, проверке цветов, работе с пикселями и CV debug overlays.

## Что обычно нужно пользователю

- Захватить экран, окно или область.
- Найти изображение или шаблон на экране.
- Найти текст через OCR.
- Искать цвета или отдельные пиксели.
- Запускать CV из скрипта.
- Показывать debug-боксы поверх найденных областей.
- Профилировать CV-операции и циклы обработки пикселей.

## Как это устроено

- Захват получает кадры с экрана, окна или выбранной области.
- `IComputerVisionExperimentalScriptingApi` — точка входа для CV в скриптах.
- `ICvAccessor` выполняет операции с изображениями, текстом, цветами и пикселями.
- В aura-сценариях используются классы триггеров.
- Для debug-боксов и подписей используйте `osd/screen-overlay.md`.
- Поиск с ML-моделями частично относится к `ml/ai.md`.
- Профилирование и производительность описаны в `computer-vision/profiling.md`.

## Прочитать текст с основного экрана

Для верхнеуровневого C# Script в EyeAuras с загруженным OpenCV-модулем:

```csharp
using EyeAuras.OpenCVAuras.Scripting;

var api = GetService<IComputerVisionExperimentalScriptingApi>();
using var cv = api.ForScreen();
var text = cv.TextSearch();
Log.Info($"Распознанный текст: {text}");
```

В лог попадёт распознанная строка. `ForScreen()` выбирает основной экран;
для конкретного окна используйте `ForWindow(handle)` или `For(args)` с
`WindowMatchParams`.
Нужен установленный и поддерживаемый OCR-движок: отсутствие движка или ошибка
захвата могут дать исключение, а не пустой текст. Пустая строка сама по себе
не доказывает отсутствие текста на экране.

Accessor освобождает вызывающий код. В обычном C#-классе передайте API через
конструктор; `GetService` и `Log` принадлежат скриптовому хосту.
Ссылка на assembly не запускает модуль захвата.

## Выбрать форму результата

Простые `ImageSearch` / `PixelSearch` возвращают геометрию в координатах экрана
для экранного источника и окна для оконного. `Rectangle.Empty` означает отсутствие
изображения; `Point.Empty` неоднозначен, поскольку пиксель может быть в `(0, 0)`.
Raw-методы возвращают оболочку `WindowImageProcessedEventArgs<T>` с nullable
`Detected.Bounds` и матрицами захвата. Применяйте `ToScreen` к локальным bounds
этого результата, чтобы учесть ROI и эффекты, а не к уже преобразованному результату.

Для собственного OpenCV-кода `ProcessPixels` даёт заимствованное изображение
только на время callback. Для хранения или изменения создайте `Clone()` и
освободите клон. `Captured` из события не является отдельным снимком.
Встроенный `EnableOsd()` работает с оконным accessor; полноэкранный путь его
отклоняет. Для своих аннотаций можно отдельно создать OSD canvas.

Точные defaults, минимальные примеры и владение — в
[операциях CV](../IComputerVisionExperimentalScriptingApi), преобразования — в
[контракте результата](../WindowImageProcessedEventArgs).
Эти правила описывают EyeAuras `20fd3d4`; доступность native-захвата, DPI и
конкретной ML-модели проверяйте в своей среде.

## Основные API и классы

- `IComputerVisionExperimentalScriptingApi` — точка входа для CV в скриптах.
- `ICvAccessor` — основная поверхность CV-операций в скриптах.
- `ImageSearchTrigger` — триггер для поиска изображения или шаблона.
- `TemplateImageMatcher` — стабильный template matching.
- `FeatureImageMatcher` — feature-based matching.
- `TextSearchTrigger`, `IRecognitionEngineProvider` — OCR.
- `ColorSearchTrigger`, `IColorSimilarityCalculator` — сценарии работы с цветами и пикселями.
- `WindowCaptureService`, `WindowImageSource`,
  `WindowCaptureTriggerBase` — инфраструктура захвата.

## Что лучше использовать

- Для CV в скриптах используйте `IComputerVisionExperimentalScriptingApi` и `ICvAccessor`.
- Для aura-сценариев предпочитайте встроенные триггеры.
- Для захвата используйте готовые capture services, а не собственную логику скриншотов.
- Для отладки областей используйте `osd/screen-overlay.md`.
- Прежде чем гадать, где тормозит CV-цикл, откройте `computer-vision/profiling.md`.

## Чего лучше избегать

- Не хардкодьте OCR engines, если доступен provider lookup.
- Не пишите свой frame capture, пока не проверили готовые capture services.
- Не смешивайте логику ML-моделей с детерминированным matching без необходимости.

## Опорные точки для поиска по коду

- `IComputerVisionExperimentalScriptingApi`, `ICvAccessor`,
  `ImageSearchTrigger`, `TemplateImageMatcher`, `FeatureImageMatcher`,
  `TextSearchTrigger`, `IRecognitionEngineProvider`, `ColorSearchTrigger`,
  `WindowCaptureService`, `WindowCaptureTriggerBase`.

## Синонимы для поиска

- image search
- template match
- feature match
- OCR
- text recognition
- color search
- pixel search
- window capture
- screen capture
- OpenCV
- Emgu CV

## Смежные карты

- `osd/screen-overlay.md`
- `computer-vision/profiling.md`
- `ml/ai.md`
- `osd/selection.md`
- `windows-subsystems/window-handles.md`