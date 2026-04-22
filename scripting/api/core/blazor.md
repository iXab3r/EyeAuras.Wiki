---
title: AI Core: Blazor Foundation
description: AI-first map of PoeShared.Blazor reactive components, view resolution, content repository, and JS utilities.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, blazor, razor, reactive
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Blazor Foundation Discovery Map

Reference map for the shared Blazor/Razor infrastructure used by EyeAuras app
UI, Blazor windows, C# overlays, WebView2 hosts, and reusable UI controls.

Use `windows-subsystems/blazor-windows.md` for native window hosting and
`osd/screen-overlay.md` for screen overlay rendering. Use
`core/reactivity.md` for the shared `PropertyBinder`, Rx/ReactiveUI, and
DynamicData concepts behind reactive view models and collection tracking.

## User Intents

- Build Razor UI that reacts to changing view-model state.
- Pass a view-model into a Razor component through `DataContext`.
- Render a dynamic component for a model object.
- Register or resolve Razor views by content type.
- Use JS helpers for focus, clipboard, CSS, keyboard hooks, and dynamic roots.
- Understand why a component does or does not re-render.
- Add Blazor-facing resources or JS component metadata to a host.

## Concept Model

- `PoeShared.Blazor` is the common Blazor foundation layer.
- `ReactiveComponentBase` is the low-level component base with `Anchors`,
  `WhenRefresh`, refresh sampling, render counters, lifecycle flags, logging,
  and after-render task queue.
- `BlazorReactiveComponentBase` adds Blazor-specific state tracking,
  `DataContext`, `Class`, `Id`, `Style`, safe JS runtime wrapping, and
  reactive refresh wiring.
- `BlazorReactiveComponent` is the usual base class for Razor components.
- `BlazorReactiveComponent<TContext>` gives a typed `DataContext`.
- `ReactiveSection` is the preferred way to re-render only a fragment when
  selected observables or reactive collections change.
- `BlazorContentPresenter` renders a dynamic view for a `Content` object.
- `IBlazorViewRepository` resolves view types by content type and optional key.
- `IBlazorContentRepository` stores extra static files and JS component
  metadata used by Blazor hosts.
- `IJsPoeBlazorUtils` wraps common JavaScript/DOM/WebView2 helper operations.

## API Details

- `ReactiveComponentBase` - base `ComponentBase` with `IReactiveComponent`,
  `IDisposable`, `IAsyncDisposable`, `Anchors`, and `WhenRefresh`.
- `BlazorReactiveComponentBase` - adds `DataContext`, safe `IJSRuntime`,
  expression tracking through `Track(...)`, and `ReactiveTrackerList`.
- `BlazorReactiveComponent` - default non-generic Razor component base.
- `BlazorReactiveComponent<TContext>` - typed `DataContext` base.
- `ReactiveSection` - component-local reactive render boundary.
- `ReactiveTrackerList` - list of observables, `WhenAnyValue` expressions,
  DynamicData lists/caches, and change sets that can trigger a section refresh.
- `BlazorContentPresenter` - dynamic component presenter using explicit
  `ViewType` or repository-based view lookup.
- `IBlazorViewRepository` - resolves registered views.
- `IBlazorViewRegistrator` - registers view assemblies or view types.
- `BlazorViewAttribute` - overrides DataContext type, view key, or marks a view
  as manual-registration-only.
- `AssemblyHasBlazorViewsAttribute` - assembly marker used by automatic view
  scanning.
- `IBlazorContentRepository` / `BlazorContentRepository` - additional static
  files plus `JSComponentConfigurationStore`.
- `IJsPoeBlazorUtils` - clipboard, focus, click, scroll, CSS/JS loading,
  dynamic root components, keyboard hooks, class/attribute helpers, and DOM
  breadcrumbs.
- `BlazorCommandWrapper` - wraps ReactiveUI commands for Blazor/WPF command
  surfaces and exposes busy/error state.
- `BlazorErrorBoundary` - error boundary with an `OnError` callback.
- `PoeSharedBlazorRegistrations` - Unity/DI registration module for the shared
  Blazor services.

## Common Flows

### Reactive Razor Component

```razor
@inherits BlazorReactiveComponent<MyViewModel>

<ReactiveSection Trackers="@(new ReactiveTrackerList()
    .With(DataContext.WhenAnyValue(x => x.Status))
    .With(DataContext.Items))">
    <div>@DataContext.Status</div>
</ReactiveSection>
```

