---
title: Basic Window
description: 
published: true
date: 2025-07-16T12:58:02.149Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:39:18.852Z
---
# Open a window with a script-owned model

Create a counter model in your script, display it in a window and log its final value after the window closes. The caller owns the data; Razor displays it and handles the button.

Use a **C# Script action** in desktop EyeAuras with its Blazor/WebView2 window host. This project is not a standalone WPF application. `GetService`, `Log` and `cancellationToken` below belong to `Script.csx`, not the ordinary model class.

1. Create a test aura, add **C# Script** under **On Enter** and open its editor. Use manual **Run** for the first test.
2. Choose **New file → C# Class** for `CounterViewModel.cs` and **New file → Component** for `MainWindow.razor`. This is a single-file component; if you chose code-behind, remove its duplicate generated counter members.
3. Enter the three complete files below. `WindowDemo` matches the model namespace, Razor namespace and script import.

## Script.csx

```csharp
using WindowDemo;
using PoeShared.Blazor.Wpf;

{
    var model = new CounterViewModel { Title = "My counter" };
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.DataContext = model;
    window.Title = "EyeAuras model window";
    window.Width = 480;
    window.Height = 260;
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
    Log.Info($"Clicks after closing: {model.Count}");
}
```

## CounterViewModel.cs

```csharp
namespace WindowDemo;

public sealed class CounterViewModel
{
    public string Title { get; set; }
    public int Count { get; set; }
}
```

## MainWindow.razor

```razor
@namespace WindowDemo
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent<CounterViewModel>

<h3 class="text-center">@DataContext.Title</h3>
<div class="text-center mt-4">
    <button class="btn btn-primary btn-lg" @onclick="Increment">Click Me</button>
</div>
<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@DataContext.Count</strong> times!
</p>

@code {
    private async Task Increment()
    {
        DataContext.Count++;
        await Refresh("model count changed");
    }
}
```

4. Click **Run**. **EyeAuras model window** opens with heading **My counter**. Click **Click Me** a few times, then close it: the script log reports the final count.
5. Run it again to create a new model and window, starting at zero. **Stop** cancels the dialog wait; leaving the explicit block disposes the window.

These earlier screenshots show the same window mechanism with different names and labels:

![Window project and Razor component](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_XRahnHfM6ayTo7lA.png)
![Window with its counter](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_n2fqzy1i8MZi1OqM.png)

| Part | Ownership and purpose |
| --- | --- |
| `CounterViewModel` | Created by the caller and passed as `DataContext`. Its count remains readable after close, but is not persisted between Runs. |
| `IBlazorWindow` | Resolved in the script container and disposed by `using` inside the explicit block. The host configurator attaches the container and project files. |
| `ViewType` | Selects the compiled public Razor component type. |
| `ShowDialog(cancellationToken)` | Shows the window and blocks until close or cancellation, keeping the owned scope alive. |
| `Width` / `Height` | Native WPF window dimensions, distinct from browser DOM geometry or another process's client area. |
| `Refresh("model count changed")` | Refreshes this reactive component after the handler changes its model. |

This model is a plain class without automatic change notifications. The example changes it in a component handler and explicitly refreshes. An external thread changing that property does not automatically create a UI subscription or make the model thread-safe. Owned subscriptions, when needed, must be disposed with their owner.

<details>
<summary>Use a two-file, component-local counter</summary>

If the script does not need the final value, use these two files as a separate alternative instead of the model-driven project. Here `PhantomPixel` matches between the script import and Razor; the counter belongs to the component.

**Script.csx**

```csharp
using PhantomPixel;
using PoeShared.Blazor.Wpf;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
}
```

**MainWindow.razor**

```razor
@namespace PhantomPixel
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h3 class="text-center">Interactive Counter</h3>

<div class="text-center mt-4">
    <button @onclick="IncrementCount" class="btn btn-primary btn-lg">
        Click Me
    </button>
</div>

<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@count</strong> times!
</p>

@code {
    private int count = 0;

    private async Task IncrementCount()
    {
        count++;
        await Refresh(nameof(IncrementCount));
    }
}
```

The click handler awaits `Refresh`; the blocking window call and explicit scope retain the same lifetime. Do not mix this component-local count with the main example's model logging.

</details>

<details>
<summary>Other presentation modes and IDE editing</summary>

For a higher-level dialog route, see [CreateWindow with a model](/en/scripting/blazor-windows/getting-started). Direct `IBlazorWindow` resolution here lets you set `ViewType` and `DataContext` yourself.

`Show()` returns immediately. Replacing `ShowDialog` with it in this short block would immediately dispose the window. For non-modal display, establish a token-aware `WhenClosed` wait before showing, then await it before cleanup; see [IBlazorWindow](/en/scripting/api/IBlazorWindow) and the [window map](/en/scripting/api/windows-subsystems/blazor-windows).

For larger components, choose **Component (with code-behind)** for matching Razor/C# parts, or [export the project for an IDE](/en/scripting/ide-integration). Highlighting varies by editor/version; an IDE build does not replace the EyeAuras host. The [historical ready-made example](https://eu.eyeauras.net/share/S20250227193905C9v8tD3LlBPa) remains available as a separate sample. [Script runtime](/en/scripting/api/scripting/runtime) explains host context and ownership.

</details>
