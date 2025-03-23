---
title: Toasts
description: 
published: true
date: 2025-03-23T22:21:57.666Z
tags: 
editor: markdown
dateCreated: 2025-03-23T22:21:44.199Z
---

You can import a ready-made example from here: [https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb](https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb)

For displaying notifications, you can use a C# script with just a few lines of code — there are many libraries available that can show such messages. For example, I will use [Notification.Wpf](https://github.com/Platonenkov/Notification.Wpf) by [Alexander Platonenkov](https://github.com/Platonenkov).

1. Create an aura.
2. Add `HotkeyIsActive` and bind it to a convenient key (e.g., `F3`) — this will be our toggle on/off. Change the activation type to `Click/Hold`.
3. Add a `C# Script` action in `On Enter`.
4. Copy-paste the script below.
5. When `F3` is pressed, a notification will appear in the bottom-right corner of the screen.

```csharp
#r "nuget: Notification.Wpf, 7.0.0"
using Notification.Wpf.Controls;
using Notification.Wpf;

var notificationManager = new NotificationManager();
notificationManager.Show("test");
```

![Notification Result](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)
![Other Notification Styles](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Image Display](https://s3.eyeauras.net/media/2025/02/Image.gif)