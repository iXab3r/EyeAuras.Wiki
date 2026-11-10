---
title: "Build a styled panel for your own trigger"
description: "Observe one loaded Hotkey Is Active trigger, switch it from Razor and style its current value through a project CSS file."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Build a styled panel for your own trigger

Show one real trigger value in a small control panel. A button writes the trigger; property notifications also refresh the panel when its configured hotkey changes it.

Use desktop EyeAuras with script-hosted Blazor/WebView2 services. Prepare a dedicated folder with two loaded auras: `RecipeSwitch` containing **one Hotkey Is Active** trigger in **Toggle Trigger state on Click** mode, and `RecipePanel` containing **Actions → On Enter → C# Script**. Choose an unused hotkey, keep suppression off, and leave `RecipeSwitch`'s actions empty. Both auras stay outside any condition that would unload them.

1. In `RecipePanel`'s script editor, add **New file → Component**, name `MainWindow`. Keep only the single-file component implementation below; remove a duplicate generated code-behind counter if the template created one.
2. Through **New file → Component**, create `_Imports.razor` at the project root and replace its generated contents with the imports below. Create **New file → CSS**, then rename it to `wwwroot/panel.css`. Replace these files and **Script.csx** with the complete contents below. Keep exactly one CSS resource at this logical path.
3. Wait for compilation and click the C# action's **Run**. `./RecipeSwitch` resolves the neighbouring aura in this folder and requires its single matching trigger.
4. Read **Trigger value** and click **Toggle trigger**. `False`/`True` and the panel's border/background should change together. Toggle the configured hotkey: the same property observation updates the panel without polling.
5. Close the panel or use **Stop**. Window disposal destroys the component and releases its owned tracker subscription. A later Run reads the trigger's current value; opening the panel does not reset it.

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


| Part | Responsibility |
| --- | --- |
| `@inject IAuraTreeScriptingApi Tree` | Gets the script-context tree service through component DI; it is not a top-level global. |
| `ChangeTrackers.Add(...)` before `base.OnInitialized()` | Registers the existing trigger's notifications before the base seals the list. The base owns the resulting subscription. |
| `Refresh("panel toggle")` | Awaits a redraw through the component dispatcher after a button write. |
| One stored `ClassMapper` | Keeps stable predicates; rendering selects `is-on` or `is-off` from the same trigger value. |
| `HeadContent` and `wwwroot/panel.css` | Attach project CSS through the window's file provider. Rules are explicitly limited to `.recipe-panel`, not automatically CSS-isolated. |

`Unknown` is displayed for `null`, using the off styling. This is the trigger's value, not a guarantee of the aura's overall Active state: other conditions still apply. The program relies on the existing trigger's notifications, not on Fody weaving a dynamically compiled helper class. Hiding a live window is not disposal.

[Reactive updates](/en/scripting/blazor-windows/reactive-toggle) explain the tracker lifetime; [styling choices](/en/scripting/blazor-windows/toggle-styling) and [project CSS](/en/scripting/blazor-windows/toggles-styling-cssfile) explain presentation. If the CSS is missing, check the resource path and matching provider before changing the trigger code.
