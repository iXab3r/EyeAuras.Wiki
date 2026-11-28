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

On a settings panel you want to see at once what is on. Let's make four toggles. The first changes colour, the second changes its icon and text, and the third shows a fourth button. They all work with the same triggers as the hotkeys.

1. Create neighbouring auras `TargetAura 1` to `TargetAura 4`, each with **Hotkey Is Active → Toggle** and its own free key. Keep them loaded. They need no actions.
2. Create a separate aura for the panel, with **C# Overlay** and **Fixed Value → Is Active**.
3. Replace the two component files with the code below. Keep the generated `Script.csx` short, with no loop or wait.

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

4. After compilation, turn the first trigger on. Its red outline becomes a green fill. The second button changes its icon and text. The third shows the fourth button, and a second click hides it again.
5. Toggle the first or second trigger with its hotkey. The styling updates too, because the component watches `TriggerValue`.

![Styling approaches in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_BY6C30fWpS.gif)

| Technique | What changes |
| --- | --- |
| First button's `Class` | `ClassMapper` is created once. When the button is drawn, its conditions pick `btn-success` or `btn-outline-danger` from the current trigger state. |
| Second button's `ChildContent` | A Razor `@if` changes the icon and text inside one `ToggleButton`. |
| `@if (items[2].IsActive)` | Adds the fourth button to the markup or removes it. Hiding the button does not reset its trigger value. |
| `d-flex gap-1 flex-column` | Stacks the controls in a column with gaps. The inner `align-self-center` group holds the third and fourth buttons. |
| `btn`, `btn-success`, `btn-outline-danger`, `alert` | Ready-made Bootstrap classes. The variants are in the [button documentation](https://getbootstrap.com/docs/5.3/components/buttons/). |
| `fa-solid fa-toggle-on` / `fa-toggle-off` | Icons from the styles the window already loads. The text next to them keeps the state clear without relying on colour or an icon alone. |

If you need your own colours and sizes that the ready-made classes do not have, start with [inline CSS](/en/scripting/blazor-windows/toggles-styling-inline). When several controls share a growing set of rules, [move them into a project CSS file](/en/scripting/blazor-windows/toggles-styling-cssfile).

`items` holds the triggers, found by paths relative to the panel. `SetActive` writes to the chosen `TriggerValue`, and `WhenAnyValue` watches for outside changes. All trackers are added before `base.OnInitialized()`. The base component owns the subscriptions and releases them when the component is disposed.

<details>
<summary>Choose a different markup branch</summary>

When two states need very different markup, use `@if` branches, as the second button does. A branch can hold a whole button, but there is no need to duplicate a button just to change one colour.

With conditional controls you can build nested settings. Keep in mind that controls that jump around make a panel harder to use. Here the hidden fourth button still keeps its own trigger state.

For a source without notifications, there is still the [timer-based panel](/en/scripting/blazor-windows/multiple-toggles).

</details>
