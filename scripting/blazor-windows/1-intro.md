---
title: 1. What is Blazor and how to use it in EyeAuras
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T13:31:15.490Z
---
# Build your first panel

A panel with buttons, a counter or settings can run inside EyeAuras without a separate website. Start with **C# Overlay**: its generated project already contains an interactive counter.

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) connects UI events to C# handlers. [Razor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-8.0) lets a component combine markup with C# expressions.

| Part | Purpose |
| --- | --- |
| [HTML](https://www.w3schools.com/html/) | Text, buttons and markup structure. |
| [CSS](https://www.w3schools.com/html/html_css.asp) | Colour, size, spacing and appearance. |
| `.razor` | Component markup, expressions and event bindings. |
| `.cs` | Component state and handlers; these can also live in a Razor `@code` block. |
| `Script.csx` | The script entry point, with a different context from the Razor component. |

## Open the generated counter

1. Create your own test aura with **Add new → New Aura**.

![Create a test aura](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_KBChU81nd6.png)

2. Under **Overlays**, add **C# Overlay**. Older screenshots call it `C# Overlay (v3, alpha)`.

![Add C# Overlay in the earlier editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_xVFX70YeoA.png)

3. Keep the generated files. Add **Fixed Value → Is Active** to the aura and leave it loaded so the panel stays visible.

![Generated editor and counter](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_UVQrNGj5te.png)

4. Click **Click Me** in the panel. The displayed count increases with each click.

![Counter responding to clicks](https://s3.eyeauras.net/media/2025/05/ltZnDlxcvJ.gif)

The count belongs to this component instance. Recreating it starts from zero; hiding its window does not necessarily recreate it.

| Your next task | Continue with |
| --- | --- |
| Choose a framed window or a borderless overlay | [Window hosting and WebView2](/en/scripting/blazor-windows/2-webview). |
| Edit markup and a C# handler | [Complete component files](/en/scripting/blazor-windows/3-hello-world). |
| Control your own aura from a button | [One toggle](/en/scripting/blazor-windows/4-toggle-hotkeyisactive). |
| Open a dialog from a C# Script action | [A script-owned window](/en/scripting/blazor-windows/getting-started). |

<details>
<summary>A small counter inside one Razor file</summary>

In the existing C# Overlay project, keep the generated `@namespace` line in `UserOverlay.razor` and replace everything below it with this fragment. Remove the generated counter field and handler from `UserOverlay.cs`, keeping its empty partial class and matching namespace, so there is only one implementation.

```razor
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h1>Counter</h1>
<p>Current count: @currentCount</p>
<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount;
    private async Task IncrementCount()
    {
        currentCount++;
        await Refresh("counter clicked");
    }
}
```

`@onclick` connects the button to the C# method. `Refresh` uses the reactive component's dispatcher to update the display. The [next component example](/en/scripting/blazor-windows/3-hello-world) provides complete files with an explicit namespace.

![Simple Razor counter](https://s3.eyeauras.net/media/2024/11/msedge_Wvy12LEOv1bGyAOA.gif)

</details>

<details>
<summary>Example pack and further reading</summary>

The [downloadable examples](https://tinyurl.com/msfhaupc) and [Tutorial — Blazor Windows, revision 3](https://eyeauras.net/share/S20250511162645vYh4n3mqSLm0/3) include earlier editor examples; the latter targets EyeAuras **1.7.8354.0**. Start a new C# Overlay for the workflow above.

[CodePen](https://codepen.io/) can supply HTML/CSS ideas. Adapt them to your component: a browser example does not itself create an EyeAuras window. The [Razor component generator](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Blazor.Shared/CodeEditor/Templates/RazorComponentTemplate.cs) shows the earlier template behind these screenshots; keep the two component parts in the same namespace when editing.

</details>
