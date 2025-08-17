---
title: 10. Connecting a CSS file – LoadCss
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---

# Alternative way to load CSS

## LoadCss – loading from code
EyeAuras provides a set of tools called `IJsPoeBlazorUtils`. Just like `IAuraTreeScriptingApi` you can inject it into your component and use its methods to load CSS at runtime.
```csharp
/// <summary>
/// Loads CSS file dynamically
/// </summary>
Task LoadCss(string cssPath);
```

The key difference from using `HeadContent` or inline styles is that *you* control when the CSS file loads. It can be on page load, button click, theme switch—anything. Full control is in your hands.
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

# Breakdown
## UserOverlay.cs
```csharp
[Inject]
public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }
```
As with `IAuraTreeScriptingApi` we inject another service to load CSS.

```csharp
    protected override async Task OnInitializedAsync()
    {
        await base.OnInitializedAsync();

        await PoeBlazorUtils.LoadCss("Styles.css");
    }
```
Here I load CSS right after the component is initialized—services are prepared but rendering hasn't happened yet. More on this lifecycle in [Microsoft's article](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).
