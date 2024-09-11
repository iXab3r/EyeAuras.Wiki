---
title: Как нажать на распознанное слово
description: 
published: true
date: 2024-09-11T21:03:45.385Z
tags: 
editor: markdown
dateCreated: 2024-09-11T21:03:45.385Z
---

## Кликаем на распознанное слово

1. Создаем ауру, кидаем в нее триггер Text Search
2. В триггере указываем зону захвата. Важно! Не забываем включить опцию `Include Text Segments` - по умолчанию она выключена ради увеличения производительности
3. Создаем ауру со скриптом
4. Копипастим, исправляем параметры поиска слова на желаемые

```csharp
var sendInput = GetService<ISendInputUnstableScriptingApi>();

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
    throw new ArgumentException("Failed to find valid text");
}

var textLocationOnScreen = data.ToScreen(textToClickOn.Region);
Log.Info($"Text: {textToClickOn.Text}, rel: {textToClickOn.Region}, screen: {textLocationOnScreen}");

sendInput.MouseMoveTo(textLocationOnScreen.Center());
sendInput.MouseClick();
```
