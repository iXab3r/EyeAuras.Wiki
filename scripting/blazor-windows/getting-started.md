---
title: Where to start?
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags:
editor: markdown
dateCreated: 2024-11-04T00:26:45.232Z
---

# Blazor in the context of EyeAuras
As of November 2024 there are two main ways to use Blazor in EA.

## C# Overlay
Until recently (Oct 2024) this was the only option. It's simple: create an aura, add a C# Overlay and… that's it. EA takes care of drawing a window on the screen with your code inside. Otherwise it's a regular overlay: you can specify display conditions via triggers, adjust color, background, etc.

Here are a couple of overlay examples:
![D](https://i.imgur.com/iaKm2Br.png) ![TL](http://files.eyesquad.net/screenshots/31-10-2024/1YWZKXCaFhEh7SNnSx8YMWjAf.png)

### Example
Let's make a tiny overlay with a button and counter.
- Create an aura
- Add C# Overlay
![Add C# Overlay](https://s3.eyeauras.net/media/2024/11/msedge_zVrveCuFgBbtBB68.png)
- That's it—the overlay with a clickable button is rendered
![C# Overlay Example](https://s3.eyeauras.net/media/2024/11/Code_MJvkplH0Iiqmm9SV.png)

> IMPORTANT! The text editor used in this overlay will soon be replaced. Because of that I won't dig into its structure and instead recommend taking a look at option #2—scripts.
{.is-info}

## C# Script Action
Now the main course. You can create not just one or two overlays controlled by triggers, but an entire window system driven by scripts. They appear wherever and whenever you want, look however you like. EA relieves you from much of the headache typical of WPF or WinForms, especially around multithreading.

### Example
Let's see how scripts can work with windows.
- Create an aura
- Add **OnEnter** **C# Script** action
![OnEnter C#](https://s3.eyeauras.net/media/2024/11/EyeAuras_xCVTs8bdg1Y7ZU8T.png)
- Create a new Razor Component, keep the default name **UserComponent**
![New Razor Component](https://s3.eyeauras.net/media/2024/11/EyeAuras_I6MYDieptaZe5a8u.png)
- In **Script.csx** add:
```csharp
var window = GetService<IDialogWindowUnstableScriptingApi>() // get DialogWindow API
    .CreateWindow<UserComponent>() //create new window with UserComponent inside
    .AddTo(ExecutionAnchors); //destroy when script is stopped

window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
window.ShowDialog();
```
- Press **Run**—here's your first dialog window using the Blazor Windows API! Note that the script keeps running while the window is open, but stopping the script closes the window.
![Blazor window](https://s3.eyeauras.net/media/2024/11/EyeAuras_fmFnsjgMCW8P6Z4b.png)

### What is IDialogWindowUnstableScriptingApi?
This is the main interface intended for interacting with dialog windows. There are alternatives, but currently it's the highest-level and safest option—it takes care of unloading windows when an aura unloads, cleaning up resources, etc. It's called **Unstable** not because it's bad but because, being new, it may have breaking changes. Eventually it will become **Stable**.

