---
title: ImGui — отрисовка курсора
description: Отрисовка курсора с помощью ImGui.
published: true
date: 2025-06-13T21:46:14.167Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T17:49:10.631Z
---
# Нарисовать рамку курсора в ImGui

Скрипт рисует зелёную рамку 10×10 вокруг положения мыши. Точку он берёт из ImGui и рисует в его фоновом слое. Реальную мышь он не двигает и кликов не отправляет.

1. Нужен настольный EyeAuras с совместимым **EyeAuras.ImGuiSdk 0.1.47**. Создайте в своей ауре **C# Script**. Не запускайте одновременно старую самостоятельную CTO-библиотеку из примера в конце страницы.
2. Вставьте весь код в верхнеуровневый `Script.csx`:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var previousNoActivate = imgui.NoActivate;
    try
    {
        imgui.NoActivate = true;
        using var rendering = imgui.AddRenderer(_ =>
        {
            if (cancellationToken.IsCancellationRequested) return;
            var cursor = ImGui.GetMousePos();
            ImGui.GetBackgroundDrawList().AddRect(
                cursor - new Vector2(5, 5), cursor + new Vector2(5, 5),
                ImGui.GetColorU32(new Vector4(0, 1, 0, 1)),
                0f, ImDrawFlags.None, 1f);
        });
        cancellationToken.WaitHandle.WaitOne();
    }
    finally { imgui.NoActivate = previousNoActivate; }
}
```

3. Когда код скомпилируется, нажмите **Run** и подвигайте мышью как обычно. Рамка должна идти за точкой, которую получает ImGui.
4. Нажмите **Stop**: отрисовка снимется, прежнее `NoActivate` вернётся, экземпляр API освободится.

| Настройка | Смысл |
| --- | --- |
| `ImGui.GetMousePos()` | Положение мыши в координатах ImGui, совместимых с его draw list. В клиентские координаты другого окна оно само не пересчитывается. |
| `cursor ± Vector2(5, 5)` | Углы рамки 10×10 вокруг центра. |
| `Vector4(0, 1, 0, 1)` | Непрозрачный зелёный в RGBA, преобразованный через `GetColorU32`. |
| Последний `1f` | Толщина границы. `0f` перед флагами — без скругления. |
| `NoActivate = true` | Просит не активировать общее окно при взаимодействии. Это настройка общего окна Main, поэтому прежнее значение возвращается. Пробуйте пример без других скриптов, которые её меняют. |

Рамка описывается заново в каждом кадре: отдельный объект OSD или подписка на каждую точку не создаются. Нельзя вызывать ImGui вне потока кадра и нельзя блокировать этот поток ожиданием Stop. Общее окно **Main** может обслуживать и другие скрипты. Когда вы освобождаете свою долю, они не закрываются. Проблемы с мониторами, началом координат и DPI не исправляйте, прибавляя экранное смещение наугад. Какой механизм выбрать, подскажут [карта SDK](/ru/scripting/api/nuget/imgui-sdk) и [пример OSD](/ru/scripting/examples/basic/osd-cursor).

<details>
<summary>Исторический самостоятельный вариант CTO 10.2.0</summary>

Этот вариант создаёт собственное окно на основном мониторе. Он оставлен для чтения старых скриптов, а не для запуска в одном процессе с SDK выше: разные версии нативного ImGui и независимые контексты не взаимозаменяемы.

```csharp
#r "nuget: ClickableTransparentOverlay, 10.2.0"

using System;
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

В [исходниках CTO 10.2.0](https://github.com/zaafar/ClickableTransparentOverlay/blob/6a343a2af63b7af0cfa9ab41e9b7cc95b88452b9/ClickableTransparentOverlay/Overlay.cs) `Run` сам вызывает `Start`, а потом ждёт закрытия. Отдельного вызова `Init` в этом пути нет. Конструктор с размерами использует `DPIAware = false`. Токен передан нашему подклассу и проверяется в `Render`. Инициализацию библиотеки он не отменяет, а если цикл кадров остановился, проверка не выполнится. [Dear ImGui](https://github.com/ocornut/imgui) — библиотека интерфейса, а ClickableTransparentOverlay создаёт вокруг неё нативное прозрачное окно. Старому варианту нужен собственный совместимый хост, а не загрузка второй версии рядом с текущей.

</details>
