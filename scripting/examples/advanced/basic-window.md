---
title: Basic Window
description: 
published: true
date: 2025-07-16T12:58:02.149Z
tags: 
editor: markdown
dateCreated: 2025-02-27T19:39:18.852Z
---

# Blazor Window
All user-controlled windows in EyeAuras are powered by its internal framework called BlazorWindows. 
They are easy to create, thread-safe and fully support Blazor, bringing in best from two worlds(native/web dev) together.
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
var window = GetService<IBlazorWindow>();
window.ViewType = typeof(MainWindow);
window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
window.ShowDialog();
```

**MainWindow.razor**
```csharp
@namespace PhantomPixel
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
    }
}
```