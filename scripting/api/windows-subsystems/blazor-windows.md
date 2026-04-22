---
title: AI Windows: Blazor Windows
description: AI-first map of Blazor window framework APIs and window hosting.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, windows, blazor
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Blazor Windows Discovery Map

Reference map for Blazor-backed native windows, WebView2 hosts, dialog windows,
Razor view resolution, custom title bars, and window automation.

Use `osd/screen-overlay.md` for click-through desktop annotations and
`nuget/imgui-sdk.md` for optional ImGui windows.

## User Intents

- Open a script-owned Razor/Blazor dialog.
- Host a Razor component in a native window.
- Understand when a C# Overlay is different from a script-created window.
- Configure size, position, owner, transparency, topmost, no-activate, or
  click-through behavior.
- Access the owning window from inside a Razor component.
- Register or resolve Razor views by DataContext.
- Open WebView DevTools.
- Load CSS/JavaScript/assets into the hosted WebView.
- Use reactive Razor components for toggles and script-facing UI.
- Open complex editor/tool windows from a large script app.

## Concept Model

- `IBlazorWindow` is a native WPF/WinForms window hosting Blazor content.
- `ViewType` is the Razor component type.
- `DataContext` is passed to the hosted view.
- `IBlazorWindowController` owns window state and operations.
- `IBlazorWindowNativeController` owns native handle/rectangle operations.
- `IBlazorWindowAccessor` exposes the owning window inside a component.
- `BlazorContentPresenter` resolves dynamic component content.
- WebView2 is the embedded browser that renders the Razor/HTML/CSS/JS surface.
- C# Overlay is a preconfigured script-hosted Blazor surface controlled by aura
  overlay settings.
- A script-created Blazor window is opened explicitly by script/app code.
- Blazor windows are native windows; use OSD/screen-overlay maps for
  click-through screen annotations.

## API Details

- `IBlazorWindow` - main window contract; `Show`, `ShowDialog`, `Close`,
  `ShowDevTools`, `ViewType`, `DataContext`, `Container`.
- `IBlazorWindowController` - visual and behavior properties.
- `IBlazorWindowNativeController` - `GetWindowHandle`, `GetWindowRect`,
  `SetWindowRect`.
- `IDialogWindowUnstableScriptingApi` - script-facing helper for dialog windows.
- `IBlazorWindowAccessor` - injectable owner-window accessor.
- `IBlazorViewRepository`, `IBlazorViewRegistrator`, `BlazorViewAttribute` -
  DataContext-based view resolution.
- `BlazorReactiveComponent` / `BlazorReactiveComponent<T>` - common base for
  reactive Razor components.
- `IJsPoeBlazorUtils.LoadCss(...)` - load CSS into the WebView at runtime.
- `IJsPoeBlazorUtils.LoadScript(...)` - load plain JavaScript into the WebView
  at runtime.
- `HeadContent` - declarative Blazor way to add CSS/head content.
- `ToggleButton` - reusable PoeShared Blazor two-state button control.
- `ScriptBlazorWindowConfigurator` - script-window integration point that wires
  script file providers/resources into windows.

## Practical Concepts

- Razor component files are normal project files and can have `.razor.cs`
  code-behind.
- Public Razor component classes are easiest for script-created windows.
- Components should use Blazor dependency injection, parameters, and
  `DataContext`; top-level script host members are not component globals.
- `DataContext` is the main way to pass a view-model/service object into a
  hosted component.
- `IBlazorWindowAccessor` is the way for a component to reach the owning native
  window.
- `ShowDevTools()` opens WebView developer tools and is useful for CSS/JS
  debugging.
- CSS can be inline, loaded declaratively through `HeadContent`, or loaded
  programmatically through `LoadCss`.
- JavaScript can be loaded through `LoadScript`; module-style JS follows normal
  Blazor/JS interop rules.
- Script embedded resources are available to Blazor windows by relative path.
- Multiple toggles or repeated controls should be backed by explicit properties
  or item view-models, not copy-pasted hardcoded accessors.

## Common Flows

### Script-Owned Dialog

1. Create/resolve the dialog-window scripting API in top-level script or app
   composition code.
2. Create a window for a Razor component type.
3. Pass `DataContext` if the component needs a view-model.
4. Configure startup location, size, transparency, or behavior before showing.
5. Add the window to the owning lifetime so it closes when the script/app stops.

### C# Overlay UI

1. Create a C# Overlay aura item.
2. Put Razor/CSS/JS/component code in the overlay script project.
3. Use overlay settings for position, style, transparency, and window-vs-overlay
   behavior.
4. Use live import/export workflow for fast UI iteration.

### Load Assets

1. Add CSS/JS/images as embedded resources in the script project.
2. Reference images/videos by relative path from Razor.
3. Use `HeadContent` for declarative CSS, or `LoadCss` when code controls
   loading time.
4. Use `LoadScript` for plain JavaScript files or URLs.

## Prefer

- Prefer `IDialogWindowUnstableScriptingApi` for script-owned dialogs.
- Prefer `IBlazorWindowAccessor` inside hosted components.
- Prefer `BlazorReactiveComponent` when the component needs reactive refresh
  helpers.
- Prefer `DataContext`/view-models for non-trivial components.
- Prefer embedded resources and relative paths for CSS/JS/images shipped with a
  mini-app.
- Prefer `recipes/bot-memory-imgui-interface.md` when Blazor windows are
  part of a larger ImGui-rooted script app.
- Prefer `osd/screen-overlay.md` for drawing over the desktop.
- Prefer `nuget/imgui-sdk.md` for ImGui-specific tools.

## Avoid

- Avoid manually creating WPF/WinForms shells for Razor content.
- Avoid changing creation-time transparency after the native window exists.
- Avoid assuming a Razor component can access its owner without accessor.
- Avoid assuming top-level script host members are available directly in Razor
  components.
- Avoid using Blazor Windows as the first choice for simple screen annotations;
  use the OSD/screen-overlay APIs for that.
- Avoid remote CSS/JS dependencies when a mini-app should work offline or be
  portable.

## Research Anchors

- `IBlazorWindow`, `IBlazorWindowController`,
  `IBlazorWindowNativeController`, `IDialogWindowUnstableScriptingApi`,
  `IBlazorWindowAccessor`, `BlazorContentPresenter`,
  `IBlazorViewRepository`, `BlazorViewAttribute`, `ShowDevTools`,
  `BlazorReactiveComponent`, `IJsPoeBlazorUtils`, `LoadCss`,
  `LoadScript`, `HeadContent`, `ToggleButton`,
  `ScriptBlazorWindowConfigurator`.

## Search Synonyms

- Blazor window
- Razor window
- script dialog
- WebView2 window
- C# Overlay
- hosted Razor component
- Razor code-behind
- HeadContent
- LoadCss
- LoadScript
- BlazorReactiveComponent
- ToggleButton
- custom title bar
- click-through window
- transparent window
- WebView DevTools

## Related Maps

- `osd/screen-overlay.md`
- `recipes/bot-memory-imgui-interface.md`
- `nuget/imgui-sdk.md`
- `scripting/project-workflow.md`
- `scripting/references-and-resources.md`
- `scripting/runtime.md`
- `core/app-runtime-contexts.md`
