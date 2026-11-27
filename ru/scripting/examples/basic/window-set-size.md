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

Скрипт может запросить у Windows новый размер уже открытого окна. Для первого опыта откройте собственный пустой Блокнот в обычном оконном режиме и оставьте только одно такое окно: пример запросит наружный размер `800×600`, не печатая в него и не перемещая его.

1. В собственной ауре добавьте **C# Script**. Вставьте весь код в `Script.csx`; это функции данного скрипта, а не методы встроенного API или отдельного обычного класса.
2. Оставьте вызов с `"notepad.exe"` для Блокнота. Для другого своего окна замените [выражение поиска](/ru/features/window-matching-expressions), предварительно проверив, что оно выбирает нужное единственное окно.

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

3. Нажмите **Run**. Блокнот должен изменить размер; журнал покажет адресата, запрос, результат вызова и прочитанные наружные границы. Если окна нет, выводится отдельное сообщение — это не успешное изменение.
4. Измените размер в вызове, например на `1000, 700`, и повторите запуск для того же своего окна.

| Параметр или результат | Смысл |
| --- | --- |
| `width`, `height` или `Size` | Размер, передаваемый нативному `SetWindowPos`. Оба варианта локальной функции сохранены. |
| `targetWindowExpression` | Явное выражение поиска. Если оно пустое, функция читает `default.WindowSelector.TargetWindow` из доступной иерархии переменных. |
| `TargetWindow` папки/BT | Настройка источника выражения для вызова без третьего аргумента. Она должна быть задана; скрипт её не создаёт. |
| `accepted` | Результат обёртки нативного запроса, а не измерение итоговой геометрии. |
| `GetWindowRect` | Наружные границы HWND, включая рамки Windows. Они отличаются от клиентской области и видимой рамки `DwmFrameBounds`. |

`SetWindowSize` не меняет положение, порядок окон или активацию. Он не пересчитывает DPI и не обещает клиентскую область `800×600`: нативные координаты зависят от DPI-контекста процесса. Приложение может ограничивать размер или оставаться развёрнутым, поэтому сравнивайте видимый результат и прочитанные границы.

Фабрика заимствована у хоста, созданный объект выбора окна освобождается при выходе из функции; окно этим не закрывается. Токен проверяется перед вызовом, но в сам `SetWindowSize` не передаётся. Для перемещения нужен другой нативный вызов с его собственными параметрами — изменение размеров не является командой перемещения.

Подробнее — [система координат](/ru/features/coordinate-system) и [контракты поиска окон](/ru/scripting/api/windows-subsystems/window-handles).
