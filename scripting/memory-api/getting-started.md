---
title: Memory API - Getting Started
description: A quick introduction to using the Memory API in EyeAuras scripts
published: true
date: 2026-04-16T00:26:32.678Z
tags: c#, scripting, memory, reverse-engineering, ai-translated
editor: markdown
dateCreated: 2026-04-16T00:26:32.678Z
---
# Memory API in EyeAuras Scripts

Use the Memory API when you want to read real process memory instead of the screen itself: `entity list`, player structures, coordinates, HP, target id, `view matrix`, and similar data. If you want a quick overview of this kind of game context, the [Aimbot](https://gamehacking.academy/pages/5/06/) and [ESP](https://gamehacking.academy/pages/5/09/) lessons from Game Hacking Academy are a good place to start.

The main idea behind EyeAuras is not that it is “just another memory reader.” The key part is that different memory access methods all share the same upper-level API:

- typed reads and writes
- strings, structs, and pointer math
- `MemoryOfModule(...)`
- `ReadImports()` and `ReadExports()`
- `pattern scanning`
- `code caves`

So you can swap the backend, while most of your tools and workflow stay the same.

## Available backends

- `LocalProcess` — a regular local process backend built on top of WinAPI. This is the best starting point in most cases. It does not work for protected processes.
- `NativeLocalProcess` — the same local-process scenario, but built on top of a handle you already obtained yourself.
- `LCProcess` — a backend powered by MemProcFS and LeechCore. The main use case here is `DMA`, usually through `FPGA`. Useful references: [Ulf Frisk](https://github.com/ufrisk), [LeechCore](https://github.com/ufrisk/LeechCore), [MemProcFS](https://github.com/ufrisk/MemProcFS), and [PCILeech](https://github.com/ufrisk/pcileech).
- `KDProcess` — a backend that works through a kernel driver. Use it when plain WinAPI is no longer enough.

> `KernelDriver` is currently in closed beta. If you are a pack author and need access, contact me directly. `FPGA` and `DMA` scenarios are already available to anyone interested.
{.is-warning}

> If you already have your own driver or your own way of reading memory, it can also be integrated into the Memory API. There are dedicated extension points for that.
{.is-info}

## What `IProcess` means

In short, an `interface` in C# here does not mean “some complicated internal thing.” It is just a contract.

- `IProcess` — an object that represents a process
- `IProcessMemory` — an object used to work with that process memory

For a simple starting model, just remember this:

- `LocalProcess` opens the process
- `process.Memory` gives you access to its memory

## First example

The safest first step is to open the current EyeAuras process, get a module, and read its exports.

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var kernel32 = process.MemoryOfModule("kernel32.dll");

Log.Info($"Process: {process.ProcessName} ({process.ProcessId})");
Log.Info($"Modules: {process.GetProcessModules().Count}");
Log.Info($"kernel32 exports: {kernel32.ReadExports().Count}");
```

This example already shows the core model: a process, a module, and working with a proper module memory view instead of a single “magic address.”

## Basic workflow

Most of the time, the flow looks like this:

1. open the process
2. pick the module you need
3. narrow the memory scope with `MemoryOfModule(...)`
4. find a stable anchor through an export, import, or signature
5. only then start reading structs and pointers

If you want to understand why this is more reliable than hardcoding one static address, these pages help a lot: [Game Fundamentals](https://gamehacking.academy/pages/1/02/), [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/), and [Pattern Scanner](https://gamehacking.academy/pages/7/02/).

## What is always available, and what is not

The rule here is simple:

- memory reading is available almost everywhere
- active process control depends on the backend

Almost any backend is good for:

- reading memory
- modules, threads, and memory regions
- `MemoryOfModule(...)`
- imports, exports, and signatures

But things like freezing a process, allocating memory, changing protection, `DLL inject`, `APC`, `remote thread`, or `manual mapping` are not available everywhere.

- `LocalProcess` and `NativeLocalProcess` are suitable both for reading and for standard user-mode process control.
- `LCProcess` is mainly meant for external memory reading and analysis. It is usually not used for active process control.
- `KDProcess` is for cases where you need deeper control and plain WinAPI is no longer enough.

## Allocation, `ProtectMemory(...)`, and `FreeMemory(...)`

In recent versions, `IProcessControlApi` got explicit methods for the full lifecycle of working with an allocated memory region:

- `AllocateMemory(...)` allocates memory and returns an `IMemoryRegion`
- `IMemoryRegion` stores `Address` and `Size`
- `ProtectMemory(...)` changes page protection and returns the previous value
- `FreeMemory(...)` explicitly frees a previously allocated region

This is useful when you need to:

- prepare a buffer inside the target process
- temporarily open a page for patching or shellcode
- restore the previous protection afterward
- free the memory cleanly at the end

A minimal example looks like this:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
var control = (IProcessControlApi) process;

var region = control.AllocateMemory(
    IntPtr.Zero,
    4096,
    MemoryAllocationType.Commit | MemoryAllocationType.Reserve,
    MemoryProtectionType.ReadWrite);

try
{
    var oldProtection = control.ProtectMemory(
        region.Address,
        region.Size,
        MemoryProtectionType.ExecuteRead);

    // You can write data, apply patches, or prepare a payload here.

    control.ProtectMemory(region.Address, region.Size, oldProtection);
}
finally
{
    control.FreeMemory(region);
}
```

Important:

- `ProtectMemory(...)` and `FreeMemory(...)` belong to active process control, not simple memory reading
- they usually make sense with `LocalProcess`, `NativeLocalProcess`, and `KDProcess`
- not every backend is required to support them; if it does not, you may get a `NotSupportedException`

## Why `DLL inject` matters

As long as you are reading memory from the outside, you are mostly observing the process. You need `DLL inject` when code must run inside the target program itself: calling its internal functions, installing hooks, building a `code cave`, or implementing internal logic. If you want a quick introduction to that transition, see [DLL Memory Hack](https://gamehacking.academy/pages/3/03/), [DLL Injector](https://gamehacking.academy/pages/7/01/), [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/), and [Triggerbot](https://gamehacking.academy/pages/5/05/).

## Read next

- [Memory basics](/scripting/memory-api/memory-basics)
- [C# Struct Layout](/scripting/memory-api/csharp-structures)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)
- [LocalProcess](/scripting/memory-api/backends/local-process)
- [LCProcess](/scripting/memory-api/backends/lc-process)
- [Custom `IProcess`](/scripting/memory-api/backends/custom-process)
- [Custom memory backends](/scripting/memory-api/backends/custom-memory-backends)
- [Getting a list of running processes](/scripting/examples/advanced/memory/get-processes)
- [Reading module exports](/scripting/examples/advanced/memory/read-exports)
- [Pattern scanning](/scripting/api/memory/pattern-scanning)
- [Memory API](/scripting/api/memory)