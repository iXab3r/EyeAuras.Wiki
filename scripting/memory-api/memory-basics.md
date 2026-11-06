---
title: Memory basics
description: Practical basics of reading and writing memory through the Memory API in EyeAuras C# scripts
published: true
date: 2026-04-16T20:27:37.740Z
tags: scripting, c#, memory, reverse-engineering, pointers, performance, ai-translated
editor: markdown
dateCreated: 2026-04-16T19:10:09.373Z
---
# Memory basics for the Memory API

This page covers the fundamentals you actually need in practice: how to read and write memory, what static pointers, pointer chains, and offsets are, how to work with strings and buffers, and which read path to use in C#.

In short, there are only three core ideas here:

- there is an address in memory
- that address contains either the value itself or a pointer to somewhere else
- your C# struct must match how the data is actually laid out in memory

If you want some extra background, these are very useful:

- [Game Fundamentals](https://gamehacking.academy/pages/1/02/)
- [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/)
- [External Memory Hack](https://gamehacking.academy/pages/3/02/)

## Getting started

Run these process examples in a top-level EyeAuras C# Script with the Memory
module loaded. The host supplies `Log`; ordinary helpers must receive dependencies.
An embedded host needs `UseMemory()` and completed `EnsureReadyAsync()`;
see [Embedded SDK](/scripting/api/nuget/embedded-sdk). The caller owns readers
created by `LocalProcess`; `process.Memory` is borrowed and must not outlive them.

The first operation allocates its own 16 bytes in the current process, writes
HP and speed, then reads them through the public API:

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    var buffer = Marshal.AllocHGlobal(16);
    try
    {
        process.Memory.Write<int>(buffer, 742);
        process.Memory.Write<float>(buffer + 0x04, 1.5f);
        var hp = process.Memory.Read<int>(buffer);
        var speed = process.Memory.Read<float>(buffer + 0x04);
        Log.Info($"HP={hp}, speed={speed}");
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
    }
}
```

The log shows HP `742` and speed `1.5`, formatted using the current culture.
`Marshal` only owns the local buffer; `process.Memory` reads and writes its values.
Do not release the buffer until its users finish.

In EyeAuras, `process.Memory` is the main layer for working with memory. You use it to:

- read numbers and structs
- read raw bytes
- write values back
- follow pointer chains

## Reading and writing simple values

The following fragments need an open reader and valid target addresses; keep
them inside its owning scope or pass it to a helper.

For simple cases, these are the methods you will use most often:

- `Read<T>(address)` — read a single value
- `Read<T>(address, count)` — read an array of values
- `Write(address, value)` — write a single value
- `Write(address, spanOrArray)` — write a block of values
- `Read(address, size)` — read raw bytes

```csharp
var hp = process.Memory.Read<int>(hpAddress);
var positionX = process.Memory.Read<float>(positionAddress);

var header = process.Memory.Read(someAddress, 64);

process.Memory.Write(someAddress, 123);
process.Memory.Write(someAddress + 4, new byte[] { 0x90, 0x90, 0x90, 0x90 });
```

`Read<T>(address, count)` counts elements; `Read(address, size)` counts bytes.
Addresses are absolute virtual addresses. `TryRead`/`TryWrite` return success,
not a transferred-byte count; underlying access errors can still throw.
The methods are synchronous without cancellation.

This path is best for:

- `int`, `float`, `long`, `byte`
- `bool`, if you know its actual size in memory
- simple `struct` types made of numbers, pointers, and other equally simple `struct` types

If your struct already contains a `string`, a normal `byte[]`, or something similar, you should usually use `ReadManaged<T>(...)` instead. There is a separate section about that below.

## Static pointers, offsets, and pointer chains

### What a static pointer is

A `static pointer` is an address you can reliably reconstruct from something more stable than “just a number from Cheat Engine”. Usually that means one of these:

- `BaseAddress + RVA`
- a module export
- the address of a global object inside a specific module

Simple example:

```csharp
var mainModule = process.GetProcessModule("game.exe");
var playerManagerPtrAddress = new IntPtr(mainModule.BaseAddress.ToInt64() + 0x123456);
var playerManager = process.Memory.ReadPointer(playerManagerPtrAddress);
```

The idea is that the module base can change between launches, but the `RVA` inside that module stays the same. So in practice, we usually think like this:

- “I need address `0x12345678`”

but rather like this:

- “I need `game.exe + 0x123456`”

### What an offset is

An `offset` is a displacement inside a structure or object.

If you have:

- a player base address `playerBase`
- `0x10` to `Health`
- `0x18` to `Mana`

then the read looks like this:

A complete 64-bit-host example creates its own pointer chain:

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    var buffer = Marshal.AllocHGlobal(0x40);
    try
    {
        var player = buffer + 0x10;
        process.Memory.Write<long>(buffer, player.ToInt64());
        process.Memory.Write<int>(player + 0x18, 742);
        var health = process.Memory.ReadPointerChain<int>(buffer, 0x18);
        Log.Info($"HP={health}");
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
    }
}
```

The output is `HP=742`: read the pointer from `buffer`, then the value at
`player + 0x18`. Intermediate offsets dereference pointers; the final offset
locates `T`. Supply at least one offset. A null pointer yields `default(T)`;
a failed read can throw. Zero therefore does not prove the chain was valid.

`ReadPointer` and the normal chain read 64-bit pointers without detecting target
architecture. `ReadPointerChain32<T>` reads `uint`; the separate `ReadPointer32`
reads `int` and can sign-extend it. For an explicit unsigned address, use
`process.Memory.Read<uint>(address)`. `IntPtr` size describes the host.

## Strings and encodings

The Memory API has three main helpers here:

- `ReadString(...)` — `UTF-8`
- `ReadStringA(...)` — `Encoding.ASCII`, not the system ANSI code page
- `ReadStringU(...)` — `UTF-16 LE` (`Encoding.Unicode`)

This complete script owns its string buffer:

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    var namePtr = Marshal.AllocHGlobal(64);
    try
    {
        process.Memory.WriteString(namePtr, "Player");
        Log.Info(process.Memory.ReadString(namePtr.ToInt64(), 7));
    }
    finally
    {
        Marshal.FreeHGlobal(namePtr);
    }
}
```

The log shows `Player`; seven bytes include the six letters and NUL.
For other text, reserve room for encoded UTF-8 bytes plus NUL. `WriteString`
does not allocate the buffer.

Practical rules:

- all three lengths are byte budgets; defaults are 256 bytes and `replaceNull=true`
- UTF-16 needs a sufficient even length; an empty result may also mean a failed read
- strings are trimmed at `\0` by default
- if the encoding in memory is different, you will get garbage even if the address is correct
- `WriteString(...)` currently writes a `UTF-8` string with a trailing `\0`

If the string is not stored separately but as a fixed field inside a struct, it is almost always better to read it through `ReadManaged<T>(...)`. There is a separate page for that: [C# Struct Layout](/scripting/memory-api/csharp-structures).

Useful background on strings and marshaling:

- [Type marshalling](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/type-marshalling)
- [Default Marshalling for Strings](https://learn.microsoft.com/en-us/dotnet/framework/interop/default-marshalling-for-strings)

## Endianness

In normal Windows processes, this is usually simple: `x86` and `x64` are `little-endian`.

That means these bytes:

```text
01 00 00 00
```

represent `int = 1`, not `16777216`.

For normal memory reading on Windows, you almost never need to reverse bytes manually. In practice, for a typical Windows game, you can usually just remember that and move on.

But if you are:

- reading a dump from a different architecture
- working with your own backend
- parsing network or file structures that use big-endian

then endianness becomes something you need to handle explicitly.

```csharp
using System.Buffers.Binary;

