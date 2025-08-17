---
title: 2. BlazorWindows and WebView2
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2025-05-11T00:47:25.172Z
---

# What are Blazor Windows and how do they work?
In the [introductory part of the series](/scripting/blazor-windows/getting-started) I talked about Blazor, HTML and CSS. To show all this beauty on screen we need a tool that turns our scripts and code into buttons, forms and more. This is where [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2)—an embeddable browser from Microsoft—comes into play.

![WebView2](https://s3.eyeauras.net/media/2025/05/WebView2.drawio%20(1).png)
You can think of `WebView2` as the part of the application responsible for rendering our components.

`BlazorWindows` is the framework that ties everything together—WebView, HTML, C# and CSS—allowing you to create interactive windows. This technology powers overlays and many parts of EyeAuras.

# What's the difference between windows and overlays?
Overlays are a variety of windows: it's the same window but with different display options. For example, an overlay is usually drawn on top of other windows.

EyeAuras has several overlay types:
![Overlays](https://s3.eyeauras.net/media/2025/05/mIYLrG2yj2.png)

# C# Overlay
This is one of the main ways to quickly create an interface in EyeAuras.
The idea is simple:
- we have a configured overlay window with a position, name and visibility condition. More on the contents below.
- we have a script written in EyeAuras that describes the interface using Razor/HTML/CSS
- EyeAuras compiles this script and we get a **library** that lets us build the UI rendered in the overlay with **WebView2**

## Overlay settings
Every overlay has:
- position and size, and a flag whether the user can move it (`IsLocked`)
![Overlay position](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_O2I6OKwmjq.png)
- visual style settings—transparency, border thickness and color, etc.
![Overlay visual style](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_VfFC6J8Kgd.png)
- window settings
![Overlay window style](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_ohz05OLVxV.png)
The most important toggle here is the window type—Overlay or Window.
- Window – almost a normal window except there is no close button. It has an icon, title, can be dragged by the title bar, etc.
- Overlay – a borderless window without drag area or system buttons.
![Window](https://s3.eyeauras.net/media/2025/05/Njy7t9XEg2.png) ![Overlay](https://s3.eyeauras.net/media/2025/05/R432QeysKh.png)

## C# Overlay v3
The current overlay version using scripting engine V3. You have access to everything available in scripts—custom Razor controls, NuGet integration, EyeAuras services, etc. Every C# overlay is a small application.

![v3](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_TqJxUFKYNe.png)

## C# Overlay v2 (deprecated)
Mentioned only briefly since it is no longer recommended. It will be removed in one of the upcoming versions and exists only for backward compatibility, offering no advantages over modern V3.

![v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_DKdQydbTcq.png)
Visually it looks like this.
![Window](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_AvrTCKw3p6.png) ![Overlay](https://s3.eyeauras.net/media/2025/05/n02buCY4RI.png)
