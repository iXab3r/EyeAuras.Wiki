---
title: 7. Кастомизируем переключатели
description: 
published: true
date: 2025-05-11T23:34:46.647Z
tags: 
editor: markdown
dateCreated: 2025-05-11T15:23:20.489Z
---

# Добавляем разнообразия
Одним из главных плюсов Blazor/HTML/CSS является невероятная гибкость - любые пожелания можно воплотить в жизнь и, как правило,
это не особо сложно, что контрастирует с многими другими UI-фреймворками.

Давайте попробуем кастомизировать нашу группу переключателей и добавим немножко красок.

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_BY6C30fWpS.gif)

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

# Разбор
## UserOverlay.cs
Ничего особенного, просто объявляем несколько свойств, через которые будем обращаться к триггерам.

## UserOverlay.razor 
А вот в этом файле у нас довольно много интересного. В этом файле приведено несколько вариантов кастомизации. Старайтесь не намешивать много разных подходов в ваших реальных проектах - такой код будет сложнее поддерживать в дальнейшем! 

```html
<div class="text-center mt-4 mx-2 d-flex gap-1 flex-column alert alert-info">
```
Здесь поменялся набор классов и добавился
- `flex-column` - этот класс в комбинации с `d-flex` позволяет отрисовывать элементы построчно, а не в ряд


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
Первый вариант - при каждой отрисовке мы выбираем стиль кнопки заранее и отрисовываем целиком новый компонент. Т.е. мы не изменяем настройки одного и того же компонента-кнопки, мы именно создаем новую. Этот подход следует выбирать когда нужно поменять слишком много свойств компонента, в остальных случаях он слишком "грязный"

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
Второй вариант - наиболее распространенный, потому что чаще всего вам придется обновлять именно _содержимое_ компонента, а не сам компонент. 

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
А здесь мы испольуем условия для динамической отрисовки дополнительной кнопки, которая показывается только если `Триггер 3` включен. По схожей схеме можно построить целую иерархию настроек. Хотя помните, что по заветам UX, "прыгающий" интерфейс это очень-очень плохо, старайтесь избегать этого при возможности.



