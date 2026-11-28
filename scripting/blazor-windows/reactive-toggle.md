---
title: 5. Update mechanism
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:35:20.794Z
---
# Refresh a toggle after a hotkey change

When a trigger is switched with a hotkey, the panel should show the new state by itself, without a mouse click. Let's make the component watch `TriggerValue`. It will then redraw when the value changes, with no constant polling.

You need two neighbouring auras, as in [the first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive). `TargetAura` has **Hotkey Is Active → Toggle**. The panel aura has **C# Overlay** and its own **Fixed Value → Is Active**. Both auras must stay loaded.

1. Replace the two component files with the code below. Leave the short `Script.csx` as it is.
2. After compilation, compare the text on the panel with the trigger state in `TargetAura`.
3. Toggle the trigger with its hotkey, then with the panel button. Both change the same trigger, and the text updates both times.

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
using ReactiveUI;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; set; }

    private IHotkeyIsActiveTrigger trigger;
    private bool IsActive => trigger.TriggerValue ?? false;

    protected override void OnInitialized()
    {
        trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
        base.OnInitialized();
    }

    private async Task SetActive(bool value)
    {
        trigger.TriggerValue = value;
        await Refresh("toggle clicked");
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3>Control TargetAura</h3>
<ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
              Class="btn btn-secondary">
    Toggle trigger
</ToggleButton>
<p>Trigger: @(IsActive ? "on" : "off")</p>
```

![External changes updating the panel in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_W7LNmgAsPK.gif)

| Part | What it does |
| --- | --- |
| `WhenAnyValue(x => x.TriggerValue)` | Reads the starting value and watches for change notifications from the trigger's property. Needs `using ReactiveUI`. |
| `ChangeTrackers.Add(...)` | Hands the update source to `BlazorReactiveComponent`. Add it before `base.OnInitialized()`, because that call seals the list and connects it. |
| `IsActive` | Reads the same trigger when the component is drawn. `null` is shown as off. |
| `Refresh("toggle clicked")` | Redraws the component on its dispatcher after the button handler writes the value. The base component also handles signals from `ChangeTrackers`. |

You do not need to write `Subscribe` by hand or keep a mirror variable. The base component owns the subscription through its `Anchors` and releases it when the component is disposed. Do not move this subscription into a short `using` in `Script.csx`, because that has a different lifetime.

The path is relative to the panel, and the trigger it points to must be loaded.

<details>
<summary>Polling a source without notifications</summary>

Polling suits a source that cannot send notifications. Replace the `ChangeTrackers.Add(trigger.WhenAnyValue(...))` line with this fragment inside `OnInitialized`, before the base call:

```csharp
ChangeTrackers.Add(System.Reactive.Linq.Observable.Timer(
    System.DateTimeOffset.Now, System.TimeSpan.FromSeconds(1)));
```

This redraws on a timer, so outside changes show up with a delay. [Multiple toggles](/en/scripting/blazor-windows/multiple-toggles) uses this timer for a whole panel.

In a larger component, `ReactiveSection` can limit redraws to the fragment that depends on a source. It is a separate optimisation and this button does not need it.

</details>
