---
title: Getting the Process List
description: How to retrieve the process list
published: true
date: 2025-05-11T00:13:27.986Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T00:05:20.439Z
---
# Find the PID of your own program

Before you read memory, you need to pick the right instance of the program. This script logs the local processes at the moment it runs: name and PID. Later you can open a memory reader by PID.

You need desktop EyeAuras on Windows with the **EyeAuras.Memory** module loaded. The `LocalProcess` type is described in the SDK metadata, but the module registers its implementation, so a `using` or an assembly reference alone is not enough.

## List local processes

1. Keep the program whose PID you want open. If several instances share the same name, work out in Task Manager beforehand which one is yours.
2. Add **C# Script** to your aura and paste the whole code into `Script.csx`:

```csharp
using System.Linq;
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.OrderBy(x => x.ProcessName).DumpToNamedTable("Processes"));
```

3. Click **Run** and open the script event log. Find the line for your program and write down `Id`, which is the PID. Every Run gets the list again.

![Process list in the event log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

| Field or operation | How to read the result |
| --- | --- |
| `ProcessInformation.Id` | PID from the source of this list. After the process exits, the same PID can go to another process. |
| `ProcessName` | Process name, not the full path to the executable. Names can repeat. |
| `GetProcesses()` | Returns records as of the call, not open readers. Records have nothing to dispose. |
| `LocalProcess.ByProcessId(pid)` | The next step: opens a specific local process. Dispose the reader when you are done. Whether it opens depends on permissions and on the state of the process. |

Two separate examples show what to do with the PID next: [module exports](/en/scripting/examples/advanced/memory/read-exports) and [a first typed read](/en/scripting/examples/advanced/memory/rpm-read). `ByProcessName` opens the first process with a matching name, so a PID is more precise when there are several instances. The local list uses [.NET process enumeration](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0).

<details>
<summary>Another source: WinPMEM or Hyper-V</summary>

You need these variants only if you already have the **EyeAuras.Memory.MPFS** integration set up with compatible MemProcFS/LeechCore native libraries and the matching acquisition device or driver. The WinPMEM route needs the configured [WinPmem driver](https://github.com/Velocidex/WinPmem).

[LeechCore](https://github.com/ufrisk/LeechCore), by [Ulf Frisk](https://github.com/ufrisk), picks the memory source by its device arguments. A separate script for WinPMEM:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

If Hyper-V is set up, replace the code with this variant and put in the index of your VM:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

This is the process list of the selected guest.

![Guest process list](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

In the Hyper-V setup used for the screenshot, **Dynamic Memory** was disabled.

![Dynamic Memory in the Hyper-V settings](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

You can check the prepared native plugin with its own command:

```bash
MemProcFS.exe -device hvmm://listvm
```

Old sample output from plugin 1.2.20240329:

```text
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

Index 0 here is an example. The VM you need is not selected automatically. The managed API also has `LCProcess.HyperV().ListVirtualMachines()`. `GetProcesses()` creates a temporary VMM and disposes it once the list is collected. When you open a process, the `LCProcess` reader has its own separate lifetime. The builders and their limits are described in the [current factory source](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Memory.MPFS/LCProcess.cs), the [earlier source revision](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs) and the [LCProcess page](/en/scripting/memory-api/backends/lc-process).

</details>

If you embed the SDK in your own application, `UseMemory()` and awaiting `EnsureReadyAsync()` belong to host startup, not to an ordinary `Script.csx`. `Log` exists only in the top-level script. An ordinary C# class gets its logger passed in explicitly. See [script runtime](/en/scripting/api/scripting/runtime), [process contracts](/en/scripting/api/memory/processes) and [memory primitives](/en/scripting/memory-api/memory-basics).
