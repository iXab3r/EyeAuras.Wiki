---
title: DLL injection
description: Practical DLL injection with the Memory API and manual mapping
published: true
date: 2026-04-16T23:20:00.000Z
tags: c#, scripting, memory, reverse-engineering, dll-inject, manual-mapping, ai-translated
editor: markdown
dateCreated: 2026-04-16T23:20:00.000Z
---
# DLL injection in Memory API

You need DLL injection when the code must run **inside** the target process. This is usually required for hooks, internal logic, calling internal functions, and other cases where an external reader is no longer convenient.

If you need some external background first, these are useful:
- [DLL Injector](https://gamehacking.academy/pages/7/01/)
- [DLL Memory Hack](https://gamehacking.academy/pages/3/03/)
- [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/)

The examples below use `LocalProcess` because it is the most direct place to start. The same methods also exist on `NativeLocalProcess`. `LCProcess` is usually not the backend you want for injection scenarios.

## InjectDll

This is the simplest route.

```csharp
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");
process.InjectDll(@"C:\Tools\MyHack.dll");
```

Inside Memory API, this call performs a classic `LoadLibraryW` injection:

1. checks that the DLL exists
2. verifies that the DLL architecture matches the target process
3. finds `LoadLibraryW` in the target process
4. allocates memory for the UTF-16 DLL path
5. writes the string there
6. creates a remote thread

What makes this route distinct:

- the DLL must exist on disk
- the Windows loader handles imports, `DllMain`, and `TLS callbacks`
- this is the easiest path to start with and debug

That is why `InjectDll(...)` should almost always be your first choice if you simply need to load a library and validate an idea.

Important things to remember:

- use a full DLL path
- the architecture must match
- protected processes and permission restrictions can break the flow before `LoadLibraryW` is even reached

## CreateThread

If `InjectDll(...)` is a ready high-level helper, then `CreateThread(...)` is a lower-level building block.

Memory API exposes it through `IProcessControlApi`:

```csharp
var threadId = process.CreateThread(startAddress, parameter);
```

This is useful when you have already prepared everything else yourself:

- found the function address inside the target process
- allocated memory for the arguments
- wrote the data there
- only need to start code inside the process

In practice it often looks like this:

```csharp
using System.Linq;
using System.Text;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

var dllPath = @"C:\Tools\MyHack.dll";
var dllPathBytes = Encoding.Unicode.GetBytes(dllPath + "\0");

var remotePath = process.AllocateMemory(
    dllPathBytes.Length,
    MemoryProtectionType.ReadWrite);

process.Memory.Write(remotePath.Address, dllPathBytes);

using var kernel32 = process.MemoryOfModule("kernel32.dll");
var loadLibraryWExport = kernel32.ReadExports()
    .First(x => x.ExportName == "LoadLibraryW");
var loadLibraryW = new IntPtr(kernel32.BaseAddress + (long) loadLibraryWExport.RVA);

var threadId = process.CreateThread(loadLibraryW, remotePath.Address);
```

This is essentially the manual version of what `InjectDll(...)` does, just without the ready-made wrapper.

What makes this route distinct:

- you control `startAddress` and `parameter` yourself
- you can call not only `LoadLibraryW`, but any other suitable function
- this is a basic building block for more advanced scenarios

## APC

If you need execution through `APC`, Memory API provides `QueueUserApc(...)`.

A practical example is placing the DLL path into remote memory, finding `LoadLibraryW`, and queueing it on an existing thread.

```csharp
using System.Linq;
using System.Text;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

var dllPath = @"C:\Tools\MyHack.dll";
var dllPathBytes = Encoding.Unicode.GetBytes(dllPath + "\0");

var remotePath = process.AllocateMemory(
    IntPtr.Zero,
    dllPathBytes.Length,
    MemoryAllocationType.Commit | MemoryAllocationType.Reserve,
    MemoryProtectionType.ReadWrite);

process.Memory.Write(remotePath.Address, dllPathBytes);

using var kernel32 = process.MemoryOfModule("kernel32.dll");
var loadLibraryWExport = kernel32.ReadExports()
    .First(x => x.ExportName == "LoadLibraryW");
var loadLibraryW = new IntPtr(kernel32.BaseAddress + (long) loadLibraryWExport.RVA);

var threadId = process.GetThreads().First().ThreadId;
process.QueueUserApc(threadId, loadLibraryW, remotePath.Address);
```

This is a fully Memory API-based route:

- `AllocateMemory(...)`
- `process.Memory.Write(...)`
- `MemoryOfModule(...)`
- `ReadExports()`
- `QueueUserApc(...)`

What makes this route distinct:

- the code is queued to an **existing** thread
- no new thread is created for execution
- the result depends heavily on how the selected thread behaves

The main APC caveat:

- the call will only run when the thread enters an `alertable wait`

Practical consequences:

- `APC` should not be treated as “instant execution”
- the DLL path string must not be freed too early
- choosing a thread at random is often a bad idea

This route is not the usual starting point. Use it when you specifically need execution through an already existing thread.

## Manual mapping

If `LoadLibraryW` does not fit your case, Memory API provides `InjectDllViaManualMapping(...)`.

### Mapping from file

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessName("game");

var mapping = process.InjectDllViaManualMapping(
    @"C:\Tools\MyHack.dll",
    LocalProcessMmapFlags.None);

Log.Info($"Base={mapping.BaseAddress.ToHexadecimal()}");
Log.Info($"EntryPoint={mapping.EntryPoint.ToHexadecimal()}");
```

### Mapping from memory

```csharp
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

var dllBytes = File.ReadAllBytes(@"C:\Tools\MyHack.dll");
var mapping = process.InjectDllViaManualMapping(dllBytes);
```

What makes this route distinct:

- the DLL can be loaded not only from disk, but also from `byte[]`
- the entire flow is controlled by the mapper
- after loading, you get `BaseAddress` and `EntryPoint`

In other words, this is no longer “ask Windows to load the DLL”, but a separate loader path built on top of Memory API.

### What it returns

`InjectDllViaManualMapping(...)` returns `ManualMappedLibraryDescriptor`:

- `BaseAddress`
- `EntryPoint`

This is useful in advanced scenarios where you want not only to load a DLL, but also control its startup separately or rely on its base address.

### Mapper flags

- `LocalProcessMmapFlags.None` — normal route
- `LocalProcessMmapFlags.DiscardHeaders` — remove PE headers after mapping
- `LocalProcessMmapFlags.SkipInitRoutines` — do not call `DllMain` and `TLS callbacks`

The practical meaning of these flags:

- `None` — the normal default
- `DiscardHeaders` — a narrower, more specialized scenario
- `SkipInitRoutines` — an advanced mode, because the library may be loaded but not initialized

If you enable `SkipInitRoutines`, then you are responsible for starting the init logic yourself. In EyeAuras tests, this is done with separate trampolines and an explicit entrypoint call through a thread or APC.

## PIC

`PIC` means `position-independent code` — code that can run without a fixed address, from an arbitrary memory location.

In practical RE work, this usually means:

- shellcode
- a small bootstrap stub
- a trampoline
- a self-contained payload that prepares something first and then calls the required function

This is the most advanced route in this article, because here you are no longer loading a DLL through a loader or calling a ready-made Windows API function. You are running your own executable code.

In practice it often looks like this:

```csharp
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

byte[] picBytes = GetPicPayloadSomehow();

var remotePic = process.AllocateMemory(
    picBytes.Length,
    MemoryProtectionType.ReadWrite);

process.Memory.Write(remotePic.Address, picBytes);
process.ProtectMemory(remotePic.Address, picBytes.Length, MemoryProtectionType.ExecuteRead);

var threadId = process.CreateThread(remotePic.Address, IntPtr.Zero);
```

Here Memory API gives you the basic building blocks:

- `AllocateMemory(...)`
- `process.Memory.Write(...)`
- `ProtectMemory(...)`
- `CreateThread(...)`

But the payload itself is entirely your responsibility:

- the code must actually be position-independent
- the entry address must be correct
- the calling convention and arguments must match
- the page must be executable

That is why `PIC` is best treated not as “another injection method”, but as a separate advanced scenario for running your own code inside the process.

## In practice

Unless you have a specific reason to do otherwise:

1. start with `InjectDll(...)`
2. if you need more raw control over code startup, use `CreateThread(...)`
3. if you need execution through an existing thread, use `QueueUserApc(...)`
4. if you need your own loader path or a DLL from memory, use `InjectDllViaManualMapping(...)`
5. if you are already working with shellcode and bootstrap payloads, then `PIC` makes sense

## Easy to forget

- you cannot mix `x86` and `x64`
- `InjectDll(...)` expects a full, valid path on disk
- `CreateThread(...)` requires `startAddress` to actually point to executable code inside the target process
- `QueueUserApc(...)` requires both a correct thread and a correct execution moment
- manual mapping does not make a DLL automatically compatible with every case
- `PIC` requires maximum care, because at that point there are almost no loader safety nets left
- the lower-level the route is, the more responsibility you take on yourself

## What to read next

- [Memory API - Getting started](/scripting/memory-api/getting-started)
- [Memory basics](/scripting/memory-api/memory-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)
- [LocalProcess](/scripting/memory-api/backends/local-process)
- [LCProcess](/scripting/memory-api/backends/lc-process)