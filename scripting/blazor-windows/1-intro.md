---
title: 1. What is Blazor and how to use it in EyeAuras
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T13:31:15.490Z
---

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) is a powerful tool that helps build convenient and beautiful interfaces in C#. It was originally intended for web development, but we will use it to build UI for our scripts—settings panels, overlays, pop‑ups. All of this can be done through the API available to you.

# Interfaces in EyeAuras

## Examples from this series
All examples can be downloaded [here](https://tinyurl.com/msfhaupc). I recommend downloading the whole pack rather than trying to import it into the current version.

## Creating our first overlay
It's very easy:
- Create a new aura
![New aura](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_KBChU81nd6.png)
- Add `C# Overlay v3`
![New Overlay](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_xVFX70YeoA.png)
- Done

At this point you already have a fully working interactive UI.
![v3](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_UVQrNGj5te.png)

If you click the `Click Me` button, the counter in the program will start updating!
![clickme](https://s3.eyeauras.net/media/2025/05/ltZnDlxcvJ.gif)

## Why Blazor?
[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) is great for building interfaces because it combines the flexibility and performance of C# with the incredible capabilities of HTML/CSS and JavaScript. Over the last two decades no stack has received as much investment from the largest companies in the world. As a result we now have a tool that lets us render virtually anything you can imagine. Check out https://codepen.io/ for inspiring examples of what this “magnificent trio” can do.

Now that we've looked at the strengths of HTML/CSS/JS, let's understand the role C#/Blazor plays in all this. In short, Blazor lets us generate HTML and bridge the world of web programming with C#. Our application is split into two parts: [Razor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-8.0) and the C# backend. Razor is responsible for rendering data, and C# for preparing it.

EyeAuras—and therefore your scripts—lives at the intersection of these two technologies. Let's dive into the essentials you'll work with.

## [HTML](https://www.w3schools.com/html/)
It's the markup language on which the entire Internet is built. It controls where elements like text, buttons, tables, etc. appear. You use HTML to define the page layout that you later style with...

## [CSS](https://www.w3schools.com/html/html_css.asp)
**C**ascading **S**tyle **S**heets control how your buttons, text and everything else look. They change colors, transparency, animations and many other details.

## [Razor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-8.0)
Razor is a markup language from Microsoft that lets you mix HTML, CSS and C# in one file.

Replace `UserOverlay.razor` in the created overlay with the example below. Keep its generated `@namespace` directive. Remove the old counter fields and methods from `UserOverlay.cs` if they duplicate these names; all counter logic in this variant lives in Razor.

```razor
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h1>Counter</h1>

<p>Current count: @currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private void IncrementCount() => currentCount++;
}
```
![Counter](https://s3.eyeauras.net/media/2024/11/msedge_Wvy12LEOv1bGyAOA.gif)

In this small piece of code HTML and C# live together and complement each other. C# defines what happens when we click the button, while HTML/CSS define how everything looks.

Blazor calls the handler and refreshes the count after a click. This is component-instance state; recreating the component resets it to zero. Continue with [overlay hosting](/en/scripting/blazor-windows/2-webview) and [Razor/code-behind](/en/scripting/blazor-windows/3-hello-world).

The tutorial link leads to [Tutorial — Blazor Windows, revision 3](https://eyeauras.net/share/S20250511162645vYh4n3mqSLm0/3), created for EyeAuras **1.7.8354.0**. This is a historical pack; its download page does not establish file compatibility with the current editor.

The current generator creates `UserOverlay.razor` with `@namespace` and `UserOverlay.cs` with the same `namespace`. Preserve these lines when replacing the example body: class name and namespace must match between both parts. The current entity is named `C# Overlay`; older screenshots use the v3 suffix.

[RazorComponentTemplate](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Blazor.Shared/CodeEditor/Templates/RazorComponentTemplate.cs).
