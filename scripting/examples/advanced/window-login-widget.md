---
title: Window with Login Widget
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: ", ai-translated"
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---

# Add LoginWidget to your own window

Place **LoginWidget** in a Razor component when your panel needs the normal EyeAuras sign-in UI. It shows **Login** or a username and opens the application-provided form. For this first example, observing the button is enough; signing in is optional.

Use a **C# Script** project in the ordinary EyeAuras host with its login services registered. This is an account UI widget, not game-password automation, a standalone WPF app or an arbitrary Blazor website. Adding the component to another host does not create an Eye Hub connection.

## Open the example window

1. Create an aura with **C# Script** and two files, **Script.csx** and **MainWindow.razor**. Keep the `PhantomPixel` namespace identical in Razor and the script import.
2. Replace the files with the complete example below and use **Run** in the script editor.
3. The separate window shows **Using login Widget** and Login or the available username. This visible result does not grant a new license or paid-pack access.
4. Close the window or use **Stop**. `ShowDialog` finishes its blocking wait, then the explicit using block disposes the script-owned window.

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

| Part | Context and ownership |
| --- | --- |
| GetService / cancellationToken | Top-level Script.csx capabilities, not globals in ordinary classes or Razor |
| IBlazorWindow | Resolved from the script container and owned by the using block. It hosts MainWindow; ShowDialog is a blocking void method, not a Task to leave unawaited |
| ILicenseAccessor | Injected into LoginWidget. When rendered, a valid license with a nonempty Username displays that name; otherwise it displays Login |
| ILoginPopupDisplayer | Injected application service opening the normal popup through OpenPopupCommand. The component contains no password or token |
| Username updates | Observed through the component's ChangeTrackers. The example adds no unowned permanent subscription |

The widget lets users open sign-in from your panel without first bringing up the main EyeAuras window. The application's route can open a system browser. Closing the popup does not imply cancellation of all authentication: application services own that process. The ShowDialog token controls the script window's wait, not universal cancellation of network login.

The popup service schedules native UI work on the UI scheduler. Do not put native ShowDialog in Task.Run from Razor; use application wrappers for your own file dialogs. Borrow the injected license/login services rather than disposing them manually. A sublicense lease and access to a protected pack remain separate contracts.

The screenshot shows an earlier form, not instructions to reproduce its field positions in the current login route.

![LoginWidget in the earlier form](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

The [original shared example](https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo) is additional material; your own window needs the two files above. See [script context](/en/scripting/getting-started), [Blazor windows](/en/scripting/api/windows-subsystems/blazor-windows) and the [IBlazorWindow contract](/en/scripting/api/IBlazorWindow) for the host and lifetime boundaries.
