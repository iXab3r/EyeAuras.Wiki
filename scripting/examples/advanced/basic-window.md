---
title: Basic Window
description: 
published: true
date: 2025-07-16T12:58:02.149Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:39:18.852Z
---

# Blazor Window
Create both `Script.csx` and `MainWindow.razor` in one C# Script project. The
`PhantomPixel` namespace must match the script import and Razor declaration.
The EyeAuras host supplies `GetService`, `IBlazorWindow` and the component base;
this is not a standalone WPF application or an ordinary helper class.

Window operations use the UI host infrastructure. This does not make arbitrary
component state thread-safe.
Syntax highlighting in Razor files is still rough on edges, so for anything more serious than `Hello, world`, I would recommend to use Component with code-behind. Then in `.cs` you will have a proper highlighting.

And of course you can still export/import project and use Rider/Visual Studio with proper syntax highlighting even in Razor files.
 
![Blazor Window](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_XRahnHfM6ayTo7lA.png)
![Working](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_n2fqzy1i8MZi1OqM.png)

## Example 
> You can import the ready-made example from here: https://eu.eyeauras.net/share/S20250227193905C9v8tD3LlBPa
{.is-info}

1. Create an aura with a script
2. Copy-paste, run it, new window should appear with a clickable button

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

    private void IncrementCount()
    {
        count++;
        Refresh(nameof(IncrementCount));
    }
}
```

Click Me increments the counter and requests `Refresh(nameof(IncrementCount))`.
`ShowDialog(cancellationToken)` waits for close or Stop; `using` releases the window
afterward. WPF handles cancellation inside ShowDialog, so an outer cancellation
exception is not required. Component events do not permit arbitrary WPF access
from worker threads.

See [runtime contexts](/en/scripting/api/core/app-runtime-contexts),
[Blazor windows](/en/scripting/api/windows-subsystems/blazor-windows) and
[IBlazorWindow](/en/scripting/api/IBlazorWindow). These are source-backed contracts
for EyeAuras `20fd3d4` / PoeEye `0e02c98`, not a claim this example was run in your host.