Use `ReactiveSection` for the state that should refresh the fragment. The older
`Track(...)` / `TrackState(...)` component APIs still exist but are marked as
replaced by reactive sections.

### Dynamic View For A Model

```razor
<BlazorContentPresenter Content="@currentModel" />
```

The presenter resolves the view through `IBlazorViewRepository`. If the resolved
view inherits from `BlazorReactiveComponent`, the presenter passes the model as
`DataContext`.

### Register A View Type

```csharp
registrator.RegisterViewType(typeof(MyDetailsView), typeof(MyModel), "Details");
```

Automatic scanning expects assemblies to be marked with
`AssemblyHasBlazorViewsAttribute`. A view can also inherit from
`BlazorReactiveComponent<TContext>` so the repository can infer the content
type.

### Use JS Utilities

```razor
@inject IJsPoeBlazorUtils JsUtils

<button @onclick="FocusSearch">Focus</button>

@code {
    private async Task FocusSearch()
    {
        await JsUtils.FocusElementById("search-box");
    }
}
```

Always await JS calls. The safe JS runtime wrapper logs JS invocation failures
and reports missed awaits through the component dispatcher.

## Host / Runtime Contexts

- App UI and WebView2 hosts register shared Blazor services through
  `PoeSharedBlazorRegistrations`.
- Razor components use Blazor `[Inject]`, `[Parameter]`, lifecycle methods, and
  `DataContext`; top-level script globals are not component globals.
- Blazor windows use this foundation but add native window ownership and
  WebView2 hosting.
- C# overlays use this foundation but are configured through aura overlay
  settings.
- Browser-hosted Blazor does not have every native host service; for example,
  host-window controllers are native-host concepts.

## Prefer

- Prefer `BlazorReactiveComponent<TContext>` when a component is designed for a
  specific view-model type.
- Prefer `ReactiveSection` and explicit `ReactiveTrackerList` entries for
  fine-grained refresh behavior.
- Prefer `BlazorContentPresenter` and view registration for dynamic UI.
- Prefer `IJsPoeBlazorUtils` for common DOM/clipboard/focus/CSS/JS operations.
- Prefer `Anchors` for component subscriptions and other component-owned
  resources.
- Prefer `windows-subsystems/blazor-windows.md` when the task is about opening,
  sizing, moving, or controlling a native Blazor window.

## Avoid

- Avoid assuming ordinary Blazor components can access top-level script members
  such as `Log`, `Variables`, or `cancellationToken`.
- Avoid broad whole-component refreshes when a small `ReactiveSection` can track
  the changing state directly.
- Avoid using obsolete `Track(...)` / `TrackState(...)` in new components.
- Avoid registering views only by convention when multiple views exist for the
  same model; use a key or explicit registration.
- Avoid fire-and-forget JS interop; await calls and handle exceptions.
- Avoid adding JS components after the page is already loaded without ensuring
  the client-side component metadata is available.

## Research Anchors

- `ReactiveComponentBase`
- `BlazorReactiveComponentBase`
- `BlazorReactiveComponent`
- `BlazorReactiveComponent<TContext>`
- `ReactiveSection`
- `ReactiveTrackerList`
- `BlazorContentPresenter`
- `IBlazorViewRepository`
- `IBlazorViewRegistrator`
- `BlazorViewAttribute`
- `AssemblyHasBlazorViewsAttribute`
- `IBlazorContentRepository`
- `BlazorContentRepository`
- `IJsPoeBlazorUtils`
- `BlazorCommandWrapper`
- `BlazorErrorBoundary`
- `PoeSharedBlazorRegistrations`

## Search Synonyms

- Blazor foundation
- Razor component
- reactive component
- BlazorReactiveComponent
- ReactiveSection
- ReactiveTrackerList
- DataContext
- dynamic view
- view repository
- BlazorContentPresenter
- JS interop
- IJsPoeBlazorUtils
- WebView2 Blazor
- component refresh
- component anchors

## Related Maps

- `windows-subsystems/blazor-windows.md`
- `osd/screen-overlay.md`
- `core/reactivity.md`
- `core/app-runtime-contexts.md`
- `scripting/runtime.md`
- `scripting/reactive-lifetime.md`
- `scripting/async.md`
