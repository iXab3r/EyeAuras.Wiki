---
title: 6. Multiple toggles
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:52:06.974Z
---
# Put three toggles on one panel

Control three of your own auras from one panel. Each item holds its actual trigger, so a button and its hotkey change the same value without three mirrored state properties.

1. In one folder, create `TargetAura 1`, `TargetAura 2` and `TargetAura 3`. Give each **Hotkey Is Active → Toggle** with a different free hotkey. Leave them loaded, with no actions for this exercise.
2. Add a separate panel aura with **C# Overlay** and **Fixed Value → Is Active**.
3. Replace its two component files below. Leave `Script.csx` as a short entry point without waiting.

## UserOverlay.cs

```csharp
using System;
using System.Threading.Tasks;
using System.Reactive.Linq;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; set; }

    private ToggleItem[] items = Array.Empty<ToggleItem>();

    protected override void OnInitialized()
    {
        items = new[]
        {
            new ToggleItem("Trigger 1", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1")),
            new ToggleItem("Trigger 2", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2")),
            new ToggleItem("Trigger 3", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3")),
        };
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }

    private async Task SetActive(ToggleItem item, bool value)
    {
        item.Trigger.TriggerValue = value;
        await Refresh("group toggle clicked");
    }

    private sealed record ToggleItem(string Label, IHotkeyIsActiveTrigger Trigger)
    {
        public bool IsActive => Trigger.TriggerValue ?? false;
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3>My triggers</h3>
<div class="d-flex gap-1 alert alert-info">
    @foreach (var item in items)
    {
        <ToggleButton @key="item" IsChecked="@item.IsActive"
                      IsCheckedChanged="value => SetActive(item, value)">
            @item.Label: @(item.IsActive ? "on" : "off")
        </ToggleButton>
    }
</div>
```

4. Once compilation finishes, click the second button. Only the trigger in `TargetAura 2` changes. Toggle another trigger with its hotkey: its panel button catches up in about a second.

![Three buttons for three auras in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

| Setting or part | What it changes |
| --- | --- |
| Labels and paths in `items` | One entry connects a label to its trigger. Paths are relative to the panel's tree context; missing aura/trigger lookup throws, and multiple matching triggers select the first. |
| `ToggleItem.IsActive` | Reads the current `TriggerValue`; `null` is displayed as off. The model stores a reference, not a second writable value. |
| `SetActive(item, value)` | Writes only the chosen trigger and refreshes the panel after the click. |
| `Observable.Timer(..., TimeSpan.FromSeconds(1))` | Requests periodic refreshes so hotkey changes become visible. This is polling, not property-change observation. |
| `d-flex gap-1` | Places the buttons in a row with spacing. Other [Bootstrap](https://getbootstrap.com/) gap sizes can change the spacing. |
| `alert alert-info` | Gives the group a coloured background. [Bootstrap button styles](https://getbootstrap.com/docs/5.3/components/buttons/) provide other appearances. |

Add the timer before `base.OnInitialized()`. The base class seals `ChangeTrackers`, subscribes through component `Anchors` and releases the subscription when the component is disposed. Hiding its window alone may leave polling active; do not create another timer in `Script.csx`.

For a notifying source, use [TriggerValue observation](/en/scripting/blazor-windows/reactive-toggle) for each item instead of the timer. The aura's other conditions still determine its overall activity. Continue with [colours, content and conditional buttons](/en/scripting/blazor-windows/toggle-styling).
