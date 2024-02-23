---
title: Как найти изображение
description: 
published: true
date: 2024-02-23T23:07:10.725Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---

## Выводим координаты найденной картинки
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok
{.is-info}

1. Создаем ауру(в примере называется ImageSearch), кидаем в нее триггер Image Search
2. В триггере указываем что искать, где и т.п. 
3. Создаем ауру со скриптом
4. Копипастим, запускаем, если все хорошо - скрипт напечатает координаты

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ImageSearch") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<IImageSearchTrigger>() // и находим триггеры "Поиск изображения"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = trigger.Refresh(); // заставляем триггер выполнить поиск

if (matchResult.Detected.Success == false) {
    // найти не удалось - больше делать нечего
    Log.Warn("Image not found");
    return;
}

// нашли цвет, берем локальные(оконные) координаты
var localRect = matchResult.Detected.Bounds.Value;

// конвертируем в экранные
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```