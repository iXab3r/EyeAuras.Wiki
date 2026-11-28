---
title: "Build a styled panel for your own trigger"
description: "Watch one loaded Hotkey Is Active trigger, switch it from Razor and style its current value with a project CSS file."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Build a styled panel for your own trigger

The panel shows the value of a real trigger. A button changes it. If the hotkey changes the value, the panel updates too, through property notifications.

You need desktop EyeAuras with script-hosted Blazor/WebView2 services. Prepare a separate folder with two loaded auras. The first is `RecipeSwitch` with **one Hotkey Is Active** trigger in **Toggle Trigger state on Click** mode. The second is `RecipePanel` with **Actions → On Enter → C# Script**. Choose an unused hotkey, keep suppression off and add no actions to `RecipeSwitch`. Do not put these auras under a condition that unloads them.

1. In `RecipePanel`'s script editor, choose **New file → Component** and name it `MainWindow`. Keep only the single Razor file with the code below. If the template created a code-behind with a duplicate counter, remove it.
2. Through **New file → Component**, create `_Imports.razor` in the project root and replace its contents with the imports below. Through **New file → CSS**, create a file and rename it to `wwwroot/panel.css`. Replace these files and **Script.csx** with the complete contents below. There must be exactly one CSS resource at this logical path.
3. Wait for compilation and click the C# action's **Run**. The path `./RecipeSwitch` finds the neighbouring aura in the same folder. That aura must have exactly one matching trigger.
4. Look at **Trigger value** and click **Toggle trigger**. `False`/`True`, the border and the background should change together. Now press your hotkey. The panel watches the same property and updates without polling.
5. Close the panel or click **Stop**. The component and its change subscription are destroyed together with the window. The next Run reads the trigger's current value: opening the panel does not reset it.

## Script.csx

```csharp
using System;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using PoeShared.Blazor.Wpf;
using RecipePanel;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.Title = "Own trigger panel";
    window.Width = 480;
    window.Height = 320;
    var closed = window.WhenClosed.Take(1).ToTask(cancellationToken);
    window.Show();
    try { await closed; }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
}
```

## _Imports.razor

```razor
@using System.Threading.Tasks
@using AntDesign
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@using ReactiveUI
@using EyeAuras.Scripting.Api
@using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive
```

## MainWindow.razor

```razor
@namespace RecipePanel
@inherits BlazorReactiveComponent
@inject IAuraTreeScriptingApi Tree

<HeadContent>
    <link rel="stylesheet" href="wwwroot/panel.css" />
</HeadContent>
<section class="@panelClass.ToString()">
    <h2>RecipeSwitch</h2>
    <p>Trigger value: @(trigger.TriggerValue?.ToString() ?? "Unknown")</p>
    <button class="btn btn-primary" @onclick="Toggle">Toggle trigger</button>
</section>

@code {
    private IHotkeyIsActiveTrigger trigger;
    private readonly ClassMapper panelClass = new ClassMapper();

    protected override void OnInitialized()
    {
        trigger = Tree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./RecipeSwitch");
        panelClass.Add("recipe-panel")
            .If("is-on", () => trigger.TriggerValue == true)
            .If("is-off", () => trigger.TriggerValue != true);
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
        base.OnInitialized();
    }

    private async Task Toggle()
    {
        trigger.TriggerValue = !(trigger.TriggerValue ?? false);
        await Refresh("panel toggle");
    }
}
```

## wwwroot/panel.css

```css
.recipe-panel {
    padding: 16px;
    border: 3px solid;
    border-radius: 8px;
}
.recipe-panel.is-on { border-color: #21864a; background: #e4f6eb; color: #14251a; }
.recipe-panel.is-off { border-color: #9e5353; background: #f8eaea; color: #331818; }
```


| Part | What it does |
| --- | --- |
| `@inject IAuraTreeScriptingApi Tree` | Gets the tree service from the script context through component DI. |
| `ChangeTrackers.Add(...)` before `base.OnInitialized()` | Subscribes to the existing trigger's notifications before the base seals the list. The base component owns the subscription. |
| `Refresh("panel toggle")` | After the button writes the value, waits for a redraw through the component dispatcher. |
| One stored `ClassMapper` | Keeps stable conditions that pick `is-on` or `is-off` from the same trigger value. |
| `HeadContent` and `wwwroot/panel.css` | Attach the project CSS through the window's file provider. The rules are explicitly limited to `.recipe-panel`: there is no automatic CSS isolation. |

For `null` the panel shows `Unknown` with the off styling. This is the trigger's value, not the aura's overall Active state: the other conditions still apply. Hiding a live window does not dispose it.

[Reactive updates](/en/scripting/blazor-windows/reactive-toggle) explains who owns the subscription. For the look, see [styling choices](/en/scripting/blazor-windows/toggle-styling) and [project CSS](/en/scripting/blazor-windows/toggles-styling-cssfile). If the CSS is not applied, check the resource path and the file provider first, not the trigger code.
