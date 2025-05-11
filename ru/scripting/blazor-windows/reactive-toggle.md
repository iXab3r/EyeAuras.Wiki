---
title: 5. Механизм обновления
description: 
published: true
date: 2025-05-11T23:34:26.741Z
tags: 
editor: markdown
dateCreated: 2025-05-11T14:35:20.794Z
---

# Как управлять аурой через UI

Однако этот код не совершенен - если вы кликаете на кнопку, то триггер и, соответственно, аура, будут включаться-выключаться как и нужно.
Если же вы активируете триггер **хоткеем**, то UI сам по себе не перерисуется, потому что UI не знает о том, что ему нужно перерисоваться - нам нужно подать сигнал.
Для простоты, мы решим эту задачу "в лоб" и в данной статье сделаем так, чтобы интерфейс обновлялся **1 раз в секунду**. 
Это не самый оптимальный подход, однако так как UI у нас очень простенкий, это не вызовет проблем.


## UserOverlay.cs
```csharp
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

# Разбор
## UserOverlay.cs
```csharp
 protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
```
В EyeAuras используется механизм, который позволяет управлять отрисовкой и один из самых простых способов им воспользоваться это добавить
событие в ChangeTrackers в метод `OnInitialized`. В нашем случае таким событием будет просто таймер - как только таймер тикает, интерфейс перерисовывается.
Обратите внимание - такой подход никак не учитывает было ли изменения состояния или нет, он просто говорит "перерисуйся". 
В более поздних статьях мы рассмотрим как можно оптимизировать систему через `ReactiveSection` и более точный трекинг изменений. Однако для огромного количества ситуаций текущего подхода хватит за глаза - `Blazor` очень быстрый и сделать "холостую" перерисовку при простом интерфейсе это не преступление. 



