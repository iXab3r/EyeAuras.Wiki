---
title: Reading Exports
description: 
published: true
date: 2025-06-12T16:08:52.785Z
tags: ", ai-translated"
editor: markdown
dateCreated: 2025-06-12T16:08:52.785Z
---
# Find a DLL export in your own process

Read the export table of `kernel32.dll` already loaded in the EyeAuras host. The result contains names, ordinals and RVAs from the in-memory PE image, including forwarded exports. A symbol can denote code, data or a forwarder string; its record is not itself a field value or an instruction to invoke it.

Use desktop Windows EyeAuras with **EyeAuras.Memory** loaded. The first exercise opens the host's own PID, avoiding guessed process names or addresses.

## List exports and find LoadLibraryA

1. Add **C# Script** and paste the complete program into top-level `Script.csx`:

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

2. Click **Run** and open the event log. It reports the PID, module count and DLL path, then the export table and matches for `LoadLibraryA`.
3. For an entry with `IsForwarder = true`, read `ForwarderName`: the computed address points to the forwarder string in this DLL. This example neither resolves another DLL nor calls the symbol.

| Data | Meaning |
| --- | --- |
| `ModuleName` / `FilePath` | Loaded-module name and path. `GetProcessModule` compares names without case sensitivity; an absent module raises an error rather than returning an empty export table. |
| `BaseAddress` | Start of this loaded PE image. It can differ on the next application launch. |
| `RVA` | Offset from the module base. For a non-forwarded export, its address is `BaseAddress + RVA`. A zero RVA in an unused slot does not identify a function at the base. |
| `Ordinal` | Export number including the DLL's ordinal base, distinct from `ExportAddressTableIndex`. |
| `ExportName` / `UnDecoratedExportName` | Original name and demangled C++ name when available. Ordinal-only exports have no name. |
| `IsForwarder` / `ForwarderName` | Forwarding flag and string such as `DLL.Symbol`; this operation does not resolve the final target. |

`ReadExports()` is the existing PE helper from `EyeAuras.Memory.Scaffolding`, supporting PE32 and PE32+. There is no need for a custom scanner. A valid image without an export directory returns an empty list; access and parsing errors are different outcomes.

`MemoryOfModule` is a live address view, not a disk copy of the DLL. Dispose the view before the reader and its handles; do not separately dispose the borrowed `process.Memory`. Addresses remain meaningful only while that process and module exist. The view does not automatically enforce all bounds for arbitrary reads. Closing the reader does not terminate the process.

<details>
<summary>Select another instance you own</summary>

Obtain its current PID from [the process list](/en/scripting/examples/advanced/memory/get-processes), then replace `Environment.ProcessId`. You need read permission, a compatible process architecture and the named DLL actually loaded there. `LocalProcess.ByProcessName("EyeAuras.exe")` is also supported, but chooses the first match rather than necessarily this host. Neither name nor PID guarantees continued lifetime.

</details>

See [processes](/en/scripting/api/memory/processes) and [memory primitives](/en/scripting/memory-api/memory-basics). `Log` comes from the script host; ordinary helpers need explicit dependencies.
