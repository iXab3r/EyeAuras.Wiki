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

Создайте действие `C# Script` в desktop EyeAuras и запустите его. Нужен
OSD-модуль с Blazor/WebView. Пока скрипт работает, рамка 10×10 следует
за курсором в экранных координатах; остановите скрипт, чтобы убрать её.
Обычный C# класс должен получить фабрику canvas и токен от владельца.

```csharp
using System.Drawing;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        Log.Info("Booting up OSD");
        using var cursorBox = canvas.AddRectangle();
        cursorBox.Size = new Size(10, 10);
        cursorBox.Background = Color.Transparent;
        cursorBox.BorderThickness = 2;
        cursorBox.BorderColor = Color.Green;

        while (!cancellationToken.IsCancellationRequested)
        {
            var cursor = System.Windows.Forms.Cursor.Position;
            cursorBox.Location = new Point(cursor.X - 5, cursor.Y - 5);
            Sleep(16); // пауза между итерациями; отмену проверяет условие цикла
        }
    }
    finally
    {
        canvas.Clear(); // пока proxy ещё передаёт удаление общему canvas
        Log.Info("OSD routine has stopped");
    }
}
```

---

## Что здесь происходит

- `canvas.AddRectangle()` создаёт новый прямоугольный overlay-объект.
- Для прямоугольника задаются:
  - прозрачный фон
  - зелёная рамка (`2px`)
  - фиксированный размер (`10x10`)
- В каждой итерации цикла позиция обновляется так, чтобы совпадать с положением курсора и оставаться по центру за счёт вычитания `5` из обеих координат.
- При выходе из блока `using` освобождается прямоугольник, затем `finally` очищает canvas до освобождения самого canvas.

---

`Remove` и `Clear` убирают регистрации, но не заменяют освобождение объектов.
Один `canvas.Dispose()` в этом срезе не гарантирует удаления всех детей.
Общее окно может оставаться у других пользователей; реализация использует
основной монитор, поэтому не обещает покрытие всех мониторов или DPI.
Подробнее — [владение OSD-объектами](/ru/scripting/api/osd/screen-overlay).

## Полезные советы

-  `Sleep(16)` в цикле ограничивает частоту обновления примерно 60 итерациями в секунду; фактическая частота отрисовки зависит от хоста.
-  Если нужен заполненный маркер, используйте `.WithBackground(Color.FromArgb(...))`.
-  Для отладки расположения overlay-элементов можно вызвать `canvas.ShowDevTools()` и посмотреть интерфейс вживую.

---
