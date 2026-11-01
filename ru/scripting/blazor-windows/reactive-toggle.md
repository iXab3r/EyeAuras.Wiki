---
title: 5. Механизм обновления
description: Как работает механизм обновления в EyeAuras
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:35:20.794Z
---
# Управление аурой через UI

Предыдущий вариант кода работает, но у него есть недостаток. При нажатии на кнопку триггер и аура переключаются как нужно. Но если активировать триггер **горячей клавишей**, интерфейс не перерисуется автоматически, потому что UI не знает, что состояние изменилось. Значит, нужно явно сообщить ему об обновлении.

Для простоты решим это в лоб: интерфейс будет обновляться **раз в секунду**. Это не самый оптимальный вариант, но для очень простого UI его вполне достаточно.

В одной папке создайте ауру с **C# Overlay v3** и ауру `TargetAura`. В каждую целевую ауру добавьте `HotkeyIsActive` и настройте горячую клавишу в режиме переключения. Оставьте целевые ауры загруженными. Путь `./TargetAura` в примере ищется относительно контекста оверлея; при другой структуре дерева замените их. Если подходящих триггеров несколько, выбирается первый.

Замените содержимое `UserOverlay.cs` и `UserOverlay.razor` в этом оверлее кодом ниже. Это две части одного `public partial` класса в одном пространстве имён. `AuraTree` получает компонент через `[Inject]`; глобальные переменные из `Script.csx` в него автоматически не передаются.

## UserOverlay.cs
```csharp
using System;
using System.Reactive.Linq;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public IHotkeyIsActiveTrigger Trigger
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
    }

    public bool TriggerIsActive
    {
        get => Trigger.TriggerValue ?? false;
        set => Trigger.TriggerValue = value;
    }

    protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
}
```

## UserOverlay.razor
```html
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">Toggle Trigger</h3>

<div class="text-center mt-4">
    <ToggleButton @bind-IsChecked="@TriggerIsActive"
    Class="btn btn-secondary">
                Trigger is Active
    </ToggleButton>
</div>

<p class="text-center mt-3 alert alert-info" style="font-size: 1.5rem;">
    @if (TriggerIsActive){
        <span class="shadow-1">Trigger is currently active</span>
    } else {
        <span class="text-warning shadow-1">Trigger is currently not active</span>
    }
</p>
```

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_W7LNmgAsPK.gif)

---

## Как это работает

## UserOverlay.cs
```csharp
 protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
```

В EyeAuras есть механизм, который управляет рендерингом интерфейса. Один из самых простых способов использовать его — добавить событие в `ChangeTrackers` внутри `OnInitialized`. Здесь это обычный таймер: каждый его тик принудительно вызывает перерисовку интерфейса. Он не проверяет, изменилось ли что-то на самом деле, а просто говорит: «перерисуй UI».

Позже мы рассмотрим более оптимальный вариант через `ReactiveSection` и более точное отслеживание изменений. Но во многих случаях этого подхода вполне достаточно — `Blazor` работает быстро, и «пустая» перерисовка простого интерфейса не является проблемой.
Нажатие кнопки записывает `TriggerValue`; горячая клавиша меняет тот же триггер. Таймер в `ChangeTrackers` заставляет компонент перечитывать состояние примерно раз в секунду, поэтому внешнее изменение видно с задержкой. Добавляйте таймер до `base.OnInitialized()`: там список отслеживания запечатывается и подписки привязываются к `Anchors` компонента. Скрытие окна само по себе не равно уничтожению компонента.
