---
title: Getting Process list
description: 
published: true
date: 2025-05-11T00:12:14.976Z
tags: 
editor: markdown
dateCreated: 2025-05-11T00:12:14.976Z
---

## Getting the list of running processes

We'll start with a very simple task - what if we want to list running processes on local machine?

In classic C# this is solved by [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)

But as we're operating withing EyeAuras API, we have to take a bit different approach, which will allow
us to very easily switch between different memory reading techniques.

### The simplest appoach - equivalent of working via `Process`
```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```
As a result of running that script, you should see something like this in `EventLog` - list with a very-very basic information about running processes, containing their `ProcessId` (aka `PID`) and `ProcessName`
![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

### Using LeechCore PMEM driver
Now, we'll use a different approach and instead of using `LocalProcess` as our entry point, we'll call `LCProcess` ([LeechCore](https://github.com/ufrisk/LeechCore) Process). LeechCore is a fantastic library developed by [Ulf Frisk](https://github.com/ufrisk). 

Internally, it has multiple different techniques of reading target (not only local, "target") system memory, including, of course, process information.

For you, end user, the matter of switching to a different memory reading approach is a matter of switching a single class, adding namespace and supplying valid startup arguments.

For this example, we'll supply the library with `-device pmem` command line, which makes it load and use [WinPMEM](https://github.com/Velocidex/WinPmem) driver.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; //note the new namespace we've added - this is where LCProcess resides

var processes = LCProcess.GetProcesses("-device", "pmem");
Log.Info(processes.DumpToNamedTable("Processes"));
```
I'll omit the result as it should be exactly the same as they were before.


### Using LeechCore Hyper-V
Lets do something cool here. Lets try to read list of processes running **INSIDE** Hyper-V Virtual Machine (aka `Guest`) from `Host`.
For simplicity, I'll pick ID of the very first VM we have here (id=0), in your case you may have to pick other ID.
```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;


var processes = LCProcess.GetProcesses("-device", "hvmm://id=0");
Log.Info(processes.DumpToNamedTable("Processes"));
```

![VM Processes](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

### Setting up Hyper-V Machine
I'll post here only the most important part - do not forget to **disable** `Dynamic Memory` in VM Settings. 
![Dynamic memory](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

### Listing Hyper-V Machine
For now, this requires running MemProcFS (which uses LeechCore) separately.
```bash
MemProcFS.exe -device hvmm://listvm
```

Here is how output could look like for a very simple scenario with a single VM:
```bash
   Microsoft Hyper-V Virtual Machine plugin 1.2.20240329(beta) for MemProcFS (by Ulf Frisk).

   plugin parameters:
      hvmm://id=<vm id number>
      hvmm://id=<vm id number>,unix
      hvmm://listvm
      hvmm://enumguestosbuild
      hvmm://loglevel=<log level number>
   Example: MemProcFS.exe -device hvmm://listvm

   Virtual Machines:
    --> [id = 0] ShadowForge (PartitionId = 0x2, Full VM)
   You selected the following virtual machine: ShadowForge
```