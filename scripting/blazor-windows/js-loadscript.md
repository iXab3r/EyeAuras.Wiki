---
title: 11. Connecting JavaScript
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---
# Attach JavaScript to a component

`IJsPoeBlazorUtils.LoadScript(string scriptPath)` loads a classic script and returns a `Task`. It does not import an ES module or register automatic cleanup. A third-party library's files, globals and shutdown are its own contract.

For custom behavior, use an ES module. This example adds a button that changes a neighboring element's text without global functions or DOM event subscriptions.

## C# Overlay v3 files

Create an aura with **C# Overlay v3** and add `Status.js` to the project resources; see [embedded resources](/en/scripting/embedded-resources). Its full manifest path depends on the namespace. The example uses `MyScript.Status.js`; replace this with the actual name listed in script preparation diagnostics. Folders contribute to the name, for example `MyScript.UI.Status.js`. A bare suffix is not a universal resource URL.

Replace `UserOverlay.razor` with the code below and remove conflicting members from `UserOverlay.cs`. The host supplies the project file provider and injects `JsRuntime` into `BlazorReactiveComponent`.

### Status.js

```javascript
export function setStatus(element, text) {
    element.textContent = text;
}
```

### UserOverlay.razor

```razor
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.JSInterop
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<button class="btn btn-primary" disabled="@(module == null)" @onclick="ShowStatus">
    Change text through JS
</button>
<span @ref="statusElement">Waiting</span>

@code {
    private ElementReference statusElement;
    private IJSObjectReference module;

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        module = await JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./MyScript.Status.js");
        await Refresh("module-loaded");
    }

    private async Task ShowStatus()
    {
        await module.InvokeVoidAsync("setStatus", statusElement, "Done");
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (module != null)
            {
                await module.DisposeAsync();
            }
        }
        finally
        {
            await base.DisposeAsync();
        }
    }
}
```

After the first render the module loads and enables the button. Clicking it changes “Waiting” to “Done”. Await the import and calls. If the resource is missing, inspect its full name and WebView2 errors; the example assumes the host serves it at the shown URL.

Disposal releases `IJSObjectReference`. If you add timers, event listeners or library instances, export and call a cleanup function before disposing the module reference. This example changes only its dedicated span; do not mutate DOM children managed dynamically by Razor.

## Load a classic script

For an existing integration, inject `PoeShared.Blazor.Services.IJsPoeBlazorUtils` with `[Inject]` and call `await PoeBlazorUtils.LoadScript("MyScript.Library.js")` from `OnAfterFirstRenderAsync`, using the actual full resource path. CSS uses `await PoeBlazorUtils.LoadCss("MyScript.Styles.css")`. These calls do not import the ES-module exports from `Status.js`.

The historical [series sample](/en/scripting/blazor-windows/1-intro) loaded CDN-hosted `rgba.js`, local `Script.js` and canvas CSS in this way. The image below shows that animation, while the complete example above only changes text. CDN availability and the library's API require separate verification.

![Demo](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)
