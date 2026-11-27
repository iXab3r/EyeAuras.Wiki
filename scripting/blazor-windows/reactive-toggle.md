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

A panel should show a trigger change even when it came from a hotkey. Observe `TriggerValue` so the component refreshes on notifications rather than continuously polling.

Prepare neighbouring `TargetAura` and panel auras as in [the first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive): **Hotkey Is Active → Toggle** on the target, **C# Overlay** and its own **Fixed Value → Is Active** on the panel. Both must stay loaded.

1. Replace the two component files below; leave the short `Script.csx` unchanged.
2. After compilation, compare the panel text with `TargetAura`'s trigger state.
3. Toggle the trigger with its hotkey, then with the panel button. Both change the same source, and the text updates in both cases.

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

| Mechanism | Purpose |
| --- | --- |
| `WhenAnyValue(x => x.TriggerValue)` | Reads the initial value and observes property-change notifications. Requires `using ReactiveUI`. |
| `ChangeTrackers.Add(...)` | Gives the observable to `BlazorReactiveComponent`. Add it before `base.OnInitialized()`, which seals and connects the list. |
| `IsActive` | Reads the same trigger when rendering; this UI displays `null` as off. |
| `Refresh("toggle clicked")` | Updates through the component dispatcher after a button write. The base also handles signals from `ChangeTrackers`. |

No manual `Subscribe` or mirrored variable is needed here. The base owns the subscription through its `Anchors` and releases it with the component. Hiding a window does not mean disposing it. A short `using` in `Script.csx` would have a different lifetime and is not the place to own this observer.

This uses notifications from the existing trigger, not an assumption that arbitrary auto-properties in Razor or `.csx` are woven. The path is relative to the panel context; lookup requires the intended loaded trigger. Its value does not override the aura's other activity conditions.

<details>
<summary>Polling a source without notifications</summary>

For a source that cannot notify, replace the `ChangeTrackers.Add(trigger.WhenAnyValue(...))` line with this fragment inside `OnInitialized`, before the base call:

```csharp
ChangeTrackers.Add(System.Reactive.Linq.Observable.Timer(
    System.DateTimeOffset.Now, System.TimeSpan.FromSeconds(1)));
```

This refreshes periodically and can show external changes with a delay. Do not add both mechanisms without a reason. [Multiple toggles](/en/scripting/blazor-windows/multiple-toggles) uses this timer for a whole panel.

For a larger component, `ReactiveSection` can limit updates to the fragment that depends on a source; it is a separate optimisation, not required for this button.

</details>
