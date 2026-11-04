---
title: Clipboard and DOM Utilities in Razor
description: IJsPoeBlazorUtils operations for text, files, focus, scrolling, and element diagnostics
published: true
date: 2026-11-03T00:00:00.000Z
tags: scripting, api, blazor, razor, clipboard, dom, ai-translated
editor: markdown
dateCreated: 2026-11-03T00:00:00.000Z
---
# Clipboard and DOM from Razor

`IJsPoeBlazorUtils` handles browser-side Blazor operations: copying text, prompting a file download, managing selection and focus, and working with DOM elements. For normal tasks, use this service first. Only add your own JS module when you need behavior it does not provide.

The examples below assume a Razor component inside a configured EyeAuras/PoeShared Blazor host, where `PoeShared.Blazor.Services.IJsPoeBlazorUtils` is already registered and `PoeShared.Blazor` resources are available. Creating the window itself is covered in [Blazor Windows](/scripting/blazor-windows/getting-started). This is a different context from a top-level C# Action.

## Copy text and prompt a file download

Create a component named `ReportPanel.razor` with the following content, then show it inside an existing Blazor window:

```razor
@using System
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using PoeShared.Blazor.Services
@inherits PoeShared.Blazor.BlazorReactiveComponent
@inject IJsPoeBlazorUtils Js

<input type="text" id="@fieldId" @ref="field" @bind="report" />
<button @onclick="Copy">Копировать</button>
<button @onclick="ReadClipboard">Прочитать буфер</button>
<button @onclick="Download">Скачать отчёт</button>
<button @onclick="Select">Выделить текст</button>
<button @onclick="Scroll">Показать поле</button>

@code {
    private readonly string fieldId = "report-" + Guid.NewGuid().ToString("N");
    private ElementReference field;
    private string report = "Результат проверки";

    private Task Copy() => Js.SetClipboardText(report);

    private async Task ReadClipboard()
    {
        report = await Js.GetClipboardText();
        await Refresh(nameof(ReadClipboard));
    }

    private Task Download() =>
        Js.DownloadTextFile("report.txt", report, "text/plain;charset=utf-8");

    private async Task Select()
    {
        await Js.FocusElementById(fieldId);
        await Js.SelectAllTextInElement(field);
    }

    private Task Scroll() =>
        Js.ScrollElementIntoView(field, behavior: "smooth", block: "center", inline: "nearest");
}
```

The `Копировать` button copies the field contents to the clipboard. `Прочитать буфер` replaces the field text with the string read from the clipboard. `Скачать отчёт` prompts the browser to download a UTF-8 file with the specified name; it does not write to an arbitrary disk path. Clipboard and download support depends on the host’s capabilities and permissions.

These handlers run after the field is already present in the DOM, so `ElementReference` is safe to use. If you need initial focus without a button click, call the operation after the component has rendered, not in the constructor or `OnInitialized`. Conditionally created fields also need to render first.

In this version, the selection methods only accept `HTMLInputElement` controls that support text selection, such as the `<input type="text">` used above. `textarea` and arbitrary containers are not supported by these helper methods. This applies to both forms of `SelectAllTextInElement` as well as `SelectTextRangeInElement`.

The service is injected by the host and is not owned by the component, so do not call `DisposeAsync` on it after copying text. All operations return `Task`, so errors stay in the normal event handling flow.

## Get elements under a point

In `DomInspector.razor`, mouse coordinates are passed directly from the browser event:

```razor
@using System.Linq
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor.Services
@inherits PoeShared.Blazor.BlazorReactiveComponent
@inject IJsPoeBlazorUtils Js

<div data-role="inspection-area" @onmousedown="Inspect">
    Нажмите здесь для диагностики DOM.
</div>
<pre>@summary</pre>

@code {
    private string summary = "";

    private async Task Inspect(MouseEventArgs e)
    {
        var hits = await Js.GetElementBreadcrumbsAt(
            e.ClientX, e.ClientY, maxDepth: 5,
            attributeNames: new[] { "data-role", "id" });

        summary = string.Join("\n", hits.Select(hit => hit.Node.Tag));
        await Refresh(nameof(Inspect));
    }
}
```

The method returns `HtmlElementBreadcrumb[]`. Each match includes the element `Node` and its ancestor `Path`. Coordinates are browser viewport `ClientX/ClientY`, not physical window screen coordinates.

`maxDepth` limits how many hit elements are returned at that point; it does not control ancestor path depth. `attributeNames` defines which attributes should be included in the descriptions. If needed, pass an operation token as the last argument: `cancellationToken`.

## Selection and scrolling

| Call | Arguments and result |
|---|---|
| `SelectAllTextInElementById(string elementId)` | Selects text in a supported input by DOM id |
| `SelectAllTextInElement(ElementReference elementRef)` | Selects text in an already rendered input |
| `SelectTextRangeInElement(ElementReference elementRef, int? start = default, int? end = default, JsSelectionRangeDirection direction = Forward)` | Passes selection start, end, and direction; offsets apply to a supported input |
| `FocusElementById(string elementId)` | Sets focus by id, without the `#` character |
| `ClickElementById(string elementId)` | Triggers the element’s browser click, not global mouse input |
| `ScrollElementIntoView(ElementReference elementRef, string behavior = "smooth", string block = "nearest", string inline = "nearest")` | Scrolls to the element; `block` is vertical alignment, `inline` is horizontal alignment |
| `ScrollToTop(string elementSelector)` and `ScrollToBottom(string elementSelector)` | Accept a selector such as `#report-list` |
| The same methods with `TimeSpan duration` | Pass animation duration in milliseconds |

