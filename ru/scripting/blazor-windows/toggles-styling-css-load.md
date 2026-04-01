---
title: 10. Подключение CSS-файла — LoadCss
description: Как подключить CSS-файл с помощью LoadCss
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---
# Альтернативный способ подключить CSS

## LoadCss — загрузка из кода

В EyeAuras есть набор инструментов `IJsPoeBlazorUtils`. Как и `IAuraTreeScriptingApi`, его можно внедрить в компонент и использовать методы для загрузки CSS во время выполнения.

```csharp
/// <summary>
/// Loads CSS file dynamically
/// </summary>
Task LoadCss(string cssPath);
```

Главное отличие от `HeadContent` или inline-стилей в том, что момент загрузки CSS контролируете именно вы. Это может быть загрузка страницы, нажатие кнопки, переключение темы — что угодно. Полный контроль остается за вами.

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

        await PoeBlazorUtils.LoadCss("Styles.css");
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

Как и в случае с `IAuraTreeScriptingApi`, здесь мы внедряем еще один сервис — для загрузки CSS.

```csharp
    protected override async Task OnInitializedAsync()
    {
        await base.OnInitializedAsync();

        await PoeBlazorUtils.LoadCss("Styles.css");
    }
```

Здесь CSS загружается сразу после инициализации компонента: сервисы уже готовы, но сам рендеринг еще не произошел. Подробнее о жизненном цикле компонента можно прочитать в [статье Microsoft](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).