var raw = process.Memory.Read(someAddress, 4);
var bigEndianValue = BinaryPrimitives.ReadInt32BigEndian(raw);
```

Useful reference:

- [BitConverter.IsLittleEndian](https://learn.microsoft.com/en-us/dotnet/api/system.bitconverter.islittleendian)

## Buffers and performance

The most common mistake in memory scripts is reading too many tiny pieces one field at a time.

Bad approach:

- 30 separate `Read<int>(...)` calls every tick

Usually, this is better:

- read one memory block
- parse it locally afterward

For an array of uniform records, use a typed array read. The caller supplies
an open process, absolute array address and count for the target version:

```csharp
using System;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

[StructLayout(LayoutKind.Explicit, Size = 0x30)]
public struct ActorEntry
{
    [FieldOffset(0x10)] public int Health;
    [FieldOffset(0x18)] public int Mana;
    [FieldOffset(0x28)] public long TargetId;
}

public static class ActorReader
{
    public static ActorEntry[] ReadActors(IProcess process, IntPtr arrayAddress, int count)
        => process.Memory.Read<ActorEntry>(arrayAddress, count);
}
```

The result contains `count` local records with stride `0x30`. This is an illustrative
layout, not ready-made game offsets. The helper neither opens nor disposes the
process. Raw spans and explicit decoding fit actual byte formats such as files,
packets or dumps; ordinary scalar fields do not need that extra layer.

Under the hood, `MemoryAccessor` already does a few useful things:

- uses `stackalloc` for small buffers
- uses `ArrayPool<byte>` for some unmanaged reads
- tries to avoid extra temporary arrays where `Span<T>` is enough

Even with that, batching still matters. In this kind of work, the biggest performance win is usually not “write smarter C#”, but “reduce the number of actual reads from process memory”.

## Multithreading

Parallel reads and a single block read do not guarantee a coherent snapshot:
the target can mutate during copying. Thread requirements belong to the backend;
a parallel test does not establish every implementation's thread safety.
Do not replace a backend or dispose its process during a read. Use a target-side
protocol or snapshot generation check when consistency across fields matters.

## Which read path to choose

![Comparison of Read and ReadManaged for native and managed layouts](https://s3.eyeauras.net/media/2026/04/memory-read-paths.svg)

This is one of the most important distinctions in the whole topic. But you do not need to memorize the terms. The practical rule is enough.

### Option 1 - the fast path

This includes:

- `Read<T>(...)`
- `TryRead<T>(...)`
- `Read<T>(..., count)`
- `Write<T>(...)`

Use this if the structure is simple. For example, it contains only:

- numbers
- pointers
- `fixed`
- `InlineArray`
- other equally simple structures

And this path is not suitable if it already contains:

- `string`
- a normal `byte[]`
- other reference-type fields

This is the fastest path.

The direct path requires `T : unmanaged`; `MarshalAs` alone does not satisfy it.

### Option 2 - the flexible path

This includes:

- `ReadManaged<T>(...)`
- `TryReadManaged<T>(...)`
- `TryWriteManaged<T>(...)`

Use this when the structure is already more “C#-style”. For example, when it contains:

- `[MarshalAs(UnmanagedType.ByValArray, ...)]`
- `[MarshalAs(UnmanagedType.ByValTStr, ...)]`
- fixed string fields
- a layout that is easier to describe through marshaling

This path is much more flexible, but slower.

Short rule:

- if the structure is simple, use regular `Read<T>(...)`
- if it contains strings, `MarshalAs`, or a more complex layout, use `ReadManaged<T>(...)`

If you are not sure:

- first try to describe the structure as a simple one
- if you run into strings or fixed managed fields, switch to `ReadManaged<T>(...)`

## What to read next

- [Memory API - Getting Started](/scripting/memory-api/getting-started)
- [C# Struct Layout](/scripting/memory-api/csharp-structures)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)