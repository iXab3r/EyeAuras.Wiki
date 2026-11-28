---
title: Reading a Known Value from Memory
description: 
published: true
date: 2025-09-04T08:42:25.753Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---
# Read a known integer from memory you own

To read something you need a real address and a known type. We allocate four bytes in the EyeAuras process, write the `int` 742 there and read it back through `process.Memory.Read<int>`. Then we write 743 to the same allocation and read it again.

You need desktop EyeAuras on Windows with **EyeAuras.Memory** loaded. The script works with its own practice buffer, so no driver, DMA device or address search is needed.

## Read and update the buffer

1. Add a **C# Script** action and paste the whole code into `Script.csx`:

```csharp
using System;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    var address = Marshal.AllocHGlobal(sizeof(int));
    try
    {
        Marshal.WriteInt32(address, 742);
        using var process = LocalProcess.ByProcessId(Environment.ProcessId);
        cancellationToken.ThrowIfCancellationRequested();
        var before = process.Memory.Read<int>(address);
        Log.Info($"PID={process.ProcessId}; address=0x{address.ToInt64():X}; int={before}");
        process.Memory.Write<int>(address, 743);
        var after = process.Memory.Read<int>(address);
        Log.Info($"After write: {after}");
    }
    finally
    {
        Marshal.FreeHGlobal(address);
    }
}
```

2. Click **Run** and open the event log. The first line should have the current PID, a hexadecimal address and `int=742`. The second says `After write: 743`.
3. Click Run again: the values are the same, but the address can be different. The block frees the memory at the end, so do not use an address from a previous Run.

| Input or owner | Why it matters |
| --- | --- |
| `Environment.ProcessId` | The process that runs the script. It also owns the allocation. |
| `address` | The absolute virtual address returned by `AllocHGlobal`. It is not an RVA or a module offset. |
| `int` / `sizeof(int)` | Type and size are known from the start: a 32-bit integer, 4 bytes. An address by itself says nothing about the type. |
| `Marshal.WriteInt32` | Writes the initial value with an ordinary .NET call. The read and the next write go through the EyeAuras high-level methods. |
| `using var process` | Inside the explicit block, closes the reader before the buffer is freed. You do not dispose `process.Memory` separately. |

`Read<T>` and `Write<T>` work with unmanaged scalars and structs. A plain `int` needs no byte arrays or `BinaryPrimitives`. Byte operations are for something else: real binary blocks, encoded strings, machine code. If the read fails, `Read<int>` does not return zero in place of an error. The token is checked before the operations. The synchronous calls themselves do not take it.

For a separate application of your own you need its current PID, an address obtained from that application and the data layout and architecture that match it. For addresses inside a DLL, first get [the loaded module base](/en/scripting/examples/advanced/memory/read-exports), then use the known offset for your version.

<details>
<summary>Process-list and LeechCore alternatives</summary>

If you only need the list, this script is enough:

```csharp
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

![Process list in the event log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

[Process listing](/en/scripting/examples/advanced/memory/get-processes) explains what `Id` is, how to pick an instance and how a list record differs from an open reader. In an embedded SDK host, `UseMemory()` and `EnsureReadyAsync()` are called separately, when the host is set up.

The variants below replace the enumeration in an already configured **MPFS/LeechCore** setup. They are not an addition to the local read script. You need compatible **EyeAuras.Memory.MPFS** assemblies, native libraries and a suitable device or driver. Read about the source in [LeechCore](https://github.com/ufrisk/LeechCore), its [manual](https://github.com/ufrisk/LeechCore/wiki) and the [LCProcess page](/en/scripting/memory-api/backends/lc-process). The library is by [Ulf Frisk](https://github.com/ufrisk).

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Replace the `var processes = ...` line with **one** of these:

```csharp
var processes = LCProcess.WinPMEM().WithAdditionalArguments("-printf", "-v").GetProcesses();
var processes = LCProcess.FPGA().GetProcesses();
var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
var processes = LCProcess.Custom("-device", "pmem").GetProcesses();
```

| Variant | Prepared source |
| --- | --- |
| `WinPMEM()` / `Custom("-device", "pmem")` | Local memory through a configured WinPMEM. `-printf` and `-v` add diagnostic output. |
| `FPGA()` | A compatible DMA device. The list belongs to the system whose memory it provides, which is not necessarily the local EyeAuras host. |
| `HyperV().UseVirtualMachineByIndex(0)` | A guest with an explicitly chosen index. Replace 0 with your own value. |

`GetProcesses()` returns the list as of the call and releases its temporary VMM. To open a reader you need a separate `ByProcessId`/`ByProcessName` call and a lifetime of its own for the reader. See the [current factory source](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Memory.MPFS/LCProcess.cs) or the [earlier revision](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs).

</details>

[Script runtime](/en/scripting/api/scripting/runtime) · [Process contracts](/en/scripting/api/memory/processes) · [Memory primitives](/en/scripting/memory-api/memory-basics) · [.NET process enumeration](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)
