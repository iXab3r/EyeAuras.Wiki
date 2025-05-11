---
title: 6. Несколько переключателей
description: 
published: true
date: 2025-05-11T14:52:06.974Z
tags: 
editor: markdown
dateCreated: 2025-05-11T14:52:06.974Z
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

<h3 class="text-center shadow-1">Toggle Multiple Triggers</h3>

<div class="text-center mt-4 mx-2 d-flex gap-1 alert alert-info">
    <ToggleButton @bind-IsChecked="@Trigger1IsActive">
        Trigger <b>1</b>
    </ToggleButton>
    <ToggleButton @bind-IsChecked="@Trigger2IsActive">
        Trigger <b>2</b>
    </ToggleButton>
    <ToggleButton @bind-IsChecked="@Trigger3IsActive">
        Trigger <b>3</b> 
    </ToggleButton>
</div>
```

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

---

# Разбор
## UserOverlay.cs
```csharp

    public bool Trigger1IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue = value;
    }
```
Ради удобства, мы объявляем несколько свойств, которые описывают доступ к разным аурам - логика ровно такая же как была раньше,
но аместо того, чтобы разделять поиск триггера по пути и доступ к значению, мы теперь это делаем в одно действие. Так как `GetTriggerByPath` гарантирует то, что триггер будет найден (или будет ошибка), то мы можем себе это позволить. 


## UserOverlay.razor 
```html
<div class="text-center mt-4 mx-2 d-flex gap-1 alert alert-info">
    <ToggleButton @bind-IsChecked="@Trigger1IsActive">
        Trigger <b>1</b>
    </ToggleButton>
    ...
</div>
```
Ключевых моментов здесь несколько, давайте сначала глянем на классы в родительнском `<div>` контейнере
- `d-flex` - этот CSS-класс указывает браузеру, что нужно выложить элементы последовательно в ряд, один за другим
- `gap-1` - при этом оставить небольшой зазор между ними, есть еще `gap-2`, `gap-3` и т.п. Эти классы являются частью [Bootstrap](https://getbootstrap.com/)
- `alert alert-info` - оборачиваем кнопки в цветную "коробочку" для лучшей видимости

В самих кнопках поменялось совсем немногое - разве что имя переменной. Ну и небольшие изменения стиля. Какие еще доступны стили для кнопок можно глянуть [здесь](https://getbootstrap.com/docs/5.3/components/buttons/). Далее мы глянем как можно кастомизировать стили.  


