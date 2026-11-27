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

Before opening a memory reader, identify the program instance you need. This script logs a snapshot of local process names and PIDs; it does not read each process's memory.

Use desktop Windows EyeAuras with **EyeAuras.Memory** loaded. `LocalProcess` has an SDK metadata facade, but the module registers its implementation. A namespace import or assembly reference alone does not prepare that backend.

## List local processes

1. Leave your own program open. If several instances have the same name, distinguish them in Task Manager first.
2. Add **C# Script** to your own aura and paste this whole program into top-level `Script.csx`:

```csharp
using System.Linq;
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.OrderBy(x => x.ProcessName).DumpToNamedTable("Processes"));
```

3. Click **Run**, open the script event log and find your program. Record `Id`, its PID. Another Run obtains a new snapshot.

![Earlier process-list output in the event log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

| Field or operation | Meaning |
| --- | --- |
| `ProcessInformation.Id` | PID in this list's source, not a memory address. A PID can be reused after a process exits. |
| `ProcessName` | Process name, not the full executable path. Names need not be unique. |
| `GetProcesses()` | Returns records, not open memory readers. Do not dispose each record. |
| `LocalProcess.ByProcessId(pid)` | Opens the selected local reader for the next operation. Dispose that reader when finished; access depends on permissions and process lifetime. |

Continue with [module exports](/en/scripting/examples/advanced/memory/read-exports) or [a first typed read](/en/scripting/examples/advanced/memory/rpm-read). `ByProcessName` selects the first match, so a PID is clearer when several instances exist. Enumeration does not guarantee that every listed process can be opened or read. The local builder uses [.NET process enumeration](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0).

<details>
<summary>Another source: prepared WinPMEM or Hyper-V</summary>

These alternatives require a configured **EyeAuras.Memory.MPFS** integration with compatible MemProcFS/LeechCore native libraries and the relevant acquisition device or driver. They are separate from the ordinary local exercise. [LeechCore](https://github.com/ufrisk/LeechCore), by [Ulf Frisk](https://github.com/ufrisk), selects the source through device arguments; the WinPMEM route needs the prepared [WinPmem driver](https://github.com/Velocidex/WinPmem).

A complete WinPMEM listing program:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

For a prepared Hyper-V environment, use this complete alternative with your VM's actual index:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

This lists processes in the selected guest; it need not match the host's local list.

![Earlier guest-process list](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

The earlier Hyper-V setup disabled **Dynamic Memory**. The image shows that setting; the installed Hyper-V acquisition plugin determines its requirements, not `LocalProcess`.

![Dynamic Memory in the earlier Hyper-V configuration](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

A prepared native plugin also offers this diagnostic command:

```bash
MemProcFS.exe -device hvmm://listvm
```

Historical output from plugin 1.2.20240329, retained to explain its parameters and VM index:

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

Index 0 is only an example, not automatic selection of your intended VM. The managed API also provides `LCProcess.HyperV().ListVirtualMachines()`. `GetProcesses()` creates a temporary VMM and disposes it after collecting records; an opened `LCProcess` reader has a separate lifetime. The [current factory source](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Memory.MPFS/LCProcess.cs), [earlier source revision](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs) and [LCProcess contract](/en/scripting/memory-api/backends/lc-process) describe these builders and their limits. Changing the managed class does not install the native stack.

</details>

An embedded SDK application separately configures `UseMemory()` and awaits `EnsureReadyAsync()` during host startup. These are not extra lines for this ordinary `Script.csx`. `Log` belongs to the top-level script; an ordinary C# helper receives its logger explicitly. See [script runtime](/en/scripting/api/scripting/runtime), [process contracts](/en/scripting/api/memory/processes) and [memory primitives](/en/scripting/memory-api/memory-basics).
