---
title: How to report a problem
description: 
published: true
date: 2026-10-11T00:00:00.000Z
tags: reporting, ai-translated
editor: markdown
dateCreated: 2023-10-15T20:42:29.377Z
---

# Report a problem

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

## Error Report

Open the dialog with **Report a problem** in the window title, or from the reporting button provided by a mini-app. It may also open automatically after an exception.

Describe the problem, select the relevant attachments, then send the report to EyeAuras or save the archive to share with support or a share author. The comment is editable, including when an app prefills it. An empty comment is omitted.

- `systemInfo.txt` and, in current EyeAuras clients, `applicationInfo.txt` are collected automatically. Application information includes the sender, license features, startup data, tree counts and subscriptions.
- `stacktrace.txt` contains exception details when available. Recent application logs and application-window screenshots are selected by default.
- Desktop screenshots, aura configuration and other optional files can be selected in the dialog. Desktop screenshots and aura configuration are not selected by default.

Read [Problem reports and receiving archives](/features/problem-reports) for the file format, collected data, an example and instructions for accepting reports as a share author. Older archives without `applicationInfo.txt` remain usable.

![](/1efpgwe[1].png)
