---
title: Lifecycle Events
description: Lifecycle Events trigger reacts on application events such as AppStarted/AppClosed
published: true
date: 2025-02-27T15:07:04.010Z
tags: 
editor: markdown
dateCreated: 2025-02-27T15:07:04.010Z
---

`**Lifecycle Events**` trigger is used to track app-related events such as AppStarted/Closed.

![Lifecycle Events Trigger](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_mrej2NiRxEGWybKN.png)

### **Overview**
You can subscribe to one or more events from the list. If any of them occurs - trigger becomes active.
This could be used to execute actions linked to different states of the program, e.g. run the script when app is started.

This trigger works in three different states:
1.  **Active**/**Inactive**: If any of events in the list have occurred - trigger will become active
2.  **Inactive**: If none of events in the list have occurred - trigger will be inactive
3.  **Unknown**: If you have not selected at least one event to listen to - trigger will stay in `Unknown` state

### **Options**

-   **Events**: There are multiple app-related events. You can subscribe to any of those. 

> IMPORTANT! When some event has happened, it is guaranteed that even if trigger will subscribe AFTER event has occurred, trigger will still process them correctly right at the moment of subscription
{.is-info}


# **Events**

## App Started
Triggers when application has been started **and** is fully loaded. It is guaranteed that all triggers and actions are ready-to-run at that point.

**Very-very important** - in EyeAuras, there is an option called `Pause Everything if Active` which **DISABLES** all auras/trees when app window becomes active(aka **foreground**/**focused**).
This is needed to avoid a situation with wrongly configured scripts stealing control from the user - with that option set, just alt-tabbing back into the app will stop everything.

![Pause Everything](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_Rfv0Ke9HBt2WiKd7.png)

This concept conflicts with Triggers nature as right after the app is loaded, window will be active, which would stop Actions from being executed. 
For normal development process, I would recommend to not touch this option as it could really save you from troubles. 
BUT! For Packs, having Pause disabled seems like a totally valid choice - it is expected that at that point everything is already configured and tested. 
You can disable Pause in `Packing configuration` either on Pack's page or in the app

![Packing configuration - web](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_Ki4uH7viSSvyQ07p.png)

![Packing configuration - desktop](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_VGeE1h6tXZrwM8BB.png)

> IMPORTANT! When some event has happened, it is guaranteed that even if trigger will subscribe AFTER event has occurred, trigger will still process them correctly right at the moment of subscription
{.is-info}

### **Example Use Case**

This trigger is a great way to make your workspace more dynamic and adaptive to your current focus. 

-   **Running application script on app startup**: This is expected to be the primary use case. You can have your script be executed right when the app gets loaded. That script can do literally anything you want, including exiting the app when user stops it/closes your script window