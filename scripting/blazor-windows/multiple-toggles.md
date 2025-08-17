---
title: 6. Multiple toggles
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2025-05-11T14:52:06.974Z
---

# Controlling an aura through the UI
The code works but isn't perfect. Clicking the button toggles the trigger and aura correctly. But if you activate a trigger **with a hotkey**, the UI doesn't refresh automatically—it needs a signal. We'll use the same simple solution: refresh the interface **once per second**. Not optimal, but fine for our tiny UI.

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

# Breakdown
## UserOverlay.cs
```csharp
    public bool Trigger1IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue = value;
    }
```
For convenience we declare properties for each aura. The logic is the same as before, but instead of splitting trigger lookup and value access, we do both at once. `GetTriggerByPath` guarantees the trigger is found (or throws), so this is safe.

## UserOverlay.razor
```html
<div class="text-center mt-4 mx-2 d-flex gap-1 alert alert-info">
    <ToggleButton @bind-IsChecked="@Trigger1IsActive">
        Trigger <b>1</b>
    </ToggleButton>
    ...
</div>
```
Key classes in the parent `<div>`:
- `d-flex` – lay out elements in a row
- `gap-1` – small gap between them (`gap-2`, `gap-3`, etc. are also available). These classes come from [Bootstrap](https://getbootstrap.com/)
- `alert alert-info` – wrap buttons in a colored box for visibility

The buttons themselves changed only by variable name and small style tweaks. See [here](https://getbootstrap.com/docs/5.3/components/buttons/) for more button styles. We'll cover customizing styles next.
