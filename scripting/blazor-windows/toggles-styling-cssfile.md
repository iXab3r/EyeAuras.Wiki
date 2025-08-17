---
title: 9. Connecting a CSS file – HeadContent
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
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
    <link href="Styles.css" rel="stylesheet"/>
</HeadContent>
```
This code connects `Styles.css` to the header. I spared your eyes and inserted the code for a green button instead of the default CSS without changing the background.

![Demo](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

## UserOverlay.cs
```csharp
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
```html
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<HeadContent>
    <link href="Styles.css" rel="stylesheet"/>
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

# Breakdown
## UserOverlay.razor
```html
<HeadContent>
    <link href="Styles.css" rel="stylesheet"/>
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
Our style storage. There's only one class now, but you can create as many as you like. User styles are connected last, giving you full control to completely change the interface if needed.
