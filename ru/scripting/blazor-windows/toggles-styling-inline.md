---
title: 8. Подключаем CSS - Inline
description: 
published: true
date: 2025-05-11T23:35:13.069Z
tags: 
editor: markdown
dateCreated: 2025-05-11T15:48:02.521Z
---

# CSS и с чем его едят
CSS - Cascading Style Sheets - это средство описания **стилей** вашего интерфейса. То, что декларирует какого цвета будет кнопочка в разных условиях, сколько места займет и т.п. 

Сам механизм невероятно мощный и с годам оброс таким количеством деталей, что подробное описание укладывается только в толстенную книгу. 
К счастью, механизм при этом и простой, соблюдается уважаемый подход `Easy to learn - Hard to master` и чтобы полноценно пользоваться стилями совершенно не нужно понимать как они там в глубине работают. 

## [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
Bootstrap это здоровенное такое хранилище полезных CSS классов, которые покрывают большинство стандартных запросов - разноцветные кнопки, редакторы и т.п.
В EyeAuras Bootstrap CSS/JS подключаются автоматически, так что в любом вашем оверлее все классы из документации будут доступны по умолчанию.
Мы их активно уже и так использовали в предыдущих статьях. 

Однако не всегда хватает стандартных стилей, часто хочется что-то свое.
Давайте возьмем, для примера код, который включает-выключает триггер через кнопку.
И попробуем просто перекрасить эту самую кнопку с помощью CSS.

![Demo](https://s3.eyeauras.net/media/2025/05/3UAeooHWHD.png)

## UserOverlay.cs
```csharp
public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public bool TriggerIsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue = value;
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

<style>
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
</style>

<h3 class="text-center shadow-1">Toggle Trigger</h3>

<div class="text-center mt-4">
    <ToggleButton 
        @bind-IsChecked="@TriggerIsActive" 
        Class="btn custom-button">
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

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

---

# Разбор

## UserOverlay.razor 
```html
<style>
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
</style>
```
А вот и т.н. inline-style - подход, при котором мы прямо в коде создаем CSS-класс и тут же его используем.
Он очень простой и вполне годится для маленьких проектов, однако у него есть существенные минусы и лучше в какой-то момент переходить на полноценный CSS-файлы со стилями, что является стандартным подходом в мире веб-дева.

# Дополнительное
ChatGPT и другие чат-боты довольно хорошо разбираются в CSS и во многих случаях могут сгенерировать для вас самые-самые разнообразные классы. 
К примеру, вот CSS от ChatGPT 4o, который добавляет градиент. Мы не будем сейчас говорить про оптимальность, оставим это на разбор профессионалам :) 
```css
.custom-button {
    background: linear-gradient(90deg, red, darkred);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 0.3rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background 0.3s ease;
}

.custom-button::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1));
    transition: left 0.6s ease-in-out;
    z-index: 1;
}

.custom-button:hover::before {
    left: 100%;
}

.custom-button > * {
    position: relative;
    z-index: 2;
}
```
![Demo 1](https://s3.eyeauras.net/media/2025/05/J0g2tAOpQa.gif)
