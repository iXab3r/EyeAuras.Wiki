---
title: Memory basics
description: Practical basics of reading and writing memory with the Memory API in EyeAuras C# scripts
published: true
date: 2026-04-16T20:25:50.318Z
tags: scripting, c#, memory, reverse-engineering, pointers, performance, ai-translated
editor: markdown
dateCreated: 2026-04-16T19:10:09.373Z
---
# Memory basics for the Memory API

This page covers the absolute basics: how to read and write memory, what `static pointer`, `pointer chain`, and `offsets` mean, how to work with strings and buffers, and which read path to choose in C#.

If you only remember three ideas, make it these:

- there is an address in memory
- that address either contains the value itself or a pointer to somewhere else
- your C# struct must match how the data is actually laid out in memory

If you want some extra background, these are very useful:

- [Game Fundamentals](https://gamehacking.academy/pages/1/02/)
- [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/)
- [External Memory Hack](https://gamehacking.academy/pages/3/02/)

## Where to start

In most cases, you open a process and work through `process.Memory`:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);

var hp = process.Memory.Read<int>(someHpAddress);
var speed = process.Memory.Read<float>(someSpeedAddress);

process.Memory.Write(someFlagAddress, 1);
```

In EyeAuras, `process.Memory` is the main layer for memory access. You use it to:

- read numbers and structs
- read raw bytes
- write values back
- walk pointer chains

## Reading and writing simple values

For most simple cases, these are the methods you need:

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

This path is the best fit for:

- `int`, `float`, `long`, `byte`
- `bool`, if you know its exact size in memory
- simple `struct` types made of numbers, pointers, and other equally simple `struct` types

If your struct already contains `string`, a regular `byte[]`, or something similar, look at `ReadManaged<T>(...)` instead. There is a separate section on that below.

## Static pointers, offsets, and pointer chains

### What is a static pointer

A `static pointer` is an address you can reliably reconstruct from something more stable than “just a number from Cheat Engine”. Usually that means:

- `BaseAddress + RVA`
- a module export
- the address of a global object inside a specific module

A very simple example:

```csharp
var mainModule = process.GetProcessModule("game.exe");
var playerManagerPtrAddress = new IntPtr(mainModule.BaseAddress.ToInt64() + 0x123456);
var playerManager = process.Memory.ReadPointer(playerManagerPtrAddress);
```

The idea is that the module base can change between launches, but the `RVA` inside that module stays the same. So instead of thinking like this:

- “I need address `0x12345678`”

you usually think like this:

- “I need `game.exe + 0x123456`”

### What is an offset

An `offset` is a displacement inside a struct or object.

If you have:

- a player base address `playerBase`
- `0x10` to `Health`
- `0x18` to `Mana`

then reading looks like this:

```csharp
var health = process.Memory.Read<int>(playerBase + 0x10);
var mana = process.Memory.Read<int>(playerBase + 0x18);
```

### What is a pointer chain

A `pointer chain` is when an address does not hold the final value, but a pointer to the next object.

In the simplest form:

- address A leads to object B
- inside B, an offset contains address C
- inside C, you finally have the value you want

A typical path looks like this:

1. read a pointer
2. add an offset
3. read another pointer
4. read the final value at the end

![Example of a pointer chain from a static address to an HP value](https://s3.eyeauras.net/media/2026/04/memory-pointer-chain.svg)

In code, that idea looks like this:

```csharp
var hp = process.Memory.ReadPointerChain<int>(
    (IntPtr)0x140123456,
    0x10,
    0x20,
    0x18);
```

The address and offsets here are just examples. The point is not the specific numbers, but that each step either reads a pointer or, at the very end, reads the actual value.

EyeAuras has built-in helpers for this:

- `ReadPointer(...)`
- `ReadPointer32(...)`
- `ReadPointerChain<T>(...)`
- `ReadPointerChain32<T>(...)`

```csharp
var health = process.Memory.ReadPointerChain<int>(
    playerManagerPtrAddress,
    0x10,
    0x20,
    0x18);
```

For a 32-bit layout, use `ReadPointer32(...)` and `ReadPointerChain32<T>(...)`. Otherwise, you will simply read pointers with the wrong size.

Important: if the chain hits `null`, `ReadPointerChain<T>(...)` returns `default` instead of throwing an exception. That is convenient, but it can hide logic errors, so in more complex cases it is often useful to log intermediate addresses separately.

## Strings and encodings

The Memory API has three main string helpers:

- `ReadString(...)` — `UTF-8`
- `ReadStringA(...)` — single-byte `ASCII` / ANSI-style string
- `ReadStringU(...)` — `UTF-16 LE` (`Encoding.Unicode`)

```csharp
var utf8Name = process.Memory.ReadString(namePtr.ToInt64(), 64);
var ansiName = process.Memory.ReadStringA(namePtr.ToInt64(), 64);
var wideName = process.Memory.ReadStringU(namePtr.ToInt64(), 64);
```

Practical rules here:

- the length parameter in `ReadStringU(...)` is in bytes, not characters
- strings are trimmed at `\0` by default
- if the memory uses the wrong encoding, you will get garbage even if the address is correct
- `WriteString(...)` currently writes a `UTF-8` string with a trailing `\0`

If the string is not stored separately but sits inside a struct as a fixed field, it is almost always better to read it through `ReadManaged<T>(...)`. There is a separate page for that: [C# Struct Layout](/scripting/memory-api/csharp-structures).

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

For normal memory reading on Windows, you almost never need to reverse bytes manually. In other words, in a regular Windows game, this is usually something you can just remember once and move on.

But if you are:

- reading a dump from another architecture
- working with your own backend
- parsing network or file structures that use big-endian

then endianness becomes something you need to handle explicitly.

```csharp
using System.Buffers.Binary;

var raw = process.Memory.Read(someAddress, 4);
var bigEndianValue = BinaryPrimitives.ReadInt32BigEndian(raw);
```

Useful link:

- [BitConverter.IsLittleEndian](https://learn.microsoft.com/en-us/dotnet/api/system.bitconverter.islittleendian)

## Buffers and performance

The most common mistake in memory scripts is reading too many tiny pieces one field at a time.

A bad pattern:

- 30 separate `Read<int>(...)` calls every tick

A better approach is usually:

- read one larger memory block
- parse it locally afterwards

```csharp
var buffer = new byte[0x400];

if (process.Memory.TryRead(playerBase, buffer.AsSpan()))
{
    var health = BitConverter.ToInt32(buffer, 0x10);
    var mana = BitConverter.ToInt32(buffer, 0x18);
    var targetId = BitConverter.ToInt64(buffer, 0x28);
}
```

If you have an array of the same element type, it is often more convenient to read it directly as a struct array:

```csharp
var actors = process.Memory.Read<ActorEntry>(actorsArrayAddress, actorCount);
```

Under the hood, `MemoryAccessor` already does a few useful things:

- uses `stackalloc` for small buffers
- uses `ArrayPool<byte>` for some unmanaged reads
- tries to avoid unnecessary temporary arrays when it can work through `Span<T>`

Even with that, batching still matters. The fastest optimization in this kind of work is usually not “write smarter C#”, but “reduce the number of real process memory accesses”.

## Multithreading

Multiple readers at the same time are generally fine. EyeAuras tests include both multiple sequential readers and multiple parallel readers.

But it is important to understand where the real boundary is:

- the API itself can usually read in parallel
- the target process may still change data between your reads

So the problem is usually not that `MemoryAccessor` “breaks under threads”, but that the process data may already have changed by the time you read it.

Practical advice:

- if you need a consistent snapshot, read the block in one go
- if your backend supports it and the scenario is safe, you can freeze the process separately for a moment
- do not split one logical object into dozens of unrelated reads from different threads without a reason

## Which read path should you choose

![Comparison of Read<T> and ReadManaged<T> for native and managed layout](/assets/memory-read-paths.svg)

This is one of the most important distinctions in the whole topic. But you do not need to memorize the terms if you remember the practical rule.

### Option 1 - the fast path

This includes:

- `Read<T>(...)`
- `TryRead<T>(...)`
- `Read<T>(..., count)`
- `Write<T>(...)`

Use it when the struct is simple. For example, it contains only:

- numbers
- pointers
- `fixed`
- `InlineArray`
- other equally simple structs

And this path is **not** a good fit if the struct already contains:

- `string`
- regular `byte[]`
- other reference-type fields

This is the fastest path.

### Option 2 - the flexible path

This includes:

- `ReadManaged<T>(...)`
- `TryReadManaged<T>(...)`
- `TryWriteManaged<T>(...)`

Use it when the struct is more “C#-style”. For example, when it contains:

- `[MarshalAs(UnmanagedType.ByValArray, ...)]`
- `[MarshalAs(UnmanagedType.ByValTStr, ...)]`
- fixed string fields
- a layout that is easier to describe through marshaling

This path is much more flexible, but slower.

Short rule:

- if the struct is simple, use regular `Read<T>(...)`
- if it contains strings, `MarshalAs`, or a more complex layout, use `ReadManaged<T>(...)`

If you are not sure:

- first try describing the struct as a simple one
- if you run into strings or fixed managed fields, switch to `ReadManaged<T>(...)`

## What to read next

- [Memory API - Getting started](/scripting/memory-api/getting-started)
- [C# Struct Layout](/scripting/memory-api/csharp-structures)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)