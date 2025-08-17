---
title: 5. Update mechanism
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2025-05-11T14:35:20.794Z
---

# Controlling an aura through the UI
The previous code works, but it's imperfect. Clicking the button toggles the trigger and aura as expected. But if you activate the trigger with a **hotkey**, the UI doesn't re-render because it doesn't know it should. We need to signal an update.

For simplicity we solve it head-on: the interface will refresh **once per second**. It's not optimal, but fine for a very simple UI.

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

# Breakdown
## UserOverlay.cs
```csharp
 protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
```
EyeAuras uses a mechanism to control rendering. One of the simplest ways to use it is to add an event to `ChangeTrackers` in `OnInitialized`. Here it's just a timer—every tick forces the interface to re-render. It doesn't check whether anything changed; it simply says "re-render".

Later we'll look at optimizing via `ReactiveSection` and more precise tracking. For many situations this approach is good enough—`Blazor` is fast and doing a "blank" re-render with a simple UI isn't a crime.