For `ScrollElementIntoView`, use `behavior` values `auto` or `smooth`; alignment values are `start`, `center`, `end`, or `nearest`. Do not confuse the `elementId` parameter used by focus/selection methods with the selector used by scrolling methods. The implementation method `ScrollToTopById` is not part of the interface and throws `NotImplementedException` in the referenced snapshot; use `ScrollToTop` instead.

## CSS and attributes

`AddClass`, `RemoveClass`, `ToggleClass`, and `HasClass` each have overloads for both a string selector and `ElementReference`. The first two take `params string[] classNames`; the last two take a single class name. `HasClass` returns `Task<bool>`.

`SetClass(ElementReference, params string[])` replaces the full class list. `SetAttribute(ElementReference, string name, string? value)` sets an attribute, and removes it when passed `null`; `RemoveAttribute(ElementReference, string name)` removes it explicitly. Use these after render. For persistent UI state, Razor and your component model are usually the better place to define it.

For example, inside a component handler that already has `field`:

```csharp
await Js.AddClass(field, "selected");
await Js.SetAttribute(field, "data-state", "ready");
bool selected = await Js.HasClass(field, "selected");
await Js.RemoveAttribute(field, "data-state");
await Js.RemoveClass(field, "selected");
```

## Registrations and lifetime

| Operation | Who completes the registration |
|---|---|
| `AddKeyboardHook<THandler>(ElementReference, THandler, string methodName)` | Returns `ElementKeyboardHookRef`; the owner must call `DisposeAsync` |
| The `AddKeyboardHook<THandler>` overload with `DotNetObjectReference<THandler>` | The caller keeps the reference, removes the hook with `RemoveKeyboardHook`, and disposes its own `DotNetObjectReference` |
| `SuppressWellKnownBrowserShortcuts(JsBrowserShortcutSuppressionOptions? options = null)` | Returns `JsBrowserShortcutSuppressionRef` with async disposal |
| `RegisterWindowTitleBarGestures<THandler>(ElementReference, DotNetObjectReference<THandler>, double? dragThresholdPixels = null)` | Returns `JsWindowTitleBarGestureRef`; the callback reference also belongs to the caller |
| `AddRootComponent(string elementId, string componentIdentifier, object initialParameters = default)` | Returns `IDynamicRootComponent`; dispose the created component together with its owner |

For a keyboard hook, pass an object that exposes the specified JS-invokable method. For `RegisterWindowTitleBarGestures`, the method names are fixed: `HandleTitleBarDragStart`, `HandleTitleBarDoubleClick`, and `HandleTitleBarContextMenu`. Their parameters must match the JS-module calls used by the specific host. The title bar gesture row here is only meant as contract and ownership guidance, not as a full title bar integration example: callback signatures and a complete wiring example are not included on this page.

The dynamic component identifier and its metadata must be registered in the host before creation. A normal Razor component type alone is not enough. These operations are intended for host/component integration, not for unrestricted creation of global handlers.

`JsBrowserShortcutSuppressionOptions` includes `Shortcuts`, `AllowCtrlAInEditable`, `AllowSelector`, `PreventDefault`, and `StopPropagation`. By default, Ctrl+A keeps normal behavior in editable elements, subtrees with `data-poe-browser-shortcuts="allow"` are excluded, `PreventDefault` is enabled, and `StopPropagation` is disabled. This is a DOM registration inside the current browser instance, not a global OS-level keyboard hook.

`RegisterAncestorContextMenuTarget(ElementReference, string ancestorSelector, string registrationId)` returns a unique selector for the marked ancestor. To unregister it, pass the same selector and id to `UnregisterAncestorContextMenuTarget(string targetSelector, string registrationId)`. Do not reuse another registration’s marker for your own owner.

## Additional host operations

- `ShowAlert(string message)` shows a text message through SweetAlert.
- `LoadCss(string cssPath)` loads CSS; the path must be available to the browser.
- `LoadScript(string scriptPath)` loads a JS file. For custom code with API surface and cleanup, prefer an [ES module](/scripting/blazor-windows/js-loadscript).
- `RegisterFileDropTarget(ElementReference)` enables file drop support through WebView2. The host must handle `WebMessageReceived` and the transferred objects; this is not a ready-made Razor callback with file paths. The contract requires WebView2 SDK version 1.0.1518.46 or later.
- `DisposeAsync()` disposes the service’s JS module. For an injected instance, lifetime is managed by the host.

## Version and related topics

Contracts and implementation were checked against PoeEye `0e02c98dcab4bff263684f1c0647eed120e2700f`: [IJsPoeBlazorUtils](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor/Services/IJsPoeBlazorUtils.cs), [JsPoeBlazorUtils](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor/Services/JsPoeBlazorUtils.cs). Availability of a specific operation depends on the host version and the resources it ships with.

- [Blazor basics](blazor)
- [Blazor Windows](../windows-subsystems/blazor-windows)
- [Lifetime and subscriptions](../scripting/reactive-lifetime)