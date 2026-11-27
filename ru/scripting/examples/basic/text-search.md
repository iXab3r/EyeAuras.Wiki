---
title: Как найти текст
description: 
published: true
date: 2024-02-23T23:11:31.331Z
tags: 
editor: markdown
dateCreated: 2024-02-23T23:11:31.331Z
---

# Прочитать строку из собственного окна

`Text Search` распознаёт текст на изображении окна, а скрипт выводит его в журнал. Для примера наберите в своём текстовом редакторе строку `Build ready` крупным тёмным шрифтом на светлом фоне.

Нужны доступный захват/OpenCV и установленный OCR-движок для английского текста. Сначала проверьте, что нужный вариант есть в списке `OCR Symbols`. Можно [импортировать исходный пример](https://eu.eyeauras.net/share/S20240223231042V9jd1AoFcJ6v).

1. В одной папке создайте ауру `TextSearch` с триггером `Text Search` и рядом ауру `Script` с действием `C# Script`.
2. В триггере выберите своё окно и небольшую область вокруг строки. Эффекты пока не добавляйте.
3. Настройте OCR и нажмите `Refresh Once`. В поле `Recognized text` должна появиться ваша строка. Если её нет, сначала исправьте захват, язык или читаемость изображения.

| Настройка | Для этого примера |
| --- | --- |
| `OCR Symbols` | `Tesseract (eng)`, если он установлен и есть в списке. Иначе — тот английский OCR, который доступен в вашей установке. |
| `Scale factor` | 1 для крупного читаемого текста. Увеличение помогает с мелким текстом, но меняет изображение, которое получает OCR. |
| `Invert image`, `Binary threshold` | Сначала выключены. Включая их, проверяйте каждое изменение по распознанному тексту. |
| `Include text segments` | Чтобы вывести всю строку, не нужен. Понадобится для рамок отдельных сегментов в [примере клика](/ru/scripting/examples/basic/click-on-text). |

4. Вставьте весь код в `Script.csx` соседнего действия и нажмите `Run`:

```csharp
using EyeAuras.OpenCVAuras.Triggers.TextSearch;
using System.Linq;

var trigger = AuraTree.GetAuraByPath(@".\TextSearch") // находим ауру по имени
    .Triggers.Items // перебираем все триггеры
    .OfType<ITextSearchTrigger>() // и находим триггеры "Поиск текста"
    .First(); // из всех берем первый, если не найдено - будет ошибка

var matchResult = await trigger.RefreshAsync(cancellationToken); // новый захват и OCR
var text = matchResult.Detected.Text;
if (string.IsNullOrWhiteSpace(text))
{
    Log.Warn("Text was not recognized; check capture and OCR settings");
    return;
}
Log.Info($"Text: {text}");
```

В `Event Log` появится `Text: Build ready`. OCR может добавить пробелы и переводы строк.

`Detected.Text` — результат распознавания. `Detected.Success` зависит ещё и от [условия проверки текста](/ru/features/text-match-expressions) в триггере, так что строка может быть распознана, даже если условие не совпало.

Код выполняется в верхнеуровневом `C# Script` работающего EyeAuras. `AuraTree`, `Log` и `cancellationToken` даёт хост, а в обычный класс службы передают явно. Для `GetAuraByPath` и `First()` аура и триггер должны уже существовать.

`RefreshAsync(cancellationToken)` передаёт токен в получение кадра и обработку запроса. Нативное OCR может завершиться не сразу после Stop. Есть и блокирующий `Refresh(cancellationToken)`. Триггер из дерева освобождать не нужно, а данные обновления приходят без буферов изображений. Все настройки — в [Text Search](/ru/triggers/images/text-search), описание API — в [карте CV](/ru/scripting/api/computer-vision/images).
