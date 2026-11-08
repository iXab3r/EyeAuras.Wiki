---
title: Custom IProcess
description: How to connect your own driver or memory reading method to the Memory API
published: true
date: 2026-04-16T16:20:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:20:00.000Z
---
# How to create a custom IProcess

If you already have your own driver, bridge, or another way to read memory, you almost never need to build “yet another Memory API”. In most cases, two layers are enough:

1. `IMemoryBackend` for raw `read/write`
2. `IProcess`, which describes the process and exposes `Memory`

Once you have that, your backend immediately gets access to typed reads, `MemoryOfModule(...)`, imports, exports, signatures, and `code cave`.

## What to use as a reference in the codebase

- `NativeLocalProcess` — a good example of a process wrapper built on top of an existing backend
- `LCProcess` — a good reference for a backend mostly focused on reading and analysis
- `KDProcess` — an example of a backend with a deeper control API

## Minimal structure

`IMemoryBackend` stays very small:

```csharp
public interface IMemoryBackend : IDisposable, IMemorySpan
{
    bool IsValid { get; }
    bool TryReadMemory(IntPtr address, Span<byte> target);
    bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source);
}
```

In most cases, this is where your driver call, `IOCTL`, RPC, or DMA bridge lives.

The process wrapper connects this transport to a process context. Integration inputs are an already-open transport client, a PID in its address space, module/thread/region information, and an explicit connection owner. The SDK has no universal `MyDriverClient`; your transport supplies those operations.

1. `IMemoryBackend` also supplies inherited `BaseAddress` (`long`) and `MemorySize` (`int`), validity, and raw reads/writes at absolute addresses. `true` means success; the interface has no transferred-byte count or cancellation token. Do not report a partial read as a complete read.
2. Create `new MemoryAccessor(log, backend)` and expose it as `IProcessMemory Memory`. Typed reads, strings and PE helpers use this accessor.
3. `IProcess` also provides `IFluentLog Log`, `bool IsValid`, `string? ProcessName`, `int ProcessId`, `GetProcessModules()`, `GetThreads()`, `VirtualQuery(IntPtr)` and `GetMemoryRegions()`. Modules must report the target's actual bases and sizes for `MemoryOfModule` to select a range.
4. The owner stops consumers and disposes the accessor, backend and transport according to their ownership. Constructing `MemoryAccessor` does not attach the backend to accessor disposal.

The resulting object can be consumed without knowing its transport:

```csharp
static int ReadValue(EyeAuras.Memory.IProcess process, long absoluteAddress)
{
    return process.Memory.Read<int>(absoluteAddress);
}
```

This helper returns an `int` or propagates a read error. It borrows the process and does not close it or validate the transport. Contracts were checked at EyeAuras `20fd3d4`; connecting the specific driver remains an integration input.

## Alternative transport through an in-process DLL

A custom process can also communicate with your DLL inside the target using a named pipe, shared memory or another IPC mechanism. The agent handles reads, writes and process metadata; the external stack still consists of a transport client, `IMemoryBackend`, then `IProcess`.

This allows in-process work or higher-level target data to be exposed through the same consumer API. You must supply DLL delivery, protocol, serialization and versioning. An agent crash can affect the target process, and this has different protection constraints from external reading. See [DLL injection](/en/scripting/memory-api/dll-inject) for delivery mechanisms.

## What you should implement right away

If you want the integration to be truly usable, do not stop at `TryReadMemory(...)`. A practical minimum is:

- `Memory`
- `GetProcessModules()`
- `GetThreads()`
- `VirtualQuery(...)`
- `GetMemoryRegions()`

Without modules, you lose proper `MemoryOfModule(...)`. Without regions and `VirtualQuery(...)`, memory analysis becomes much less useful.

## What you can add later

If your driver can do more, you can also expose extra capability interfaces on top of `IProcess`:

- `IProcessControlApi` — suspend, allocate, protect, `remote thread`
- `IProcessSupportsManualMapping`
- `IProcessSupportsUserApc`

So the usual path looks like this:

1. first, make reading stable and describe the process properly
2. then add the control API
3. only after that move on to `DLL inject` and `manual mapping`

## Common mistakes

- Trying to implement PE parsing, signatures, and strings directly inside the driver class
- Exposing only raw read/write without modules or a memory map
- Mixing the low-level backend and the process wrapper into one large class
- Starting with injection before verifying normal reads, modules, and signatures

If a game uses a non-standard structure layout, that usually does not require a new backend. In most cases, the right solution is a separate mapper on top of an existing `IProcess`.

## What to read next

- [LocalProcess](/scripting/memory-api/backends/local-process)
- [Custom memory backends](/scripting/memory-api/backends/custom-memory-backends)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)
- [Memory API - Getting started](/scripting/memory-api/getting-started)