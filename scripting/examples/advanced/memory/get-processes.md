---
title: Getting the Process List
description: How to retrieve the process list
published: true
date: 2025-05-11T00:13:27.986Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T00:05:20.439Z
---
# Getting a List of Running Processes

The local example runs in an EyeAuras `C# Script` with the `EyeAuras.Memory` module loaded. `LocalProcess.GetProcesses()` returns `ProcessInformation` records, not open memory readers; do not dispose each record. An embedded SDK host separately needs `UseMemory()` and `EnsureReadyAsync()` during application setup.

Let’s start with a very simple task: what if we want to get a list of processes running on the local machine?

In regular C#, this is usually done by calling [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)

However, since we’re working inside the EyeAuras API, we need a slightly different approach that makes it easy to switch between different memory-reading methods.

## The simplest option — equivalent to working through `Process`

```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

After running this script, you should see something like this in `EventLog`: a list with basic information about running processes, including their `ProcessId` (or `PID`) and `ProcessName`.

![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

> LC examples require a compatible MPFS/LeechCore installation, its native libraries and a configured device or driver. The factories were checked against source `c8b2304`; changing the managed class does not prepare the native environment.
{.is-warning}

## Using the LeechCore PMEM driver

Now let’s use a different approach. Instead of `LocalProcess` as the entry point, we’ll call `LCProcess` ([LeechCore](https://github.com/ufrisk/LeechCore)). LeechCore is an excellent library developed by [Ulf Frisk](https://github.com/ufrisk).

Internally, it supports different ways of reading memory from a target system—not just the local machine—including, of course, process information.

For the end user, switching between memory-reading methods usually comes down to replacing one class, adding a namespace, and passing different startup arguments.

In this example, we’ll pass the command line `-device pmem`, which tells the library to load and use the [WinPMEM](https://github.com/Velocidex/WinPmem) driver.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; // LCProcess belongs to this namespace

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

The visible process list depends on the device and permissions; it need not match the local list.

## Using LeechCore with Hyper-V

Now let’s do something more interesting: try to get the list of processes running **INSIDE** a Hyper-V virtual machine (the guest system) from the host.

For simplicity, I’ll use the ID of the first VM I found (`id=0`). In your case, you may need a different ID.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;

var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

![VM Processes](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

## Configuring the Hyper-V VM

Only the most important point here: make sure `Dynamic Memory` is **disabled** in the virtual machine settings.

![Dynamic memory](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

## Getting the List of Hyper-V Virtual Machines

To diagnose the native Hyper-V plugin, you can launch MemProcFS separately. The historical output below illustrates that route; it is not the only managed route for enumerating virtual machines.

```bash
MemProcFS.exe -device hvmm://listvm
```

Here’s what the output might look like in a simple setup with a single virtual machine:

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

LC factories and temporary VMM ownership during enumeration were checked against [LCProcess at c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs). `GetProcesses()` returns a list snapshot and disposes its temporary VMM. Native execution remains unverified; the [backend contract](/en/scripting/memory-api/backends/lc-process) describes arguments and limits.

## Read next

[Script context](/en/scripting/api/core/app-runtime-contexts) · [Processes and memory](/en/scripting/api/memory/processes) · [Memory primitives](/en/scripting/memory-api/memory-basics)
