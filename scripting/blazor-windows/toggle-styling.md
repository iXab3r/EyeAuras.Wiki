---
title: 7. Customizing toggles
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T15:23:20.489Z
---
# Show toggle state with colour, text and visibility

Make four controls easier to read: the first changes colour, the second changes its icon and text, and the third reveals a fourth button. They use the same real triggers as their hotkeys.

1. Create neighbouring `TargetAura 1` through `TargetAura 4`, each with **Hotkey Is Active → Toggle** and a different free key. Keep them loaded and leave their action lists empty for this exercise.
2. Create a separate panel aura with **C# Overlay** and **Fixed Value → Is Active**.
3. Replace the two component files below. Keep the generated `Script.csx` short, without a loop or wait.

## UserOverlay.cs

```csharp
using System;
using System.Threading.Tasks;
using ReactiveUI;
using AntDesign;
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

    private readonly ClassMapper firstButtonClass = new ClassMapper();

    protected override void OnInitialized()
    {
        items = new[]
        {
            new ToggleItem("Trigger 1", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1")),
            new ToggleItem("Trigger 2", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2")),
            new ToggleItem("Trigger 3", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3")),
            new ToggleItem("Trigger 4", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 4")),
        };
        firstButtonClass.Add("btn")
            .If("btn-success", () => items[0].IsActive)
            .If("btn-outline-danger", () => !items[0].IsActive);
        foreach (var item in items)
        {
            ChangeTrackers.Add(item.Trigger.WhenAnyValue(x => x.TriggerValue));
        }
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

<h3>Panel settings</h3>
<div class="d-flex gap-1 flex-column alert alert-info">
    <ToggleButton IsChecked="@items[0].IsActive"
                  IsCheckedChanged="value => SetActive(items[0], value)"
                  Class="@firstButtonClass.ToString()">
        Trigger 1: @(items[0].IsActive ? "on" : "off")
    </ToggleButton>

    <ToggleButton IsChecked="@items[1].IsActive"
                  IsCheckedChanged="value => SetActive(items[1], value)">
        @if (items[1].IsActive)
        {
            <i class="fa-solid fa-toggle-on"></i>
            <strong>Trigger 2 on</strong>
        }
        else
        {
            <i class="fa-solid fa-toggle-off"></i>
            <span>Trigger 2 off</span>
        }
    </ToggleButton>

    <div class="d-flex gap-1 align-self-center">
        <ToggleButton IsChecked="@items[2].IsActive"
                      IsCheckedChanged="value => SetActive(items[2], value)">
            Show trigger 4
        </ToggleButton>
        @if (items[2].IsActive)
        {
            <span class="vr"></span>
            <ToggleButton IsChecked="@items[3].IsActive"
                          IsCheckedChanged="value => SetActive(items[3], value)">
                Trigger 4
            </ToggleButton>
        }
    </div>
</div>
```

4. After compilation, turn the first trigger on: its red outline becomes a green fill. The second button changes its icon and text. The third shows the fourth button; clicking it again hides that button.
5. Toggle the first or second trigger with its hotkey. The styling also updates because the component observes `TriggerValue`.

![Styling approaches in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_BY6C30fWpS.gif)

| Technique | What changes |
| --- | --- |
| First button's `Class` | A single `ClassMapper` holds stable predicates. Rendering selects `btn-success` or `btn-outline-danger` from the actual trigger state. |
| Second button's `ChildContent` | Razor `@if` changes the icon and text inside one `ToggleButton`. |
| `@if (items[2].IsActive)` | Includes or removes the fourth button. Hiding it does not reset its trigger value. |
| `d-flex gap-1 flex-column` | Stacks the controls vertically with spacing; the inner `align-self-center` group holds the third and fourth buttons. |
| `btn`, `btn-success`, `btn-outline-danger`, `alert` | Built-in Bootstrap styles. See the [button documentation](https://getbootstrap.com/docs/5.3/components/buttons/) for variants. |
| `fa-solid fa-toggle-on` / `fa-toggle-off` | Icons from the host's styling. Adjacent text keeps the meaning clear without relying only on colour or icons. |

These two component files need no separate CSS file and change no global theme. `Class`/`class` applies styling to this markup; no JavaScript injection is involved.

For your own colours and dimensions beyond the supplied classes, start with [inline CSS](/en/scripting/blazor-windows/toggles-styling-inline). When several controls share growing rules, [move them into a project CSS file](/en/scripting/blazor-windows/toggles-styling-cssfile); the trigger observation and click handlers stay responsible for state.

`items` holds the resolved trigger references, using paths relative to the panel. `SetActive` writes the selected `TriggerValue`; `WhenAnyValue` observes external changes. All trackers are added before `base.OnInitialized()`. The base owns their subscriptions and releases them on component disposal, not merely when the overlay becomes hidden.

<details>
<summary>Choose a different markup branch</summary>

When two states need substantially different markup, use `@if` branches as the second button does. Branches can also contain different complete button markup, but duplicating an entire button just to change one colour is unnecessary. A changed branch does not guarantee that Blazor destroys and recreates a component; its rendering rules determine that lifetime.

Conditional controls can build a hierarchy of settings, but moving neighbouring controls can make the panel harder to use. Here the hidden fourth button still has its own trigger state.

For a source without notifications, the [timer-based panel](/en/scripting/blazor-windows/multiple-toggles) remains an alternative. Do not combine it with property observation merely to update these four buttons.

</details>
