---
title: 7. Настройка переключателей
description: Как настроить переключатели.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T15:23:20.489Z
---
# Добавляем разнообразие

Одно из главных преимуществ Blazor/HTML/CSS — огромная гибкость: реализовать можно почти любую идею, и обычно это не слишком сложно, особенно по сравнению со многими другими UI-фреймворками.

Давайте немного доработаем нашу группу переключателей и добавим ей цвета.

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_BY6C30fWpS.gif)

В одной папке создайте ауру с **C# Overlay v3** и ауры `TargetAura 1`, `TargetAura 2`, `TargetAura 3`, `TargetAura 4`. В каждую целевую ауру добавьте `HotkeyIsActive` и настройте горячую клавишу в режиме переключения. Оставьте целевые ауры загруженными. Пути `./TargetAura 1` и остальные в примере ищутся относительно контекста оверлея; при другой структуре дерева замените их. Если подходящих триггеров несколько, выбирается первый.

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

    public bool Trigger1IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue = value;
    }

    public bool Trigger2IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2").TriggerValue = value;
    }

    public bool Trigger3IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3").TriggerValue = value;
    }

    public bool Trigger4IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 4").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 4").TriggerValue = value;
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

<h3 class="text-center shadow-1">Custom Toggles</h3>

<div class="text-center mt-4 mx-2 d-flex gap-1 flex-column alert alert-info">
    @if (Trigger1IsActive){
         <ToggleButton @bind-IsChecked="@Trigger1IsActive"
            Class="btn btn-success">
            Trigger <b>1</b> is active
        </ToggleButton>
    } else {
         <ToggleButton @bind-IsChecked="@Trigger1IsActive"
            Class="btn btn-outline-danger">
            Trigger <b>1</b> is inactive
        </ToggleButton>
    }
    <ToggleButton @bind-IsChecked="@Trigger2IsActive">
        @if (Trigger2IsActive){
            <i class="fa-solid fa-toggle-on"></i>
            <strong>Trigger 2 is active</strong>
        } else {
            <i class="fa-solid fa-toggle-off"></i>
            <span>Trigger 2 is not active</span>
        }
    </ToggleButton>
    <span class="d-flex gap-1 align-self-center">

        <ToggleButton @bind-IsChecked="@Trigger3IsActive">
            Trigger <b>3</b>
        </ToggleButton>
        @if (Trigger3IsActive){
            <span class="vr"></span>

            <ToggleButton @bind-IsChecked="@Trigger4IsActive">
                Trigger <b>4</b>
            </ToggleButton>
        }
    </span>
</div>
```

---

## Разбор

## UserOverlay.cs

Ничего необычного — просто несколько свойств, которые обращаются к триггерам.

## UserOverlay.razor

В этом файле показано сразу несколько способов кастомизации. В реальных проектах лучше не смешивать слишком много подходов в одном месте — такой код сложнее поддерживать.

```html
<div class="text-center mt-4 mx-2 d-flex gap-1 flex-column alert alert-info">
```

Список классов изменился:

- `flex-column` — вместе с `d-flex` выстраивает элементы вертикально, а не в строку

```html
@if (Trigger1IsActive){
         <ToggleButton @bind-IsChecked="@Trigger1IsActive"
            Class="btn btn-success">
            Trigger <b>1</b> is active
        </ToggleButton>
    } else {
         <ToggleButton @bind-IsChecked="@Trigger1IsActive"
            Class="btn btn-outline-danger">
            Trigger <b>1</b> is inactive
        </ToggleButton>
    }
```

Первый вариант: условие выбирает разметку и параметры кнопки. Не стоит полагаться на то, что Blazor обязательно уничтожит и создаст компонент заново при каждом таком переключении. Такой подход полезен, когда меняется слишком много свойств; в остальных случаях он выглядит немного «грязно».

```html
<ToggleButton @bind-IsChecked="@Trigger2IsActive">
        @if (Trigger2IsActive){
            <i class="fa-solid fa-toggle-on"></i>
            <strong>Trigger 2 is active</strong>
        } else {
            <i class="fa-solid fa-toggle-off"></i>
            <span>Trigger 2 is not active</span>
        }
</ToggleButton>
```

Второй вариант — самый распространённый. Обычно вы обновляете *содержимое* компонента, а не сам компонент целиком.

```html
 <span class="d-flex gap-1 align-self-center">
        <ToggleButton @bind-IsChecked="@Trigger3IsActive">
            Trigger <b>3</b>
        </ToggleButton>
        @if (Trigger3IsActive){
            <span class="vr"></span>

            <ToggleButton @bind-IsChecked="@Trigger4IsActive">
                Trigger <b>4</b>
            </ToggleButton>
        }
    </span>
```

Здесь условие используется для динамического рендера дополнительной кнопки. Она появляется только тогда, когда активен `Trigger 3`. Таким способом можно строить целую иерархию настроек. Но помните: «прыгающий» интерфейс — это плохой UX, поэтому по возможности такого поведения лучше избегать.
Нажатие кнопки записывает `TriggerValue`; горячая клавиша меняет тот же триггер. Таймер в `ChangeTrackers` заставляет компонент перечитывать состояние примерно раз в секунду, поэтому внешнее изменение видно с задержкой. Добавляйте таймер до `base.OnInitialized()`: там список отслеживания запечатывается и подписки привязываются к `Anchors` компонента. Скрытие окна само по себе не равно уничтожению компонента.
