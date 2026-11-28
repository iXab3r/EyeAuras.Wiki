---
title: 11. Connecting JavaScript
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---
# Read an element's width through JavaScript

To find out the real width of an element inside WebView2, you need the browser DOM. Let's write a small ES module: a button measures the panel and Razor shows the number. This is the size on the browser page, not the size of the native Windows window.

1. Create an aura with **C# Overlay** and **Fixed Value → Is Active**. In the project, choose **New file → JavaScript** and name the file `Status`. Replace the template code with the module below.
2. Find out its full resource name with this short `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

3. In the import line below, replace `MyScript.Status.js` with the full name from the log. Folders are part of the name, for example `MyScript.UI.Status.js`. Changing the component's namespace does not change the resource name. More in [embedded resources](/en/scripting/embedded-resources).
4. Replace both parts of the component. `BlazorDemo` must be the same in `.cs` and `.razor`. Do not leave the generated counter members next to the new code. The project resource is served from the page's base URI, so `./` in the import is relative to that address, not to a Windows path.

## Status.js

```javascript
export function getWidth(element) {
    return Math.round(element.getBoundingClientRect().width);
}
```

## UserOverlay.cs

```csharp
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.JSInterop
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<div @ref="panel" style="width: 240px; padding: 8px; border: 1px solid lime;">
    Panel to measure
</div>
<button class="btn btn-primary" disabled="@(!ready)" @onclick="Measure">
    Measure width
</button>
<p>Width: @width CSS px</p>

@code {
    private ElementReference panel;
    private Task<IJSObjectReference> moduleTask;
    private bool ready;
    private bool closing;
    private int width;

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        moduleTask = JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./MyScript.Status.js").AsTask();
        await moduleTask;
        if (closing) return;
        ready = true;
        await Refresh("module loaded");
    }

    private async Task Measure()
    {
        var module = await moduleTask;
        width = await module.InvokeAsync<int>("getWidth", panel);
        if (!closing) await Refresh("element measured");
    }

    public override async ValueTask DisposeAsync()
    {
        closing = true;
        try
        {
            if (moduleTask != null)
                await (await moduleTask).DisposeAsync();
        }
        finally { await base.DisposeAsync(); }
    }
}
```

5. Wait until the project compiles and the module loads. The **Measure width** button becomes enabled. Click it, and `0` changes to the rounded width of the panel, including padding and border. Change the panel's CSS width and measure again. CSS box sizing affects the number.

| Part | Purpose |
| --- | --- |
| `JsRuntime` | A member of `BlazorReactiveComponent` that is injected for you. Ordinary C# classes have no such global. |
| `import` / `IJSObjectReference` | Loads an ES module. The component keeps the reference and calls the module's exports through it. |
| `ElementReference` | Passes the exact rendered element, with no lookup by a global ID. |
| `getWidth` | Reads [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) in CSS pixels and returns a number. Razor shows the result. |
| `DisposeAsync` | Waits for an import that has already started, releases the module reference, then runs the base class cleanup. |

This module has no timers or event listeners. If you add some, export a cleanup function and call it before you dispose the module reference. `DisposeAsync` alone does not cancel them.

## LoadScript is a different loading mode

| Method | Use |
| --- | --- |
| ES module import | Your own code with explicit exports. You call the functions through the reference the component owns. |
| `IJsPoeBlazorUtils.LoadScript(path)` | An existing classic library. Creates a `script` with `type="text/javascript"` and returns a task. It does not import exports. |
| `IJsPoeBlazorUtils.LoadCss(path)` | Connects a stylesheet. It returns nothing you could use to remove the stylesheet automatically. |

To connect an existing classic library, inject `PoeShared.Blazor.Services.IJsPoeBlazorUtils` with `[Inject]`. Then call `await BlazorUtils.LoadScript("MyScript.Library.js")` from `OnAfterFirstRenderAsync`, with the real name of its resource. Do not load `Status.js` this way, because it uses exports. The loader remembers a path even while it is loading or after it failed, so a second call does not wait and does not check for success again. How to shut the library down is up to the library.

If a stylesheet belongs to the component's markup, connect [a CSS file through HeadContent](/en/scripting/blazor-windows/toggles-styling-cssfile). If C# has to decide when to connect it, use [LoadCss after rendering](/en/scripting/blazor-windows/toggles-styling-css-load).

The old [series sample](/en/scripting/blazor-windows/1-intro) used the classic loader for `rgba.js` from a CDN, a local `Script.js` and CSS for a canvas:

![Third-party library animation from the old sample](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)

<details>
<summary>Change a dedicated element's text through the module</summary>

The old sample changed text through JS. To do the same in this project, add this export to `Status.js`:

```javascript
export function setStatus(element, text) {
    element.textContent = text;
}
```

Add this markup next to the measurement button in `UserOverlay.razor`:

```razor
<button class="btn btn-primary" disabled="@(!ready)" @onclick="ShowStatus">
    Change text through JS
</button>
<span @ref="statusElement"></span>
```

Add these members inside the existing `@code` block:

```csharp
private ElementReference statusElement;

private async Task ShowStatus()
{
    var module = await moduleTask;
    await module.InvokeVoidAsync("setStatus", statusElement, "Done");
}
```

A click on the button writes **Done** into the empty span. Razor must not manage the contents of that span at the same time. For an ordinary label it is simpler to change a C# value and await `Refresh`.

</details>
