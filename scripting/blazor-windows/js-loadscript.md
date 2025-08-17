---
title: 11. Connecting JavaScript
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---

# JavaScript and why we need it in 2025
JS turned static pages into interactive portals long ago. Today so many libraries and frameworks are built on top of JS that it's harder to find places where it's *not* used.

Sooner or later you'll want to use a JS library to enhance user experience. For example, we'll take an absolutely useless but pretty snippet from https://codepen.io/—a creative playground for many talented people. Highly recommended.

So, how do we load JavaScript in Blazor?

## LoadScript
Just like with [CSS](/scripting/blazor-windows/toggles-styling-cssfile), we can use `IJsPoeBlazorUtils` to load a script whenever we need.
```csharp
/// <summary>
/// Loads a JavaScript file dynamically and returns a promise that completes when the script loads.
/// </summary>
Task LoadScript(string scriptPath);
```
> IMPORTANT: This method is for loading plain JavaScript. If you want to load [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) use [another approach](https://learn.microsoft.com/en-us/aspnet/core/blazor/javascript-interoperability/location-of-javascript?view=aspnetcore-9.0).

## What do we want to achieve?
Since this is just a demo of script loading (and scripts can do anything), we're not aiming for functionality—just an animation.

![Demo](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)

## Code
As examples grow larger, I'll show only the relevant parts worth explaining. You can find the rest by downloading the sample project from [this page](https://wiki.eyeauras.net/ru/scripting/blazor-windows/1-intro).

---

# Code review

## UserOverlay.cs
```csharp
[Inject]
public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }
```
Just like `IAuraTreeScriptingApi`, we inject another service—this time to load CSS and scripts.

```csharp
protected override async Task OnAfterFirstRenderAsync()
{
    await base.OnAfterFirstRenderAsync();
    await PoeBlazorUtils.LoadCss("Styles.css");
    await PoeBlazorUtils.LoadScript("https://raw.githack.com/strangerintheq/rgba/0.0.8/rgba.js");
    await PoeBlazorUtils.LoadScript("Script.js");
}
```
In one place we load styles and two scripts. One script is on a CDN (`rgba.js`), the other is local (`Script.js`). Mix approaches as needed, though for EyeAuras local storage is generally preferred.

Note that we load everything right after the first render. As a programmer you must decide which scripts to load and when. Here I chose `OnAfterFirstRenderAsync`, but another example might use `OnInitializedAsync` or even a mix. For more about the component lifecycle see [this Microsoft article](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).

```css
canvas {
    position: absolute;
    width: 100% !important;
    left: 0;
    top: 1.5em;
    height: calc(100% - 1.5em) !important;
}
```
A bit of CSS magic:
- `position: absolute;` — draw the element in absolute coordinates, independent of its place in the tree. Common for graphics, pop‑ups etc.
- `width: 100% !important;` — take 100% width; `!important` overrides other styles. Needed here because `rgba.js` sets canvas size itself.
- `left: 0;` — with absolute positioning we usually specify the location; here we pin it to the left edge.
- `top: 1.5em;` — add top padding to leave room for the header. There's a more reliable way, but for the demo this is fine.
- `height: calc(100% - 1.5em) !important;` — combined from everything above: "Important! Element height must be 100% of page height minus 1.5em (header)."
