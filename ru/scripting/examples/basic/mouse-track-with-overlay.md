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

Скрипт показывает квадрат 32×32, левый верхний угол которого следует за курсором на экране. Положение читается через API ввода, но сам ввод не отправляется. Квадрат стоит рядом с указателем, а не вокруг него, как рамка в [другом OSD-примере](/ru/scripting/examples/basic/osd-cursor).

Нужен настольный EyeAuras с модулем ввода и экранными оверлеями Blazor/WebView2. Первый раз пробуйте на основном мониторе.

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

3. Включите ауру клавишей `F1` и подвигайте мышью — рядом с указателем будет квадрат. Повторное `F1` выключает ауру и отменяет действие. Если запускали вручную через Run, его завершает **Stop**.

| Параметр | Что меняет |
| --- | --- |
| `CursorPosition` | Читает экранную позицию через стандартный Windows Input. Если присвоить этому свойству значение, мышь сдвинется, но в примере этого нет. |
| `Size(32, 32)` | Размер квадрата. Его начало совпадает с указателем, половина размера не вычитается. |
| `Aquamarine`, `Azure`, `1` | Заливка, цвет и толщина границы. |
| `Task.Delay(16, cancellationToken)` | Пауза между обновлениями. Отменяется вместе с запуском. Частоту кадров не гарантирует. |

Прямоугольник создаётся один раз и дальше меняется через свойства. При выходе сначала освобождается он, потом очищается его холст, потом освобождается сам холст. Прежний способ ввода возвращается. Службы заимствованы у хоста. Общее окно OSD может остаться для других владельцев. Сейчас экранный механизм использует основной монитор и не обещает одинаковый DPI на всех экранах. В обычный C#-класс сервисы и токен передаются явно — см. [контракт OSD](/ru/scripting/api/osd/screen-overlay).

<details>
<summary>Другие элементы и старый готовый пример</summary>

OSD умеет не только прямоугольники. Для подписей есть HTML/Razor-элементы, в которые можно поместить нужное содержимое. Это отдельные контракты и ресурсы: сам `AddRectangle` картинку или видео не покажет.

[Импортировать старый пример](https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX). В нём была синхронная пауза `Sleep(16)`, она учитывает токен хоста. Асинхронному ожиданию выше отдельная фоновая задача не нужна.

</details>
