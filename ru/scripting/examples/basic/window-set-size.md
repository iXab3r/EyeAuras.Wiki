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

`SetTargetWindowSize` позволяет задать размер целевого окна. Может использоваться в скриптах, Behavior Trees и макросах.

## Что важно знать

- `targetWindowExpression` может быть заголовком окна, именем процесса и т. д. Подробнее — [здесь](/ru/features/window-matching-expressions)
- Если `targetWindowExpression` не задан, метод возьмёт `TargetWindow`, настроенный на уровне папки или BT
- Точно такой же подход можно использовать и для перемещения окна — достаточно заменить `SetWindowSize` на другой метод

```csharp
SetTargetWindowSize(100, 200); //or SetTargetWindowSize(100, 200, "notepad.exe");

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
    UnsafeNative.SetWindowSize(targetWindow.Handle, newSize);
}
```