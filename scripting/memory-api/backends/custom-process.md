---
title: Custom IProcess
description: How to connect your own driver or memory reading method to the Memory API
published: true
date: 2026-04-16T16:20:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:20:00.000Z
---
# How to create a custom `IProcess`

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

On top of that, you implement `IProcess` and expose `MemoryAccessor` right away:

```csharp
public sealed class MyDriverProcess : DisposableReactiveObject, IProcess
{
    public MyDriverProcess(MyDriverClient driver, int processId, string? processName = null)
    {
        ProcessId = processId;
        ProcessName = processName;

        var memoryBackend = new MyDriverMemoryBackend(driver, processId).AddTo(Anchors);
        Memory = new MemoryAccessor(Log, memoryBackend).AddTo(Anchors);
    }

    public string? ProcessName { get; }
    public int ProcessId { get; }
    public IProcessMemory Memory { get; }

    public IReadOnlyList<ProcessModuleInformation> GetProcessModules() => driver.GetModules(ProcessId);
    public IReadOnlyList<ProcessThreadInformation> GetThreads() => driver.GetThreads(ProcessId);
    public MemoryBasicInformation VirtualQuery(IntPtr address) => driver.VirtualQuery(ProcessId, address);
    public IReadOnlyList<MemoryBasicInformation> GetMemoryRegions() => driver.GetMemoryRegions(ProcessId);
}
```

There is one key line here:

```csharp
Memory = new MemoryAccessor(Log, memoryBackend);
```

That is what connects your backend to the full EyeAuras upper layer.

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