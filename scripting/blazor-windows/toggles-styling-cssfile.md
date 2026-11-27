---
title: 9. Connecting a CSS file – HeadContent
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:12:56.395Z
---
# Put button styles in a CSS file

Move a panel's styling into `Styles.css` so the Razor stays readable. `HeadContent` connects the file to the page; the button still reads and changes its trigger through C#.

Use two loaded auras in one folder: `TargetAura` with **Hotkey Is Active → Toggle Trigger state on Click**, and a separate panel with **C# Overlay** and **Fixed Value → Is Active**. Give the trigger a free hotkey and leave its actions empty for this exercise. `./TargetAura` must resolve to your aura with one such trigger. [The first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive) explains that setup.

1. In your C# Overlay editor, choose **New file → CSS** and name it `Styles`. The project gets `Styles.css`.

![Adding CSS in the earlier editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

2. Replace its generated yellow-background rule with the CSS below.
3. Find the resource's full name and substitute it for `MyScript.Styles.css` in `UserOverlay.razor`.

The full resource name uses the **project's** namespace, not just the component's `@namespace`. For example, `Styles.css` may become `MyScript.Styles.css`, and `Theme/Styles.css` may become `MyScript.Theme.Styles.css`. Do not substitute `BlazorDemo` just because the component uses that namespace.

Leave this complete short entry point in `Script.csx` to list the actual embedded names:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Copy your file's full name from the script log into the indicated path below. `Script` is the top-level script type; this context is not an ordinary class or Razor global. The C# Overlay host exposes the project file provider to WebView2. In this host, full manifest names are relative URLs at the page's base URI; a Windows path or a made-up dynamic-resource prefix is not interchangeable with them. A general `IScriptFileProvider` can be composite, so do not assume it can be cast to `ScriptEmbeddedResourceFileProvider`. That concrete provider's `GetManifestNames()` is another way to inspect names when you actually own one.

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
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<HeadContent>
    <link href="MyScript.Styles.css" rel="stylesheet" />
</HeadContent>

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

4. After compilation with the correct resource name, the button has a lime background, black text and 80% panel width. Click it or use the hotkey: the trigger still changes.

![CSS file connected in the earlier example](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Part | Purpose |
| --- | --- |
| `Styles.css` | Stores the rules. Creating a resource does not itself attach a stylesheet to the document. |
| `HeadContent` | Supplies content to the host-registered `HeadOutlet`. |
| `link rel="stylesheet"` | Gives the browser the stylesheet URL; head insertion and successful file resolution are separate steps. |
| `MyScript.Styles.css` | An example full manifest name. Substitute your actual file name, including any folder-derived parts. |
| `.demo-panel .custom-button` | Restricts matching to this panel. The file is not automatically isolated from other components in the same document. |

`[Inject]` obtains the tree service from the component's host. Script.csx globals are not implicit Razor members. The button reads and writes the actual `TriggerValue`, displaying `null` as off. `WhenAnyValue` also updates it after a hotkey change. Add trackers before `base.OnInitialized()`; the component owns their subscription and disposes it when destroyed, not merely when hidden. Other aura conditions still determine overall activity. See [reactive updates](/en/scripting/blazor-windows/reactive-toggle) for the notification and polling alternatives.

Blazor manages `HeadContent` with the component. Coordinate it at a common owner if several components provide head content; it is not a global-theme switching API. Selector specificity and rule order still decide the final appearance.

<details>
<summary>Inspect the browser head</summary>

Open the C# Overlay developer tools with **F12**. Look for your link in `head`. If the link exists but styling is unchanged, check whether the full resource URL loaded and whether the selector matches. A link tag alone does not prove a successful load.

An earlier host used a head resembling this snapshot. It illustrates the host-supplied libraries; do not paste the whole list into your component or assume the list is identical in every version:

```html
<head>
    <meta charset="utf-8">
    <base href="/">

    <link href="_content/AntDesign/css/ant-design-blazor.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/bootstrap.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/bootstrap-extra.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/app.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/font-awesome6.min.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/font-play-regular.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Controls/assets/css/main-colors.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Controls/assets/css/main-style.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Controls/assets/css/main-ant-blazor.css" rel="stylesheet">
    <link href="_content/EyeAuras.Blazor.Shared/EyeAuras.Blazor.Shared.bundle.scp.css" rel="stylesheet">
    <link href="EyeAuras.styles.css" rel="stylesheet">
</head>
```

The CSS template initially contains this separate whole-document example; replace it when styling only the button:

```css
body, html {
    background: yellow;
}
```

See [HeadContent in Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0) and the [window's BlazorContentControl](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/BlazorContentControl.cs).

</details>

For code-controlled loading after rendering, use [LoadCss](/en/scripting/blazor-windows/toggles-styling-css-load).
