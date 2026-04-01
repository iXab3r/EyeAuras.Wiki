---
title: ImGui: отрисовка курсора
description: Отрисовка курсора с помощью ImGui.
published: true
date: 2025-06-13T21:46:14.167Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T17:49:10.631Z
---
# Отрисовка курсора на экране через ImGui

В этом руководстве показано, как нарисовать простой визуальный оверлей — например, зелёную рамку вокруг курсора мыши — с помощью [Dear ImGui](https://github.com/ocornut/imgui) через библиотеку `ClickableTransparentOverlay`.

Мы будем использовать **ImGui.NET** — официальный .NET-байндинг для ImGui — и рендерить всё прямо в полноэкранное прозрачное overlay-окно, которое не блокирует ввод мыши.

---

## Что такое ImGui?

**ImGui** (Immediate Mode GUI) — это быстрая и минималистичная UI-библиотека, которую часто используют для отладки, dev-инструментов, оверлеев и кастомных редакторов. В отличие от классических retained-mode UI-библиотек, ImGui перерисовывает весь интерфейс каждый кадр, поэтому она особенно хорошо подходит для HUD, debug-панелей и других инструментов реального времени.

---

## Что потребуется

Убедитесь, что у вас подключён следующий NuGet-пакет:

```csharp
#r "nuget: ClickableTransparentOverlay, 10.2.0"
```

Этот пакет предоставляет базовый класс `Overlay`, который берёт на себя создание окна, настройку ImGui и рендеринг.

---

## Полный пример: отслеживание курсора через ImGui

```csharp
#r "nuget: ClickableTransparentOverlay, 10.2.0"

using ClickableTransparentOverlay;
using System.Threading.Tasks;
using ImGuiNET;

try
{
    Log.Info("Booting up ImGui OSD");

    using var overlay = new SampleOverlay(cancellationToken);
    await overlay.Run(); // Starts the overlay loop
}
catch (Exception ex)
{
    Log.Error("ImGui OSD encountered an error", ex);
    throw;
}
finally
{
    Log.Info("ImGui OSD was closed");
}

internal class SampleOverlay : Overlay
{
    private readonly CancellationToken cancellationToken;

    public SampleOverlay(CancellationToken cancellationToken)
        : base( // Fullscreen on primary monitor
            System.Windows.Forms.Screen.PrimaryScreen.Bounds.Width,
            System.Windows.Forms.Screen.PrimaryScreen.Bounds.Height)
    {
        this.cancellationToken = cancellationToken;
    }

    // Called every frame
    protected override void Render()
    {
        // Graceful shutdown if requested
        if (cancellationToken.IsCancellationRequested)
        {
            Close();
            return;
        }

        // Get the current ImGui draw list
        var drawList = ImGui.GetBackgroundDrawList();

        // Get the current cursor position (in screen coordinates)
        var cursorPosition = UnsafeNative.GetCursorPosition();

        // Draw a green 10x10 rectangle centered on the cursor
        drawList.AddRect(
            cursorPosition.OffsetBy(-5, -5).ToVector2(),
            cursorPosition.OffsetBy(5, 5).ToVector2(),
            ImGui.GetColorU32(new System.Numerics.Vector4(0f, 1f, 0f, 1f)), // Green
            0f,                    // Corner rounding
            ImDrawFlags.None,     // No flags
            1f                    // Thickness
        );
    }
}
```

---

## Основные моменты

- `ImGui.GetBackgroundDrawList()` даёт доступ к canvas для рисования в фоновом слое.
- `AddRect()` рисует прямоугольник в экранных координатах.
- Цвет передаётся как `Vector4` (RGBA) и затем преобразуется через `ImGui.GetColorU32`.
- `OffsetBy(x, y)` здесь предполагается как вспомогательный метод, который возвращает новый `Point`, смещённый на указанную дельту.
- Базовый класс `Overlay` сам запускает frame loop и обрабатывает прозрачность окна.

---

## Что можно добавить дальше

- Подпись или tooltip рядом с курсором
- Разные фигуры в зависимости от состояния
- Обработку кликов или взаимодействия с overlay
- Отображение debug-данных или игровых визуальных элементов в реальном времени