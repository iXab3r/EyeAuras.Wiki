---
title: 10. Подключаем CSS файл - LoadCss
description: 
published: true
date: 2025-05-11T23:35:36.798Z
tags: 
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---

# Альтернативный вариант загрузки CSS

## LoadCss - загрузка из кода

В EyeAuras есть набор инструментов, который называется `IJsPoeBlazorUtils` - ровно как и `IAuraTreeScriptingApi`, его можно подключить в ваш компонент
и дальше использовать один из его методов для загрузки CSS в рантайме.
```csharp
/// <summary>
/// Loads CSS file dynamically
/// </summary>
Task LoadCss(string cssPath);
```

Ключевым отличием от подключения CSS через `HeadContent` и `Inline` здесь будет то, что _вы_ контролируете момент, когда подгружается CSS-файл. Это может быть загрузка страницы, может быть нажатие кнопки, может быть переключение стиля в UI - что угодно. Весь контроль на вашей стороне. 
![Demo](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

## UserOverlay.cs
```csharp
public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    [Inject]
    public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }

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

    protected override async Task OnInitializedAsync()
    {
        await base.OnInitializedAsync();

        await PoeblazorUtils.LoadCss("Styles.css");
    }
}
```

## UserOverlay.razor
```html
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">CSS via HeadContent</h3>

<div class="text-center mt-4">
    <ToggleButton 
        @bind-IsChecked="@TriggerIsActive" 
        Class="btn custom-button">
                Trigger is Active
    </ToggleButton>
</div>
```

## Styles.css
```css
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

---

# Разбор

## UserOverlay.cs 
```csharp
[Inject]
public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }
```
По аналогии с `IAuraTreeScriptingApi` мы подключаем еще один сервис, через который и будем загружать CSS.

```csharp
    protected override async Task OnInitializedAsync()
    {
        await base.OnInitializedAsync();

        await PoeblazorUtils.LoadCss("Styles.css");
    }
```
В данном случае я выбрал загрузку CSS  сразу после того как компонент был инициализирован, т.е. все службы подготовлены и т.п. Однако это происходит ДО того, как компонент отрисован. Более подробно об этом есть в этой [статье от Microsoft](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0)
