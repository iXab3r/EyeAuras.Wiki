---
title: ImGui — Начало работы
description: Краткое руководство по началу работы с ImGui
published: true
date: 2026-02-14T16:30:30.911Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-21T21:51:07.137Z
---
# ImGui в контексте EyeAuras

**ImGui** — это на удивление мощная, но при этом простая и интуитивная библиотека для отрисовки *разных вещей*. Изначально автор создавал её для разработки UI в играх, но со временем область применения стала гораздо шире — [список проектов, которые используют её](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui), действительно впечатляет.

Но здесь мы говорим про **автоматизацию**, верно? Тогда чем ImGui полезен нам?

Ответ простой: ImGui — это **самый простой и интуитивный** способ собрать собственный UI. Освоить его даже проще, чем [Blazor Windows](/ru/scripting/blazor-windows/getting-started).

---

## Установка

EyeAuras постепенно переходит на модульную систему на базе NuGet, чтобы пользователь мог подключать **только те возможности, которые ему действительно нужны**. Текущая функциональность стала слишком большой: захват изображений, анализ, эффекты, деревья поведения, эмуляция ввода, чтение памяти, обработка аудио, Blazor UI… и почти ни одно mini-app не использует даже половину этого набора.

Поэтому разные возможности выносятся в отдельные NuGet-пакеты, которые можно установить так же, как любые другие.

Ниже — C# Script работающего desktop EyeAuras. Ссылка на `0.1.42` сохранена
из исходного примера; перед запуском проверьте совместимость установленного
пакета с API своей версии. Описание контрактов сверено с исходниками
EyeAuras `20fd3d4`, что само по себе не подтверждает любую опубликованную
версию NuGet. Для обычного C# класса нужны явно переданные зависимости:
`GetService`, `AddNewExtension` и токен запуска предоставляет хост скрипта.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
 
using EyeAuras.ImGuiSdk; // required for registration methods
using ImGuiNET;          // access to ImGui APIs
using System.Numerics;   // for Vector2/Vector3 use with ImGui

{
    AddNewExtension<ImGuiContainerExtensions>(); // registers IImGuiExperimentalApi and others

    using var osd = GetService<IImGuiExperimentalApi>();
}
```

---

## Hello, World

Чтобы начать работать с ImGui, нужно сделать всего 3 вещи:

* Подключить namespace `ImGuiNET`
* Получить `IImGuiExperimentalApi` через `GetService`
* Вызвать `AddRenderer()` и передать в него ваш метод отрисовки

На этом всё. EyeAuras сам создаст overlay и запустит render loop. Вам остаётся только поместить свою логику в метод, который передаётся в `AddRenderer`.

>  Примечание: ваш метод будет вызываться **на каждом кадре**, поэтому избегайте `sleep` и любого долгого блокирующего кода.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
 
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;

{
    AddNewExtension<ImGuiContainerExtensions>();

    using var osd = GetService<IImGuiExperimentalApi>();

    using var rendering = osd.AddRenderer(() =>
    {
        ImGui.ShowDemoWindow();
    });

    cancellationToken.WaitHandle.WaitOne(); // keep running until script is stopped
}
```

