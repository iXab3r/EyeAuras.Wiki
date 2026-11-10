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

Show **Test run finished** after a local action without opening a full dialog. **Notification.Wpf** creates a WPF popup inside the desktop application; this is not a Windows system notification.

Use Windows EyeAuras with a live WPF `Application.Current`, its UI dispatcher and the ability to restore **Notification.Wpf 7.0.0**. The example is pinned to that package; another version can have a different contract.

1. Add a **C# Script** action under **On Enter** in your own test aura. Start with manual **Run**.
2. Put this complete code in top-level `Script.csx`. `#r` requests the package; `using` imports its namespace.

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

3. After package restore and compilation, click **Run**. A popup displays the supplied text with a requested five-second expiration.

![Example text notification](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)

| Part | What to change or expect |
| --- | --- |
| String passed to `Show` | Your local notification text. |
| `expirationTime` | Requested display duration, separate from how long `InvokeAsync` takes and from cancellation. |
| `Dispatcher.InvokeAsync` | Creates the manager and calls Show on the WPF UI dispatcher. No `Task.Run` is needed. |
| `Notification.Wpf, 7.0.0` | Pinned dependency, not a claim about the latest version. |

Awaiting `InvokeAsync` waits for the Show request, not for popup closure. The token is checked before that request and is not passed into `Show`. The manager is not an `IDisposable` scope that owns this popup: the library stores its window and notification areas in static state. Finishing the action, or pressing **Stop** after display, does not itself close the popup. Its remaining lifetime and UI behaviour belong to the library.

<details>
<summary>Invoke it with a hotkey and explore other styles</summary>

To invoke without opening the editor, add **Hotkey Is Active**, assign a free key such as `F3` and choose **Hold**. Entering the active state runs **On Enter**; releasing the key lets it enter again. This creates another notification, not an on/off switch for the existing one. Earlier descriptions called the mode `Click/Hold`.

The library also supports other styling and content. These earlier examples illustrate alternatives not automatically enabled by the single-string call:

![Other Notification.Wpf styles](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Notification containing an image](https://s3.eyeauras.net/media/2025/02/Image.gif)

See [Notification.Wpf](https://github.com/Platonenkov/Notification.Wpf) by [Alexander Platonenkov](https://github.com/Platonenkov), its [pinned manager source](https://github.com/Platonenkov/Notification.Wpf/blob/26ab7dae1328b345e7f557d5f7f6e687e01d5d20/Notification.Wpf/Base/NotificationManager.cs) and the [historical ready-made example](https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb).

</details>
