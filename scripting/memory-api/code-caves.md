---
title: Code Cave
description: What a code cave is in EyeAuras, how to find one, and when you actually need it
published: true
date: 2026-04-16T15:56:00.000Z
tags: c#, scripting, memory, reverse-engineering, code-cave, ai-translated
editor: markdown
dateCreated: 2026-04-16T15:56:00.000Z
---
# Code Caves in the Memory API

A `code cave` is an unused area inside a PE module, usually filled with zeros. You can use it for data, a small payload, a trampoline, or a helper buffer. For the general idea, these materials are useful: [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/), [DLL Memory Hack](https://gamehacking.academy/pages/3/03/) and [DLL Injector](https://gamehacking.academy/pages/7/01/).

EyeAuras does not turn this into a "magic" operation. The API simply lets you find suitable regions through `EnumerateCodeCaves(...)`.

## Collect module candidates

This ordinary helper borrows an already-open process and exact PE module name.
It materializes the lazy search before disposing the view:

```csharp
using System.Linq;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

static CodeCaveEntry[] FindCandidates(IProcess process, string moduleName)
{
    using var memory = process.MemoryOfModule(moduleName);
    return memory.EnumerateCodeCaves(minBytes: 64, alignment: 16).ToArray();
}
```

`StartVA` is absolute, `StartRva` is relative to the module base, and `Size` is
usable length after alignment. An empty array means no candidates in the scanned
sections. The caller still owns the process.

At EyeAuras `20fd3d4`, defaults scan readable executable sections and accept a
mixture of `0x00`, `0xCC` and `0x90`. `maxScanPerSection = 1_048_576` limits each
section separately. `alignment = 1` disables alignment; choose a power of two
for expected rounding. Reads are synchronous without cancellation. Finding padding
neither proves it unused nor reserves it.

## How to find them

You should search for a `code cave` in the memory of a specific module:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var moduleMemory = process.MemoryOfModule("kernel32.dll");
```

The following fragments run while `moduleMemory` and its process remain open.
Enumerate candidates before disposing either owner:

```csharp
var caves = moduleMemory.EnumerateCodeCaves(
    minBytes: 64,
    alignment: 16);
```

Each result is returned as a `CodeCaveEntry`. In practice, the most useful fields are usually `Section`, `StartVA`, `StartRva`, and `Size`.

## Data caves and executable caves

Not every cave is suitable for the same job. In practice, the common split looks like this:

- `readable + writable + not executable` — strings, structures, arguments, helper data
- `readable + executable` — `trampoline`, payload, redirection

Use `sectionFilter` for that:

```csharp
var dataCave = moduleMemory.EnumerateCodeCaves(
        minBytes: 128,
        alignment: 2,
        sectionFilter: s => s.IsReadable && s.IsWritable && !s.IsExecutable)
    .FirstOrDefault();

var execCave = moduleMemory.EnumerateCodeCaves(
        minBytes: 64,
        alignment: 16,
        sectionFilter: s => s.IsReadable && s.IsExecutable)
    .FirstOrDefault();
```

## What this does not do

`EnumerateCodeCaves(...)` does not:

- write data by itself
- create a hook
- place a `jmp`
- change memory protection
- run code automatically

It only finds a suitable location.

`FreeMemory` releases allocated memory, not padding found inside a PE module.
Search grants no ownership or write permission. Protection changes and writes
are separate operations whose validity is not established by a scan result.

## Limitations

- Search for caves through `MemoryOfModule(...)`, not across the entire process memory.
- The search itself only requires memory reading.
- Writing into a discovered cave depends on the backend.
- For active patching, you usually need `LocalProcess`, `NativeLocalProcess`, or `KDProcess`.
- With `LCProcess`, cave enumeration is useful for analysis, but not as a typical process control tool.

## What to read next

- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Memory API - Getting Started](/scripting/memory-api/getting-started)
