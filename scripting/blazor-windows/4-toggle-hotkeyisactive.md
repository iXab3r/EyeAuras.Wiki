---
title: 4. Creating a toggle
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:24:53.840Z
---
# Toggle your own aura from a panel

Give a panel button and a hotkey the same source of truth: the writable `TriggerValue` of **Hotkey Is Active**. The button controls that trigger; the aura's other conditions still apply.

1. In one folder, create `TargetAura`. Add **Hotkey Is Active**, choose **Toggle**, assign a free hotkey and leave the aura loaded. Add no actions for this exercise.
2. In the same folder, create a panel aura with **C# Overlay** and its own **Fixed Value → Is Active**. Its visibility must not depend on `TargetAura`.
3. Replace the two component files below. Leave the generated `Script.csx` as a short entry point without a loop or wait.

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
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

4. After compilation, compare the displayed state with the trigger in `TargetAura`. Click **Toggle trigger**: its `TriggerValue` changes and the panel displays the new state.

![Button and trigger in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

| Part | Meaning |
| --- | --- |
| `[Inject] IAuraTreeScriptingApi` | Obtains the tree API from this component's host. `AuraTree` is not an implicit Razor global; see [dependency injection](/en/scripting/dependency-injection). |
| `"./TargetAura"` | Resolves within the panel's aura-tree context. Use your actual neighbouring aura path, not a filesystem path or another workspace's name. |
| `GetTriggerByPath<IHotkeyIsActiveTrigger>` | Requires a matching aura and trigger; it throws when they are absent and selects the first matching trigger if several exist. |
| `TriggerValue ?? false` | Reads the initial and current trigger value. This button deliberately displays `null` as off. |
| `IsChecked` / `IsCheckedChanged` | Read the displayed value and handle a user change separately. `@bind-IsChecked` is the shorthand when a suitable read/write property supplies both. |
| `SetActive` and `Refresh` | Write to the selected trigger, then refresh the component through its dispatcher. |

There is no separate mutable copy of the trigger state. This first example refreshes after panel clicks; an external hotkey change needs a notification or polling source to update an already displayed panel. Add that in [reactive updates](/en/scripting/blazor-windows/reactive-toggle).

The general aura `IsActive` state is not interchangeable with this trigger's writable `TriggerValue`. Keep the target and panel loaded; unloading or replacing a target requires resolving the intended trigger again.
