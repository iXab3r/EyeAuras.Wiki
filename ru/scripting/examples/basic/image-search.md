---
title: Как найти изображение
description: 
published: true
date: 2024-06-23T10:33:55.116Z
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
// находим ауру по имени и внутри нее находим триггер "Поиск изображения"
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");

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