---
title: Как найти текст
description: 
published: true
date: 2024-02-23T23:11:31.331Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:11:31.331Z
---

## Выводим распознанный текст
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v
{.is-info}

1. Создаем ауру(в примере называется TextSearch), кидаем в нее триггер Text Search
2. В триггере указываем зону распознавания, язык и т.п. 
3. Создаем ауру со скриптом
4. Копипастим, запускаем, если все хорошо - скрипт напечатает распознанный текст

```csharp
var trigger = AuraTree.FindAuraByPath(@".\TextSearch") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<ITextSearchTrigger>() // и находим триггеры "Поиск текста"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = trigger.Refresh(); // заставляем триггер выполнить поиск
Log.Info($"Text: {matchResult.Detected.Text}");
```