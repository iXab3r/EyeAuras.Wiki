---
title: IDialogWindowUnstableScriptingApi
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-11-03T23:15:54.436Z
---
# Open a dialog from a script

`IDialogWindowUnstableScriptingApi` creates a Blazor window for a Razor component.
This experimental contract refers to EyeAuras `20fd3d4` / PoeEye `0e02c98`.
Older copied interfaces with `ShowTitleBar` and `ViewDataContext` do not describe
this version.

## Show a window and wait for close

Add `HelloDialog.razor` with a public component in namespace `MyScript`:

```razor
@namespace MyScript
<h3>Hello from EyeAuras</h3>
<p>Close the window to continue the script.</p>
```

Run the following top-level script in desktop EyeAuras. Its UI module registers
the dialog API and `IBlazorWindow` factory; an assembly reference does not create
those services:

```csharp
using EyeAuras.Shared.Scripting;

{
    var dialogs = GetService<IDialogWindowUnstableScriptingApi>();
    using var window = dialogs.CreateWindow<MyScript.HelloDialog>();
    window.Title = "Dialog example";
    window.Width = 400;
    window.Height = 300;
    window.ShowDialog(cancellationToken);
    Log.Info("Dialog wait completed");
}
```

The window displays the component text. `ShowDialog` waits for close while the WPF
implementation continues dispatcher message processing. It handles token cancellation
internally, so do not require an `OperationCanceledException` at the caller.
`using` also releases the window when an exception leaves the script.

`CreateWindow<T>(object dataContext = default)` sets `ViewType`, `DataContext` and
`AutoOwner = false`, and adds the window to the API's resources. It does not promise
automatic ownership by another application window. For a modeless window, use
`Show()` and retain ownership until the work ends; a using scope containing only
Show ends its lifetime immediately.

## Pass a model and await a modeless window

Add an ordinary `WindowStatus.cs` file to the same project:

```csharp
namespace MyScript;

public sealed class WindowStatus
{
    public string Text { get; init; }
}
```

Create `StatusPanel.razor`, receiving the model through `DataContext`:

```razor
@namespace MyScript
@using PoeShared.Blazor
@inherits BlazorReactiveComponent<WindowStatus>

@if (DataContext != null)
{
    <p>@DataContext.Text</p>
}
```

In top-level `Script.csx`, subscribe before showing the window and then await close:

```csharp
using System;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using EyeAuras.Shared.Scripting;

{
    var runToken = cancellationToken;
    var dialogs = GetService<IDialogWindowUnstableScriptingApi>();
    var model = new MyScript.WindowStatus { Text = "Window ready" };
    using var window = dialogs.CreateWindow<MyScript.StatusPanel>(model);
    window.Title = "Status";
    window.Width = 400;
    window.Height = 240;

    var closed = window.WhenClosed.Take(1).ToTask(runToken);
    window.Show();
    try
    {
        await closed;
        Log.Info("Window closed");
    }
    catch (OperationCanceledException) when (runToken.IsCancellationRequested)
    {
        Log.Info("Window display stopped");
    }
}
```

The window displays `Window ready`. Its close button completes the wait; Stop
cancels it. `Take(1)` ends the subscription after the first close, and cancellation
ends it on Stop. `using` releases the window in either case. `Show()` returns
immediately; showing alone defines no script duration. `Hide()` is not Close.

The model is immutable after construction in this example. Mutable state needs
notifications and UI refresh; see [Blazor](core/blazor). The model is not a Razor
global. Use `DataContext`, not the obsolete `ViewDataContext` alias.

See [IBlazorWindow](IBlazorWindow) for properties, events and native geometry.
Native file dialogs from Razor use separate wrappers described in the
[Blazor window map](windows-subsystems/blazor-windows).
