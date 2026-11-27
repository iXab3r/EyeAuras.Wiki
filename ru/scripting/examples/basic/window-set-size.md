---
title: Настройка размера окна
description: Как задать размер окна.
published: true
date: 2025-10-19T13:28:14.334Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:28:14.334Z
---
# Задать размер выбранного окна

Скрипт просит Windows изменить размер уже открытого окна. Для примера откройте пустой Блокнот в обычном оконном режиме и оставьте только одно такое окно. Скрипт запросит наружный размер `800×600`.

1. В своей ауре добавьте **C# Script** и вставьте весь код в `Script.csx`. Это функции самого скрипта, а не методы встроенного API или отдельного обычного класса.
2. Для Блокнота оставьте вызов с `"notepad.exe"`. Для другого окна замените [выражение поиска](/ru/features/window-matching-expressions) и сначала проверьте, что оно находит ровно одно нужное окно.

```csharp
using System;
using System.Drawing;
using EyeAuras.Shared.Services;
using EyeAuras.Shared.Scaffolding;
using PoeShared.Native;
using PoeShared.Prism;

SetTargetWindowSize(800, 600, "notepad.exe");
// SetTargetWindowSize(new Size(800, 600)); // TargetWindow из переменных папки/BT

private void SetTargetWindowSize(int width, int height, string targetWindowExpression = null)
{
    SetTargetWindowSize(new Size(width, height), targetWindowExpression);
}

private void SetTargetWindowSize(Size newSize, string targetWindowExpression = null)
{
    if (string.IsNullOrEmpty(targetWindowExpression))
    {
        var value = Variables.Get<string>("default.WindowSelector.TargetWindow");
        if (!value.HasValue || string.IsNullOrEmpty(value.Value))
        {
            Log.Warn("Сначала задайте TargetWindow или передайте выражение");
            return;
        }
        targetWindowExpression = value.Value;
    }

    using var selector = GetService<IFactory<IWindowSelector>>().Create();
    var target = selector.FindWindow(targetWindowExpression);
    if (target == null || !target.IsWindow)
    {
        Log.Warn("Подходящее окно не найдено");
        return;
    }
    cancellationToken.ThrowIfCancellationRequested();
    var accepted = UnsafeNative.SetWindowSize(target.Handle, newSize);
    var actual = UnsafeNative.GetWindowRect(target.Handle);
    Log.Info($"Окно: {target.Title}; запрос: {newSize}; accepted: {accepted}; границы: {actual}");
}
```

3. Нажмите **Run**. Блокнот должен изменить размер. В журнале появятся окно, запрошенный размер, результат вызова и прочитанные наружные границы.
4. Поменяйте размер в вызове, например на `1000, 700`, и запустите скрипт снова для того же окна.

| Параметр или результат | Смысл |
| --- | --- |
| `width`, `height` или `Size` | Размер, который передаётся нативному `SetWindowPos`. В скрипте оставлены оба варианта локальной функции. |
| `targetWindowExpression` | Явное выражение поиска. Если оно пустое, функция читает `default.WindowSelector.TargetWindow` из доступной иерархии переменных. |
| `TargetWindow` папки/BT | Откуда берётся выражение при вызове без третьего аргумента. Настройка должна быть задана заранее: скрипт её не создаёт. |
| `accepted` | Результат обёртки над нативным запросом. Итоговую геометрию он не измеряет. |
| `GetWindowRect` | Наружные границы HWND вместе с рамками Windows. Они отличаются от клиентской области и от видимой рамки `DwmFrameBounds`. |

`SetWindowSize` не меняет положение окна, порядок окон и активацию. DPI он не пересчитывает и клиентскую область `800×600` не обещает: нативные координаты зависят от DPI-контекста процесса. Приложение может ограничивать размер или оставаться развёрнутым, поэтому сравнивайте то, что видите, с прочитанными границами.

Подробнее — [система координат](/ru/features/coordinate-system) и [описание поиска окон](/ru/scripting/api/windows-subsystems/window-handles).
