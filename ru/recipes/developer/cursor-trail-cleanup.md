---
title: "Оставить ограниченный след своего курсора"
description: "Скрипт читает позиции курсора в одном контексте ImGui, хранит до 64 точек и убирает отрисовку по Stop."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Оставить ограниченный след своего курсора

Скрипт рисует за вашим курсором короткий голубой след и показывает счётчик — до 64 позиций. Он только читает положение указателя: не двигает его и не отправляет ввод.

Нужен настольный EyeAuras на Windows с хостом необязательного **EyeAuras.ImGuiSdk 0.1.47** и совместимыми нативными зависимостями. Исходник SDK использует ClickableTransparentOverlay 11.5.28. Одной ссылки NuGet мало: она не устанавливает и не регистрирует нативную отрисовку. Начните в своём сеансе на основном мониторе с видимым renderer — см. [подготовку ImGui](/ru/scripting/imgui/getting-started).

1. Создайте редактируемую ауру через **Add new → New Aura**, назовите её `RecipeTrail` и добавьте **C# Script** в **Actions → On Enter**. Автоматическую активацию и другие действия ввода для этого примера не используйте.
2. Полностью замените верхнеуровневый **Script.csx** файлом ниже. Дождитесь, пока разрешится закреплённый пакет, и вручную нажмите **Run** у действия.
3. Подвигайте курсором в области renderer. Голубая линия соединяет последние позиции. Панель **Owned cursor trail** показывает `Stored positions: n/64`. Когда очередь заполнится, новые точки начнут вытеснять старые.
4. Нажмите **Clear** в панели: след исчезнет и со следующих кадров начнёт собираться заново. **Stop** в редакторе убирает отрисовку и сохранённые позиции. Новый Run начинает с пустого следа.

| Выбор | Результат |
| --- | --- |
| Размер очереди `64` | Хранится не больше 64 позиций `Vector2`, а не вся история мыши. |
| Интервал `16` мс | Минимальный интервал между отсчётами, он проверяется при отрисовке. Это не гарантия 60 отсчётов в секунду. |
| `ImGui.GetMousePos()` и фоновый draw list | Позиции остаются в одной системе координат живого ImGui. Это не клиентские координаты другого окна. |

Не умножайте эти точки на предполагаемый DPI и не прибавляйте смещение захваченного окна на рабочем столе. На другом мониторе или при другом расположении сначала проверьте, где на самом деле находится область renderer. За её пределами точки могут обрезаться. Общего преобразования для нескольких мониторов в примере нет.

Callback не владеет ни шрифтом, ни указателем нативного контекста. Очередь и рисование защищены одним коротким lock. При Stop тот же lock дожидается callback, который уже начал работу, запрещает следующие вызовы и очищает очередь. Затем при выходе из блока снимается регистрация и освобождается API-дескриптор. Общий overlay `Main`, которым пользуются другие, не закрывается. Чем различаются координаты, объясняет [контекст рисования курсора](/ru/scripting/examples/basic/imgui-cursor).

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
