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

Measure a panel inside WebView2 and show the returned number in Razor. The module reads browser DOM geometry; this is not the native Windows window size.

1. Create your own aura with **C# Overlay** and **Fixed Value → Is Active**. In the project, choose **New file → JavaScript**, name it `Status` and replace the template contents with the module below.
2. List its full embedded name with this short `Script.csx` entry point:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

3. Replace `MyScript.Status.js` in the import below with the actual name from the log. A folder contributes to the name, for example `MyScript.UI.Status.js`; changing only the component namespace does not change that resource name. See [embedded resources](/en/scripting/embedded-resources).
4. Replace both component parts. `BlazorDemo` must match in `.cs` and `.razor`; do not leave duplicate generated counter members beside them. The host serves the project resource at its page base URI; `./` imports relative to that base, not from a Windows path.

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

5. Once compilation and import finish, **Measure width** becomes enabled. Click it: `0` changes to the panel's rounded rendered width, including padding and border. Change its CSS width and repeat; CSS box sizing affects the returned value.

| Part | Purpose |
| --- | --- |
| `JsRuntime` | An injected member of `BlazorReactiveComponent`, not an ordinary C# global. |
| `import` / `IJSObjectReference` | Loads an ES module and owns a reference used to call its exports. |
| `ElementReference` | Passes the specific rendered element without a global ID lookup. |
| `getWidth` | Reads [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) in CSS pixels. Razor owns rendering the returned value. |
| `DisposeAsync` | Waits for an import already started, releases the module reference, then calls base cleanup. |

This module adds no timers or event listeners. If you add them, export a cleanup function and call it before disposing the module reference: `DisposeAsync` alone does not cancel them. Hiding the window is not component disposal.

## LoadScript is a different loading mode

| Method | Use |
| --- | --- |
| ES module import | Your own code with explicit exports, invoked through the component-owned reference. |
| `IJsPoeBlazorUtils.LoadScript(path)` | An existing classic library. Creates a `script` with `type="text/javascript"` and returns a task; it does not import exports. |
| `IJsPoeBlazorUtils.LoadCss(path)` | Connects a stylesheet without returning automatic removal ownership. |

For an existing classic library, inject `PoeShared.Blazor.Services.IJsPoeBlazorUtils` with `[Inject]`, then call `await BlazorUtils.LoadScript("MyScript.Library.js")` from `OnAfterFirstRenderAsync`, using the actual resource name. Do not load the exported `Status.js` with that API. The loader caches paths even while loading or after failure; a repeated call is not a wait or a success check. The library's shutdown remains a separate contract.

The historical [series sample](/en/scripting/blazor-windows/1-intro) used this classic loading route for CDN `rgba.js`, local `Script.js` and canvas CSS. This animation shows that third-party example, not the measurement above; its CDN and library contracts are separate prerequisites:

![Historical third-party animation](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)

<details>
<summary>Change a dedicated element's text through the module</summary>

The text-changing variant uses the same project/import/lifetime. Add this export to `Status.js`:

```javascript
export function setStatus(element, text) {
    element.textContent = text;
}
```

Add this markup next to the existing measurement button in `UserOverlay.razor`:

```razor
<button class="btn btn-primary" disabled="@(!ready)" @onclick="ShowStatus">
    Change text through JS
</button>
<span @ref="statusElement"></span>
```

Add these members inside its existing `@code` block:

```csharp
private ElementReference statusElement;

private async Task ShowStatus()
{
    var module = await moduleTask;
    await module.InvokeVoidAsync("setStatus", statusElement, "Done");
}
```

Clicking the button writes **Done** into its dedicated empty span. Do not also make Razor dynamically manage that span's children. For an ordinary label, changing C# state and awaiting `Refresh` is simpler.

</details>
