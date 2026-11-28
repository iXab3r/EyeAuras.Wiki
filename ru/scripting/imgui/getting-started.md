---
title: ImGui — Начало работы
description: Как показать свою панель на ImGui из C#-скрипта
published: true
date: 2026-02-14T16:30:30.911Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-21T21:51:07.137Z
---
# Сделать панель управления на ImGui

Здесь мы сделаем отдельную панель с флажком, который переключает триггер вашей ауры. ImGui рисует интерфейс заново на каждом кадре: флажок читает текущее значение, а нажатие записывает новое. Поэтому подписываться на изменения, чтобы обновить текст, как в [Blazor](/ru/scripting/blazor-windows/getting-started), не нужно.

Нужен настольный EyeAuras для Windows, совместимый с **EyeAuras.ImGuiSdk 0.1.47** и его нативными зависимостями. Пакет лежит в [источнике EyeAuras](https://packages.eyeauras.net/v3/index.json), рассчитан на .NET 8 Windows и зависит от **EyeAuras.ClickableTransparentOverlay 11.5.28**. Не загружайте в тот же процесс другую версию ImGui.NET/CTO.

## Подготовить и запустить панель

1. Создайте ауру `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и свободной горячей клавишей. Оставьте её загруженной. Действия для первого раза не нужны.
2. В той же папке создайте вторую ауру с действием **C# Script**. Вставьте весь код в её верхнеуровневый `Script.csx`:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;
using ImGuiNET;
using System.Numerics;

{
    var trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    using var rendering = imgui.AddRenderer(_ =>
    {
        var visible = ImGui.Begin("My UI##target-control");
        try
        {
            if (!visible) return;
            var value = trigger.TriggerValue ?? false;
            if (ImGui.Checkbox("Is Active", ref value)) trigger.TriggerValue = value;
            ImGui.SameLine();
            ImGui.TextDisabled("Hotkey Is Active");
            ImGui.Separator();
            ImGui.TextColored(trigger.IsActive == true
                ? new Vector4(0, 1, 0, 1) : new Vector4(1, 0, 0, 1),
                trigger.IsActive == true ? "ACTIVE" : "INACTIVE");
        }
        finally { ImGui.End(); }
    });
    cancellationToken.WaitHandle.WaitOne();
}
```

3. Дождитесь, пока зависимость восстановится и скрипт скомпилируется, затем нажмите **Run**. В панели **My UI** переключите **Is Active** — у `TargetAura` поменяется `TriggerValue`. Переключите триггер горячей клавишей — следующий кадр прочитает новое значение.

![Панель с флажком в старой демонстрации](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

4. Нажмите **Stop**. Ожидание завершится. Сначала освободится регистрация отрисовки, потом экземпляр API. Другие скрипты, которые используют общее окно, от этого не закрываются.

| Часть | Что она означает |
| --- | --- |
| `./TargetAura` | Соседняя аура относительно скрипта. Берётся первый подходящий триггер. Если его нет, будет ошибка. |
| `TriggerValue` / `IsActive` | Флажок меняет значение триггера, а подпись показывает итоговое состояние. Остальные условия ауры продолжают действовать. `null` флажок показывает как «выключено». |
| `AddNewExtension` → `GetService` | Сначала регистрируем SDK, потом создаём API. Одного `#r` для этого мало. |
| `AddRenderer` | Принимает функцию, которая вызывается каждый кадр на потоке отрисовки. Возвращает регистрацию `IDisposable`. |
| `Begin` / `End` | Открывают и закрывают описание окна в текущем кадре. `End` нужен, даже когда содержимое свёрнуто. |
| `##target-control` | Скрытая постоянная часть идентификатора окна. Не подставляйте в неё случайное число на каждом кадре. |

SDK сам создаёт нативное окно и контекст перед вызовами отрисовки. Пока контекста нет, не вызывайте `ImGui.GetIO`, `Begin` и рисование. Второй контекст вручную не создавайте. Это нативный ImGui: Razor, HTML и WebView2 ему не нужны. [OSD на Blazor](/ru/scripting/examples/basic/osd-cursor) устроен по-другому.

Все экземпляры API делят одно окно **Main**, его настройки и атлас шрифтов. Не закрывайте это окно напрямую. `GetService`, `AuraTree` и `cancellationToken` — это возможности `Script.csx`. Обычному классу зависимости и токен нужно передать явно. Долгую работу и ожидания держите вне функции кадра.

Нужен свой шрифт или кириллица на панели? Смотрите, [как сделать TTF из ресурсов основным шрифтом](/ru/scripting/imgui/loading-font). Если окно Main используют и другие обработчики, [применяйте шрифт только к своему рисованию](/ru/scripting/imgui/loading-font-static).

<details>
<summary>Сначала посмотреть готовые элементы ImGui</summary>

Этот вариант запускается сам по себе, вместо основной программы. Он показывает стандартное демонстрационное окно, пока вы не нажмёте Stop:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    using var rendering = imgui.AddRenderer(_ => ImGui.ShowDemoWindow());
    cancellationToken.WaitHandle.WaitOne();
}
```

![Стандартное демонстрационное окно](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

</details>

<details>
<summary>Два окна с независимыми счётчиками</summary>

Ещё одна полная программа на замену основной. Окна создаются в кадре, и там же запрашивается их адресное закрытие. Менеджер сам вызывает `CounterPanel.ToImGui` и сам делает `Begin/End`. Счётчик хранится в поле обычного класса, глобальные сервисы скрипта ему не нужны.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Reactive.Disposables;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    ImGuiWindowHost first = null, second = null;
    var closed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    var remaining = 2;
    var closing = 0;
    using var rendering = imgui.AddRenderer(_ =>
    {
        if (first == null)
        {
            first = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "First");
            second = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "Second");
            void OnClosed()
            {
                if (Interlocked.Decrement(ref remaining) == 0) closed.TrySetResult(true);
            }
            first.Anchors.Add(Disposable.Create(OnClosed));
            second.Anchors.Add(Disposable.Create(OnClosed));
        }
        if (Volatile.Read(ref closing) != 0)
        {
            ImGuiWindowManager.Close(first);
            ImGuiWindowManager.Close(second);
        }
    });
    try { await closed.Task.WaitAsync(cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        Interlocked.Exchange(ref closing, 1);
        await closed.Task;
    }
}

public sealed class CounterPanel : ICanBeDisplayedInImGui
{
    private int count;
    public void ToImGui()
    {
        if (ImGui.Button("Add")) count++;
        ImGui.TextUnformatted($"Value: {count}");
    }
}
```

Если закрыть первое окно, второе останется. Когда закрыты оба, скрипт завершается. Stop просит закрыть оставшиеся окна и ждёт, пока они освободятся. API в это время удерживает отрисовку. Для ожидания нужен работающий нативный цикл кадров. Содержимое с `IDisposable` менеджер тоже освобождает. Не заменяйте адресное закрытие на `CloseAll`: он затрагивает и чужие окна.

</details>

<details>
<summary>Асинхронная работа по кнопке без остановки кадров</summary>

Ещё одна программа на замену основной. Кнопка запускает десять шагов по 200 мс. Если нажать её ещё раз во время работы, вторая задача не запустится. Задержки здесь стоят вместо вашей работы, а ImGui остаётся на потоке отрисовки.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var runToken = cancellationToken;
    using var stop = CancellationTokenSource.CreateLinkedTokenSource(runToken);
    var workToken = stop.Token;
    var gate = new object();
    var worker = Task.CompletedTask;
    var stopping = false;
    var progress = 0;
    var rendering = imgui.AddRenderer(_ =>
    {
        var visible = ImGui.Begin("Work");
        try
        {
            if (!visible) return;
            var clicked = ImGui.Button("Start");
            lock (gate)
            {
                if (clicked && !stopping && worker.IsCompleted)
                {
                    Interlocked.Exchange(ref progress, 0);
                    worker = Task.Run(async () =>
                    {
                        try
                        {
                            for (var step = 1; step <= 10; step++)
                            {
                                await Task.Delay(200, workToken);
                                Interlocked.Exchange(ref progress, step);
                            }
                        }
                        catch (OperationCanceledException) when (workToken.IsCancellationRequested) { }
                        catch (Exception error) { Log.Error("Операция не завершена", error); }
                    });
                }
            }
            ImGui.TextUnformatted($"Done: {Volatile.Read(ref progress)}/10");
        }
        finally { ImGui.End(); }
    });
    try
    {
        await Task.Delay(Timeout.Infinite, runToken);
    }
    catch (OperationCanceledException) when (runToken.IsCancellationRequested) { }
    finally
    {
        Task active;
        lock (gate) { stopping = true; active = worker; }
        rendering.Dispose();
        stop.Cancel();
        await active;
    }
}
```

При Stop порядок такой: запрещается новый запуск, снимается отрисовка, задача отменяется, и программа ждёт её завершения. Только после этого освобождается источник токена — сама рабочая задача его не освобождает. `gate`, `Interlocked` и `Volatile` согласуют состояние между потоками.

</details>

ImGui умеет рисовать ещё и линии, фигуры, подписи и проекции подготовленных координат. [Список проектов Dear ImGui](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) и старое [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg) показывают, какими бывают интерфейсы. Контракты и границы общего состояния описаны в [операциях IImGuiExperimentalApi](/ru/scripting/api/IImGuiExperimentalApi) и [карте SDK](/ru/scripting/api/nuget/imgui-sdk). В 0.1.42 базовая отрисовка есть, но менеджера окон, который здесь используется, нет. Поэтому все программы на этой странице написаны под 0.1.47.
