---
title: Как найти цвет
description: 
published: true
date: 2024-02-23T23:03:50.178Z
tags: 
editor: markdown
dateCreated: 2024-02-23T22:58:56.886Z
---
# Вывести координаты найденной цветной области

Это верхнеуровневый `C# Script` EyeAuras. Подготовьте рядом ауру `ColorSearch` с триггером `Color Search`: задайте цель захвата, ROI, цвет и диапазон сходства. Результат — экранный прямоугольник в журнале, без перемещения мыши.
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223230313LBOJUBwnUmRU
{.is-info}

1. Создаем ауру(в примере называется ColorSearch), кидаем в нее триггер Color Search
2. В триггере указываем где искать, какой цвет и т.п. 
3. Создаем ауру со скриптом
4. Копипастим, запускаем, если все хорошо - скрипт напечатает координаты найденной зоны

```csharp
var trigger = AuraTree.FindAuraByPath(@".\ColorSearch") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<IColorSearchTrigger>() // и находим триггеры "Поиск цвета"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = trigger.Refresh(); // заставляем триггер выполнить поиск

if (matchResult.Detected.Success != true || matchResult.Detected.Bounds == null) {
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


`Detected` содержит состояние и локальный `Bounds`; `ToScreen` переводит его через матрицы этого кадра. Без подходящей области скрипт выводит предупреждение. Ошибку захвата нужно отличать от обычного отсутствия совпадения по диагностике триггера. Значение порога берётся из настроенного триггера, а не из defaults отдельного CV accessor. Триггер из дерева и кадры результата заимствованы; не освобождайте их в скрипте. `Refresh()` выполняет синхронную операцию и сам по себе не обещает отмену токеном.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
