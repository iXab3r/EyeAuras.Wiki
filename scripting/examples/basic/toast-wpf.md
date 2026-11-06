---
title: Toasts
description: 
published: true
date: 2025-03-23T22:21:57.666Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T22:21:44.199Z
---

# Notifications from a C# Script

You can import a ready-made example from here: [https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb](https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb)

For displaying notifications, you can use a C# script with just a few lines of code — there are many libraries available that can show such messages. For example, I will use [Notification.Wpf](https://github.com/Platonenkov/Notification.Wpf) by [Alexander Platonenkov](https://github.com/Platonenkov).

Run this as a top-level C# Script Action in Windows EyeAuras with a live WPF
`Application.Current` and UI dispatcher. The input is the string `test`; the expected
result is a library-owned WPF popup, not a Windows system notification.

The historical `Notification.Wpf 7.0.0` package is retained. Its package XML includes
the manager constructor and string Show overload; the version's source is linked
below. This does not establish restore or native UI compatibility in your host.

1. Create an aura.
2. Add `HotkeyIsActive` and bind it to a convenient key (e.g., `F3`) — this will be our toggle on/off. Change the activation type to `Click/Hold`.
3. Add a `C# Script` action in `On Enter`.
4. Copy-paste the script below.
5. When `F3` is pressed, a notification will appear in the bottom-right corner of the screen.

```csharp
#r "nuget: Notification.Wpf, 7.0.0"
using Notification.Wpf.Controls;
using Notification.Wpf;

// Create and show on the EyeAuras WPF dispatcher.
await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
{
    var notificationManager = new NotificationManager();
    notificationManager.Show("test");
});
```

![Notification Result](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)
![Other Notification Styles](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Image Display](https://s3.eyeauras.net/media/2025/02/Image.gif)

Awaiting `InvokeAsync` waits for the Show request, not notification closure.
The script token is not passed to Show; returning from the Action does not attach
the notification to `ExecutionAnchors`.

In [upstream v7.0.0.0](https://github.com/Platonenkov/Notification.Wpf/blob/26ab7dae1328b345e7f557d5f7f6e687e01d5d20/Notification.Wpf/Base/NotificationManager.cs),
the manager selects the supplied dispatcher or `Application.Current.Dispatcher`
and posts calls made from another thread. The default expiration passed to the
notification area is five seconds. Overlay/area state is static and library-owned;
a local manager variable is not a disposal scope for the popup. Display duration
can also depend on UI behavior; no live notification run is claimed here.
