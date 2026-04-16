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

## How to find them

You should search for a `code cave` in the memory of a specific module:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var moduleMemory = process.MemoryOfModule("kernel32.dll");
```

Then you can enumerate matching candidates:

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

If you need more than just finding a cave and want to actually prepare it for patching or a payload, use explicit `ProtectMemory(...)` and `FreeMemory(...)` from `IProcessControlApi`. A short getting-started example is available in [Memory API - Getting Started](/scripting/memory-api/getting-started).

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