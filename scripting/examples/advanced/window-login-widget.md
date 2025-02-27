---
title: Window with Login Widget
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: 
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---

# Login Widget
Login widget is fast and easy way to invoke Login form from your own UI.
This will allow user to authenticate without bringing main EyeAuras window to foreground.
 
![Login Widget](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

## Example 
> You can import the ready-made example from here: https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo
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
@using EyeAuras.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center">Using login Widget</h3>
<LoginWidget/>

@code {
    
}
```