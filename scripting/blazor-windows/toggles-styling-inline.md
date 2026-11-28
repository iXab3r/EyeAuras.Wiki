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

Let's make a toggle stand out: a lime button with black text, 80% of the panel wide. CSS changes the look, and C# still switches the trigger.

You need two loaded auras in one folder. `TargetAura` has **Hotkey Is Active → Toggle Trigger state on Click**. A separate panel aura has **C# Overlay** and **Fixed Value → Is Active**. Give the trigger a free hotkey. It needs no actions. The path `./TargetAura` must lead to your aura with one such trigger. [The first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive) shows how to build the button itself.

1. In your C# Overlay, replace `UserOverlay.cs` and `UserOverlay.razor` completely with the files below. `BlazorDemo` must be the same in both. Do not keep the old fields and handlers with the same names.
2. Keep `Script.csx` short, with no waiting, for example `Log.Debug("Panel ready");`.

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

3. After compilation, click the green button. Its text and the trigger change state, and its colour stays as set in the CSS. The hotkey changes the same trigger.

![Green button in the earlier example](https://s3.eyeauras.net/media/2025/05/3UAeooHWHD.png)

| Setting or technique | What it affects |
| --- | --- |
| `background: lime`, `color: black` | Background and text colour of the button that matches the selector. |
| `width: 80%` | Width relative to the parent area, not the screen. |
| `.demo-panel .custom-button` | Selects the button inside this panel. It does not restyle every button in the window. |
| A Razor `style` element | The rules are written in the component's markup but apply in the whole WebView document. There is no automatic per-component CSS isolation here. |
| `ToggleButton.Style` | A separate way to set values right on the visible button. It is not the same as a selector in `style`. |
| `btn` | Basic [Bootstrap styling](https://getbootstrap.com/docs/5.3/getting-started/introduction/) that the window loads. Which classes are available depends on what the window loads. |

The button reads and writes the real `TriggerValue` and shows `null` as off. Thanks to `WhenAnyValue` it also updates after a hotkey press. The details and a timer-based variant are in [reactive updates](/en/scripting/blazor-windows/reactive-toggle).

<details>
<summary>Set values directly without a selector</summary>

In the same component you can replace just `ToggleButton` with this fragment and remove the `style` element. The state and handler stay in `UserOverlay.cs`:

```razor
<ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
              Style="background: lime; color: black; width: 80%;">
    Trigger: @(IsActive ? "on" : "off")
</ToggleButton>
```

For several buttons a shared class is easier, because you change the rule in one place. The layout comes from the markup, as in the earlier row of toggles:

![Earlier toggle row](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

</details>

<details>
<summary>Add a gradient and hover highlight</summary>

You can replace the simple rule inside `style` with the one below. The selector is the same, and it adds a gradient and a moving highlight on hover:

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

When there are many rules, [move them into a CSS file](/en/scripting/blazor-windows/toggles-styling-cssfile).