![ImGui Demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

---

## Создаём переключатель

Теперь сделаем что-то своё. Demo window полезно для тестов, но в реальной работе от него мало пользы.

Как и в [Blazor Windows](/ru/scripting/blazor-windows/getting-started), давайте [создадим toggle](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

### Что для этого нужно

* Создать overlay через `IImGuiExperimentalApi`
* Передать метод отрисовки в `AddRenderer`
* Внутри render-метода нарисовать checkbox и текст

И это всё. Никакого отдельного управления состоянием, никаких `sleep`, никакой ручной обработки кликов — всё работает в immediate mode. Поначалу синтаксис может показаться непривычным, но ChatGPT **очень хорошо** знает ImGui, так что смело задавайте вопросы.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"

using EyeAuras.ImGuiSdk;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;
using ImGuiNET;
using System.Numerics;

// Создайте рядом ауру TargetAura с триггером HotkeyIsActive.

{
    var trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");

    AddNewExtension<ImGuiContainerExtensions>();

    using var osd = GetService<IImGuiExperimentalApi>();

    using var rendering = osd.AddRenderer(() =>
    {
        var visible = ImGui.Begin("My UI");
        try
        {
            if (!visible) return;
            ImGui.Text("Control window flags and interaction behavior.");

            var isActive = trigger.TriggerValue ?? false;
            if (ImGui.Checkbox("Is Active", ref isActive))
            {
                trigger.TriggerValue = isActive;
            }
            ImGui.SameLine();
            ImGui.TextDisabled("(Gets/Sets whether Trigger is active or not)");

            ImGui.Separator();
            if (trigger.IsActive == true)
            {
                ImGui.TextColored(new Vector4(0f, 1f, 0f, 1f), "Trigger is currently ACTIVE");
            }
            else
            {
                ImGui.TextColored(new Vector4(1f, 0f, 0f, 1f), "Trigger is currently INACTIVE");
            }
        }
        finally
        {
            ImGui.End();
        }
    });

    cancellationToken.WaitHandle.WaitOne();
}
```

![Toggle](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

---

## Что ещё можно делать с ImGui?

Помимо интерактивных окон, ImGui можно использовать и для **OSD (On-Screen Display)** — отрисовки overlay прямо поверх экрана. Причём можно рисовать как **2D**, так и **3D** объекты.

Вот пример — всё, что вы видите, включая UI и экранные overlay, отрисовано с помощью ImGui:

 [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg)

---

В примерах появится демонстрационное окно либо переключатель `TargetAura`.
После остановки `using` сначала снимает подписку `AddRenderer`, затем
освобождает API. Подписка не привязывается к API автоматически. Экземпляры
используют общее окно `Main`, поэтому освобождение вашей доли не означает
закрытия окна других скриптов. Параметры частоты кадров, общий overlay,
шрифты и время жизни разобраны в
[операциях IImGuiExperimentalApi](/ru/scripting/api/IImGuiExperimentalApi).


## Два окна с отдельным состоянием

Для всех примеров этой страницы выбрана `0.1.47`: метаданные опубликованной сборки подтверждают `ImGuiWindowManager` и `ImGuiWindowHost`. В `0.1.42` этих типов нет, хотя базовый `AddRenderer` в ней уже есть. Пакет `0.1.47` зависит от `EyeAuras.ClickableTransparentOverlay 11.5.28`; используйте совместимую сборку приложения.

После подключения пакета из начала страницы выполните этот вариант
`Script.csx`. Оба окна имеют свой счётчик и свой крестик. Содержимое находится
в обычном классе `CounterPanel`; его можно вынести в `.cs` файл проекта.

```csharp
using System;
using System.Reactive.Disposables;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var first = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "Первый");
    var second = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "Второй");
    var firstClosed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    var secondClosed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    first.Anchors.Add(Disposable.Create(() => firstClosed.TrySetResult(true)));
    second.Anchors.Add(Disposable.Create(() => secondClosed.TrySetResult(true)));
    try
    {
        await Task.WhenAll(firstClosed.Task, secondClosed.Task).WaitAsync(cancellationToken);
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
    finally
    {
        ImGuiWindowManager.Close(first);
        ImGuiWindowManager.Close(second);
        // API ещё жив: менеджер должен обработать закрытие на кадре.
        await Task.WhenAll(firstClosed.Task, secondClosed.Task);
    }
}

public sealed class CounterPanel : ICanBeDisplayedInImGui
{
    private int count;
    public void ToImGui()
    {
        if (ImGui.Button("Добавить")) count++;
        ImGui.TextUnformatted($"Значение: {count}");
    }
}
```

Менеджер сам рисует окна каждый кадр; отдельный `AddRenderer` для них не
нужен. `CounterPanel` не вызывает `Begin/End`: ими владеет `ImGuiWindowHost`.
Закрытие одного окна не закрывает второе. Когда закрыты оба, скрипт завершится;
Stop запрашивает закрытие оставшихся и ждёт освобождения hosts, пока API ещё
удерживает общий overlay. Это требует работающего render-loop, а не гарантирует
завершение при отказе нативного renderer. У контента с `IDisposable` менеджер
тоже вызывает `Dispose`. Не заменяйте адресное закрытие на `CloseAll()`.

## Выполнить работу по кнопке, не останавливая отрисовку

Ниже — другой вариант `Script.csx` с той же подготовкой пакета. Кнопка
запускает одну последовательность; повторные нажатия во время её работы
игнорируются. Здесь задержки изображают асинхронную работу. Реальное тяжёлое
вычисление также выполняйте вне render callback.

```csharp
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
        var visible = ImGui.Begin("Работа");
        try
        {
            if (!visible) return;
            var clicked = ImGui.Button("Начать");
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
            ImGui.TextUnformatted($"Готово: {Volatile.Read(ref progress)}/10");
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

Состояние задачи и запрет нового старта защищены `gate`, прогресс передаётся
через `Interlocked`/`Volatile`. Внутри callback нет ожидания worker. При Stop
сначала запрещается новый старт, снимается отрисовка, затем отменяется и
ожидается работа. Только после этого `using` освобождает источник токена.
Worker **не** освобождает `stop`: иначе следующий `Cancel()` владельца мог бы
обратиться к уже освобождённому объекту. Методы ImGui вызываются только в
render callback; API скриптового хоста в обычном `.cs`-классе нужно передавать явно.
