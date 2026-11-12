---
title: Window with Login Widget
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---

# Login Widget
Create `Script.csx` and `MainWindow.razor` in one EyeAuras C# Script project.
The `PhantomPixel` namespace must match the script import. The EyeAuras host
supplies the window, service container and base component; this is not a
standalone WPF application or an ordinary helper class.


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
@using EyeAuras.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center">Using login Widget</h3>
<LoginWidget/>

@code {
    
}
```


The new window shows `LoginWidget` with a Login button or the current username.
It resolves `ILicenseAccessor` and `ILoginPopupDisplayer` from the app container;
a click opens the login popup. Authentication depends on the app services and
external provider. The widget does not grant a license or sublicence lease,
and does not prove access to a paid pack. Arbitrary Blazor hosts may lack these
registrations. `ShowDialog(cancellationToken)` waits for closure or Stop, then
`using` disposes the window. This token controls the window wait; cancellation
of network login is a separate loader API contract.
