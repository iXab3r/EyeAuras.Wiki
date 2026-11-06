---
title: IBlazorWindow
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-07T20:56:27.448Z
---
# Control a Blazor window

`PoeShared.Blazor.Wpf.IBlazorWindow` hosts a Razor component in a native WebView2
window. In PoeEye `0e02c98`, it inherits `INativeWindow`, which inherits
`IBlazorWindowController`, `IBlazorWindowNativeController` and
`IDisposableReactiveObject`. Check the SDK/XML matching your version for all signatures.

## Open, resize and release a window

Create `WindowBody.razor` in a desktop C# Script project:

```razor
@namespace MyScript
<h3>Window ready</h3>
```

Run this at the top level. The script host supplies `GetService` and
`cancellationToken`; ordinary helpers receive the dialog API explicitly.
The application UI module registers the API and window factory.

```csharp
using System;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;

{
    var dialogs = GetService<IDialogWindowUnstableScriptingApi>();
    using var window = dialogs.CreateWindow<MyScript.WindowBody>();
    window.Title = "My window";
    window.Width = 480;
    window.Height = 320;
    window.Show();
    await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
    window.Width = 640;
    await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
    window.Close();
}
```

The modeless window changes width after five seconds, then closes after another
five seconds. `using` releases ownership even if the delay is canceled. Properties
and commands go through the window dispatcher queue; returning from `Show()` does
not mean WebView has loaded. For a modal workflow, keep the window alive until
`ShowDialog(cancellationToken)` returns.

## Configure content and appearance

| Task | Properties and types |
| --- | --- |
| Component and model | `ViewType`, `ViewTypeForTitleBar`: `Type`; `DataContext`: `object` |
| Dependencies and files | `Container`: `IUnityContainer`; `AdditionalFiles`: `ImmutableArray<IFileInfo>`; `AdditionalFileProvider`: `IFileProvider` |
| Position and size | `Left`, `Top`, `Width`, `Height`, `MinWidth`, `MinHeight`, `MaxWidth`, `MaxHeight`: `int` |
| Color and border | `BackgroundColor`, `BorderColor`: `System.Windows.Media.Color`; `Padding`, `BorderThickness`: `System.Windows.Thickness` |
| Behavior | `TitleBarDisplayMode`, `ResizeMode`, `WindowState`; `Topmost`, `NoActivate`, `IsClickThrough`, `ShowInTaskbar` |

`DataContext` is current; obsolete `ViewDataContext` forwards to it despite an
old contradictory XML comment. Arbitrary WPF `ContentFactory` is unsupported here;
set `ViewType`. Native creation is lazy. Configure transparency and activation
suppression before handle creation, which may happen before the first show.

## Events, geometry and resources

Lifecycle, keyboard/mouse and preview events belong to this window. Own and dispose
your subscriptions. `WhenClosing` exposes `CancelEventArgs`; canceling Close and
disposing the object are different operations. `Hide()` changes visibility without
ending ownership.

`GetWindowHandle()` returns HWND. `GetWindowRect`, `SetWindowRect`, `SetWindowSize`
and `SetWindowPos` use `System.Drawing.Rectangle`, `Size` and `Point`. This is
native window geometry, not DOM or CV coordinates. Check DPI and multiple-monitor
behavior in the target environment.

`GetWindowRect()` reads the wrapper's tracked geometry, not a fresh Win32 query.
Setters update tracked values and queue native commands, so a return is not an OS
acknowledgment. WPF ultimately uses `SetWindowPos` without activation/z-order changes
for rectangle updates. `WhenLoaded`, `WhenUnloaded` and `WhenClosed` replay their
first event; keyboard/mouse and `WhenClosing` use shared live event streams.

`RegisterFileProvider` returns a registration to dispose when no longer needed.
`EnableDragMove` similarly returns a resource that ends dragging. `ShowDevTools`
opens WebView tools. `WaitForIdle(timeout)` waits for a queue marker, not all network
loads. A nonpositive timeout waits indefinitely; a positive timeout can expire,
and the `void` method gives no success flag. Do not use return alone as proof of drain.

See [NativeWindow source](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/Window/NativeWindow.cs)
and [queue processing](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/Window/NativeWindow.Queue.cs).
These are source contracts, not an executed DPI test.

The [dialog example](IDialogWindowUnstableScriptingApi) passes a model and awaits
window close or Stop. Showing or anchoring a window alone does not keep Run open.
See [Blazor window choices](windows-subsystems/blazor-windows) and [OSD canvas](osd/screen-overlay)
for other surfaces.
