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

## The main rule

In most cases, the normal workflow looks like this:

1. open the process
2. get the module
3. work inside that module

That is what `MemoryOfModule(...)` is for:

```csharp
using System.Diagnostics;
using System.Linq;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var kernel32 = process.MemoryOfModule("kernel32.dll");
```

After that, `kernel32` is no longer the entire process memory. It is a view into a specific PE image.

## What the Memory API can do

For PE-related work, these methods are usually the most useful:

- `ReadSections()`
- `ReadExports()`
- `ReadImports()`

```csharp
var sections = kernel32.ReadSections();
var exports = kernel32.ReadExports();

var mainModule = process.GetProcessModules()
    .First(x => x.ModuleName.EndsWith(".exe", StringComparison.OrdinalIgnoreCase));

using var mainMemory = process.MemoryOfModule(mainModule);
var imports = mainMemory.ReadImports();
```

This is usually enough to:

- understand the module layout
- find a public function
- inspect external dependencies
- prepare for `IAT` patching, `pattern scanning`, or a `code cave`

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