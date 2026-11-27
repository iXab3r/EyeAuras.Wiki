---
title: "Highlight your own element through a project module"
description: "Import an ES module after rendering, pass one ElementReference and release the component-owned module on close."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Highlight your own element through a project module

Let a small JavaScript module highlight one element of your own panel. Razor owns the text and button; JS only adds or removes one class on the element explicitly passed to it.

You need desktop EyeAuras with the script-hosted Blazor/WebView2 services and project resource provider. No remote page, browser session or downloaded JS library is involved.

1. Create your own aura `RecipeHighlight` with **Actions → On Enter → C# Script**, using manual **Run**. Through **New file → Component**, create `MainWindow`; replace its single Razor file and remove any duplicate generated counter code-behind.
2. Through **New file → Component**, create the root `_Imports.razor` and replace its generated contents with the imports below. Through **New file → JavaScript** and **New file → CSS**, create and rename resources to `wwwroot/highlight.js` and `wwwroot/panel.css`. Replace their contents completely: the JS file is an ES module, not a classic script template.
3. Replace **Script.csx**, wait for compilation, then click **Run**. The window should show one bordered text element and **Toggle highlight**. The button becomes available after the first render and successful module import.
4. Click the button: that element gains a yellow background and outline. Click again: they disappear. No other element or application is selected.
5. Close the window or click **Stop**. Component teardown calls the module's cleanup, releases its reference, and then runs base disposal. Reopen with Run: the highlight begins off.

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


| Part | Responsibility |
| --- | --- |
| `OnAfterFirstRenderAsync` | Imports only after `@ref` can identify a rendered DOM element. |
| `./wwwroot/highlight.js` | Relative URL at this script-aware window's page base URI; it resolves the unique project resource, not a disk path. |
| `IJSObjectReference` | The component-owned module reference used for explicit exports. |
| `ElementReference panel` | Identifies the one owned element; no global ID lookup or `window` helper is needed. |
| `clearHighlight`, then `DisposeAsync`, then base | Removes the owned class, releases the module reference and preserves component cleanup. |

The module adds no timers or event listeners. If you later add either, its cleanup must remove them explicitly; disposing an `IJSObjectReference` alone does not do that. Cleanup awaits an import already started, so closing during loading does not intentionally abandon that reference. Hiding a window does not destroy its component.

The provider accepts this unique folder-qualified resource suffix. Keep the paths and case shown and avoid duplicate resources; [embedded resources](/en/scripting/embedded-resources) explains full manifest names if resolution is ambiguous. The project namespace may prefix those names; changing `@namespace RecipeHighlight` does not rename the resources.

[JavaScript loading](/en/scripting/blazor-windows/js-loadscript) distinguishes module import from classic `LoadScript`. For an ordinary text or color change driven entirely by C# state, [reactive Razor updates](/en/scripting/blazor-windows/reactive-toggle) are simpler; use the module when you actually need DOM behavior.
