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

Скрипт находит слово на экране и пишет его рамку в журнал. Когда вы разрешите, он один раз кликнет по этому слову. Для первого раза покажите одно слово `READY` в своём тестовом окне, которое не меняется и где нет кнопок отправки и других важных действий. Нужны работающие OCR/OpenCV и `Windows Input`.

1. Создайте ауру `Test` с `Text Search` и рядом ауру с действием `C# Script`.
2. В триггере выберите своё тестовое окно, сузьте область до слова и проверьте `Recognized text` кнопкой `Refresh Once`.

| Настройка | Для этого примера |
| --- | --- |
| `OCR Symbols` | Доступный английский движок. |
| `Include text segments` | Включено: нужны отдельные рамки. |
| `Scale factor` | 1. Цепочку эффектов для первого раза оставьте пустой. |
| `click` в коде | Сначала `false`: результат только пишется в журнал. |

3. Вставьте весь код в верхнеуровневый `Script.csx`. Нажмите `Run` и укажите **то же тестовое окно**, что и в триггере:

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

4. Пока `click = false`, проверьте в журнале окно, текст и рамку своей надписи. Если OCR разбил слово на несколько сегментов, сначала уточните язык или область.
5. Не двигайте окно, поменяйте `click` на `true` и запустите ещё раз, выбрав то же окно. Курсор перейдёт в центр найденной рамки и один раз кликнет левой кнопкой. После опыта верните `false`.

Если сначала нужно разобраться с распознаванием, начните с [настройки Text Search](/ru/triggers/images/text-search) и [вывода текста в журнал](/ru/scripting/examples/basic/text-search). Проверьте распознанную строку, потом включите рамки сегментов — они нужны для этого примера.

Координаты пересчитываются по одному разу на каждом шаге: локальная `Region` → `ToScreen` → минус начало `DwmFrameBounds`, потому что ввод адресован окну. Стандартный контроллер активирует указанное окно и прибавляет это начало обратно. Это не клиентские координаты и не фоновый клик. Во время опыта не двигайте окно и не меняйте масштаб. Если внутренний масштаб OCR не равен 1, рамку нужно дополнительно пересчитать до `ToScreen`.

Триггер и службы заимствованы. Прежний адресат ввода возвращается в `finally`. Токен передаётся в запрос OCR и проверяется перед вводом, но уже начатый синхронный клик сразу не отменится. Выбор окна отменяется Escape или правой кнопкой.

<details>
<summary>Посмотреть исходные сегменты</summary>

Сразу после проверки `data.Detected` можно вывести `Log.Info(data.Detected.Segments.DumpToTable());`. Что попадает в `Segments`, зависит от движка: это не всегда слова. Сравнение строк учитывает регистр и пробелы. `Score` — оценка OCR, а не процент площади и не гарантия правильности.

Подробнее об API: [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts), [захват и координаты](/ru/scripting/api/computer-vision/images), [операции CV](/ru/scripting/api/IComputerVisionExperimentalScriptingApi), [ввод](/ru/scripting/api/ISendInputScriptingApi).

</details>
