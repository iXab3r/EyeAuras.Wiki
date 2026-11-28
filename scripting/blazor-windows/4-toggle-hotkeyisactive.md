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

A button on a panel can change the same trigger as a hotkey. Both write to the `TriggerValue` of **Hotkey Is Active**. The button changes only that trigger, so the aura's other conditions still apply.

1. In one folder, create `TargetAura`. Add **Hotkey Is Active** to it, choose **Toggle** and assign a free hotkey. Leave the aura loaded. It needs no actions here.
2. In the same folder, create an aura for the panel. Add **C# Overlay** and its own **Fixed Value → Is Active**, so the panel stays visible whatever `TargetAura` does.
3. Replace the two component files with the code below. Leave the generated `Script.csx` short, with no loop or wait.

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

4. After compilation, click **Toggle trigger**. The `TriggerValue` of the trigger in `TargetAura` changes, and the panel shows the new state.

![Button and trigger in the earlier example](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

| Part | Meaning |
| --- | --- |
| `[Inject] IAuraTreeScriptingApi` | The tree API that the component gets from its host. In Razor, `AuraTree` is not a global. See [dependency injection](/en/scripting/dependency-injection). |
| `"./TargetAura"` | The neighbouring aura, relative to the panel's place in the aura tree. If your tree is laid out differently, change the path. |
| `GetTriggerByPath<IHotkeyIsActiveTrigger>` | The aura and the trigger must exist, otherwise it throws. If there are several matching triggers, it takes the first one. |
| `TriggerValue ?? false` | Reads the trigger value, both at the start and later. This button shows `null` as off. |
| `IsChecked` / `IsCheckedChanged` | The first passes the current value to the button. The second receives the new value after a click. `@bind-IsChecked` is the short form when one read/write property does both. |
| `SetActive` and `Refresh` | Writes to the trigger, then redraws the component on its dispatcher. |

The panel does not keep its own copy of the state. It reads the trigger and redraws only after its own clicks. After a hotkey press the panel may still show the old state. The [next step](/en/scripting/blazor-windows/reactive-toggle) adds updates for outside changes.

The aura's general `IsActive` state is not the same thing as this trigger's writable `TriggerValue`. Keep both auras loaded. If the target aura is unloaded or replaced, the component has to find the trigger again.
