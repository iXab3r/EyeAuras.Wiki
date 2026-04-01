---
title: OSD-отрисовка курсора
description: Отрисовка курсора в OSD
published: true
date: 2025-03-31T18:03:18.405Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T18:02:42.036Z
---
# Отрисовка курсора на экране через OSD API EyeAuras

Этот скрипт показывает, как нарисовать небольшой прямоугольник вокруг курсора мыши, который обновляется в реальном времени, с помощью **On-Screen Display (OSD) API** в EyeAuras. Для этого используется API `IOnScreenCanvas`, которое динамически рендерит overlay-элемент и заставляет его следовать за курсором.

---

## Обзор API

EyeAuras предоставляет scripting API для создания лёгких визуальных элементов поверх экрана.

С помощью этих API можно создавать, изменять и удалять лёгкие экранные overlay-элементы. Это удобно для HUD-индикаторов, отслеживания UI-элементов, отладочных помощников и маркеров курсора.

---

## Пример: зелёный прямоугольник вокруг курсора

```csharp
try
{
    Log.Info("Booting up OSD");

    // Create an overlay canvas
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();

    // Add a 10x10 green-outlined rectangle (no fill) to the canvas
    using var cursorBox = canvas.AddRectangle()
        .WithSize(new Size(10, 10))
        .WithBackground(Color.Transparent)
        .WithBorderThickness(2)
        .WithBorderColor(Color.Green);

    // Continuously update position to follow the cursor
    while (!cancellationToken.IsCancellationRequested)
    {
        cursorBox.Location = System.Windows.Forms.Cursor.Position.OffsetBy(-5, -5);
    }
}
finally
{
    Log.Info("OSD routine has stopped");
}
```

---

## Что здесь происходит

- `canvas.AddRectangle()` создаёт новый прямоугольный overlay-объект.
- Для прямоугольника задаются:
  - прозрачный фон
  - зелёная рамка (`2px`)
  - фиксированный размер (`10x10`)
- В каждой итерации цикла позиция обновляется так, чтобы совпадать с положением курсора и оставаться по центру за счёт `.OffsetBy(-5, -5)`.
- Когда скрипт завершается, прямоугольник автоматически удаляется и освобождается.

---

## Полезные советы

-  Чтобы ограничить частоту обновления, можно добавить `Task.Delay(16)` для примерно 60 FPS.
-  Если нужен заполненный маркер, используйте `.WithBackground(Color.FromArgb(...))`.
-  Для отладки расположения overlay-элементов можно вызвать `canvas.ShowDevTools()` и посмотреть интерфейс вживую.

---