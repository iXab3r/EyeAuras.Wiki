---
title: Getting the list of running processes
description: 
published: true
date: 2025-08-06T17:18:21.144Z
tags: 
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---

# Getting the list of running processes

We'll start with a very simple task - what if we want to list running processes on local machine?

In classic C# this is solved by [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)

But as we're operating withing EyeAuras API, we have additional capabilities, which will allow
us to very easily switch between different memory reading techniques allowing to counteract any defensive measures out there.

## Using .NET primitives - equivalent of working via `Process`
```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```
As a result of running that script, you should see something like this in `EventLog` - list with a very-very basic information about running processes, containing their `ProcessId` (aka `PID`) and `ProcessName`
![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

## Using LeechCore
Now, we'll use a different approach and instead of using `LocalProcess` as our entry point, we'll call `LCProcess` ([LeechCore](https://github.com/ufrisk/LeechCore) Process). LeechCore is a fantastic library developed by [Ulf Frisk](https://github.com/ufrisk). 

There are which so-called `acquisition device` which are available in LC. You can find more arguments on his [Wiki](https://github.com/ufrisk/LeechCore/wiki)

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; //LCProcess is inside MPFS

var processes = LCProcess.WinPMEM().GetProcesses(); //use kernel driver
Log.Info(processes.DumpToNamedTable("Processes"));
```

### Using LeechCore device-specific builders

```csharp
LCProcess.WinPMEM().GetProcesses(); //use WinPMEM Kernel driver 
LCProcess.WinPMEM().WithAdditionalArguments("-printf", "-v").GetProcesses(); //same, but with verbose logging

//using other acquisition devices
LCProcess.FPGA().GetProcesses(); //use FPGA DMA PCI-E 
LCProcess.HyperV().GetProcesses(); //read info from the first system Hyper-V VM 

//or go full-custom with LeechCore args
LCProcess.Custom("-device", "pmem").GetProcesses(); //allows to supply any custom arguments
```
