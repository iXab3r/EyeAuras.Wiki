---
title: Отслеживаем мышь
description: 
published: true
date: 2024-02-24T00:08:49.173Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---
# Показать цветной квадрат у указателя мыши

Сделаем маркер 32×32, у которого левый верхний угол следует за экранным положением курсора. Положение читается через API ввода, но ввод не отправляется. Это цветной квадрат рядом с указателем, а не центрированная рамка из [другого OSD-примера](/ru/scripting/examples/basic/osd-cursor).

Нужен настольный EyeAuras с модулем ввода и экранными оверлеями Blazor/WebView2. Первый опыт выполняйте на основном мониторе.

1. Создайте свою ауру с **Hotkey Is Active**, назначьте свободную клавишу, например `F1`, и выберите **Toggle Trigger state on Click**.
2. В **While Active** добавьте **C# Script** и вставьте весь код в `Script.csx`:

```csharp
using System;
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    var input = GetService<ISendInputScriptingApi>();
    var previousSimulator = input.InputSimulatorId;
    try
    {
        input.InputSimulatorId = "Windows Input";
        using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
        try
        {
            using var rectangle = canvas.AddRectangle();
            rectangle.Background = Color.Aquamarine;
            rectangle.BorderColor = Color.Azure;
            rectangle.BorderThickness = 1;
            rectangle.Size = new Size(32, 32);
            while (!cancellationToken.IsCancellationRequested)
            {
                rectangle.Location = input.CursorPosition;
                await Task.Delay(16, cancellationToken);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
        finally { canvas.Clear(); }
    }
    finally { input.InputSimulatorId = previousSimulator; }
}
```

3. Включите ауру клавишей `F1`. Двигая мышь, увидите рядом с указателем квадрат. Повторное `F1` выключает ауру и отменяет действие; при ручном Run его завершает **Stop**.

![Историческая демонстрация маркера возле курсора](https://i.imgur.com/FSSKzJp.gif)

| Параметр | Что меняет |
| --- | --- |
| `CursorPosition` | Чтение экранной позиции стандартного Windows Input. Присваивание этому свойству двигало бы мышь; здесь его нет. |
| `Size(32, 32)` | Размер квадрата; его начало совпадает с указателем, без вычитания половины размера. |
| `Aquamarine`, `Azure`, `1` | Заливка, цвет и толщина границы. |
| `Task.Delay(16, cancellationToken)` | Пауза между обновлениями, отменяемая вместе с запуском; не гарантия частоты кадров. |

Прямоугольник создан один раз и обновляется через свойства. При выходе сначала освобождается он, затем очищается его холст, затем освобождается холст; прежний способ ввода восстанавливается. Службы заимствованы у хоста. Общее окно OSD может оставаться для других владельцев; текущий экранный механизм использует основной монитор и не обещает одинаковый DPI на всех экранах. Обычному C# классу сервисы и токен передаются явно — [контракт OSD](/ru/scripting/api/osd/screen-overlay).

<details>
<summary>Другие элементы и старый готовый пример</summary>

OSD поддерживает не только прямоугольники: для подписей есть HTML/Razor-элементы, в которых можно разместить соответствующее содержимое. Это отдельные контракты и ресурсы, а не способность `AddRectangle` показать картинку или видео.

[Импортировать исторический пример](https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX). В нём была синхронная пауза `Sleep(16)`; она учитывает токен хоста. Асинхронное ожидание выше не требует отдельной фоновой задачи.

</details>
