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

Нарисуйте в собственном редакторе изображений красный квадрат не меньше 32×32 пикселей на светлом фоне. Найдём внутри него подходящий блок 8×8 и выведем его экранные координаты. Скрипт читает пиксели окна через настроенный `Color Search`, без перемещения мыши.

Нужны работающий захват/OpenCV и редактируемое действие `C# Script`. [Готовый исходный пример](https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU) можно импортировать, но окно и цвет всё равно выбирают на своей машине.

1. В одной папке создайте ауру `ColorSearch` с триггером `Color Search` и соседнюю ауру `Script` с действием `C# Script` в `On Enter`.
2. Выберите окно редактора и область с квадратом. Оставьте масштаб изображения 100%, эффекты для первого поиска не добавляйте.
3. Настройте параметры из таблицы и нажмите `Refresh Once`. В предпросмотре должен быть виден квадрат, а результат должен удовлетворять порогу.

| Настройка | Значение и смысл |
| --- | --- |
| `Target Color` | Выберите красный участок через `Pick Color from Preview Pane`. Так образец берётся из фактического захвата. |
| `Comparison Granularity` | `Average Color of 8x8 Pixel Blocks` — искать локальный блок, а не средний цвет всей области. |
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

При совпадении появится `Colored area found @` с экранным прямоугольником блока. Это не обещание обвести весь нарисованный квадрат. Если данных для поиска нет, журнал отдельно предложит проверить источник; `Colored area not found` означает, что полученный результат не прошёл условие.

Порог — сходство цвета/образца по выбранному механизму сравнения, а не процент красных пикселей во всём окне. Вариант `Aggregate Average Color of Entire Area` решает другую задачу: сравнивает средний цвет региона и при успехе возвращает весь регион. Подробнее — [Color Search](/ru/triggers/images/color-search).

`GetAuraByPath` требует существующую ауру, а `First()` — хотя бы один `IColorSearchTrigger` в ней; при ошибке структуры поиск не выполняется. Путь `.\ColorSearch` относителен контексту действия, не текущей папке на диске.

`Detected.Bounds` относится к обработанному кадру. `ToScreen` учитывает область и цепочку эффектов этого результата; не добавляйте рамку окна ещё раз. Триггер заимствован; этот `RefreshAsync` возвращает данные без буферов изображений. Токен передаётся в запрос захвата, но не гарантирует мгновенную отмену нативного сравнения.

Для других способов чтения — [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts), [результаты CV](/ru/scripting/api/computer-vision/images) и [операции CV](/ru/scripting/api/IComputerVisionExperimentalScriptingApi).
