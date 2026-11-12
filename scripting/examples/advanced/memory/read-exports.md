---
title: Reading Exports
description: 
published: true
date: 2025-06-12T16:08:52.785Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-12T16:08:52.785Z
---

# Reading module exports from the image

Run this top-level C# Script in EyeAuras with the Memory module loaded and read
access to the selected process. The inputs are `EyeAuras.exe` and its loaded
`kernel32.dll`. Name lookup selects the first matching process; use a known PID
with `LocalProcess.ByProcessId` when the instance matters.


In previous guides we were able to successfully output list of modules of a running process.

This already gives you ability to read some information from them, but modern games are very complex, with thousands of structures and methods.
That is there public exports come into play - these are bits of information exported by DLLs that point to specific places in the binary.

## Example
```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using (var process = LocalProcess.ByProcessName("EyeAuras.exe"))
{
    Log.Info($"Process: {process.ProcessName} ({process.ProcessId})");

    var modules = process.GetProcessModules();
    Log.Info($"Modules: {modules.Count()}");

    using var kernel32Mem = process.MemoryOfModule("kernel32.dll");
    var kernel32Exports = kernel32Mem.ReadExports();
    Log.Info($"Kernel 32 exports: {kernel32Exports.DumpToNamedTable("Exports")}");

    var loadLibraryA = kernel32Exports.FirstOrDefault(x => x.ExportName == "LoadLibraryA");
    Log.Info($"LoadLibraryA: {loadLibraryA}");
}
```



The EventLog receives process details and the loaded PE image's export table.
`MemoryOfModule` is a live address view, not a DLL copy; keep its process open.
`ReadExports` includes ordinal-only entries and forwarders. Check `IsForwarder`
and `ForwarderName` before treating an entry as code; an exported name alone
is not sufficient to invoke a function. The process reader owns its handles;
disposing the module view does not replace that ownership.

See [processes](/scripting/api/memory/processes) and [memory primitives](/scripting/memory-api/memory-basics).
