---
title: PE basics
description: Core PE concepts for Memory API usage and practical reverse engineering work
published: true
date: 2026-04-16T15:57:00.000Z
tags: c#, scripting, memory, reverse-engineering, pe, ai-translated
editor: markdown
dateCreated: 2026-04-16T15:57:00.000Z
---
# PE basics for the Memory API

`PE` is the `.exe` and `.dll` file format on Windows. In the context of the Memory API, this matters because most practical work is done not with a “random address”, but with a specific module: its sections, imports, exports, and `RVA`s. For broader background, see [Game Fundamentals](https://gamehacking.academy/pages/1/02/), [DLL Injector](https://gamehacking.academy/pages/7/01/), and the [PE/COFF Spec](https://learn.microsoft.com/windows/win32/debug/pe-format).

## Key terms

- module — a loaded `.exe` or `.dll`
- `RVA` — an address relative to the module base
- `VA` — an absolute address in the target process memory
- section — a part of the PE image such as `.text`, `.rdata`, or `.data`
- export — something a module exposes to other modules
- import — something a module pulls in from other DLLs

If the module base is `0x7FF700000000` and the `RVA` is `0x1234`, then the `VA` is `BaseAddress + 0x1234`.

## Inspect a loaded module

Run this at the top level of a C# script in EyeAuras with the memory module loaded.
The host supplies `Log`; ordinary classes receive the logger and process explicitly.
An SDK reference alone does not initialize the host. An embedded application needs
startup, `UseMemory()` and `EnsureReadyAsync()`; see [Embedded SDK](/en/scripting/api/nuget/embedded-sdk).

`LocalProcess.ByProcessId` returns a new reader owned by the caller. Its memory
view is used while the reader is alive. The example opens the current process,
reads `kernel32.dll`, then closes the module view and reader:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    using var module = process.MemoryOfModule("kernel32.dll");
    foreach (var section in module.ReadSections())
    {
        Log.Info($"{section.Name}: RVA=0x{section.VirtualAddress:X}, " +
                 $"VA=0x{section.StartVA:X}, end=0x{section.EndVA:X}");
    }
    foreach (var export in module.ReadExports())
    {
        if (export.IsForwarder)
            Log.Info($"{export.ExportName}: forwarder={export.ForwarderName}");
        else
            Log.Info($"{export.ExportName}: ordinal={export.Ordinal}, " +
                     $"VA=0x{module.BaseAddress + (long)export.RVA:X}");
    }
    var imports = module.ReadImports();
    Log.Info($"Imports={imports.Count}");
    foreach (var import in imports)
    {
        Log.Info($"{import.DllName}!{import.FunctionName}: " +
                 $"IAT slot VA=0x{module.BaseAddress + (long)import.IatEntryRva:X}");
    }
}
```

The log lists section RVAs and VAs, exports and imports. Lists may be empty.
Ordinal-only exports may have no name. A forwarded export identifies a forwarding
string, so `BaseAddress + RVA` is not its executable function address.
An import's `IatEntryRva` identifies the IAT slot, not the imported function's address;
ordinal imports need not have `FunctionName`.

These helpers synchronously read a live image without a cancellation token or
snapshot guarantee. Unavailable data or unsupported headers can cause exceptions.
They do not execute functions or modify the IAT. This checks neither native-component
availability nor successful execution in your installed build.

## RVA versus file offset

`ReadSections`, `ReadExports` and `ReadImports` operate on a loaded image at
`IMemory.BaseAddress`. A DLL's raw disk bytes have a different layout.
For a section at RVA `0x1000` with `PointerToRawData = 0x400`, RVA `0x1234`
corresponds to loaded address `BaseAddress + 0x1234`, or file offset
`0x400 + (0x1234 - 0x1000) = 0x634` when within the section's raw data.
A virtual tail may have no corresponding file bytes. See the
[PE specification](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format).

`ModuleSectionEntry` has no `PointerToRawData`; the calculation explains the format,
not a ready file-conversion API. Use a PE reader and section table for disk files.
For the loaded image, reuse the helpers above.

At source revision `c8b2304`, section `StartVA` and `EndVA` are absolute addresses;
`EndVA` is exclusive and the span uses `max(VirtualSize, RawSize)`. This is not proof
that every page is readable. Import-thunk width follows PE32/PE32+, not the pointer
size of your helper class. See [section implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.Shared/Scaffolding/MemoryExtensions.Imports.cs).

## Where this is useful

A basic understanding of PE becomes useful almost everywhere once you move away from “here is a random address” and start thinking in a more stable model:

- module
- section
- export
- import
- `RVA`

That model fits much better with signatures, injection, and patching workflows.

## What to read next

- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)
- [Reading module exports](/scripting/examples/advanced/memory/read-exports)
- [Memory API](/scripting/api/memory)