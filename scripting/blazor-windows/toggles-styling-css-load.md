---
title: 10. Connecting a CSS file – LoadCss
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---
# Load a stylesheet after the component appears

Sometimes C# has to decide when to connect a stylesheet. `IJsPoeBlazorUtils.LoadCss` does that. In this example it styles a button after the first render, when the browser's JS context is available.

You need two loaded auras in one folder. `TargetAura` has **Hotkey Is Active → Toggle Trigger state on Click**. A separate panel aura has **C# Overlay** and **Fixed Value → Is Active**. Give the trigger a free hotkey. It needs no actions. The path `./TargetAura` must lead to your aura with one such trigger. [The first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive) shows how to build the button itself.

1. In C# Overlay, choose **New file → CSS → Styles** and save the CSS below in it.
2. Find out the file's full resource name. In `UserOverlay.cs`, replace `MyScript.Styles.css` with that name.

The full resource name includes the **project's** namespace, not just the component's `@namespace`. For example, `Styles.css` may be called `MyScript.Styles.css`, and `Theme/Styles.css` may be called `MyScript.Theme.Styles.css`. Do not put in `BlazorDemo` just because the component uses that namespace.

To find out the real name, leave this short code in `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Copy the full name of your `Styles.css` from the script log into the path marked below. `Script` here is the top-level script type. An ordinary class or Razor has no such global. The full name works as a relative URL from the page's base URI, so a Windows path will not work in its place.

3. Replace both component files with the code below. The namespace is the same in both. This version needs no `HeadContent` link.

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

    [Inject]
    public PoeShared.Blazor.Services.IJsPoeBlazorUtils BlazorUtils { get; set; }

    private IHotkeyIsActiveTrigger trigger;
    private bool IsActive => trigger.TriggerValue ?? false;

    protected override void OnInitialized()
    {
        trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
        base.OnInitialized();
    }

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        await BlazorUtils.LoadCss("MyScript.Styles.css");
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

<div class="demo-panel">
    <ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
                  Class="btn custom-button">
        Trigger: @(IsActive ? "on" : "off")
    </ToggleButton>
</div>
```

## Styles.css

```css
.demo-panel .custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

4. After compilation and the first render, the button gets a lime background, black text and 80% of the panel's width. Until the CSS loads, it may show its default look for a moment.

![Styling after CSS loading in the earlier example](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Part | What it does |
| --- | --- |
| `[Inject] IJsPoeBlazorUtils` | Gets the window's browser utility service. The component does not own this shared service and does not dispose it. |
| `OnAfterFirstRenderAsync` | Runs after the first render, when the JS context is available. Await the asynchronous calls. |
| `Task LoadCss(string cssPath)` | Adds a stylesheet link through JS. Returns a task, not an object you could use to remove the stylesheet later. |
| Full resource name | A URL of a resource from your project, not any Windows file path. |
| `.demo-panel .custom-button` | A rule for this panel only. The loaded CSS itself applies to the whole document of the window. |

The button reads and writes the real `TriggerValue` and shows `null` as off. Thanks to `WhenAnyValue` it also updates after a hotkey press. The details and a timer-based variant are in [reactive updates](/en/scripting/blazor-windows/reactive-toggle).

You can move the same awaited call into a button handler if you need the styling later. When the component is disposed, a stylesheet loaded this way is not removed. To connect a stylesheet right in the markup, use [HeadContent](/en/scripting/blazor-windows/toggles-styling-cssfile). The stages of a component's life are described in [Blazor lifecycle](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).

<details>
<summary>Repeated calls and edited stylesheets</summary>

The loader remembers each path with a `loading`, `loaded` or `failed` status. A second call for the same path returns at once. It does not start a new load, does not wait for one already running and does not confirm that the earlier attempt worked. So a repeated `LoadCss` call cannot pick up an edited file or retry after an error. For a clean test, use a newly created window with the correct resource path.

</details>
