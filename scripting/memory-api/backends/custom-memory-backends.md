---
title: Custom Memory Backends
description: How to build IMemoryBackend chains and add caching, tracking, and other capabilities on top
published: true
date: 2026-04-16T16:45:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, backend, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:45:00.000Z
---
# Custom IMemoryBackend Implementations and Backend Chains

`IMemoryBackend` in EyeAuras is intentionally small, and that is a good thing. It works well not only as the final reader, but also as a decorator layer. That makes it easy to stack statistics, logging, caching, or temporary tracing on top of one backend.

Instead of this:

```text
MemoryAccessor -> DriverBackend
```

you can build a chain like this:

```text
MemoryAccessor -> CacheBackend -> StatsBackend -> LoggingBackend -> DriverBackend
```

## Temporarily wrap existing memory

For a borrowed `IProcess`, stop concurrent reads before replacing its backend;
this replacement is not a synchronized transaction.

```csharp
static int ReadThroughDecorator(EyeAuras.Memory.IProcess process, long address)
{
    var original = process.Memory.Backend;
    using var tracing = new MyTracingBackend(original);
    process.Memory.UseMemoryBackend(tracing);
    try
    {
        return process.Memory.Read<int>(address);
    }
    finally
    {
        process.Memory.UseMemoryBackend(original);
    }
}
```

The full decorator below forwards reads unchanged; add statistics in its raw
methods. It borrows `inner`. `UseMemoryBackend` only changes a reference:
it neither disposes the previous backend nor adopts the replacement, and
`MemoryAccessor.Dispose()` does not dispose the backend. Restore the original
before disposing the temporary wrapper. A `MemoryOfModule` view forwards to the
original memory and sees this substitution; independently created accessors need
not do so. Raw addresses remain absolute; `BaseAddress` is not added automatically.

## Two important API entry points

`IProcessMemory` already has everything you need for this kind of replacement:

```csharp
var currentBackend = process.Memory.Backend;
process.Memory.UseMemoryBackend(new MyTracingBackend(currentBackend));
```

After that, the new low-level layer is used for normal reads, `MemoryOfModule(...)`, `ReadExports()`, `ReadImports()`, signature scanning, and `code cave`.

## Minimal decorator backend

```csharp
using System;
using EyeAuras.Memory;

internal sealed class MyTracingBackend : IMemoryBackend
{
    private readonly IMemoryBackend inner;

    public MyTracingBackend(IMemoryBackend inner) => this.inner = inner;

    public bool IsValid => inner.IsValid;
    public long BaseAddress => inner.BaseAddress;
    public int MemorySize => inner.MemorySize;

    public bool TryReadMemory(IntPtr address, Span<byte> target)
    {
        return inner.TryReadMemory(address, target);
    }

    public bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source)
    {
        return inner.TryWriteMemory(address, source);
    }

    // The caller owns inner.
    public void Dispose() { }
}
```

This is the basic template. From there, add your own logic before or after the `inner` call.

## Most useful use cases

- statistics — track how many reads, writes, and bytes actually go through the backend
- suspicious logging — quickly catch `null`, near-null, garbage, and otherwise suspicious addresses
- page cache — reduce the number of expensive reads going through a driver, DMA, or remote bridge

These kinds of backends already existed in `ScriptShock.MemoryApi`: `StatsMemoryBackend`, `SuspiciousAddressLoggingBackend`, `PageCachingMemoryBackend`, `CompositeMemoryBackend`. These are historical examples, not a promise that these types ship in the base SDK.

## Layer order matters

These two chains answer different questions:

```text
Stats -> Cache -> Driver
Cache -> Stats -> Driver
```

In the first case, statistics show the final user-facing picture. In the second, they show only the real requests that reached the driver. As a rule, layers that need to see physical memory access should sit closer to the driver, while layers that should observe final behavior should sit closer to `MemoryAccessor`.

## Easy things to overlook

- Do not change the semantics of `TryReadMemory(...)` and `TryWriteMemory(...)` unless you have a clear reason.
- If you add caching, writes must invalidate affected ranges.
- Choose ownership explicitly: a borrowing decorator leaves `inner` open; an owning one disposes it once.
- The smarter the backend becomes, the more important thread safety is.

## What to read next

- [LocalProcess](/scripting/memory-api/backends/local-process)
- [Custom IProcess](/scripting/memory-api/backends/custom-process)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Memory API - Getting Started](/scripting/memory-api/getting-started)
