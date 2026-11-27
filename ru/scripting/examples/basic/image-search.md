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

Скрипт найдёт изображение по образцу и запишет прямоугольник в журнал. Он сравнивает захваченные пиксели, поэтому образец должен быть виден в выбранном окне. Доступа к внутренним ресурсам другой программы этот поиск не даёт.

Для примера подготовьте собственный небольшой PNG с различимой меткой, сохраните его как `C:\Templates\marker.png` и откройте в редакторе изображений при масштабе 100%. Метка должна целиком помещаться в окне. Нужны работающий модуль OpenCV и доступный способ захвата; внешние NuGet-пакеты не требуются.

1. Создайте собственное действие `C# Script` и откройте `Script.csx`.
2. Вставьте программу ниже. Если файл лежит в другом месте, замените абсолютный путь.
3. Нажмите `Run`, затем выберите окно с меткой в экранном указателе.
4. В `Event Log` появится `Найдено относительно окна` с прямоугольником либо `Совпадений нет`. Скрипт не двигает мышь и не кликает.

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

`GetService`, `Log` и `cancellationToken` предоставляет верхнеуровневый хост EyeAuras. Обычному C#-классу передайте службы явно. Выбор окна отменяется правой кнопкой или Escape; сам указатель не принимает токен Run.

| Значение в примере | Что означает |
| --- | --- |
| `ForWindow(window)` | Источник — выбранное окно. Захват по требованию, без курсора, с пустой областью и цепочкой эффектов. Конкретный способ захвата выбирает программа. |
| `new Percentage(90)` | Порог сходства 90%, а не 0.9. Это оценка сравнения образца, не вероятность и не доля площади окна. |
| `Rectangle.Empty` в аргументе | Искать по всему полученному кадру. |
| `Rectangle.Empty` в результате | Совпадение не найдено. Ошибки чтения PNG или захвата могут прервать вызов — это другой результат. |

Полученный через `ForWindow` объект принадлежит этому использованию и закрывается через `using`. Простой `ImageSearch` уже переводит результат в координаты окна; не применяйте к нему `ToScreen` повторно. Начало кадра не обязано совпадать с клиентской областью: рамки, DPI и способ захвата имеют значение. Не меняйте масштаб изображения после подготовки образца.

## Прочитать результат настроенного Image Search

Если окно, образец и область уже настроены в ауре, используйте её триггер. Можно [импортировать исходный пример](https://eu.eyeauras.net/share/S20240223230622FB6T3303xKok) или подготовить свой:

1. В одной папке создайте ауру `ImageSearch` с триггером `Image Search` и соседнюю ауру `Script` с действием `C# Script`.
2. В `Image Search` выберите собственное окно, через `Load...` загрузите тот же PNG, задайте `Match Threshold = 90`. Для первого поиска оставьте всю область и пустую цепочку эффектов.
3. Нажмите `Refresh Once` в триггере и убедитесь по предпросмотру, что метка видна. Полная настройка — в [Image Search](/ru/triggers/images/image-search).
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

5. Нажмите `Run`. Журнал покажет `Image found @` с экранным прямоугольником, `Image not found` либо отдельное сообщение о невыполненном поиске.

`RefreshAsync(cancellationToken)` передаёт отмену в получение кадра и обработку запроса; это не обещание мгновенно прервать любую нативную операцию. Синхронный `Refresh(cancellationToken)` тоже существует, но блокирует вызывающий поток. Задержки активации ауры не заменяют результат этого конкретного поиска.

Здесь `Detected.Bounds` локален для обработанного кадра. `matchResult.ToScreen` использует матрицы того же результата для области и эффектов; не прибавляйте положение окна вручную. Триггер заимствован из дерева, освобождать его не нужно. Этот путь обновления возвращает данные без буферов изображений.

<details>
<summary>Продолжить поиск или подключить реакцию</summary>

Для подробного результата отдельного объекта CV есть `ImageSearchRaw`: проверяйте nullable `Detected.Bounds` и преобразуйте локальную область матрицами именно этого результата. Кадр из `ProcessPixels` заимствуется только на время обработчика; для сохранения копии нужен `Clone()` и отдельный `Dispose`.

Поиск не отправляет ввод. Для экранной точки стандартному механизму ввода нужен `TargetWindow = null`; ненулевое окно добавляет преобразование относительно его рамки. Пример с явным выбором адресата — [клик по тексту](/ru/scripting/examples/basic/click-on-text). Контракты координат и ресурсов — в [карте CV](/ru/scripting/api/computer-vision/images).

</details>
