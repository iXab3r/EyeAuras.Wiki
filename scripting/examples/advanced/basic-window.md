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

The script creates a counter model, shows it in a window and logs the final value after the window closes. The data stays with the script. Razor only displays it and handles the button.

You need a **C# Script** action in desktop EyeAuras with Blazor/WebView2. `GetService`, `Log` and `cancellationToken` are available only in `Script.csx`, not in the ordinary model class.

1. Create a test aura, add **C# Script** under **On Enter** and open its editor. For the first try, start the action manually with **Run**.
2. Choose **New file → C# Class** to create `CounterViewModel.cs` and **New file → Component** to create `MainWindow.razor`. In this example the component is a single file with no code-behind part. If your template created one, remove the old counter from it.
3. Paste the code into the three files below. The `WindowDemo` namespace must be the same in the model, in Razor and in the script's `using`.

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

4. Click **Run**. The **EyeAuras model window** opens with the heading **My counter**. Click **Click Me** a few times and close the window. The final count appears in the script log.
5. Click Run again: a new model and a new window are created, and the count starts from zero. **Stop** cancels the dialog wait, then the script leaves the explicit block and the window is disposed.

![Window project and Razor component](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_XRahnHfM6ayTo7lA.png)
![Window with its counter](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_n2fqzy1i8MZi1OqM.png)

| Part | Who manages it |
| --- | --- |
| `CounterViewModel` | The script creates it and passes it as `DataContext`. After the window closes, the script can still read the data. It is not saved between Runs. |
| `IBlazorWindow` | A separate window. The script gets it from its container and disposes it with `using` inside the explicit block. |
| `ViewType` | The compiled Razor component type to show. |
| `ShowDialog(cancellationToken)` | Shows the window and waits until it is closed or cancelled. Cleanup comes after that. |
| `Width` / `Height` | Size of the native WPF window. |
| `Refresh("model count changed")` | Redraws this reactive component after the handler has changed the model. |

The model is a plain class and does not notify about changes by itself. The component handler changes it and calls `Refresh` explicitly. If you change the same model from another thread, the window does not redraw on its own. If you need subscriptions, tie them to an owner and dispose them together with it.

To make the window show changes from your own aura, take the observation from the [reactive toggle example](/en/scripting/blazor-windows/reactive-toggle): there the component subscribes to trigger notifications and owns the subscription. Keep the model and the window lifetime as they are here, managed by the script.

<details>
<summary>Use a two-file, component-local counter</summary>

If the script does not need the final value, use these two files instead of the model project. Here the `PhantomPixel` namespace must match between the script's `using` and Razor, and the counter belongs to the component.

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

The click handler awaits `Refresh`. The blocking window call and the explicit block keep the window alive the same way as in the main example. Do not mix this component-local count with the main example's model logging.

</details>

<details>
<summary>Other presentation modes and IDE editing</summary>

For an ordinary dialog there is a simpler way: [CreateWindow with a model](/en/scripting/blazor-windows/getting-started). Here `IBlazorWindow` is resolved directly so that you can set `ViewType` and `DataContext` yourself.

`Show()` only shows the window and returns immediately. You cannot simply put it in place of `ShowDialog` in this block: the block would end right away and dispose the window. For a non-modal window, first create a token-aware `WhenClosed` wait, then show the window and await the wait before cleanup. See [IBlazorWindow](/en/scripting/api/IBlazorWindow) and the [window map](/en/scripting/api/windows-subsystems/blazor-windows).

You can split a large component into two matching parts, Razor and C#, with **Component (with code-behind)**. To work in an IDE, [export the project](/en/scripting/ide-integration). There is also an [older ready-made example](https://eu.eyeauras.net/share/S20250227193905C9v8tD3LlBPa). [Script runtime](/en/scripting/api/scripting/runtime) explains the host context and ownership.

</details>
