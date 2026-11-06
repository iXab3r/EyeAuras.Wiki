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

Run the `LocalProcess` examples at the top level of a C# script in EyeAuras with
the memory module loaded. The host supplies `Log`; ordinary classes receive it and
the process explicitly. An embedded host needs startup, `UseMemory()` and
`EnsureReadyAsync()`; see [Embedded SDK](/en/scripting/api/nuget/embedded-sdk).
The caller owns the reader and releases it after use; its memory accessor is used
within that lifetime. Native-component availability is a separate prerequisite.

Supply your own test process, a full path to your DLL and matching architecture.
`game` and `C:\Tools\MyHack.dll` are replaceable inputs, not supplied resources.
`NativeLocalProcess` also declares these operations; LC is outside this workflow.
Source checks below target `c8b2304`; no native execution is claimed.

## InjectDll

This is the simplest route.

```csharp
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessName("game");
    process.InjectDll(@"C:\Tools\MyHack.dll");
}
```

`void InjectDll(string fullDllPath)` returns no module address or wait handle.
The current `RpmInjector` checks the DLL/target architecture, resolves `LoadLibraryW`
(including supported named forwarders), allocates and writes the UTF-16 path,
starts a thread and waits for it. It checks the thread exit code, closes the thread
handle and frees the path buffer in `finally`; the overload that opens a process
handle also closes it. There is no cancellation token or bounded wait. A reader's
`Dispose` is not a command to unload the DLL.

This is source evidence, not proof that a particular DLL initialized successfully
on your Windows build. Confirm the DLL's own result. The implementation does not
check the wait-result code, and its exit-code check is not a full module-address
return contract. See [RpmInjector](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory/Internal/RpmInjector.cs).

## CreateThread

If `InjectDll(...)` is a ready high-level helper, then `CreateThread(...)` is a lower-level building block.

`IProcessControlApi` exposes the following fragment for an already-open reader
and caller-prepared absolute `IntPtr startAddress` and `IntPtr parameter`:

```csharp
var threadId = process.CreateThread(startAddress, parameter);
```

Place it inside the reader's owning scope. It returns a `uint` thread ID, not a
wait handle or function result. Returning does not establish completion.
The function address, argument lifetime and completion protocol belong to the caller.
Do not free arguments immediately after starting the thread. Loading a DLL manually
also requires correct export/forwarder handling and a UTF-16 terminated path;
use the complete `InjectDll` operation when that is the task.

## APC

If you need execution through `APC`, Memory API provides `QueueUserApc(...)`.

`IProcessSupportsUserApc` declares two forms:

```csharp
void QueueUserApc(int threadId, IntPtr apcRoutine, IntPtr apcArgument);
void QueueUserApc(IntPtr hThread, IntPtr apcRoutine, IntPtr apcArgument);
```

These are reference signatures. The caller supplies a live target, a chosen thread,
a function with the required ABI and an argument valid until execution. The handle
overload borrows `hThread`; the caller closes it. There is no execution result or
cancellation token. Choosing the first thread in a list does not establish readiness
or completion.

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

{
    using var process = LocalProcess.ByProcessName("game");

    var mapping = process.InjectDllViaManualMapping(
        @"C:\Tools\MyHack.dll",
        LocalProcessMmapFlags.None);

    Log.Info($"Base=0x{mapping.BaseAddress.ToInt64():X}");
    Log.Info($"EntryPoint=0x{mapping.EntryPoint.ToInt64():X}");
}
```

### Mapping from memory

```csharp
using System.IO;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessName("game");

    var dllBytes = File.ReadAllBytes(@"C:\Tools\MyHack.dll");
    var mapping = process.InjectDllViaManualMapping(dllBytes, LocalProcessMmapFlags.None);
    Log.Info($"Base=0x{mapping.BaseAddress.ToInt64():X}");
}
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

These are address values, not an owned resource. The descriptor has no `Dispose`
and supplies no safe unload protocol. The public wrapper discards its `LibraryMapper`
instance after mapping; disposing the process reader does not invoke `UnmapLibrary`.
The overloads accept `string` or `Memory<byte>` with explicit flags; convenience
variants take `bool erasePE = false`.

### Mapper flags

- `LocalProcessMmapFlags.None` — normal route
- `LocalProcessMmapFlags.DiscardHeaders` — remove PE headers after mapping
- `LocalProcessMmapFlags.SkipInitRoutines` — do not call `DllMain` and `TLS callbacks`

The practical meaning of these flags:

- `None` — the normal default
- `DiscardHeaders` — a narrower, more specialized scenario
- `SkipInitRoutines` — an advanced mode, because the library may be loaded but not initialized

The current mapper loads dependencies, builds imports and relocations, maps sections,
sets up exception/TLS support and calls initialization routines unless skipped.
A successful return occurs after those synchronous steps; it does not establish
arbitrary application-level readiness. `SkipInitRoutines` skips TLS callbacks and
entry-point calls, not all TLS setup. Define the initialization protocol separately.
Source contains cleanup on mapping failure and an explicit `UnmapLibrary` operation;
this is not a compatibility guarantee for every DLL or Windows layout.
See [LibraryMapper](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.Shared/Lunar/LibraryMapper.cs).

## PIC

`PIC` means `position-independent code` — code that can run without a fixed address, from an arbitrary memory location.

In practical RE work, this usually means:

- shellcode
- a small bootstrap stub
- a trampoline
- a self-contained payload that prepares something first and then calls the required function

This is the most advanced route in this article, because here you are no longer loading a DLL through a loader or calling a ready-made Windows API function. You are running your own executable code.

A complete integration needs actual machine code, its architecture and ABI, entry
point, arguments and completion protocol. Memory API does not generate that payload.
Allocate a buffer, write the payload bytes, set the required protection, execute the
agreed entry point, wait according to the integration protocol and only then release
owned buffers. This describes responsibilities, not a ready loader. Use byte writes
for machine code and `Read<T>`/`Write<T>` for ordinary scalar values.

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