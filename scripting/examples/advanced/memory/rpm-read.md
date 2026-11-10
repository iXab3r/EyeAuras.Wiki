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

A first memory read needs a real address and a known type. Allocate four bytes in the EyeAuras process, initialise an `int` to 742 and read it through `process.Memory.Read<int>`. Then write 743 only to that allocation and read it again. Each Run obtains its own address rather than copying one from another process.

Use desktop Windows EyeAuras with **EyeAuras.Memory** loaded. This is the script's own teaching buffer; no driver, DMA device or address search is needed.

## Read and update the buffer

1. Add **C# Script** and paste the complete program into `Script.csx`:

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

2. Click **Run** and open the event log. The first line should contain the current PID, a hexadecimal address and `int=742`; the next reports `After write: 743`.
3. Run again: values are the same, but the address can change. The block frees the allocation on exit, so an address from a previous Run must not be reused.

| Input or owner | Why it matters |
| --- | --- |
| `Environment.ProcessId` | Process actually executing the script, which also owns this allocation. |
| `address` | Absolute virtual address returned by `AllocHGlobal`, not an RVA or module offset. |
| `int` / `sizeof(int)` | A known 32-bit integer occupying 4 bytes. An arbitrary address does not reveal its own schema. |
| `Marshal.WriteInt32` | Ordinary .NET initialisation of the owned buffer. The subsequent read/write use EyeAuras high-level primitives. |
| `using var process` | Inside the explicit block, releases the reader before the buffer is freed. `process.Memory` is borrowed. |

`Read<T>` and `Write<T>` support unmanaged scalars and structs. A plain `int` needs neither byte-array wrappers nor `BinaryPrimitives`; byte operations serve actual binary payloads, encoded text or machine code. A failed `Read<int>` is not silently reported as a successful zero. The token is checked before the synchronous operations, which do not take the Run token themselves.

For a separate application you own, obtain its current PID, a valid address from that application and the agreed data layout/architecture. Do not substitute a similar-looking fixed address. For a known versioned offset within a DLL, first obtain [the loaded module base](/en/scripting/examples/advanced/memory/read-exports).

<details>
<summary>Process-list and LeechCore alternatives</summary>

To list processes rather than read this buffer, use this independent program:

```csharp
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

![Earlier process-list output](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

[Process listing](/en/scripting/examples/advanced/memory/get-processes) explains `Id`, instance selection and records versus readers. Embedded hosts separately register `UseMemory()` and await `EnsureReadyAsync()`.

The following are enumeration alternatives for an already configured **MPFS/LeechCore** environment. They require compatible **EyeAuras.Memory.MPFS**, native libraries and the selected device or driver. They do not belong after the local buffer program. [LeechCore](https://github.com/ufrisk/LeechCore), its [manual](https://github.com/ufrisk/LeechCore/wiki) and the [LCProcess contract](/en/scripting/memory-api/backends/lc-process) describe acquisition; the library is by [Ulf Frisk](https://github.com/ufrisk).

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Replace only the `var processes = ...` line with **one** of these fragments:

```csharp
var processes = LCProcess.WinPMEM().WithAdditionalArguments("-printf", "-v").GetProcesses();
var processes = LCProcess.FPGA().GetProcesses();
var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
var processes = LCProcess.Custom("-device", "pmem").GetProcesses();
```

| Variant | Prepared source |
| --- | --- |
| `WinPMEM()` / `Custom("-device", "pmem")` | Local acquisition through configured WinPMEM. `-printf`, `-v` add diagnostics. |
| `FPGA()` | A compatible DMA device. Records describe the system it acquires, not automatically the local EyeAuras host. |
| `HyperV().UseVirtualMachineByIndex(0)` | A guest with an explicit VM index; replace 0 with your own selection. |

`GetProcesses()` returns a snapshot and releases its temporary VMM. Opening a reader requires separate `ByProcessId`/`ByProcessName` and ownership. See the [current factory source](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Memory.MPFS/LCProcess.cs) or the [earlier revision](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs). A different factory does not prepare native dependencies.

</details>

[Script runtime](/en/scripting/api/scripting/runtime) · [Process contracts](/en/scripting/api/memory/processes) · [Memory primitives](/en/scripting/memory-api/memory-basics) · [.NET process enumeration](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)
