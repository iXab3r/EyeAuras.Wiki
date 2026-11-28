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

If styling rules make the Razor hard to read, move them into `Styles.css`. `HeadContent` connects the file to the page. The button still reads and changes its trigger through C#.

You need two loaded auras in one folder. `TargetAura` has **Hotkey Is Active → Toggle Trigger state on Click**. A separate panel aura has **C# Overlay** and **Fixed Value → Is Active**. Give the trigger a free hotkey. It needs no actions. The path `./TargetAura` must lead to your aura with one such trigger. [The first toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive) shows how to build the button itself.

1. In your C# Overlay editor, choose **New file → CSS** and name the file `Styles`. You get `Styles.css` in the project.

![Adding CSS in the earlier editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

2. Replace its contents with the CSS below. The template sets a yellow background, and the button does not need that rule.
3. Find out the full resource name and put it in place of `MyScript.Styles.css` in `UserOverlay.razor`.

The full resource name includes the **project's** namespace, not just the component's `@namespace`. For example, `Styles.css` may be called `MyScript.Styles.css`, and `Theme/Styles.css` may be called `MyScript.Theme.Styles.css`. Do not put in `BlazorDemo` just because the component uses that namespace.

To find out the real name, leave this short code in `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Copy the full name of your `Styles.css` from the script log into the path marked below. `Script` here is the top-level script type. An ordinary class or Razor has no such global. The full name works as a relative URL from the page's base URI, so a Windows path will not work in its place.

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

4. Wait for compilation with the correct resource name. The button gets a lime background, black text and 80% of the panel's width. A click and the hotkey still toggle the trigger.

![CSS file connected in the earlier example](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Part | What it does |
| --- | --- |
| `Styles.css` | Holds the rules. Adding the file is not enough: it is not connected to the document yet. |
| `HeadContent` | Passes content to the `HeadOutlet` that the window registers. |
| `link rel="stylesheet"` | Gives the browser the stylesheet URL. Finding the file behind that URL is a separate step. |
| `MyScript.Styles.css` | A sample full manifest name. Replace it with the real name of your file. Folders are part of the name too. |
| `.demo-panel .custom-button` | Limits the rule to this panel. The file is not isolated from other components in the same document automatically. |

The button reads and writes the real `TriggerValue` and shows `null` as off. Thanks to `WhenAnyValue` it also updates after a hotkey press. The details and a timer-based variant are in [reactive updates](/en/scripting/blazor-windows/reactive-toggle).

Blazor manages `HeadContent` together with the component. If several components use `HeadContent` at the same time, coordinate it in their common owner.

<details>
<summary>Inspect the browser head</summary>

In C# Overlay, open the developer tools with **F12** and look for your link in `head`. If the link is there but the styling has not changed, check that the resource loads by its full name and that the selector matches.

The `head` of an earlier version looked roughly like this. These are libraries the window loads itself, and the list depends on the version:

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

The CSS template starts with this rule for the whole document. Replace it if you only style the button:

```css
body, html {
    background: yellow;
}
```

See [HeadContent in Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0) and the [window's BlazorContentControl](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/BlazorContentControl.cs).

</details>

If C# has to choose when to connect the file, use [LoadCss](/en/scripting/blazor-windows/toggles-styling-css-load).
