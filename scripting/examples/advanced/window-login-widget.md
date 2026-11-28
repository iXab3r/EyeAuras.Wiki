---
title: Window with Login Widget
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---

# Add LoginWidget to your own window

**LoginWidget** is the ready-made EyeAuras sign-in button. Put it in the Razor component of your own window. It shows **Login** or a username and opens the normal sign-in form. You do not have to sign in to try the example. Seeing the button is enough.

The example works only in a **C# Script** project inside ordinary EyeAuras, where the login services are already registered.

## Open the example window

1. Create an aura with **C# Script** and two files, **Script.csx** and **MainWindow.razor**. The `PhantomPixel` namespace must be the same in Razor and in the script's `using`.
2. Replace the files with the code below and click **Run** in the script editor.
3. A separate window opens with the title **Using login Widget** and either Login or the available username.
4. Close the window or click **Stop**. `ShowDialog` stops waiting, and leaving the using block disposes the window.

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

| Part | Where it comes from and who owns it |
| --- | --- |
| GetService / cancellationToken | Exist only at the top level of Script.csx. Ordinary classes and Razor do not have them |
| IBlazorWindow | Comes from the script container. The using block holds the window until ShowDialog finishes. The window shows MainWindow as a component |
| ILicenseAccessor | Application services pass it to LoginWidget. With a valid license and a nonempty Username the widget shows the name. Otherwise it shows Login |
| ILoginPopupDisplayer | Also passed to the widget. It opens the normal sign-in form through OpenPopupCommand. The component itself holds no password or token |
| Username updates | The widget watches Username through the component's ChangeTrackers. The example needs no permanent subscriptions of its own |

When the user clicks Login, the normal sign-in of their EyeAuras version starts. It can open the system browser. A closed popup does not mean sign-in was cancelled: application services own that state. The token in ShowDialog controls how long the script window waits.

The popup is created the standard way and moves to the UI thread on its own. Do not put a native ShowDialog in Task.Run from a Razor handler. For your own file dialog, use the application's UI wrappers.

![LoginWidget in the earlier form](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

The [original shared example](https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo) is extra material. More: [script context](/en/scripting/getting-started), [Blazor windows](/en/scripting/api/windows-subsystems/blazor-windows) and [IBlazorWindow](/en/scripting/api/IBlazorWindow).
