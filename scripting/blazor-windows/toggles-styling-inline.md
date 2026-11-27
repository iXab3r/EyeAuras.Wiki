---
title: 8. Adding CSS – Inline
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T15:48:02.521Z
---
# Style a button inside its component

Make a toggle stand out: a lime background, black text and a width of 80% of its panel. CSS changes appearance; C# still changes the trigger.

Use two loaded auras in one folder: `TargetAura` with **Hotkey Is Active → Toggle Trigger state on Click**, and a separate panel with **C# Overlay** and **Fixed Value → Is Active**. Give the trigger a free hotkey and leave its actions empty for this exercise. `./TargetAura` must resolve to your aura with one such trigger. [The first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive) explains that setup.

1. Replace `UserOverlay.cs` and `UserOverlay.razor` in your C# Overlay with the complete files below. Keep `BlazorDemo` consistent in both; replacing the files removes the old duplicate fields and handlers.
2. Keep `Script.csx` short, without a wait, for example `Log.Debug("Panel ready");`.

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using ReactiveUI;
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
        await Refresh("styled toggle clicked");
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<style>
.demo-panel .custom-button {
    background: lime;
    color: black;
    width: 80%;
}
</style>

<div class="demo-panel">
    <ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
                  Class="btn custom-button">
        Trigger: @(IsActive ? "on" : "off")
    </ToggleButton>
</div>
```

3. After compilation, click the green button. Its text and the target trigger change state; its colour stays as specified by CSS. The hotkey changes the same trigger.

![Green button in the earlier example](https://s3.eyeauras.net/media/2025/05/3UAeooHWHD.png)

| Setting or technique | Scope |
| --- | --- |
| `background: lime`, `color: black` | Background and text colour of the matching button. |
| `width: 80%` | Width relative to its parent area, not the screen. |
| `.demo-panel .custom-button` | Matches this panel's button without selecting every button in the document. |
| A Razor `style` element | Declares rules inside the component markup, but they apply in the WebView document. This is not automatic component CSS isolation. |
| `ToggleButton.Style` | Sets values directly on the visible button, rather than defining a CSS selector. |
| `btn` | Basic [Bootstrap styling](https://getbootstrap.com/docs/5.3/getting-started/introduction/) supplied by the window. Available classes depend on the host's resources. |

`[Inject]` obtains the tree service from the component's host. Script.csx globals are not implicit Razor members. The button reads and writes the actual `TriggerValue`, displaying `null` as off. `WhenAnyValue` also updates it after a hotkey change. Add trackers before `base.OnInitialized()`; the component owns their subscription and disposes it when destroyed, not merely when hidden. Other aura conditions still determine overall activity. See [reactive updates](/en/scripting/blazor-windows/reactive-toggle) for the notification and polling alternatives.

<details>
<summary>Set values directly without a selector</summary>

In the same component, replace just `ToggleButton` with this fragment and remove the `style` element. Keep the state and handler in `UserOverlay.cs`:

```razor
<ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
              Style="background: lime; color: black; width: 80%;">
    Trigger: @(IsActive ? "on" : "off")
</ToggleButton>
```

A shared class is easier to maintain for several buttons. Layout is a separate choice, as in the earlier row of toggles:

![Earlier toggle row](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

</details>

<details>
<summary>Add a gradient and hover highlight</summary>

Replace the simple rule inside `style` with this alternative. It keeps the same panel-specific selector and adds a moving highlight on hover:

```css
.demo-panel .custom-button {
    background: linear-gradient(90deg, red, darkred);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 0.3rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background 0.3s ease;
}

.demo-panel .custom-button::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1));
    transition: left 0.6s ease-in-out;
    z-index: 1;
}

.demo-panel .custom-button:hover::before {
    left: 100%;
}

.demo-panel .custom-button > * {
    position: relative;
    z-index: 2;
}
```

![Gradient styling in the earlier demonstration](https://s3.eyeauras.net/media/2025/05/J0g2tAOpQa.gif)

</details>

When the rules grow, [move them into a CSS file](/en/scripting/blazor-windows/toggles-styling-cssfile).
