---
title: 10. Connecting a CSS file – LoadCss
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
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

## Prepare the overlay and target auras

Create a **C# Overlay v3** aura and `TargetAura` in the same folder. Add `HotkeyIsActive` in toggle mode to each target and keep them loaded. The shown `./TargetAura` paths resolve relative to the overlay context; adjust them to your actual tree. If several triggers match, the first is selected.

Replace `UserOverlay.cs` and `UserOverlay.razor` with the corresponding complete blocks below. They are parts of one `public partial` class in the same namespace. `[Inject]` supplies `AuraTree`; Script.csx globals are not component globals.

## Prepare the resource

Add `Styles.css` with `New` → `CSS` and include it in the overlay project's resources. Replace `MyScript` in `MyScript.Styles.css` with your actual project namespace; folders contribute to the full name, for example `MyScript.Theme.Styles.css` for `Theme/Styles.css`.

Script preparation diagnostics list manifest resource names. `ScriptEmbeddedResourceFileProvider.GetManifestNames()` exposes them on that specific provider, but `GetService<IScriptFileProvider>()` may return a composite and cannot always be cast to it. Use the full resource name instead of assuming every suffix URL resolves. The window host connects the script provider to WebView2.

## UserOverlay.cs
```csharp
using System;
using System.Reactive.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

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

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();

        await PoeBlazorUtils.LoadCss("MyScript.Styles.css");
    }
}
```

## UserOverlay.razor
```html
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">CSS via LoadCss</h3>

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

## Breakdown
## UserOverlay.cs
```csharp
[Inject]
public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }
```
As with `IAuraTreeScriptingApi` we inject another service to load CSS.

```csharp
    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();

        await PoeBlazorUtils.LoadCss("MyScript.Styles.css");
    }
```
Here I load CSS right after the component is initialized—services are prepared but rendering hasn't happened yet. More on this lifecycle in [Microsoft's article](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).

The button writes `TriggerValue`, and the hotkey changes the same trigger. The `ChangeTrackers` timer rereads it about once per second, so external changes appear with a delay. Add the timer before `base.OnInitialized()`, which seals the tracker list and owns the subscriptions through component `Anchors`. Hiding a window is not the same as disposing its component.

CSS loads after the first render when JavaScript is available. The supplied rules make the button green with black text and 80% parent width. `LoadCss` returns a `Task`, not a style ownership handle; component disposal does not promise to remove that CSS.
