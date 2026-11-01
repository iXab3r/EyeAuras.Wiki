---
title: ImGui — отрисовка курсора
description: Отрисовка курсора с помощью ImGui.
published: true
date: 2025-06-13T21:46:14.167Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T17:49:10.631Z
---
# Отрисовка курсора на экране через ImGui

В этом руководстве показано, как нарисовать простой визуальный оверлей — например, зелёную рамку вокруг курсора мыши — с помощью [Dear ImGui](https://github.com/ocornut/imgui) через библиотеку `ClickableTransparentOverlay`.

Мы будем использовать **ImGui.NET** — .NET-обёртку для ImGui — и рендерить всё прямо в полноэкранное прозрачное overlay-окно, которое не блокирует ввод мыши.

---

## Нарисовать рамку из C# Script через SDK

Вставьте блок в верхнеуровневый файл действия `C# Script` живого EyeAuras. Подключите совместимую версию необязательного `EyeAuras.ImGuiSdk`, в которой есть `ImGuiContainerExtensions`, `IImGuiExperimentalApi` и `AddRenderer`. Исторический пример SDK использует `#r "nuget:EyeAuras.ImGuiSdk, 0.1.17"`; соответствие опубликованного пакета этим исходникам не проверено. Ниже показан контракт EyeAuras `20fd3d4` / PoeEye `0e02c98`, а не обещание совместимости любой версии пакета.

```csharp
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;
using PoeShared.Scaffolding;

AddNewExtension<ImGuiContainerExtensions>();
using var osd = GetService<IImGuiExperimentalApi>();
using var renderer = osd.AddRenderer(() =>
{
    if (cancellationToken.IsCancellationRequested) return;
    var cursor = ImGui.GetMousePos();
    ImGui.GetBackgroundDrawList().AddRect(
        cursor - new Vector2(5, 5),
        cursor + new Vector2(5, 5),
        ImGui.GetColorU32(new Vector4(0f, 1f, 0f, 1f)),
        0f, ImDrawFlags.None, 1f);
});
cancellationToken.WaitHandle.WaitOne();
```

Пока скрипт работает, вокруг курсора рисуется зелёная рамка 10×10. `ImGui.GetMousePos()` возвращает точку в системе координат ImGui; здесь не подставляются нативные экранные координаты с неучтённым началом окна. Рисование выполняется только внутри обработчика кадра; нельзя блокировать его ожиданием отмены. При остановке сначала снимается подписка, затем освобождается экземпляр API. Он использует общее окно `Main`: не закрывайте его напрямую, оно может обслуживать другие скрипты. [Карта ImGui SDK](/ru/scripting/api/nuget/imgui-sdk) ведёт к контрактам и ограничениям времени жизни. Работа графики и конкретной версии пакета требует проверки в Windows.

## Отдельное окно через ClickableTransparentOverlay

Ниже сохранён самостоятельный вариант с закреплённым `ClickableTransparentOverlay, 10.2.0`. Это альтернативный скрипт: не запускайте оба блока вместе. Он создаёт собственное окно на основном мониторе; методы внешнего пакета и поведение DPI здесь не проверены запуском.

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
using System.Threading;
using PoeShared.Native;
using PoeShared.Scaffolding;
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

        // Используем ту же систему координат, что и draw list
        var cursorPosition = ImGui.GetMousePos();

        // Draw a green 10x10 rectangle centered on the cursor
        drawList.AddRect(
            cursorPosition - new System.Numerics.Vector2(5, 5),
            cursorPosition + new System.Numerics.Vector2(5, 5),
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
- `AddRect()` принимает точки в системе координат draw list ImGui.
- Цвет передаётся как `Vector4` (RGBA) и затем преобразуется через `ImGui.GetColorU32`.
- Базовый класс `Overlay` сам запускает frame loop и обрабатывает прозрачность окна.

---

## Что можно добавить дальше

- Подпись или tooltip рядом с курсором
- Разные фигуры в зависимости от состояния
- Обработку кликов или взаимодействия с overlay
- Отображение debug-данных или игровых визуальных элементов в реальном времени
