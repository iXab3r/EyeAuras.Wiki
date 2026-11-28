---
title: 2. BlazorWindows and WebView2
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T00:47:25.172Z
---
# Choose a window for your panel

A settings panel usually needs a title bar, and you want to move and resize it. An indicator on top of another window needs no frame. In **C# Overlay** these are two modes of the same window, and the component inside stays the same.

[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2) shows HTML/CSS inside a native window. Blazor connects that UI to C#, and Blazor Windows puts the component into an EyeAuras window. The WebView2 Runtime must be installed for this to work.

![WebView2 inside an EyeAuras window](https://s3.eyeauras.net/media/2025/05/WebView2.drawio%20(1).png)

## Compare Window and Overlay

You need your own **C# Overlay** with its generated counter. Keep its aura loaded and active, for example with **Fixed Value → Is Active**. Older screenshots call this overlay v3.

![Overlay choices in the earlier menu](https://s3.eyeauras.net/media/2025/05/mIYLrG2yj2.png)

1. Open the overlay settings. Under **Window Settings**, select **Window** and set its title to `My panel`.
2. Under **Position**, set width `400` and height `200`. Turn **Is Locked** off so you can move and resize the window.
3. Under **Visual style**, turn **Click-Through mode** off so the button accepts clicks. Leave **Opacity** at `100%`.
4. Click **Click Me** and the counter goes up. Then switch **Window Settings → Overlay**. The title bar and system frame disappear, and the same counter stays on screen.

![Window mode with a title bar](https://s3.eyeauras.net/media/2025/05/Njy7t9XEg2.png)
![The same content in Overlay mode](https://s3.eyeauras.net/media/2025/05/R432QeysKh.png)

| Setting | How to choose |
| --- | --- |
| `Window` | A framed panel with a title bar. Its close button is disabled in C# Overlay, because the aura controls visibility. |
| `Overlay` | A borderless panel. In this mode the window always stays above other windows. |
| `Always On Top` | Keeps the window above others in Window mode. In Overlay this is already on. |
| `Is Locked` | Stops you from resizing the window or moving it the usual way. Buttons inside the component keep working. |
| `Moveable even if Locked` | Lets you move a locked window. |
| `Click-Through mode` | Passes input through a locked C# Overlay when the main EyeAuras window is not active. Leave it off for an interactive panel. |
| `Opacity`, background and border | Change how the window looks. A transparent window does not start passing input through on its own. |
| Aura activity | Decides whether the overlay is shown. When the window is hidden, it and the component may stay alive. |

Position and size are set here:

![Position settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_O2I6OKwmjq.png)

Background, border, opacity and click-through are in the group next to it:

![Visual settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_VfFC6J8Kgd.png)

The mode, title, **Always On Top** and size limits are in **Window Settings**:

![Window settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_ohz05OLVxV.png)

If the panel did not appear, first check that the aura is loaded and active, then look for compilation errors. If you can see the panel but cannot click it, check **Click-Through mode**.

## The component and its window

The C# Overlay editor compiles the project and picks the public component type to show. `UserOverlay.razor` describes the content, and the settings above describe the window. `Script.csx` runs as the entry point. The overlay appears only after it finishes, so an endless wait in `Script.csx` stops the overlay from showing.

A component gets services through injection. Script globals such as `GetService` and `cancellationToken` are not global names in Razor. The [next page](/en/scripting/blazor-windows/3-hello-world) has complete component files. A [separate example](/en/scripting/blazor-windows/getting-started) opens a window from a C# Script action.

<details>
<summary>How to read old v2 and v3 examples</summary>

![Earlier C# Overlay v3 editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_TqJxUFKYNe.png)

`C# Overlay v2 (legacy)` is for older projects. For a new example, use the current C# Overlay.

![Earlier v2 editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_DKdQydbTcq.png)
![Window appearance in v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_AvrTCKw3p6.png)
![Overlay appearance in v2](https://s3.eyeauras.net/media/2025/05/n02buCY4RI.png)

The [CsharpAuraOverlay implementation](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.CsScriptAuras/Overlays/CsharpOverlay/CsharpAuraOverlay.cs) sets the window options and ties visibility to the aura's state. The [earlier implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.CsScriptAuras/Overlays/CsharpOverlay/CsharpAuraOverlay.cs) goes with the older examples.

</details>
