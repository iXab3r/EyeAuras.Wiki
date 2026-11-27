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

A settings panel benefits from a title bar and resizing. An indicator over another window may need no frame. **C# Overlay** offers both through the same native window host.

[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2) renders HTML/CSS inside a native window. Blazor connects that UI to C#; Blazor Windows supplies EyeAuras window hosting. The installed WebView2 Runtime is a prerequisite for this native host. A browser page or an SDK reference alone does not provide the window or register its services.

![WebView2 inside an EyeAuras window](https://s3.eyeauras.net/media/2025/05/WebView2.drawio%20(1).png)

## Compare Window and Overlay

Use your own **C# Overlay** with its generated counter. Keep its aura loaded and active, for example with **Fixed Value → Is Active**. Earlier menus label this overlay v3.

![Overlay choices in the earlier menu](https://s3.eyeauras.net/media/2025/05/mIYLrG2yj2.png)

1. Open the overlay settings. Under **Window Settings**, select **Window** and set its title to `My panel`.
2. Under **Position**, set width `400` and height `200`. Turn **Is Locked** off to move and resize it.
3. Under **Visual style**, turn **Click-Through mode** off and leave **Opacity** at `100%` so the panel accepts clicks.
4. Click **Click Me** to increase the counter. Switch **Window Settings → Overlay**: the title bar and system frame disappear while the same counter UI remains available.

![Window mode with a title bar](https://s3.eyeauras.net/media/2025/05/Njy7t9XEg2.png)
![The same type of content in Overlay mode](https://s3.eyeauras.net/media/2025/05/R432QeysKh.png)

| Setting | How to choose |
| --- | --- |
| `Window` | A framed panel with a title bar. C# Overlay disables its close button because the aura controls visibility. |
| `Overlay` | A borderless panel, forced to stay above other windows. |
| `Always On Top` | Controls topmost behaviour in Window mode; Overlay already enables it. |
| `Is Locked` | Prevents resizing and normal window movement; it does not disable buttons inside the component. |
| `Moveable even if Locked` | Allows movement while the window is locked. |
| `Click-Through mode` | Passes input through a locked C# Overlay when the main EyeAuras window is inactive. Leave it off for this interactive panel. |
| `Opacity`, background and border | Change appearance. Transparency does not by itself enable click-through input. |
| Aura activity | Controls whether the overlay is shown. Hiding it may leave its window and component alive. |

Position and size are configured together:

![Position settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_O2I6OKwmjq.png)

The neighbouring group controls background, border, opacity and click-through behaviour:

![Visual settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_VfFC6J8Kgd.png)

**Window Settings** contains the mode, title, topmost setting and size limits:

![Window settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_ohz05OLVxV.png)

If the panel is missing, check whether the aura is loaded and active, then check compilation errors. If it is visible but does not accept clicks, check **Click-Through mode**.

## The component and its host

The C# Overlay editor compiles the project and selects its public component type. `UserOverlay.razor` defines the content; the settings above define the native window. Let the short `Script.csx` entry point finish its setup: an infinite wait there prevents the overlay from being presented.

Razor receives services through injection. Script globals such as `GetService` and `cancellationToken` are not global component names. See [complete component files](/en/scripting/blazor-windows/3-hello-world) or the separate [C# Script dialog workflow](/en/scripting/blazor-windows/getting-started).

<details>
<summary>Reading v2 and v3 examples</summary>

The v3 editor shown below uses a script project with Razor components, references and services supplied by its host:

![Earlier C# Overlay v3 editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_TqJxUFKYNe.png)

`C# Overlay v2 (legacy)` belongs to older projects. It is not an extra setup step for a new C# Overlay.

![Earlier v2 editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_DKdQydbTcq.png)
![Window appearance in v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_AvrTCKw3p6.png)
![Overlay appearance in v2](https://s3.eyeauras.net/media/2025/05/n02buCY4RI.png)

The [CsharpAuraOverlay implementation](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.CsScriptAuras/Overlays/CsharpOverlay/CsharpAuraOverlay.cs) binds window settings and visibility to the aura. The [earlier implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.CsScriptAuras/Overlays/CsharpOverlay/CsharpAuraOverlay.cs) accompanies the older examples. Neither makes every script-facing service available in every other Blazor host.

</details>
