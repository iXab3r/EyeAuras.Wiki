---
title: How-to: Report a problem
description: 
published: true
date: 2024-05-14T11:15:49.956Z
tags: 
editor: markdown
dateCreated: 2023-10-15T20:42:29.377Z
---

**EyeAuras** is a very complex program that continually evolves. Unfortunately, its evolution isn't without setbacks. It has had, currently has, and will likely have errors in the future—some minor and others critical.

This reality is why I've built an entire system allowing users to effortlessly send logs, configurations, screenshots, and any other pertinent data that could aid in diagnosing and rectifying a problem.

Errors fall into 3 main categories:

### **1\. Defect**

**What's happening?**

Something isn't functioning as anticipated; perhaps you've noticed unusual behavior, a trigger that's not working, or an action not executing its intended task. While the app remains operational, it's not running at full capacity.

**What should you do?**

Click the “Report a problem” button found in the window title. An “Error Report” dialog will pop up, allowing you to share details and send logs.

### **2\. Application Crash**

**What's happening?**

The application abruptly ceases to function. This is typically due to a critical error within the app or its configuration.

**What should you do?**

An “Error Report” dialog will automatically display, offering you the chance to send or save logs. After closing the Error Report dialog, the application will terminate since it can't function normally.

### **3\. Native Application Crash - worst case scenario**

**What's happening?**

The application stops instantly without any alerts or warnings, and without the “Error Report” dialog—it just shuts down.

Several factors could be responsible:

-   **Anti-viruses**: EyeAuras employs certain tactics to ensure compatibility with numerous games and programs. Occasionally, these measures might set off anti-virus alerts. Often, it's a machine-learning algorithm flagging a potential threat—not necessarily identifying a virus but merely signaling the user to inspect further. A quick solution is adding the EyeAuras folder to your antivirus exclusions. While I may develop a solution in the future, as of 2023, I haven't solidified any plans.
-   **Anti-cheats**: Given its automated nature, some anti-cheat systems might detect EyeAuras. For instance, in the past, EasyAntiCheat would shut down EyeAuras upon detection. However, as of October 2023, systems like EasyAntiCheat, ActiveAntiCheat, and Vanguard haven't detected or disrupted the program.
-   **Critical app errors**: Although I strive to avert such situations, they can occur. Should this happen, please contact me directly, and we'll work on a solution.

**What should you do?**

If restarting the app resolves the issue, click “Report a problem” to provide diagnostic data that could help identify the problem—previous logs can still be sent or saved.

If the app consistently crashes upon restart—a rare event—please do the following.

1.  Navigate to “**%appdata%\\EyeAuras\\release**” in Explorer (just copy & paste this into address bar). The folder that will be opened is a main EyeAuras storage, it contains configuration, logs, everything
2.  Backup “**config.cfg**” and folder “backups” somewhere. This is main configuration file (and backups) which contains all your settings, auras, etc.
3.  Remove “**config.cfg**” and try to start the app. **This will reset application configuration to default settings and will remove everything. That is why you've made backup at the previous step**
4.  If app has started successfully - please click on “Report a problem” and send me the logs. In some cases this will be enough for me to diagnose the issue.
5.  If app has not started - compress the whole folder and send it to me directly in Discord or in Telegram. Fortunately, this is a very rare occurrence and in most cases you won't have to do that.
6.  After the issue has been resolved (via application update, for example), you can restore your configuration (from backup file) and try again.

## **Error Report**

You can manually trigger this dialog by pressing the “Report a problem” button in the window title. Alternatively, it might launch automatically if the program detects an internal exception.

This feature will automatically collate all necessary information (like the Windows Event log and OS statistics), combine logs and screenshots (this is turned off by default), and compress everything into a singular archive.

This archive will either be sent to the EyeAuras central server or saved as a local file, which you can then dispatch directly to me.

-   **stacktrace.txt** - contains information about critical error which crashed the app, may not be present in some cases
-   **EyeAuras.\*.log** - application logs, by default only latest files are attached. If issue happened during previous lifecycle of the app, you may have to extend selection
-   **EventLog\_\*.log** - Windows system logs, contains OS alerts and other global events in the system. In some cases this will have extended information about application crash
-   **Wnd \*.png** - screenshots of application windows
-   **Screen \*.png** - screenshots of your PC screens, **not sent by default**
-   **metrics.txt** - contains information about EyeAuras internal structures, such as timings, does not have any personal data

![](/1efpgwe[1].png)