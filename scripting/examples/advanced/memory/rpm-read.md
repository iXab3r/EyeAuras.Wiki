---
title: Reading Mem using ReadProcessMemory
description: 
published: true
date: 2025-05-10T23:09:15.299Z
tags: 
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---

## Getting the list of running processes

We'll start with a very simple task - what if we want to list running processes on local machine?

In classic C# this is solved by [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)

But as we're operating withing EyeAuras API, we have to take a bit different approach, which will allow
us to very easily switch between different memory reading techniques.

### The simplest appoach - equivalent of working via `Process`
```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;


var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```
As a result of running that script, you should see something like this in `EventLog` - list with a very-very basic information about running processes, containing their `ProcessId` (aka `PID`) and `ProcessName`
![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

### Using LeechCore PMEM driver


```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;

var processes = LCProcess.GetProcesses("-device", "pmem");
Log.Info(processes.DumpToNamedTable("Processes"));
```

