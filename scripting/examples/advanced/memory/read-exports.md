---
title: Reading Exports
description: 
published: true
date: 2025-06-12T16:08:52.785Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-12T16:08:52.785Z
---
# Find a DLL export in your own process

Let's look at the export table of `kernel32.dll`, which is already loaded in the EyeAuras process. The script logs names, ordinals and RVAs from the PE image in memory, including forwarded exports. An export can be a function, data or a forwarder string.

You need desktop EyeAuras on Windows with **EyeAuras.Memory** loaded. The script uses the PID of EyeAuras itself, so you do not have to guess another process's name or addresses.

## List exports and find LoadLibraryA

1. Add a **C# Script** action and paste the whole code into `Script.csx`:

```csharp
using System;
using System.Linq;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;
using PoeShared.Scaffolding;

{
    using var process = LocalProcess.ByProcessId(Environment.ProcessId);
    var modules = process.GetProcessModules();
    Log.Info($"Process: {process.ProcessName}, PID={process.ProcessId}; modules={modules.Count}");

    var module = process.GetProcessModule("kernel32.dll");
    using var memory = process.MemoryOfModule(module);
    var exports = memory.ReadExports();
    Log.Info($"Module: {module.FilePath}; base=0x{module.BaseAddress.ToInt64():X}");
    Log.Info(exports.DumpToNamedTable("Exports"));

    var matches = exports.Where(x => x.ExportName == "LoadLibraryA").ToArray();
    if (matches.Length == 0) Log.Info("LoadLibraryA: export not found");
    foreach (var export in matches)
    {
        var address = module.BaseAddress.ToInt64() + export.RVA;
        Log.Info($"{export.ExportName}: ordinal={export.Ordinal}, RVA=0x{export.RVA:X}, address=0x{address:X}");
        if (export.IsForwarder) Log.Info($"Forwarder: {export.ForwarderName}");
    }
}
```

2. Click **Run** and open the event log. First come the PID, the module count and the DLL path, then the export table and the search result for `LoadLibraryA`.
3. If an entry has `IsForwarder = true`, look at `ForwarderName`: the computed address points to the forwarder string inside this DLL.

| Data | What it means |
| --- | --- |
| `ModuleName` / `FilePath` | The name used to pick the loaded module, and its path. `GetProcessModule` compares names case-insensitively. A missing module is an error, not an empty export list. |
| `BaseAddress` | Address where this PE image starts in the current process. It can be different on the next launch. |
| `RVA` | Offset from the module base. For an export that is not forwarded, the address is `BaseAddress + RVA`. A zero RVA in an unused table slot does not mean a function at the base address. |
| `Ordinal` | Export number including the DLL's ordinal base. It is not the same as `ExportAddressTableIndex`. |
| `ExportName` / `UnDecoratedExportName` | The original name and, when available, the demangled C++ name. An ordinal-only export has no name. |
| `IsForwarder` / `ForwarderName` | Forwarding flag and a string such as `DLL.Symbol`. The final address is not resolved here. |

`ReadExports()` is a ready-made PE helper from `EyeAuras.Memory.Scaffolding`. It handles PE32 and PE32+, so you do not need to write your own scanner. A valid image with no export directory returns an empty list. An access or parsing error is a different case.

`MemoryOfModule` is a live view of addresses, not a copy of the DLL from disk, and it does not own the process. Dispose the view first, then the reader with its handles. `process.Memory` does not belong to the script, so do not dispose it separately. Addresses are valid while the process is alive and the module is loaded. The view does not automatically check all bounds for arbitrary reads.

<details>
<summary>Select another instance you own</summary>

Take the PID from [the process list](/en/scripting/examples/advanced/memory/get-processes) and replace only `Environment.ProcessId`. You need read permission, a compatible process architecture and a process where the DLL is actually loaded. `LocalProcess.ByProcessName("EyeAuras.exe")` also works, but it takes the first match, which is not necessarily this host.

</details>

See [processes](/en/scripting/api/memory/processes) and [memory primitives](/en/scripting/memory-api/memory-basics). `Log` comes from the script host. An ordinary helper class gets it passed in explicitly.
