---
title: Настройка размера окна
description: Как задать размер окна.
published: true
date: 2025-10-19T13:28:14.334Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:28:14.334Z
---
# SetTargetWindowSize

Ниже `SetTargetWindowSize` — локальная функция примера, а не встроенная команда. Вставьте весь блок в верхнеуровневый файл `C# Script` (действие ауры, скриптовый узел BT или шаг макроса). Откройте Блокнот; пример запросит размер его окна 800×600. Для другого окна измените выражение `notepad.exe`.

## Что важно знать

- `targetWindowExpression` может быть заголовком окна, именем процесса и т. д. Подробнее — [здесь](/ru/features/window-matching-expressions)
- Если `targetWindowExpression` не задан, метод возьмёт `TargetWindow`, настроенный на уровне папки или BT
- Точно такой же подход можно использовать и для перемещения окна — достаточно заменить `SetWindowSize` на другой метод

```csharp
using System.Drawing;
using PoeShared.Native;
using EyeAuras.Shared.Services;

SetTargetWindowSize(800, 600, "notepad.exe");
// SetTargetWindowSize(800, 600); // взять выражение из TargetWindow папки/BT

private void SetTargetWindowSize(int width, int height, string? targetWindowExpression = default){
    SetTargetWindowSize(new Size(width, height), targetWindowExpression);
}

private void SetTargetWindowSize(Size newSize, string? targetWindowExpression = default)
{
    string windowExpression;
    if (string.IsNullOrEmpty(targetWindowExpression))
    {
        var defaultWindowVar = Variables.Get<string>("default.WindowSelector.TargetWindow");
        if (!defaultWindowVar.HasValue)
        {
            throw new ArgumentException("Folder's TargetWindow is not set");
        }
        windowExpression = defaultWindowVar.Value;
    }
    else
    {
        windowExpression = targetWindowExpression;
    }
    var targetWindow = GetService<IWindowSelector>().GetWindow(windowExpression);
    var accepted = UnsafeNative.SetWindowSize(targetWindow.Handle, newSize);
    Log.Info($"SetWindowSize accepted: {accepted}; requested: {newSize}");
}
```

`PoeShared.Native.UnsafeNative.SetWindowSize` вызывает `SetWindowPos` без перемещения, смены Z-порядка и активации. Проверьте видимый результат в целевом окне: приложение может ограничивать размер, быть развёрнутым или обрабатывать запрос по-своему. Это нативный размер окна, не обещание клиентской области 800×600; рамка, DPI и экранные координаты ввода — разные контексты. Значение `accepted` отражает результат вызова обёртки, а не измерение итоговой геометрии. [Карта окон](/ru/scripting/api/windows-subsystems/window-handles) ведёт к контрактам SDK; токен отмены в этот нативный вызов не передаётся.
