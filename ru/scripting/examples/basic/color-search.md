---
title: Как найти цвет
description: 
published: true
date: 2024-02-23T23:01:14.212Z
tags: 
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---

## Выводим координаты найденного цветного прямоугольника
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223225316w1ZpWARHUMIf
{.is-info}

1. Создаем ауру(в примере называется FindColor), кидаем в нее триггер Color Search
2. В триггере указываем где искать, какой цвет и т.п. 
3. Создаем ауру со скриптом
4. Копипастим, запускаем, если все хорошо - скрипт напечатает координаты найденной зоны

```csharp
var trigger = AuraTree.FindAuraByPath(@".\FindColor") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<IColorSearchTrigger>() // и находим триггеры "Поиск цвета"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = trigger.Refresh(); // заставляем триггер выполнить поиск

if (matchResult.Detected.Success == false) {
    // найти не удалось - больше делать нечего
    Log.Warn("Colored area not found");
    return;
}

// нашли цвет, берем локальные(оконные) координаты
var localRect = matchResult.Detected.Bounds.Value;

// конвертируем в экранные
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Colored area found @ {screenRect}");
```
> Важно! Обратите внимание, что в самом триггере на поиск цвета указано искать цветной прямоугольник `Comparison Granularity = Average Color of 8x8 Pixel Blocks`
> По умолчанию `Color Search` усредняет цвет **всего** выбранного региона, а это не то, что нам нужно
{.is-warning}
