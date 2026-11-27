---
title: Как найти цвет
description: 
published: true
date: 2024-02-23T23:03:50.178Z
tags: 
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---

# Найти цветной участок и вывести его положение

Скрипт ищет цветной участок в окне и пишет его экранные координаты в журнал. Для примера нарисуйте в своём редакторе изображений красный квадрат не меньше 32×32 пикселей на светлом фоне. Скрипт найдёт внутри него подходящий блок 8×8. Пиксели окна он читает через настроенный `Color Search` и мышь не двигает.

Нужны работающий захват/OpenCV и действие `C# Script`, которое можно редактировать. [Готовый пример](https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU) можно импортировать, но окно и цвет всё равно придётся выбрать на своём компьютере.

1. В одной папке создайте ауру `ColorSearch` с триггером `Color Search` и рядом ауру `Script` с действием `C# Script` в `On Enter`.
2. Выберите окно редактора и область с квадратом. Масштаб изображения оставьте 100%, эффекты для первого поиска не добавляйте.
3. Задайте параметры из таблицы и нажмите `Refresh Once`. В предпросмотре должен быть виден квадрат, а результат должен проходить порог.

| Настройка | Значение и смысл |
| --- | --- |
| `Target Color` | Возьмите красный цвет кнопкой `Pick Color from Preview Pane`. Так образец берётся из того, что реально захвачено. |
| `Comparison Granularity` | `Average Color of 8x8 Pixel Blocks` — искать отдельный блок, а не средний цвет всей области. |
| `Match Threshold` | Нижняя граница 90%, верхняя 100%. Если включён режим `Min`, задайте обе границы. |

4. Вставьте весь код в `Script.csx` соседнего действия и нажмите `Run`:

```csharp
using System.Linq;
using EyeAuras.OpenCVAuras.Triggers.ColorSearch;

var trigger = AuraTree.GetAuraByPath(@".\ColorSearch") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<IColorSearchTrigger>() // и находим триггеры "Поиск цвета"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = await trigger.RefreshAsync(cancellationToken); // новый захват и поиск

if (matchResult.Detected?.Success == null) {
    Log.Warn("Поиск не выполнен; проверьте источник и диагностику триггера");
    return;
}
if (matchResult.Detected.Success != true || matchResult.Detected.Bounds == null) {
    // найти не удалось - больше делать нечего
    Log.Warn("Colored area not found");
    return;
}

// область в координатах обработанного кадра
var localRect = matchResult.Detected.Bounds.Value;

// конвертируем в экранные
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Colored area found @ {screenRect}");
```

Если цвет найден, в журнале появится `Colored area found @` с экранным прямоугольником блока. Он не обязан охватывать весь нарисованный квадрат. Если данных для поиска нет, журнал отдельно попросит проверить источник. `Colored area not found` значит, что результат получен, но не прошёл условие.

Порог — это сходство цвета с образцом по выбранному способу сравнения, а не процент красных пикселей во всём окне. Вариант `Aggregate Average Color of Entire Area` решает другую задачу: сравнивает средний цвет области и при успехе возвращает её целиком. Подробнее — [Color Search](/ru/triggers/images/color-search).

`GetAuraByPath` требует, чтобы аура существовала, а `First()` — чтобы в ней был хотя бы один `IColorSearchTrigger`. Если структура другая, поиск не выполнится. Путь `.\ColorSearch` считается относительно контекста действия, а не текущей папки на диске.

`Detected.Bounds` задан в координатах обработанного кадра. `ToScreen` уже учитывает область и цепочку эффектов этого результата, поэтому рамку окна ещё раз не прибавляйте. Триггер заимствован. Этот `RefreshAsync` возвращает данные без буферов изображений. Токен передаётся в запрос захвата, но мгновенную отмену нативного сравнения не гарантирует.

Другие способы чтения описаны в [контексте скрипта](/ru/scripting/api/core/app-runtime-contexts), [результатах CV](/ru/scripting/api/computer-vision/images) и [операциях CV](/ru/scripting/api/IComputerVisionExperimentalScriptingApi).
