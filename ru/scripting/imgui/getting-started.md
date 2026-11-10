---
title: ImGui — Начало работы
description: Краткое руководство по началу работы с ImGui
published: true
date: 2026-02-14T16:30:30.911Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-21T21:51:07.137Z
---
# Сделать панель управления на ImGui

Покажем отдельную панель с флажком, который меняет триггер вашей ауры. ImGui заново описывает интерфейс на каждом кадре: флажок читает текущее значение, а нажатие записывает новое. Отдельная подписка для обновления текста, как в [Blazor](/ru/scripting/blazor-windows/getting-started), здесь не нужна.

Нужен настольный Windows-хост EyeAuras, совместимый с **EyeAuras.ImGuiSdk 0.1.47** и его нативными зависимостями. Пакет из [источника EyeAuras](https://packages.eyeauras.net/v3/index.json) предназначен для .NET 8 Windows и зависит от **EyeAuras.ClickableTransparentOverlay 11.5.28**. Не загружайте рядом другую версию ImGui.NET/CTO в тот же процесс. Пакет предоставляет типы, а `ImGuiContainerExtensions` регистрирует сервис в контейнере скрипта — это два разных шага.

## Подготовить и запустить панель

1. Создайте свою ауру `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и свободной горячей клавишей. Оставьте её загруженной, без действий для первого опыта.
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

3. Дождитесь восстановления зависимости и компиляции, нажмите **Run**. В панели **My UI** измените **Is Active**: меняется `TriggerValue` у `TargetAura`. Переключите триггер горячей клавишей — следующий кадр прочитает новое значение.

![Переключатель в прежней демонстрации](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

4. Нажмите **Stop**. Ожидание завершится; сначала освобождается регистрация отрисовки, затем экземпляр API. Другие скрипты, использующие общее окно, этим не закрываются.

| Часть | Что она означает |
| --- | --- |
| `./TargetAura` | Соседняя аура в контексте скрипта. Поиск берёт первый подходящий триггер и выдаёт ошибку при отсутствии. |
| `TriggerValue` / `IsActive` | Флажок меняет значение триггера; подпись показывает его итоговое состояние. Остальные условия ауры не отменяются. `null` во флажке показан как выключенное. |
| `AddNewExtension` → `GetService` | Сначала регистрация SDK, затем создание API. Одного `#r` для этого недостаточно. |
| `AddRenderer` | Возвращает регистрацию `IDisposable` для функции, вызываемой каждый кадр на потоке отрисовки. |
| `Begin` / `End` | Открывают и завершают описание окна в текущем кадре; `End` нужен и при свёрнутом содержимом. |
| `##target-control` | Стабильная скрытая часть идентификатора окна. Не меняйте её случайным числом каждый кадр. |

Инициализацию нативного окна и контекста выполняет SDK перед вызовами отрисовки. Не вызывайте `ImGui.GetIO`, `Begin` или рисование до получения такого контекста и не создавайте второй контекст вручную. Это нативный ImGui-интерфейс; ему не нужны Razor, HTML или WebView2. [OSD на Blazor](/ru/scripting/examples/basic/osd-cursor) — другой механизм.

Экземпляры API используют общее окно **Main**, его настройки и атлас шрифтов. Не закрывайте это окно напрямую. `GetService`, `AuraTree` и `cancellationToken` — возможности `Script.csx`; обычный класс получает нужные зависимости и токен явно. Долгую работу и ожидания выполняйте вне функции кадра.

Для собственного начертания или кириллицы на панели перейдите к [загрузке TTF-ресурса как основного шрифта](/ru/scripting/imgui/loading-font). Если Main используют другие обработчики, выбирайте [локальное применение шрифта](/ru/scripting/imgui/loading-font-static) только для своего рисования; в обоих случаях сам TTF должен содержать нужные глифы.

<details>
<summary>Сначала посмотреть готовые элементы ImGui</summary>

Вместо основной программы можно запустить этот самостоятельный вариант. Он показывает стандартное демонстрационное окно до Stop:

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

Это альтернативная полная программа. Создание и адресный запрос закрытия выполняются в кадре; менеджер сам вызывает `CounterPanel.ToImGui` и владеет `Begin/End`. У обычного класса есть своё поле счётчика, без глобальных сервисов скрипта.

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

Закрытие первого окна оставляет второе. После закрытия обоих скрипт заканчивается; Stop запрашивает закрытие оставшихся и ждёт освобождения, пока API удерживает отрисовку. Ожидание требует работающего нативного цикла кадров. Контент с `IDisposable` менеджер также освобождает. Не заменяйте адресное закрытие на `CloseAll`, затрагивающий чужие окна.

</details>

<details>
<summary>Асинхронная работа по кнопке без остановки кадров</summary>

Ещё одна альтернативная программа: кнопка запускает десять шагов по 200 мс. Повторное нажатие во время работы не запускает вторую задачу. Задержки здесь изображают вашу работу; ImGui остаётся на потоке отрисовки.

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

При Stop сначала запрещается новый запуск, снимается отрисовка, затем отменяется и ожидается задача. Только после этого освобождается источник токена. Рабочая задача не освобождает его сама. `gate`, `Interlocked` и `Volatile` согласуют состояние между потоками; ожидания нет внутри кадра.

</details>

ImGui также рисует линии, фигуры, подписи и проекции подготовленных координат. [Список проектов Dear ImGui](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) и историческое [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg) показывают варианты интерфейсов, а не встроенный доступ к данным игры. Контракты и границы общего состояния — в [операциях IImGuiExperimentalApi](/ru/scripting/api/IImGuiExperimentalApi) и [карте SDK](/ru/scripting/api/nuget/imgui-sdk). В 0.1.42 есть базовая отрисовка, но нет используемого здесь менеджера окон; для всех программ этой страницы выбрана 0.1.47.
