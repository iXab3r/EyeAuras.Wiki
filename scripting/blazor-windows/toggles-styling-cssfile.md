---
title: 9. Connecting a CSS file – HeadContent
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:12:56.395Z
---

# CSS files
CSS is usually distributed as separate files containing class definitions; sometimes there are thousands of them!

## The HTML `head` tag
If you click on a C# overlay and press `F12` (open dev tools), at the top of the HTML you'll see something like:
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
This is where additional styles and sometimes scripts are declared. The browser processes them right at startup so it knows what to load. During rendering it uses the styles to control layout. Our style file has to end up here somehow. But first, let's simply create it.

## Creating a CSS file
In the overlay script click `New` -> `CSS` and enter a name. We'll use the default name `Styles`. You can choose any name, just remember to update the path in code accordingly.

![New CSS](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

## Default CSS
By default EyeAuras creates a file like:
```css
body, html {
    background: yellow;
}
```
This would color the window/overlay background yellow. But merely creating a CSS file doesn't apply it—you must also connect it so the browser knows where to find it.

## HeadContent – declarative approach
In Blazor the header content is controlled via [HeadContent](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0). It allows you to append extra CSS files to the HTML header when needed.

Your component loads, finds `HeadContent` and it appends links to the `head` element—after that the browser handles everything. For example:

```csharp
<HeadContent>
    <link href="MyScript.Styles.css" rel="stylesheet"/>
</HeadContent>
```
This code connects `Styles.css` to the header. I spared your eyes and inserted the code for a green button instead of the default CSS without changing the background.

![Demo](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

Create an aura with C# Overlay and a sibling aura named `TargetAura`. Add a
`HotkeyIsActive` trigger to the target, configure a toggle hotkey, and keep the
target loaded. `./TargetAura` is relative to the overlay context; adjust it to
your tree. If several compatible triggers exist, the first is selected.

Replace the two component bodies below, preserving their matching generated
`namespace` and `@namespace` directives. They are parts of one public partial
class. `[Inject]` supplies `AuraTree`; fields in `Script.csx` are not shared automatically.

## Prepare the CSS resource

Add `Styles.css` using `New` → `CSS` and save the content below as a script
resource. Replace `MyScript` in `MyScript.Styles.css` with the project namespace.
A nested `Theme/Styles.css` becomes `MyScript.Theme.Styles.css`.
Manifest resource names appear in script preparation diagnostics and in
`ScriptEmbeddedResourceFileProvider.GetManifestNames()` on a concrete provider.
`GetService<IScriptFileProvider>()` may return a composite, so do not assume that
cast works. Use the complete resource name instead of a guessed filename suffix.
The window host exposes the script file provider to WebView2.

## UserOverlay.cs
```csharp
using System;
using System.Reactive.Linq;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public bool TriggerIsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue = value;
    }

    protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
}
```

## UserOverlay.razor
```razor
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<HeadContent>
    <link href="MyScript.Styles.css" rel="stylesheet"/>
</HeadContent>

<h3 class="text-center shadow-1">CSS via HeadContent</h3>

<div class="text-center mt-4">
    <ToggleButton
        @bind-IsChecked="@TriggerIsActive"
        Class="btn custom-button">
                Trigger is Active
    </ToggleButton>
</div>
```

## Styles.css
```css
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

---

## Breakdown
## UserOverlay.razor
```html
<HeadContent>
    <link href="MyScript.Styles.css" rel="stylesheet"/>
</HeadContent>
```
The key part that connects the styles.

## Styles.css
```css
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```
The result is a green button with black text and 80% of its parent's width.
Final styling depends on selector specificity and rule order; this example does
not guarantee overriding every host style.

Clicking the button writes `TriggerValue`; the hotkey changes the same trigger.
The timer in `ChangeTrackers` rereads state roughly once per second, so external
changes appear with that delay. Add the timer before `base.OnInitialized()`,
which seals the tracker list and binds subscriptions to component anchors.
Hiding the window is not the same as disposing the component.

The WPF host registers `HeadOutlet` at its page's `headOutlet` element, and C# Overlay supplies `IScriptFileProvider` as `AdditionalFileProvider`. Head insertion and CSS path resolution are separate: the link must reach head and the provider must contain the resource.

[BlazorContentControl](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/BlazorContentControl.cs).
