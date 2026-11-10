---
title: "Оставить ограниченный след своего курсора"
description: "Читайте позиции курсора в одном контексте ImGui, храните до 64 точек и освобождайте отрисовку по Stop."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Оставить ограниченный след своего курсора

Покажите короткий голубой след своего курсора со счётчиком до 64 позиций. Программа читает положение указателя, не перемещает его и не отправляет ввод.

Нужен настольный EyeAuras на Windows с хостом необязательного **EyeAuras.ImGuiSdk 0.1.47** и совместимыми нативными зависимостями; исходник SDK использует ClickableTransparentOverlay 11.5.28. Одна ссылка NuGet не устанавливает и не регистрирует нативную отрисовку. Начните в своём сеансе на основном мониторе с видимым renderer: [подготовка ImGui](/ru/scripting/imgui/getting-started).

1. Создайте редактируемую ауру через **Add new → New Aura**, назовите `RecipeTrail`, добавьте **C# Script** в **Actions → On Enter**. Для упражнения не используйте автоматическую активацию и другие действия ввода.
2. Полностью замените верхнеуровневый **Script.csx** файлом ниже. Дождитесь разрешения закреплённого пакета и нажмите ручную **Run** действия.
3. Перемещайте свой курсор в области renderer. Голубая линия соединяет последние позиции. Панель **Owned cursor trail** показывает `Stored positions: n/64`; после заполнения новые точки вытесняют старые.
4. Нажмите **Clear** в панели: накопленный след исчезнет, а следующие кадры начнут собирать его снова. **Stop** редактора уберёт эту отрисовку и сохранённые позиции. Новый Run начинает пустой след.

| Выбор | Результат |
| --- | --- |
| Размер очереди `64` | Хранятся максимум 64 позиции `Vector2`, а не неограниченная история мыши. |
| Интервал `16` мс | Минимальный интервал, проверяемый при отрисовке; это не гарантия 60 отсчётов в секунду. |
| `ImGui.GetMousePos()` и фоновый draw list | Позиции остаются в одной системе координат живого ImGui. Это не клиентские координаты другого окна. |

Не умножайте эти точки на предполагаемый DPI и не добавляйте смещение захваченного окна на рабочем столе. Для другого монитора или расположения сначала проверьте фактическую область renderer. За её пределами точки могут отсекаться; пример не задаёт универсальное преобразование нескольких мониторов.

Callback не владеет шрифтом или указателем нативного контекста. Очередь и рисование защищены одним коротким lock. При Stop этот же lock дожидается вошедшего callback, запрещает работу последующим вызовам и очищает очередь. Затем выход из блока снимает регистрацию и освобождает API-дескриптор. Общий overlay `Main` других владельцев не закрывается. [Контекст рисования курсора](/ru/scripting/examples/basic/imgui-cursor) поясняет различие координат.

## Script.csx

```csharp
#r "nuget: EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var gate = new object();
    var points = new Queue<Vector2>(64);
    var clock = Stopwatch.StartNew();
    long nextSampleMs = 0;
    var stopping = false;
    using var rendering = imgui.AddRenderer(_ =>
    {
        lock (gate)
        {
            if (stopping) return;
            if (clock.ElapsedMilliseconds >= nextSampleMs)
            {
                points.Enqueue(ImGui.GetMousePos());
                if (points.Count > 64) points.Dequeue();
                nextSampleMs = clock.ElapsedMilliseconds + 16;
            }
            var draw = ImGui.GetBackgroundDrawList();
            var color = ImGui.ColorConvertFloat4ToU32(new Vector4(0, 1, 1, 1));
            Vector2? previous = null;
            foreach (var point in points)
            {
                if (previous.HasValue) draw.AddLine(previous.Value, point, color, 1.5f);
                previous = point;
            }
            var visible = ImGui.Begin("Owned cursor trail");
            try
            {
                if (visible)
                {
                    ImGui.Text($"Stored positions: {points.Count}/64");
                    if (ImGui.Button("Clear")) points.Clear();
                }
            }
            finally { ImGui.End(); }
        }
    });
    try { await Task.Delay(Timeout.Infinite, cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        lock (gate)
        {
            stopping = true;
            points.Clear();
        }
    }
}
```
