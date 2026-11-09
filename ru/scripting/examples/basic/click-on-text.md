---
title: Как нажать на распознанное слово
description: 
published: true
date: 2024-09-11T21:04:35.270Z
tags: 
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---

# Проверить OCR-рамку и один раз кликнуть по ней

Покажите слово `READY` в собственном тестовом текстовом окне. Сначала скрипт только найдёт сегмент и выведет адресат и рамку. После проверки вы отдельно разрешите один клик в том же окне. Это движение настоящего курсора и обычный ввод с активацией окна, а не фоновая команда другой программе.

Нужны работающие OpenCV/OCR, экранный выбор окна и доступный `Windows Input`. Используйте документ без кнопок отправки и других значимых действий; слово должно быть единственным таким сегментом в выбранной области.

1. Создайте ауру `Test` с триггером `Text Search` и соседнюю ауру с действием `C# Script`.
2. В `Target Window` выберите своё тестовое окно **экранным указателем**. Не заменяйте полученное выражение свободным поиском по заголовку: программа ниже проверяет совпадение с тем же выбранным окном.
3. Ограничьте захват областью слова, выберите доступный английский движок в `OCR Symbols`. Нажмите `Refresh Once` и проверьте текст и рамки в предпросмотре.

| Настройка | Для этого пути |
| --- | --- |
| `Include text segments` | Включено. Без сегментов нет отдельных рамок для клика. |
| `Scale factor` | 1. Внутренний масштаб OCR меняет рамки сегментов отдельно от матриц захвата; здесь дополнительное преобразование не требуется. |
| Эффекты | Для первого опыта пустая цепочка. Область захвата учитывается матрицами результата. |
| `allowClick` в коде | Сначала `false` — только журнал; `true` разрешает один клик за Run. |

4. Вставьте в верхнеуровневый `Script.csx` весь код. Нажмите `Run` и снова выберите указателем то же тестовое окно:

```csharp
using System;
using System.Drawing;
using System.Linq;
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Osd;
using EyeAuras.Shared.Scaffolding;
using PoeShared.Scaffolding;

var allowClick = false; // сначала только проверить результат; затем разрешить один клик
var ocr = AuraTree.GetTriggerByPath<ITextSearchTrigger>("./Test");
if (!ocr.IncludeTextSegments || ocr.ScaleFactor != 1)
{
    throw new ArgumentException("Включите Include text segments и задайте Scale factor = 1");
}

var target = await GetService<IOsdSelectionService>().PickWindow();
if (target == null || !target.IsWindow ||
    ocr.TargetWindow != target.ToWindowMatchExpressionOrDefault())
{
    Log.Warn("Выберите то же собственное окно, которое задано указателем в Text Search");
    return;
}

var data = await ocr.RefreshAsync(cancellationToken);
if (data.Detected == null || data.Detected.Segments.IsDefaultOrEmpty)
{
    Log.Warn("Нет сегментов OCR; проверьте захват и движок");
    return;
}
Log.Info($"OCR segments: {data.Detected.Segments.DumpToTable()}");

var matches = data.Detected.Segments.Where(x => x.Text == "READY").ToArray();
if (matches.Length != 1)
{
    Log.Info("Нужен ровно один сегмент READY; ввод не отправлен");
    return;
}
var segment = matches[0];
var screenRect = data.ToScreen(segment.Region);
var frame = target.DwmFrameBounds;
if (screenRect.IsEmpty || !frame.Contains(screenRect))
{
    Log.Warn("Рамка текста вне выбранного окна; ввод не отправлен");
    return;
}
Log.Info($"Target: {target.Title}; HWND: {target.Handle}; text: {segment.Text}; local: {segment.Region}; screen: {screenRect}");
if (!allowClick) { Log.Info("Проверка завершена без клика"); return; }

cancellationToken.ThrowIfCancellationRequested();
if (!target.IsWindow || target.DwmFrameBounds != frame)
{
    Log.Warn("Окно изменилось; повторите поиск без клика");
    return;
}

var sendInput = GetService<ISendInputScriptingApi>();
sendInput.InputSimulatorId = "Windows Input";
var previousTarget = sendInput.TargetWindow;
try
{
    sendInput.TargetWindow = target; // стандартный ввод активирует это окно
    var center = screenRect.Center();
    var relativePoint = new Point(center.X - frame.X, center.Y - frame.Y);
    sendInput.MouseMoveTo(relativePoint);
    sendInput.MouseClick();
}
finally { sendInput.TargetWindow = previousTarget; }
```

5. При `allowClick = false` найдите в журнале название окна, HWND, текст и экранную рамку. Убедитесь, что это ваша надпись, а не другой участок. Заголовок окна между его выбором в триггере и запуском не должен измениться; иначе обновите выбор.
6. Оставьте окно на месте, замените `allowClick` на `true` и повторите `Run` с выбором того же окна. Курсор перейдёт в центр рамки и выполнит один левый клик. После опыта верните `false`.

`Segments` могут быть символами или более крупными фрагментами — это зависит от движка. Сравнение `x.Text == "READY"` учитывает регистр и пробелы; если движок разбил слово иначе, сначала посмотрите выведенный список. Нужен ровно один подходящий сегмент; отсутствие или несколько совпадений не вызывают клик. Его `Score` — оценка OCR, а не процент занятой площади или гарантия правильности.

Путь координат здесь явный: `Region` в изображении OCR → `data.ToScreen` → экранный прямоугольник → точка относительно `DwmFrameBounds` для ненулевого `TargetWindow`. Стандартный ввод добавляет это начало координат обратно при активации окна. Нельзя передать ему экранную точку как оконную: получится повторное смещение. Это также не начало клиентской области Win32.

Если изменяете внутренний `Scale factor`, сначала требуется перевести рамку из увеличенного OCR-изображения обратно в обработанный кадр, а затем применять `ToScreen`. Этот пример намеренно проверяет значение 1. Рамки, DPI и перемещение окна проверяйте по фактическому захвату; не сохраняйте координаты для будущего состояния окна.

Выбор указателем можно отменить правой кнопкой или Escape; он не принимает токен Run. Триггер и службы заимствованы. `RefreshAsync` передаёт отмену в запрос захвата, но не обещает прервать нативное OCR мгновенно. Проверка токена перед вводом не отменяет уже начатый `MouseMoveTo` или `MouseClick`. Между проверкой и вводом окно может измениться, поэтому используйте стабильное собственное окно и один короткий запуск.

Дополнительно: [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts), [захват и координаты](/ru/scripting/api/computer-vision/images), [операции CV](/ru/scripting/api/IComputerVisionExperimentalScriptingApi), [ввод](/ru/scripting/api/ISendInputScriptingApi).
