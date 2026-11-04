---
title: Как найти текст
description: 
published: true
date: 2024-02-23T23:11:31.331Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:11:31.331Z
---

# Распознать текст в выбранной области

Код выполняется в верхнеуровневом файле действия `C# Script` живого EyeAuras. В той же папке нужна аура `TextSearch` с настроенным `Text Search`: выберите окно или экран, область распознавания и доступный OCR-движок с нужным языком. Сначала убедитесь в редакторе триггера, что он получает изображение и распознаёт текст.

## Выводим распознанный текст
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v
{.is-info}

1. Создаем ауру(в примере называется TextSearch), кидаем в нее триггер Text Search
2. В триггере указываем зону распознавания, язык и т.п.
3. Создаем ауру со скриптом
4. Копипастим, запускаем, если все хорошо - скрипт напечатает распознанный текст

```csharp
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using System.Linq;

var trigger = AuraTree.FindAuraByPath(@".\TextSearch") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<ITextSearchTrigger>() // и находим триггеры "Поиск текста"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = trigger.Refresh(); // заставляем триггер выполнить поиск
var text = matchResult.Detected.Text;
if (string.IsNullOrWhiteSpace(text))
{
    Log.Warn("Text was not recognized; check capture and OCR settings");
    return;
}
Log.Info($"Text: {text}");
```

В `Event Log` появится распознанная строка либо предупреждение. `Detected.Text` — результат OCR, а `Detected.Success` ещё зависит от условий поиска, заданных в триггере; это не одно и то же. `Refresh()` синхронный, токен отмены в него не передаётся. Полученный из дерева триггер не нужно уничтожать. Для координат слов включите сегменты и используйте [пример клика по тексту](/ru/scripting/examples/basic/click-on-text); контракты ищите через [карту CV](/ru/scripting/api/computer-vision/images).
