---
title: Как найти изображение
description: 
published: true
date: 2024-06-23T10:33:55.116Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:07:10.725Z
---

# Найти свою метку в окне и получить координаты

Скрипт ищет картинку по образцу и пишет её прямоугольник в журнал. Он сравнивает захваченные пиксели, поэтому образец должен быть виден в выбранном окне. Доступа к внутренним ресурсам другой программы такой поиск не даёт.

Для примера сделайте свой небольшой PNG с заметной меткой, сохраните его как `C:\Templates\marker.png` и откройте в редакторе изображений в масштабе 100%. Метка должна целиком помещаться в окне. Нужны работающий модуль OpenCV и доступный способ захвата. Внешние NuGet-пакеты не нужны.

1. Создайте своё действие `C# Script` и откройте `Script.csx`.
2. Вставьте программу ниже. Если файл лежит в другом месте, замените абсолютный путь.
3. Нажмите `Run` и выберите окно с меткой в экранном указателе.
4. В `Event Log` появится `Найдено относительно окна` с прямоугольником или `Совпадений нет`. Скрипт не двигает мышь и не кликает.

```csharp
using System.Drawing;
using EyeAuras.OpenCVAuras.Scripting;
using EyeAuras.Shared.Osd;
using PoeShared.Scaffolding;

cancellationToken.ThrowIfCancellationRequested();
var window = await GetService<IOsdSelectionService>().PickWindow();
if (window == null || !window.IsWindow) { Log.Warn("Окно недоступно"); return; }
cancellationToken.ThrowIfCancellationRequested();
{
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>().ForWindow(window);
    var found = cv.ImageSearch(
        @"C:\Templates\marker.png",
        similarityThreshold: new Percentage(90),
        region: Rectangle.Empty);
    Log.Info(found.IsEmpty ? "Совпадений нет" : $"Найдено относительно окна: {found}");
}
```

`GetService`, `Log` и `cancellationToken` даёт верхнеуровневый хост EyeAuras. В обычный C#-класс службы нужно передать явно. Выбор окна отменяется правой кнопкой или Escape. Токен Run сам указатель не принимает.

| Значение в примере | Что означает |
| --- | --- |
| `ForWindow(window)` | Источник — выбранное окно. Захват по требованию, без курсора, с пустой областью и пустой цепочкой эффектов. Конкретный способ захвата выбирает программа. |
| `new Percentage(90)` | Порог сходства 90%, а не 0.9. Это оценка сравнения с образцом, а не вероятность и не доля площади окна. |
| `Rectangle.Empty` в аргументе | Искать по всему полученному кадру. |
| `Rectangle.Empty` в результате | Совпадение не найдено. Ошибка чтения PNG или захвата может прервать вызов — это уже другой результат. |

Объект из `ForWindow` принадлежит этому использованию и закрывается через `using`. Простой `ImageSearch` уже возвращает координаты окна, поэтому `ToScreen` к ним не применяйте. Начало кадра может не совпадать с клиентской областью: влияют рамки, DPI и способ захвата. Не меняйте масштаб изображения после того, как подготовили образец.

## Прочитать результат настроенного Image Search

Если окно, образец и область уже настроены в ауре, возьмите её триггер. Можно [импортировать исходный пример](https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok) или подготовить свой:

1. В одной папке создайте ауру `ImageSearch` с триггером `Image Search` и рядом ауру `Script` с действием `C# Script`.
2. В `Image Search` выберите своё окно, кнопкой `Load...` загрузите тот же PNG и задайте `Match Threshold = 90`. Для первого поиска оставьте всю область и пустую цепочку эффектов.
3. Нажмите `Refresh Once` в триггере и проверьте в предпросмотре, что метка видна. Полная настройка — в [Image Search](/ru/triggers/images/image-search).
4. В `Script.csx` соседнего действия вставьте **вместо первого примера**:

```csharp
using EyeAuras.OpenCVAuras.Triggers.ImageSearch;

// находим ауру по имени и внутри нее находим триггер "Поиск изображения"
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");

var matchResult = await trigger.RefreshAsync(cancellationToken); // новый захват и поиск

if (matchResult.Detected?.Success == null) {
    Log.Warn("Поиск не выполнен; проверьте источник и диагностику триггера");
    return;
}
if (matchResult.Detected.Success != true || matchResult.Detected.Bounds == null) {
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

5. Нажмите `Run`. В журнале появится `Image found @` с экранным прямоугольником, `Image not found` или отдельное сообщение о том, что поиск не выполнен.

`RefreshAsync(cancellationToken)` передаёт отмену в получение кадра и обработку запроса. Мгновенно прервать любую нативную операцию он не обещает. Есть и синхронный `Refresh(cancellationToken)`, но он блокирует вызывающий поток. Задержки активации ауры не заменяют результат этого конкретного поиска.

Здесь `Detected.Bounds` задан в координатах обработанного кадра. `matchResult.ToScreen` пересчитывает его матрицами того же результата с учётом области и эффектов, поэтому положение окна вручную не прибавляйте. Триггер взят из дерева, освобождать его не нужно. Этот способ обновления возвращает данные без буферов изображений.

<details>
<summary>Продолжить поиск или подключить реакцию</summary>

Подробный результат отдельного объекта CV даёт `ImageSearchRaw`. Проверяйте nullable `Detected.Bounds` и пересчитывайте локальную область матрицами именно этого результата. Кадр из `ProcessPixels` доступен только на время обработчика. Чтобы сохранить копию, нужен `Clone()` и отдельный `Dispose`.

Поиск не отправляет ввод. Для экранной точки стандартному механизму ввода нужен `TargetWindow = null`. Если указать окно, координаты будут пересчитаны относительно его рамки. Пример с явным выбором адресата — [клик по тексту](/ru/scripting/examples/basic/click-on-text). Про координаты и ресурсы — в [карте CV](/ru/scripting/api/computer-vision/images).

</details>
