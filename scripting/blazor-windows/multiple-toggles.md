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

Let's put buttons for three auras on one panel. Each button reads and changes its real trigger, so the button and the hotkey change the same value. You do not need copies of the state or three sets of identical properties.

1. In one folder, create `TargetAura 1`, `TargetAura 2` and `TargetAura 3`. Add **Hotkey Is Active → Toggle** to each, with its own free hotkey. Leave the auras loaded. They need no actions.
2. Add a separate aura for the panel, with **C# Overlay** and **Fixed Value → Is Active**.
3. Replace its two component files with the code below. Leave `Script.csx` as a short entry point with no waiting.

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

4. After compilation, click the second button. Only the trigger in `TargetAura 2` changes. Now toggle another trigger with its hotkey. Its button on the panel shows the change within about a second.

![Three buttons for three auras in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

| Setting or part | What it changes |
| --- | --- |
| Labels and paths in `items` | Each entry ties a label to its trigger. Paths are relative to the panel's place in the tree. If the aura or the trigger is missing, the lookup throws. If several triggers match, the first one is used. |
| `ToggleItem.IsActive` | Reads the current `TriggerValue` and shows `null` as off. The model stores a reference to the trigger, not a copy of its value. |
| `SetActive(item, value)` | Writes only to the chosen trigger and redraws the panel after the click. |
| `Observable.Timer(..., TimeSpan.FromSeconds(1))` | Redraws the panel once a second, so changes made by hotkeys show up. This is polling, not a subscription to a property. |
| `d-flex gap-1` | Puts the buttons in a row with gaps. Other [Bootstrap](https://getbootstrap.com/) gap sizes change the spacing. |
| `alert alert-info` | Gives the group a coloured background. Other looks are in the [Bootstrap button styles](https://getbootstrap.com/docs/5.3/components/buttons/). |

Add the timer before `base.OnInitialized()`. The base class then seals `ChangeTrackers`, subscribes through the component's `Anchors` and unsubscribes when the component is disposed. Do not create a second timer in `Script.csx`.

To update the panel on an event instead of once a second, [watch TriggerValue](/en/scripting/blazor-windows/reactive-toggle) for each item. The [next styling example](/en/scripting/blazor-windows/toggle-styling) changes the colour, content and visibility of the buttons.
