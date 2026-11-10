---
title: Как нажать на распознанное слово
description: 
published: true
date: 2024-09-11T21:04:35.270Z
tags: 
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---

# Найти слово, проверить рамку и один раз кликнуть

Для первого опыта покажите единственное слово `READY` в своём стабильном тестовом окне, без кнопок отправки и других значимых действий. Скрипт сначала выведет найденную рамку, а после вашего решения выполнит один клик. Нужны работающие OCR/OpenCV и `Windows Input`.

1. Создайте ауру `Test` с `Text Search` и соседнюю ауру с действием `C# Script`.
2. В триггере выберите своё тестовое окно, ограничьте область словом и проверьте `Recognized text` через `Refresh Once`.

| Настройка | Для этого примера |
| --- | --- |
| `OCR Symbols` | Доступный английский движок. |
| `Include text segments` | Включено: нужны отдельные рамки. |
| `Scale factor` | 1; цепочка эффектов для первого опыта пустая. |
| `click` в коде | Сначала `false`: только результат в журнале. |

3. Вставьте в верхнеуровневый `Script.csx` весь код. Нажмите `Run` и укажите **то же тестовое окно**, которое настроено в триггере:

```csharp
using System.Linq;
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;

var click = false;
var target = await GetService<IOsdSelectionService>().PickWindow();
if (target == null || !target.IsWindow) { Log.Warn("Окно недоступно"); return; }
var ocr = AuraTree.GetTriggerByPath<ITextSearchTrigger>("./Test");
var data = await ocr.RefreshAsync(cancellationToken);
if (data.Detected == null || data.Detected.Segments.IsDefaultOrEmpty)
{ Log.Warn("Нет сегментов OCR"); return; }

var matches = data.Detected.Segments.Where(x => x.Text == "READY").ToArray();
if (matches.Length != 1) { Log.Info("Нужен ровно один сегмент READY"); return; }
var box = data.ToScreen(matches[0].Region);
var frame = target.DwmFrameBounds;
if (box.IsEmpty || !frame.Contains(box)) { Log.Warn("Рамка вне выбранного окна"); return; }
Log.Info($"Окно: {target.Title}; текст: {matches[0].Text}; экранная рамка: {box}");
if (!click) return;

cancellationToken.ThrowIfCancellationRequested();
var input = GetService<ISendInputScriptingApi>();
input.InputSimulatorId = "Windows Input";
var previousTarget = input.TargetWindow;
try
{
    input.TargetWindow = target;
    var point = box.Center();
    input.MouseMoveTo(point.X - frame.X, point.Y - frame.Y);
    input.MouseClick();
}
finally { input.TargetWindow = previousTarget; }
```

4. При `click = false` проверьте в журнале окно, текст и рамку своей надписи. Если OCR разбил слово на несколько сегментов, сначала уточните язык или область.
5. Оставьте окно на месте, замените `click` на `true` и повторите запуск с выбором того же окна. Курсор перейдёт в центр найденной рамки и сделает один левый клик. После опыта верните `false`.

Если перед кликом нужно разобраться с распознаванием, начните с [настройки Text Search](/ru/triggers/images/text-search) и [вывода текста в журнал](/ru/scripting/examples/basic/text-search). Сначала проверьте распознанную строку, затем включите рамки сегментов, необходимые для этого примера.

Преобразование одно на каждом этапе: локальная `Region` → `ToScreen` → вычитание начала `DwmFrameBounds` для адресного ввода. Стандартный контроллер активирует указанное окно и добавляет это начало обратно. Это не клиентские координаты и не фоновый клик. Не перемещайте окно и не меняйте масштаб во время опыта; внутренний масштаб OCR, отличный от 1, требует дополнительного пересчёта рамки до `ToScreen`.

Триггер и службы заимствованы; прежний адресат ввода восстанавливается в `finally`. Токен передаётся в запрос OCR и проверяется перед вводом, но уже начатый синхронный клик не отменяется мгновенно. Выбор окна отменяется Escape или правой кнопкой.

<details>
<summary>Посмотреть исходные сегменты</summary>

Сразу после проверки `data.Detected` можно вывести `Log.Info(data.Detected.Segments.DumpToTable());`. `Segments` зависят от движка и не всегда являются словами; сравнение строки учитывает регистр и пробелы. `Score` — оценка OCR, не процент площади и не гарантия правильности.

Контракты: [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts), [захват и координаты](/ru/scripting/api/computer-vision/images), [операции CV](/ru/scripting/api/IComputerVisionExperimentalScriptingApi), [ввод](/ru/scripting/api/ISendInputScriptingApi).

</details>
