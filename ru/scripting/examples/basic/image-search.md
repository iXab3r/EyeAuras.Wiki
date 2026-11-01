---
title: Как найти изображение
description: 
published: true
date: 2024-06-23T10:33:55.116Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---

# Найти изображение и вывести координаты

## Выводим координаты найденной картинки
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok
{.is-info}

1. Создаем ауру(в примере называется ImageSearch), кидаем в нее триггер Image Search
2. В `Image Search` выберите окно или экран, изображение-образец и область поиска. Выставьте порог сходства; начальное значение триггера — 80 процентов. Это настройка готового триггера, а не значение 95 процентов из API `CvAccessor`.
3. В той же папке создаем ауру с действием `C# Script` и вставляем код в верхнеуровневый файл. Путь `.\ImageSearch` ищется относительно контекста скрипта; в найденной ауре должен быть `IImageSearchTrigger`.
4. Копипастим, запускаем, если все хорошо - скрипт напечатает координаты

```csharp
using EyeAuras.OpenCVAuras.Triggers.ImageSearch;

// находим ауру по имени и внутри нее находим триггер "Поиск изображения"
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");

var matchResult = trigger.Refresh(); // заставляем триггер выполнить поиск

if (!matchResult.Detected.Success || matchResult.Detected.Bounds == null) {
    // найти не удалось - больше делать нечего
    Log.Warn("Image not found");
    return;
}

// нашли изображение; Bounds относится к обработанному кадру, включая ROI/масштаб
var localRect = matchResult.Detected.Bounds.Value;

// конвертируем в экранные
var screenRect = matchResult.ToScreen(localRect);
Log.Info($"Image found @ {screenRect}");
```

`Refresh()` запускает синхронный захват и поиск по настройкам триггера. В `Event Log` появится экранный прямоугольник либо `Image not found`; если захват не работает, проверьте ошибки самого триггера. Его и результат захвата скрипт не владеет.

Для последующего клика преобразуйте результат через `ToScreen` и передайте экранную точку в `ISendInputScriptingApi` с `TargetWindow = null`. Ненулевой `TargetWindow` в стандартном контроллере включает активацию окна и преобразование координат — экранную точку нельзя преобразовывать повторно. Пример клика и маршруты к API — в [поиске текста с кликом](/ru/scripting/examples/basic/click-on-text) и [карте CV](/ru/scripting/api/computer-vision/images).
