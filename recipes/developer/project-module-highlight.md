---
title: "Highlight your own element through a project module"
description: "Import an ES module after rendering, pass it one ElementReference and release the module when the window closes."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Highlight your own element through a project module

A small JavaScript module highlights one element of your own panel. The text and the button live in Razor. JS only adds or removes one class on the element that was explicitly passed to it.

You need desktop EyeAuras with the script-hosted Blazor/WebView2 services and the project resource provider.

1. Create an aura `RecipeHighlight` and add **Actions → On Enter → C# Script** for manual **Run**. Through **New file → Component**, add `MainWindow` and replace its single Razor file with the code below. If a generated code-behind with a duplicate counter appeared, remove it.
2. Through **New file → Component**, create `_Imports.razor` in the project root and replace its contents with the imports below. Through **New file → JavaScript** and **New file → CSS**, create two files and rename them to `wwwroot/highlight.js` and `wwwroot/panel.css`. Replace their contents completely. The JS file here is an ES module, not the classic script from the template.
3. Replace **Script.csx**, wait for compilation and click **Run**. The window shows one bordered text element and the **Toggle highlight** button. The button becomes available after the first render, once the module has loaded.
4. Click the button. Only this element gets a yellow background and outline. Click again and the highlight disappears.
5. Close the window or click **Stop**. On teardown the component calls the module's cleanup, releases its reference and then runs base disposal. On the next Run the highlight starts off.

## Script.csx

```csharp
using System;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using PoeShared.Blazor.Wpf;
using RecipeHighlight;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.Title = "Own DOM highlight";
    window.Width = 480;
    window.Height = 320;
    var closed = window.WhenClosed.Take(1).ToTask(cancellationToken);
    window.Show();
    try { await closed; }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
}
```

## _Imports.razor

```razor
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.JSInterop
@using PoeShared.Blazor
```

## MainWindow.razor

```razor
@namespace RecipeHighlight
@inherits BlazorReactiveComponent

<HeadContent>
    <link rel="stylesheet" href="wwwroot/panel.css" />
</HeadContent>
<div class="recipe-highlight" @ref="panel">Only this element is highlighted.</div>
<button class="btn btn-primary" disabled="@(!ready)" @onclick="ToggleHighlight">
    Toggle highlight
</button>

@code {
    private ElementReference panel;
    private Task<IJSObjectReference> moduleTask;
    private bool ready;
    private bool highlighted;
    private bool closing;

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        moduleTask = JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./wwwroot/highlight.js").AsTask();
        await moduleTask;
        if (closing) return;
        ready = true;
        await Refresh("highlight module loaded");
    }

    private async Task ToggleHighlight()
    {
        var module = await moduleTask;
        highlighted = !highlighted;
        await module.InvokeVoidAsync("setHighlight", panel, highlighted);
    }

    public override async ValueTask DisposeAsync()
    {
        closing = true;
        try
        {
            if (moduleTask != null)
            {
                var module = await moduleTask;
                try { await module.InvokeVoidAsync("clearHighlight", panel); }
                finally { await module.DisposeAsync(); }
            }
        }
        finally { await base.DisposeAsync(); }
    }
}
```

## wwwroot/highlight.js

```javascript
export function setHighlight(element, enabled) {
    element.classList.toggle("is-highlighted", enabled);
}

export function clearHighlight(element) {
    element.classList.remove("is-highlighted");
}
```

## wwwroot/panel.css

```css
.recipe-highlight { padding: 16px; border: 2px solid #666; margin-bottom: 12px; }
.recipe-highlight.is-highlighted { background: #fff2a8; outline: 3px solid #956b00; }
```


| Part | What it does |
| --- | --- |
| `OnAfterFirstRenderAsync` | Imports the module once the DOM element behind `@ref` exists. |
| `./wwwroot/highlight.js` | A URL relative to the page base URI of this window. It finds the unique project resource, not a path on disk. |
| `IJSObjectReference` | The module reference. The component owns it and calls the exports through it. |
| `ElementReference panel` | Passes the one element you own, with no global ID lookup and no `window` helper. |
| `clearHighlight`, then `DisposeAsync`, then base | Removes its own class, releases the module reference and runs the base component cleanup. |

The module adds no timers or event listeners. If you add them later, remove them in cleanup yourself: disposing an `IJSObjectReference` does not do that. If the window is closed while the module is loading, cleanup waits for the started import and does not abandon its reference. Hiding a window does not destroy its component.

The provider finds the resource by this unique path ending, folder included. Keep the paths and letter case shown here and do not create duplicate resources. If names are ambiguous, [embedded resources](/en/scripting/embedded-resources) explains full manifest names. The project namespace may be a prefix of those names. `@namespace RecipeHighlight` does not rename the resources.

[JavaScript loading](/en/scripting/blazor-windows/js-loadscript) explains how a module import differs from classic `LoadScript`. If the text or colour depends only on C# state, [reactive Razor updates](/en/scripting/blazor-windows/reactive-toggle) are simpler.
