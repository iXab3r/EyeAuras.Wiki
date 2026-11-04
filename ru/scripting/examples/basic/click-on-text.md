---
title: Как нажать на распознанное слово
description: 
published: true
date: 2024-09-11T21:04:35.270Z
tags: 
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---
# Кликнуть по распознанному слову

Выполните код в `C# Script` EyeAuras рядом с аурой `Test`, содержащей настроенный `Text Search`. Путь `./Test` отсчитывается от текущего контекста дерева. Выберите окно/ROI и OCR-движок в триггере; `HVDK` замените точным текстом нужного сегмента. Ввод использует выбранный доступный симулятор и перемещает настоящий курсор.

1. Создаем ауру, кидаем в нее триггер Text Search
2. В триггере указываем зону захвата. Важно! Не забываем включить опцию `Include Text Segments` - по умолчанию она выключена ради увеличения производительности
3. Создаем ауру со скриптом
4. Копипастим, исправляем параметры поиска слова на желаемые

```csharp
var sendInput = GetService<ISendInputScriptingApi>();
sendInput.TargetWindow = null; // ToScreen ниже даёт абсолютные координаты

var ocr = AuraTree.GetTriggerByPath<ITextSearchTrigger>("./Test");

if (!ocr.IncludeTextSegments){
    throw new ArgumentException($"It seems that {nameof(ocr.IncludeTextSegments)} is disabled in TextSearch {ocr}, segments data is not available");
}

var data = ocr.Refresh();
Log.Info($"OCR chars: {data.Detected.Segments.DumpToTable()}");

var textToClickOn = 
    data.Detected
    .Segments
    .Where(x => x.Text == "HVDK") //or any other logic
    .FirstOrDefault();
if (textToClickOn == default){
    Log.Info("Подходящий текстовый сегмент не найден");
    return;
}

var textLocationOnScreen = data.ToScreen(textToClickOn.Region);
Log.Info($"Text: {textToClickOn.Text}, rel: {textToClickOn.Region}, screen: {textLocationOnScreen}");

sendInput.MouseMoveTo(textLocationOnScreen.Center());
sendInput.MouseClick();
```


При совпадении скрипт печатает исходную область и экранный прямоугольник, перемещает курсор в его центр и кликает. `Segments` — сегменты OCR, не обязательно слова; регистр и пробелы в сравнении учитываются. Отключённый `Include Text Segments` не равен отсутствию совпадения. Координаты `Region` локальны для распознанной области; `data.ToScreen` учитывает матрицы именно этого захвата. Изображения результата заимствованы. Триггер из дерева не принадлежит скрипту, освобождать его нельзя. Обновление и ввод синхронные; остановка между ними не отменяет уже начатую операцию.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi) · [Ввод](/ru/scripting/api/ISendInputScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
