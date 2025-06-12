---
title: Reading Exports
description: 
published: true
date: 2025-06-12T16:08:52.785Z
tags: 
editor: markdown
dateCreated: 2025-06-12T16:08:52.785Z
---

# Reading module exports from the image

In previous guides we were able to successfully output list of modules of a running process.

This already gives you ability to read some information from them, but modern games are very complex, with thousands of structures and methods.
That is there public exports come into play - these are bits of information exported by DLLs that point to specific places in the binary.

## 
```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using (var process = LocalProcess.ByProcessName("EyeAuras.exe"))
{
    Log.Info($"Process: {process.ProcessName} ({process.ProcessId})");

    var modules = process.GetProcessModules();
    Log.Info($"Modules: {modules.Count()}");

    var kernel32Mem = process.MemoryOfModule("kernel32.dll");
    var kernel32Exports = kernel32Mem.ReadExports();
    Log.Info($"Kernel 32 exports: {kernel32Exports.DumpToNamedTable("Exports")}");

    var loadLibraryA = kernel32Exports.First(x => x.ExportName == "LoadLibraryA");
    Log.Info($"LoadLibraryA: {loadLibraryA}");
}
```


