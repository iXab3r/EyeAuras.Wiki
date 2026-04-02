---
title: Performance and Memory Profiler
description: Documentation for the performance and memory profiler.
published: true
date: 2024-05-14T19:49:19.852Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:55:28.895Z
---
## What problem does this solve?

Sometimes the program uses more memory or system resources than expected. In some cases this is caused by bugs, and sending a report helps identify and fix them.

## How does it work?

If the program is using too much CPU, we are most likely interested in the **Performance profiler**. If it is using too much memory, use the **Memory profiler**.

Below is a quick explanation of how to use these tools. They can be used independently. After you take memory snapshots or record profiling results, click **Report a problem.** In the list of files to upload, you will see new entries:

- **Memory-** if you used the **Memory Profiler**
- **Performance-** if you used the **Performance profiler**

In some cases, the report file can be **very large**, especially when sending memory snapshots. Because of that, uploading may fail. If you cannot upload the file to the server with the **Send** button in the upload window, you can use **Google Drive** or any other cloud storage instead. You can send me the link in **Discord (Xab3r#3780) / Telegram (ixab3r)**.

![](https://i.imgur.com/GVmE825.png)

## Performance profiler

If the app is lagging, this is the tool you need.

In **Settings**, click **Start profiling** to begin the profiling process. This starts recording what the program is doing into a special file. In most cases, recording for **10–30 minutes** is enough, then you can click **Stop profiling.** That amount of data is usually sufficient to find the issue.

**IMPORTANT! During the recorded period, the program should be doing exactly the same thing it normally does.** For example, if your character was farming, put it back on farm before recording and enable the same set of auras you usually use.

![](https://i.imgur.com/W97u6Ku.png)

## Memory Profiler

Sometimes the program has a **memory leak**, meaning it keeps consuming more and more memory even though it is doing the same work as usual. That is exactly what **memory snapshots** are for.

To take a snapshot, go to **Settings** and click **Take snapshot.** This copies the entire contents of the program’s memory into a special file.

**IMPORTANT! Take the snapshot only when the problem is already clearly visible** — for example, when the program is already using several times more memory than normal.

The snapshot process can be **very slow**. In some cases it may take **minutes or even tens of minutes**. During that time, the program will not work normally, but eventually the snapshot will finish and everything will return to normal.

![](https://i.imgur.com/OrOAW7G.png)