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

Покажем зелёную рамку 10×10 вокруг положения мыши. Скрипт читает точку из ImGui и рисует в его фоновом слое; реальную мышь он не перемещает и кликов не отправляет.

1. Нужен настольный EyeAuras с совместимым **EyeAuras.ImGuiSdk 0.1.47**. В своей ауре создайте **C# Script**. Не запускайте одновременно самостоятельную старую CTO-библиотеку из примера в конце страницы.
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

3. После компиляции нажмите **Run** и перемещайте мышь обычным способом. Рамка должна следовать за точкой, которую получает ImGui.
4. Нажмите **Stop**: отрисовка снимается, прежнее `NoActivate` восстанавливается, экземпляр API освобождается.

| Настройка | Смысл |
| --- | --- |
| `ImGui.GetMousePos()` | Положение мыши в системе ImGui, совместимой с его draw list. Это не автоматически пересчитанная координата клиентской области другого окна. |
| `cursor ± Vector2(5, 5)` | Углы рамки 10×10 вокруг центра. |
| `Vector4(0, 1, 0, 1)` | Непрозрачный зелёный RGBA, преобразованный через `GetColorU32`. |
| Последний `1f` | Толщина границы; `0f` перед флагами — отсутствие скругления. |
| `NoActivate = true` | Запрос не активировать общее окно при взаимодействии. Это настройка общего Main, поэтому прежнее значение восстанавливается; опыт делайте без других скриптов, меняющих её. |

Новый кадр заново описывает рамку: отдельный объект OSD или подписка на каждую точку не создаётся. Нельзя вызывать ImGui вне потока кадра или блокировать его ожиданием Stop. Общее окно **Main** может обслуживать другие скрипты; освобождение вашей доли не означает их закрытие. Мониторы, начало координат и DPI не следует исправлять произвольным добавлением экранного смещения; для выбора механизма см. [карту SDK](/ru/scripting/api/nuget/imgui-sdk) и [пример OSD](/ru/scripting/examples/basic/osd-cursor).

<details>
<summary>Исторический самостоятельный вариант CTO 10.2.0</summary>

Этот альтернативный проект создаёт собственное окно на основном мониторе. Он сохранён для чтения старых скриптов, а не для совместного запуска в процессе с SDK выше: разные версии нативного ImGui и независимые контексты нельзя считать взаимозаменяемыми.

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

В [исходниках CTO 10.2.0](https://github.com/zaafar/ClickableTransparentOverlay/blob/6a343a2af63b7af0cfa9ab41e9b7cc95b88452b9/ClickableTransparentOverlay/Overlay.cs) `Run` сам вызывает `Start` до ожидания закрытия; отдельного вызова `Init` в этом пути нет. Конструктор с размерами использует `DPIAware = false`. Токен передан нашему подклассу и проверяется в `Render`; он не отменяет инициализацию библиотеки, а при остановившемся цикле кадров проверка не выполнится. [Dear ImGui](https://github.com/ocornut/imgui) — библиотека интерфейса; ClickableTransparentOverlay создаёт нативное прозрачное окно вокруг неё. Этот старый вариант требует собственного совместимого хоста, а не загрузки второй версии рядом с текущей.

</details>
