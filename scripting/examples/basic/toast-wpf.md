---
title: Toasts
description: 
published: true
date: 2025-03-23T22:21:57.666Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T22:21:44.199Z
---
# Show a short notification from a script

The script shows a popup message, **Test run finished**, without opening a full dialog. The **Notification.Wpf** library shows it. This is the library's own WPF window inside the desktop application, not a Windows system notification.

You need EyeAuras on Windows with a live WPF `Application.Current` and its UI dispatcher. The **Notification.Wpf 7.0.0** NuGet package must also restore. The example is pinned to that version. The library's API may differ in another one.

1. In a test aura, add **C# Script** under **On Enter**. To begin with, start it by hand with **Run**.
2. Paste the whole code into top-level `Script.csx`. `#r` restores the package and `using` imports its namespace.

```csharp
#r "nuget: Notification.Wpf, 7.0.0"
using System;
using Notification.Wpf;

cancellationToken.ThrowIfCancellationRequested();
await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
{
    var manager = new NotificationManager();
    manager.Show("Test run finished", expirationTime: TimeSpan.FromSeconds(5));
});
```

3. Wait until the package restores and the code compiles, then click **Run**. A popup with this text appears. The library is asked to show it for five seconds.

![Example text notification](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)

| Part | What you can change |
| --- | --- |
| String passed to `Show` | The notification text. |
| `expirationTime` | How long to show the notification. |
| `Dispatcher.InvokeAsync` | Creates the manager and shows the notification on the WPF UI thread. No `Task.Run` is needed. |
| `Notification.Wpf, 7.0.0` | The version the example is pinned to. |

The manager is not `IDisposable` and does not own a single notification: the library keeps its windows and notification areas in its own static state. Finishing the script, or pressing **Stop** after the popup is shown, does not close it.

If a label should stay visible the whole time an aura's condition holds, use a [Text overlay](/en/overlays/text) and set its content and visibility. Keep the popup for one-off events, such as the end of a job.

<details>
<summary>Start it with a hotkey and other styles</summary>

To skip opening the editor, add **Hotkey Is Active**, assign a free key such as `F3` and choose **Hold**. When the aura becomes active, **On Enter** runs. Release the key and the aura can be activated again. Each press shows a new notification. It does not switch an existing one on and off.

The library can show notifications with other styling and content. The pictures from its examples show variants that the one-string call above does not give you by itself:

![Other Notification.Wpf styles](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Notification containing an image](https://s3.eyeauras.net/media/2025/02/Image.gif)

[Notification.Wpf source](https://github.com/Platonenkov/Notification.Wpf) by [Alexander Platonenkov](https://github.com/Platonenkov), [manager source for the pinned version](https://github.com/Platonenkov/Notification.Wpf/blob/26ab7dae1328b345e7f557d5f7f6e687e01d5d20/Notification.Wpf/Base/NotificationManager.cs). The [historical ready-made example](https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb) is still available.

</details>
