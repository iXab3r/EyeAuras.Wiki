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

Use `IJsPoeBlazorUtils.LoadCss` when C# should choose when to connect a stylesheet. This example applies your button's rules after the first render, when the browser's JS context is available.

Use two loaded auras in one folder: `TargetAura` with **Hotkey Is Active → Toggle Trigger state on Click**, and a separate panel with **C# Overlay** and **Fixed Value → Is Active**. Give the trigger a free hotkey and leave its actions empty for this exercise. `./TargetAura` must resolve to your aura with one such trigger. [The first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive) explains that setup.

1. In C# Overlay, choose **New file → CSS → Styles** and save the CSS below.
2. Find its full resource name and substitute it for `MyScript.Styles.css` in `UserOverlay.cs`.

The full resource name uses the **project's** namespace, not just the component's `@namespace`. For example, `Styles.css` may become `MyScript.Styles.css`, and `Theme/Styles.css` may become `MyScript.Theme.Styles.css`. Do not substitute `BlazorDemo` just because the component uses that namespace.

Leave this complete short entry point in `Script.csx` to list the actual embedded names:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Copy your file's full name from the script log into the indicated path below. `Script` is the top-level script type; this context is not an ordinary class or Razor global. The C# Overlay host exposes the project file provider to WebView2. In this host, full manifest names are relative URLs at the page's base URI; a Windows path or a made-up dynamic-resource prefix is not interchangeable with them. A general `IScriptFileProvider` can be composite, so do not assume it can be cast to `ScriptEmbeddedResourceFileProvider`. That concrete provider's `GetManifestNames()` is another way to inspect names when you actually own one.

3. Replace both component files below, keeping the namespace consistent. This version does not also need a `HeadContent` link.

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

4. After compilation and the first render, the button receives a lime background, black text and 80% panel width. It may briefly show its default appearance before CSS loads.

![Styling after CSS loading in the earlier example](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Mechanism | How to use it |
| --- | --- |
| `[Inject] IJsPoeBlazorUtils` | Gets the host's browser utility service. The component borrows it and does not dispose the shared service. |
| `OnAfterFirstRenderAsync` | Runs after the first render; await the asynchronous calls. This is not a pre-render initialisation hook. |
| `Task LoadCss(string cssPath)` | Adds a stylesheet link through JS. Returns a task, not a handle that removes the stylesheet on disposal. |
| Full resource name | A URL for the project's served resource, not an arbitrary Windows filesystem path. |
| `.demo-panel .custom-button` | Matches this panel, while the loaded CSS remains part of the window's document. |

`[Inject]` obtains the tree service from the component's host. Script.csx globals are not implicit Razor members. The button reads and writes the actual `TriggerValue`, displaying `null` as off. `WhenAnyValue` also updates it after a hotkey change. Add trackers before `base.OnInitialized()`; the component owns their subscription and disposes it when destroyed, not merely when hidden. Other aura conditions still determine overall activity. See [reactive updates](/en/scripting/blazor-windows/reactive-toggle) for the notification and polling alternatives.

The same awaited call can run in a button handler when you want to load styling later. Disposing the component does not automatically remove a stylesheet loaded this way. [HeadContent](/en/scripting/blazor-windows/toggles-styling-cssfile) is the declarative alternative. See [Blazor lifecycle](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0) for the distinction between initialisation and rendering.

<details>
<summary>Repeated calls and edited stylesheets</summary>

The loader caches each path with `loading`, `loaded` or `failed` status. Calling it again for that path returns immediately: it does not start a reload, wait for an existing load or confirm that an earlier attempt succeeded. Do not use repeated `LoadCss` calls as a change detector or retry mechanism. For a clean first test, use a newly created window with the correct resource path.

</details>
