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

## Using the LeechCore PMEM driver

Now let’s use a different approach. Instead of `LocalProcess` as the entry point, we’ll call `LCProcess` ([LeechCore](https://github.com/ufrisk/LeechCore)). LeechCore is an excellent library developed by [Ulf Frisk](https://github.com/ufrisk).

Internally, it supports different ways of reading memory from a target system—not just the local machine—including, of course, process information.

For the end user, switching between memory-reading methods usually comes down to replacing one class, adding a namespace, and passing different startup arguments.

In this example, we’ll pass the command line `-device pmem`, which tells the library to load and use the [WinPMEM](https://github.com/Velocidex/WinPmem) driver.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; // обратите внимание на новое пространство имён — LCProcess находится здесь

var processes = LCProcess.GetProcesses("-device", "pmem");
Log.Info(processes.DumpToNamedTable("Processes"));
```

The output is omitted here, since it should be exactly the same as before.

## Using LeechCore with Hyper-V

Now let’s do something more interesting: try to get the list of processes running **INSIDE** a Hyper-V virtual machine (the guest system) from the host.

For simplicity, I’ll use the ID of the first VM I found (`id=0`). In your case, you may need a different ID.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;

var processes = LCProcess.GetProcesses("-device", "hvmm://id=0");
Log.Info(processes.DumpToNamedTable("Processes"));
```

![VM Processes](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

## Configuring the Hyper-V VM

Only the most important point here: make sure `Dynamic Memory` is **disabled** in the virtual machine settings.

![Dynamic memory](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

## Getting the List of Hyper-V Virtual Machines

At the moment, this requires launching MemProcFS (which is based on LeechCore) separately.

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