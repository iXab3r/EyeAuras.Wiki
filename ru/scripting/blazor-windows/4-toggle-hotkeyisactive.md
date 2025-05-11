---
title: 3.  Создаем переключатель
description: 
published: true
date: 2025-05-11T14:24:53.840Z
tags: 
editor: markdown
dateCreated: 2025-05-11T14:24:53.840Z
---

# Как управлять аурой через UI
А теперь давайте решим очень частую задачу - мы хотим повесить где-нибудь на экране кнопку, которая будет 
включать и выключать определенный функционал.

## Решение через HotkeyIsActive Trigger
Стандартное решение в таких ситуациях это
- создать ауру
- кинуть в нее HotkeyIsActive триггер
- забиндить хоткей
В целом на этом и все - при нажатии на хоткей состояние ауры будет включаться-выключаться.

## Решение через C# Overlay
Создаем еще один оверлей. Именно в нем мы будем отрисовывать кнопку.

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
}
```

## UserOverlay.razor
```csharp
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">Toggle Trigger</h3>

<div class="text-center mt-4">
    <ToggleButton 
              @bind-IsChecked="@TriggerIsActive" 
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

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

---

# Разбор
Давайте подробно разберем что у нас здесь есть

Разберем что тут у нас есть
## UserOverlay.cs
```csharp
 [Inject]
 public IAuraTreeScriptingApi AuraTree { get; init; }
```
EyeAuras активно использует подход в разработке, который называется Dependency Injection, подробно о нем я писал [здесь](/scripting/dependency-injection).
Если вкратце, с его помощью мы можем получить доступ к тем или иным частям программы. 
В данном конкретном случае мы говорим "Мне нужен доступ к дереву аур" и EyeAuras при выполнении скрипта гарантирует, что он будет доступен. 
Так как мы собираемся изменять состояние одной из аур, без дерева аур никак.

```csharp
public IDefaultTrigger Trigger 
{
   get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
}
```
Здесь мы создаем свойство, при обращении к которому код обратится к дереву аур и попробует найти там ауру с именем `TargetAura`, которая лежит в той же папке, где и оверлей (`./` следует использовать как раз для таких случаев). Правила поиска пути совпадают с теми, которые испольузуются в системах файлов. Одна точка - текущая папка, две точки - выход на уровень выше и т.п. Поддерживаются как прямые, так и обратные слэши в путях (Windows и Unix-style). 

Однако это не все. Если бы мы просто хотели найти ауру по пути, то следовало бы использовать `GetAuraByPath`, мы же здесь хотим найти не только ауру, но и сразу извлечь из этой ауры триггер определенного типа. В нашем случае это `IHotkeyIsActiveTrigger` - триггер типа `HotkeyIsActive`.
Если или аура, или триггер не будут найдены - EyeAuras кинет исключение и вы это увидите.

```csharp
  public bool TriggerIsActive
    {
        get => Trigger.TriggerValue ?? false;
        set => Trigger.TriggerValue = value;
    }
```
И последний блок кода в этом файле - здесь мы и меняем состояние триггера. 
- При вызове `Get` мы находим триггер и считываем текущее состояние
- При вызове `Set` мы записываем новое состояние
> Обратите внимание, не у всех триггеров есть `TriggerValue`, который можно изменять извне, однако **у всех** триггеров есть свойство `IsActive`, которое позволяет **считать** текущее состояние. Особенно это полезно во всяких триггерах типа ImageSearch/MLSearch и т.п., чтобы понять нашли они что-нибудь или нет

## UserOverlay.razor
```html
@using PoeShared.Blazor.Controls
```

`ToggleButton` это компонент, который отрисовывает кнопку-переключатель с двумя состояниями (ВКЛ/ВЫКЛ). Находится эта кнопка в пространстве имен `PoeShared.Blazor.Controls`, поэтому чтобы она стала нам доступна, в заголовочной части файла мы пишем `@using PoeShared.Blazor.Controls` и теперь все, что там находится станет нам доступно в коде

```html
<ToggleButton 
              @bind-IsChecked="@TriggerIsActive" 
              Class="btn btn-secondary">
   Trigger is Active
</ToggleButton>
```
Здесь мы указываем, что в данном месте формы нужно отрисовать компонент `ToggleButton`. 
Самая важная часть здесь это `@bind-IsChecked="@TriggerIsActive"` - она указывает компоненту, откуда именно брать состояние кнопки и куда его записывать. 
Теперь при отрисовке кнопки она считает состояние из `TriggerIsActive`, вызвав `Get`, а при клике на кнопку - запишет новое состояние, вызвав `Set`


```html
@if (TriggerIsActive){
   <span class="shadow-1">Trigger is currently active</span>
} else {
   <span class="text-warning shadow-1">Trigger is currently not active</span>
}
```
Этот блок кода отрисовывает или один, или другой текст в зависимости от того, включен сейчас триггер или нет. Обратите внимание, что при нажатии на кнопку одновременно перерисовывается и текст. 

