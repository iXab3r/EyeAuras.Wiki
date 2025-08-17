---
title: 1. What is Blazor and how to use it in EyeAuras
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2025-05-11T13:31:15.490Z
---

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) is a powerful tool that helps build convenient and beautiful interfaces in C#. It was originally intended for web development, but we will use it to build UI for our scripts—settings panels, overlays, pop‑ups. All of this can be done through the API available to you.

# Examples from this series
All examples can be downloaded [here](https://tinyurl.com/msfhaupc). I recommend downloading the whole pack rather than trying to import it into the current version.

# Creating our first overlay
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

Let's create our first component and break down its parts. It will contain text and a button that increases a counter when clicked.

```html
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
