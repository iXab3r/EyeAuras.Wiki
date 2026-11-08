---
title: C# Struct Layout
description: How to define native structs, offsets, and fixed-size fields for the Memory API in EyeAuras
published: true
date: 2026-04-16T20:12:00.000Z
tags: c#, scripting, memory, reverse-engineering, structs, interop, ai-translated
editor: markdown
dateCreated: 2026-04-16T20:12:00.000Z
---
# C# struct layout for the Memory API

This page explains how to describe in-memory data as C# structs so the `Memory API` can read it correctly.

In short:

- if the struct is simple, keep it simple and read it with `Read<T>(...)`
- if you know the exact offsets, it is usually better to lock them in with `LayoutKind.Explicit`
- if the struct contains strings, `MarshalAs`, or similar fields, use `ReadManaged<T>(...)`

Official references:

- [StructLayoutAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.structlayoutattribute)
- [FieldOffsetAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.fieldoffsetattribute)
- [MarshalAsAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.marshalasattribute)
- [InlineArrayAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.inlinearrayattribute)
- [Type marshalling](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/type-marshalling)

Especially useful reverse engineering references:

- [Game Fundamentals](https://gamehacking.academy/pages/1/02/)
- [External Memory Hack](https://gamehacking.academy/pages/3/02/)
- [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/)

## Read a structure at a known address

An ordinary C# helper receives an open `IProcess` and the absolute address of the exact target layout. For `PlayerData` defined below:

```csharp
static PlayerData ReadPlayer(EyeAuras.Memory.IProcess process, long address)
{
    return process.Memory.Read<PlayerData>(address);
}
```

The returned fields are a snapshot, not a live memory binding. `PlayerData` contains no managed references and satisfies `where T : unmanaged`. A failed read throws; the method takes no cancellation token. For the inline string in `NameEntry`, use the marshalling route:

```csharp
static NameEntry ReadName(EyeAuras.Memory.IProcess process, long address)
{
    return process.Memory.ReadManaged<NameEntry>(address);
}
```

At EyeAuras `20fd3d4`, this requires `where T : struct`, reads `Marshal.SizeOf<T>()` bytes and uses `Marshal.PtrToStructure<T>`. `TryReadManaged` accepts `Span<T>`; create `new NameEntry[count]`, not `stackalloc`, because the structure contains a managed string. In `Read<T>(address, size)`, `size` counts elements, not bytes. The helper borrows the process and does not dispose it.

## The most important rule

The Memory API can read structs in two different ways:

- `Read<T>(...)` / `TryRead<T>(...)` for simple structs
- `ReadManaged<T>(...)` / `TryReadManaged<T>(...)` for structs with strings, `MarshalAs`, and similar features

In most cases, the simpler path is the better one:

- if the struct is plain and has no “complex” fields, do not overcomplicate it and read it as a simple struct
- if the layout depends on `MarshalAs`, strings, or fixed managed arrays, use `ReadManaged<T>(...)`

## Sequential and Explicit

### LayoutKind.Sequential

Use this when the fields really are laid out one after another in the same order as in the native type.

```csharp
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential)]
public struct PlayerStats
{
    public int Health;
    public float Speed;
    public long TargetId;
}
```

This is a good choice when:

- you have an exact C/C++ definition of the struct
- the offsets line up automatically without surprises
- there are no special gaps or overlapping fields

### LayoutKind.Explicit

Use this when the offsets are already known and you want to define them manually.

```csharp
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Explicit, Size = 0x20)]
public struct PlayerData
{
    [FieldOffset(0x0)] public int Health;
    [FieldOffset(0x8)] public float Speed;
    [FieldOffset(0x10)] public long TargetId;
}
```

This style is usually the most convenient in reverse engineering, because you can copy offsets directly from an SDK, REClass, Cheat Engine, or disassembly into C#.

## Pack and alignment

Even if the fields are “in order”, the final layout can still break because of alignment.

Example:

```csharp
[StructLayout(LayoutKind.Sequential, Pack = 1)]
public struct PackedHeader
{
    public byte Type;
    public int Size;
}
```

If the original native type used `#pragma pack(push, 1)` and you forget `Pack = 1` in C#, your offsets will shift.

Practical advice:

- do not guess `Pack`
- if the original layout is already known from offsets, it is often easier to switch to `Explicit`
- if you are working from headers or an SDK, copy the `pack` value exactly
- if `Pack` is still unfamiliar, that is fine: in most RE scenarios it is easier to use `Explicit` and define offsets manually

## Pointers inside a struct

For pointer fields, it is usually better to use:

- `nint` / `nuint`
- `IntPtr` / `UIntPtr`
- or explicitly `uint` / `ulong` if the layout is strictly tied to 32/64-bit

If you are describing a 64-bit game, do not store pointers in `int`.

```csharp
[StructLayout(LayoutKind.Sequential)]
public struct ActorNode64
{
    public ulong Next;
    public ulong Prev;
    public int Id;
}
```

If you are intentionally working with a 32-bit layout, you can make that explicit in the type as well:

```csharp
[StructLayout(LayoutKind.Sequential)]
public struct ActorNode32
{
    public uint Next;
    public uint Prev;
    public int Id;
}
```

## Arrays inside a struct

There are three main options here.

### fixed

The most direct `unmanaged` option:

```csharp
[StructLayout(LayoutKind.Sequential)]
public unsafe struct FixedArrayStruct
{
    public int Header;
    public fixed float Values[4];
}
```

This is fast and works well with `Read<T>(...)`, but it requires `unsafe`.

### InlineArray

A modern and clean option for inline arrays:

```csharp
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

[InlineArray(4)]
public struct Float4
{
    private float _element0;
}

[StructLayout(LayoutKind.Sequential)]
public struct InlineArrayStruct
{
    public int Header;
    public Float4 Values;
}
```

This also works well with the fast reading path.

### [MarshalAs(UnmanagedType.ByValArray)]

Use this when you need a more flexible route:

```csharp
[StructLayout(LayoutKind.Sequential)]
public struct ManagedArrayStruct
{
    public int Header;

    [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16)]
    public byte[] Data;
}
```

This kind of struct is better read with:

```csharp
var value = process.Memory.ReadManaged<ManagedArrayStruct>(addr);
```

## Strings inside a struct

If a string is stored as a fixed field inside the struct, this is almost always a `ReadManaged<T>(...)` case.

```csharp
[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
public struct NameEntry
{
    public int Id;

    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
    public string Name;
}
```

Reading it:

```csharp
var entry = process.Memory.ReadManaged<NameEntry>(addr);
Log.Info(entry.Name);
```

Important:

- `ByValTStr` depends on the struct’s `CharSet`
- with `Unicode`, it will use a UTF-16 representation
- `Ansi` uses the system ANSI code page on Windows and UTF-8 on Unix; the marshalling platform, not the target process, determines that encoding
- this kind of struct should not be read via `Read<T>(...)`

## Offsets and helper methods

`MemoryAccessor` includes useful helpers so you do not have to keep the same offsets in ten different places:

- `SizeOf<T>()`
- `OffsetOf<T>(...)`
- `OffsetOf(type, memberName)`
- `NameOf<T>(...)`
- `FieldOf<T>(...)`

```csharp
var size = process.Memory.SizeOf<PlayerData>();
var targetOffset = process.Memory.OffsetOf<PlayerData>(x => x.TargetId);
```

This is convenient when:

- you want to validate the layout on startup
- you are building pointer math from a field name
- you are reusing offsets across different parts of the code

But the practical rule is simple:

- for simple structs, these helpers are very convenient
- for more complex `[MarshalAs]` layouts, it is often easier to read the whole struct with `ReadManaged<T>(...)` than to build manual offset math

## What to choose in practice

If the struct looks like a normal block of memory with no strings or managed fields:

- `int`
- `float`
- `long`
- `fixed`
- `InlineArray`
- nested unmanaged struct

then it is usually better to use:

- `StructLayout`
- a simple `struct` when possible
- `Read<T>(...)`

If the struct contains:

- `string`
- `byte[]` via `ByValArray`
- `ByValTStr`
- any other explicit marshaling

then it is usually better to use:

- `ReadManaged<T>(...)`
- `TryReadManaged<T>(...)`
- `TryWriteManaged<T>(...)`

## What breaks layout most often

- using `class` instead of `struct`
- missing `StructLayout`
- wrong `Pack`
- mixing up 32-bit and 64-bit pointer sizes
- trying to read `string` or a managed array as a normal simple struct
- manual offsets that no longer match the real native layout

If you notice that “all values are being read, but everything looks shifted”, the issue is almost always `Pack`, pointer size, or a sequential definition that does not actually match the original layout.

## A practical workflow

If all you have are offsets from reverse engineering:

1. start with `LayoutKind.Explicit`
2. verify `Size`
3. verify 2-3 key fields
4. only then decide whether it can be simplified to `Sequential`

If you have the original native header:

1. copy the `StructLayout`
2. copy `Pack` if it was used
3. double-check strings and inline arrays separately

## What to read next

- [Memory basics](/scripting/memory-api/memory-basics)
- [Memory API - Getting started](/scripting/memory-api/getting-started)
- [PE basics](/scripting/memory-api/pe-basics)
- [Code Cave](/scripting/memory-api/code-caves)
## Check layout before reading

`Pack` caps alignment rather than setting every field's size. Zero means the platform default, not no padding. Compare size and offsets with the target ABI. `nint`/`nuint` follow the host width; `ActorNode64` therefore uses `ulong`, while the 32-bit example uses `uint`.

`InlineArray` needs a compatible runtime/compiler (.NET 8 / C# 12 or newer for this syntax) and a single instance field. The shown `float` element contains no managed references; the attribute does not make an arbitrary reference-containing type unmanaged. `Read<T>` reads the managed representation of an unmanaged structure. Marshalling attributes apply through the `ReadManaged<T>` route.

Official contracts: [Pack](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.structlayoutattribute.pack?view=net-8.0), [InlineArray](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.inlinearrayattribute?view=net-8.0), [CharSet](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/charset). These rules do not discover an unknown external program's layout.
