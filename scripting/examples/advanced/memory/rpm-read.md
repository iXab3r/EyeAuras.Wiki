---
title: Getting the list of running processes
description: 
published: true
date: 2025-09-04T08:42:25.753Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---

# Getting the list of running processes

This example runs in an EyeAuras `C# Script` with `EyeAuras.Memory` loaded. `LocalProcess.GetProcesses()` returns `ProcessInformation` records, not open memory readers; the records do not require disposal. Embedded hosts separately register `UseMemory()` and await `EnsureReadyAsync()`.

We'll start with a very simple task - what if we want to list running processes on local machine?

In classic C# this is solved by [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)

The EyeAuras API lets you select a backend. That selection changes the data source and environment requirements.

## Using .NET primitives - equivalent of working via `Process`
```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```
As a result of running that script, you should see something like this in `EventLog` - list with a very-very basic information about running processes, containing their `ProcessId` (aka `PID`) and `ProcessName`
![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

> LC examples require a compatible MPFS/LeechCore installation, native libraries and a configured device or driver. Factories were checked against source `c8b2304`; native execution was not tested.
{.is-warning}

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
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; 

LCProcess.WinPMEM().GetProcesses(); //use WinPMEM Kernel driver 
LCProcess.WinPMEM().WithAdditionalArguments("-printf", "-v").GetProcesses(); //same, but with verbose logging

//using other acquisition devices
LCProcess.FPGA().GetProcesses(); //use FPGA DMA PCI-E 
LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses(); //select VM index 0 explicitly

//or go full-custom with LeechCore args
LCProcess.Custom("-device", "pmem").GetProcesses(); //allows to supply any custom arguments
```

### Using DMA-devices
DMA is supported by integration with LeechCore - just use `.FPGA()` type of `LCProcess`

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; 

var processList = LCProcess.FPGA().GetProcesses(); //get list of processes by reading it via DMA device
Log.Info($"Processes: \n\t{processList.DumpToTable()}"); // dump process list to the log
```

LC factories and temporary VMM ownership during enumeration were checked against [LCProcess at c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs). `GetProcesses()` returns a list snapshot and disposes its temporary VMM. Native execution remains unverified; the [backend contract](/en/scripting/memory-api/backends/lc-process) describes arguments and limits.

Despite the URL `rpm-read`, this page enumerates processes. To read a value, open a known PID with `using var process = LocalProcess.ByProcessId(pid)` and call `process.Memory.Read<T>(address)` with a known type and absolute address. This is not an example of discovering unknown memory.

## Read next

[Script context](/en/scripting/api/core/app-runtime-contexts) · [Processes and memory](/en/scripting/api/memory/processes) · [Memory primitives](/en/scripting/memory-api/memory-basics)
