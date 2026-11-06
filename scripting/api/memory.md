---
title: Memory API
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-20T21:17:57.774Z
---
# Memory API

Use `process.Memory.Read<T>(address)` for a known value. Start with the
[process map](memory/processes) to select a reader, or
[pattern scanning](memory/pattern-scanning) to locate bytes.

## Read and replace a value

Supply the PID and absolute address of an `int` in a target whose layout you know.
The EyeAuras Memory module must be loaded. This ordinary C# helper can also be
declared and called from a top-level script:

```csharp
using System;
using EyeAuras.Memory;

static int ReplaceInt32(int processId, IntPtr address, int newValue)
{
    using var process = LocalProcess.ByProcessId(processId);
    int previous = process.Memory.Read<int>(address);
    process.Memory.Write<int>(address, newValue);
    return previous;
}
```

It returns the previous value and writes the new one in two separate operations;
this is not atomic against target threads. Use `Read<int>` alone for a read,
or your correctly laid-out unmanaged type for a struct. Manual byte packing is
unnecessary for ordinary scalar values.

The returned `ILocalProcess` owns its OS handles; `process.Memory` is borrowed
and must not outlive it. `IsValid` does not guarantee a particular address is
readable. Even `Try*` calls can throw while opening/accessing a process.
An embedded app needs `EyeAuras.SDK.Runtime`, Memory, `UseMemory()` and completed
`EnsureReadyAsync()`; SDK references alone do not load the implementation.
See [Embedded SDK](nuget/embedded-sdk).

## Read bytes or an array

This helper borrows its open process and returns a copy of a byte payload:

```csharp
using System;
using EyeAuras.Memory;

static byte[] ReadPayload(IProcess process, IntPtr address, int byteCount)
{
    return process.Memory.Read(address, byteCount);
}
```

`Read<int>(address, count)` counts elements; `Read(address, size)` and `ReadBytes`
count bytes. In this source version, nonpositive typed-array counts yield an empty
array; `ReadBytes(long, long)` does not support sizes above `int.MaxValue`.
It is not an arbitrary-size streaming API.

For a supplied buffer use `TryRead<byte>(address, buffer.AsSpan())`, and for a
byte payload write use `TryWriteMemory(address, payload.AsSpan())`. They return
`bool`, not a transferred-byte count. Do not treat a buffer as complete on `false`.
The local wrapper copies into the target span only after native success;
OS-handle errors can throw before a Boolean is returned.

## Read a value through a pointer chain

Supply the absolute address of a cell containing the first 64-bit pointer:

```csharp
using EyeAuras.Memory;

static int ReadChainedInt32(IProcess process, long rootAddress)
{
    return process.Memory.ReadPointerChain<int>(rootAddress, 0x20, 0x10);
}
```

This reads `p = Read<long>(rootAddress)`, then `p = Read<long>(p + 0x20)`, then
`Read<int>(p + 0x10)`. The result is the final value, not its address. A null
pointer yields `default(int)`, so zero does not distinguish an empty chain from
a real zero value. Reads may throw. Supply at least one offset. For 32-bit target
pointers use `ReadPointerChain32<T>`; host bitness does not choose the target layout.

## Strings and marshalled structures

`ReadStringA(address, length: 256)` decodes ASCII, `ReadString` UTF-8 and
`ReadStringU(address, lengthBytes: 256)` UTF-16. Lengths are byte budgets,
not guaranteed character counts. Default `replaceNull: true` truncates at NUL.
Unavailable reads can return an empty string; ASCII/UTF-8 helpers also use
`TextTooLong` and `TextTooShort` for unsuitable lengths. This is not a universal
diagnostic protocol. Give UTF-16 a positive even byte size of at least two.
`WriteString(IntPtr, string)` writes UTF-8 plus NUL; the target must provide space.

`ReadManaged<T>`, `TryReadManaged<T>` and `TryWriteManaged<T>` handle structs
with marshalling layout, including `[MarshalAs]` strings/arrays. Use an ordinary
managed array for their buffer; a struct containing `string` or `byte[]` cannot
be stack-allocated. Prefer `Read<T>`/`Write<T>` for unmanaged values.

## Module views and backend configuration

`MemoryOfModule` supplies base and size for scans and PE helpers. Direct reads
still take absolute addresses: `memory.Read<int>(memory.BaseAddress + offset)`.
The view neither bounds-checks arbitrary reads nor adds its base automatically.
Disposing it does not dispose the owning process.

`UseCustomMemoryMapper()` returns `ICustomMemoryMapper` with
`SetOverrideForOffsetOf`. `UseCustomMemoryMapper32()` selects packing `4`,
not a global switch for backend pointers. `UseMemoryMapper` and `UseMemoryPool`
require `IConfigurableMemoryContext`. `UseMemoryBackend` replaces the reference
for future access without promising to dispose the previous backend;
the integration determines ownership.

## Versioned core contracts

Declarations below follow EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`.
XML comments, diagnostic `ToString` bodies and internal mapper members are omitted;
core signatures and DTO fields are retained. Layout types are in
`EyeAuras.Memory.Mappers`, core types in `EyeAuras.Memory`, extensions in
`EyeAuras.Memory.Scaffolding`. Compare your installed SDK assemblies and XML docs;
this source snapshot does not promise compatibility with every NuGet build.

The [process map](memory/processes) covers modules, PE, code caves and extended
readers. Optional surfaces include [Frida](nuget/frida-sdk) and
[ReProcess](reverse-engineering/reprocess).

```csharp
public interface IMemoryContext
{
    IFluentLog Log { get; }
    IMemoryMapper MemoryMapper { get; }
    ArrayPool<byte> MemoryPool { get; }
}
public interface IMemorySpan
{
    long BaseAddress { get; }
    int MemorySize { get; }
}
public interface IMemoryAccessor : IMemorySpan
{
    IFluentLog Log { get; }
    IMemoryContext Context { get; }
}
public interface IReadOnlyMemory : IMemoryReader
{
}
public interface IMemory : IMemoryWriter, IMemoryBackend, IReadOnlyMemory, IMemoryMapper
{
}
public interface IMemoryWriter : IMemoryAccessor
{
    public bool TryWrite<T>(IntPtr addr, ReadOnlySpan<T> source) where T : unmanaged;
    bool TryWriteManaged<T>(IntPtr addr, ReadOnlySpan<T> source) where T : struct;
    void Write<T>(IntPtr addr, T value) where T : unmanaged;
    void Write<T>(IntPtr addr, T[] value) where T : unmanaged;
    void Write<T>(IntPtr addr, ReadOnlySpan<T> source) where T : unmanaged;
    void Write<T>(IntPtr addr, Span<T> source) where T : unmanaged;
    void WritePointer(IntPtr addr, IntPtr value);
    void WritePointer32(IntPtr addr, IntPtr value);
    void Write(IntPtr addr, byte[] source);
    void WriteString(IntPtr addr, string text);
}
public interface IMemoryReader : IMemoryAccessor
{
    bool TryRead<T>(IntPtr addr, Span<T> target) where T : unmanaged;
    bool TryRead<T>(IntPtr addr, out T target) where T : unmanaged;
    bool TryRead<T>(long addr, Span<T> target) where T : unmanaged;
    bool TryRead<T>(long addr, out T target) where T : unmanaged;
    bool TryReadManaged<T>(IntPtr addr, Span<T> target) where T : struct;
    T ReadManaged<T>(IntPtr addr) where T : struct;
    T ReadManaged<T>(long addr) where T : struct;
    byte[] Read(IntPtr addr, int size);
    byte[] Read(long addr, int size);
    T Read<T>(IntPtr addr) where T : unmanaged;
    T Read<T>(long addr) where T : unmanaged;
    IntPtr ReadPointer(IntPtr addr);
    IntPtr ReadPointer32(IntPtr addr);
    T ReadPointerChain<T>(IntPtr addr, params int[] offsets) where T : unmanaged;
    T ReadPointerChain<T>(long addr, params int[] offsets) where T : unmanaged;
    T ReadPointerChain32<T>(IntPtr addr, params int[] offsets) where T : unmanaged;
    T ReadPointerChain32<T>(long addr, params int[] offsets) where T : unmanaged;
    T[] Read<T>(IntPtr addr, int size) where T : unmanaged;
    T[] Read<T>(long addr, int size) where T : unmanaged;
    string ReadStringA(long addr, int length = 256, bool replaceNull = true);
    string ReadString(long addr, int length = 256, bool replaceNull = true);
    string ReadStringU(long addr, int lengthBytes = 256, bool replaceNull = true);
    byte[] ReadBytes(long addr, int size);
    byte[] ReadBytes(long addr, long size);
    IList<long> ReadPointersArray(long startAddress, long endAddress, int offset = 8);
}
public readonly record struct ProcessThreadInformation
{
    public int ThreadId { get; init; }
    public int ProcessId { get; init; }
    public int BasePriority { get; init; }
    public int DeltaPriority { get; init; }
    public uint UsageCount { get; init; }
    public uint Flags { get; init; }
}
public readonly record struct ProcessModuleInformation
{
    public string? ModuleName { get; init; }
    public string? FilePath { get; init; }
    public IntPtr BaseAddress { get; init; }
    public int Size { get; init; }
}
public readonly record struct ProcessParametersInformation
{
    public IntPtr Address { get; init; }
    public string? CurrentDirectory { get; init; }
    public string? DllPath { get; init; }
    public string? ImagePathName { get; init; }
    public string? CommandLine { get; init; }
    public IntPtr EnvironmentAddress { get; init; }
    public string? WindowTitle { get; init; }
    public string? DesktopInfo { get; init; }
    public string? ShellInfo { get; init; }
    public string? RuntimeData { get; init; }
}
public readonly record struct ProcessInformation
{
    public string ProcessName { get; init; }
    public int Id { get; init; }
}
public readonly record struct CodeCaveEntry
{
    public ModuleSectionEntry Section { get; init; }
    public long StartVA { get; init; }
    public uint StartRva { get; init; }
    public int Size { get; init; }
    public int OffsetInSection { get; init; }
    public bool AlignmentAdjusted { get; init; }
}
public readonly record struct ModuleSectionEntry
{
    public string Name { get; init; }
    public uint VirtualAddress { get; init; }
    public uint VirtualSize { get; init; }
    public uint RawSize { get; init; }
    public uint Characteristics { get; init; }
    public long StartVA { get; init; }
    public long EndVA { get; init; }
    public bool IsExecutable { get; init; }
    public bool IsReadable { get; init; }
    public bool IsWritable { get; init; }
}
public readonly record struct ModuleImportEntry
{
    public string DllName { get; init; }
    public string? FunctionName { get; init; }
    public ushort Hint { get; init; }
    public bool IsByOrdinal { get; init; }
    public ushort Ordinal { get; init; }
    public uint ImportNameTableRva { get; init; }
    public uint ImportAddressTableRva { get; init; }
    public uint IatEntryRva { get; init; }
    public int ThunkIndex { get; init; }
    public ulong ThunkValue { get; init; }
}
public readonly record struct ModuleExportEntry
{
    public string? ExportName { get; init; }
    public string? UnDecoratedExportName { get; init; }
    public ushort Ordinal { get; init; }
    public uint RVA { get; init; }
    public bool IsForwarder { get; init; }
    public string? ForwarderName { get; init; }
    public int ExportAddressTableIndex { get; init; }
    public int NamePointerIndex { get; init; }
}

public interface IMemoryBackend : IDisposable, IMemorySpan
{
    bool IsValid { get; }
    bool TryReadMemory(IntPtr address, Span<byte> target);
    bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source);
}

public interface IProcess : IDisposable
{
    IFluentLog Log { get; }
    bool IsValid { get; }
    string? ProcessName { get; }
    int ProcessId { get; }
    IProcessMemory Memory { get; }
    IReadOnlyList<ProcessModuleInformation> GetProcessModules();
    public IReadOnlyList<ProcessThreadInformation> GetThreads();
    public MemoryBasicInformation VirtualQuery(IntPtr address);
    public IReadOnlyList<MemoryBasicInformation> GetMemoryRegions();
}

public interface IProcessMemory : IMemory
{
    IMemoryBackend Backend { get; }
    void UseMemoryBackend(IMemoryBackend backend);
}

public interface IMemoryMapper
{
    FieldInfo FieldOf<T>(Expression<Func<T, object>> expr);
    string NameOf<T>(Expression<Func<T, object>> expr);
    int OffsetOf<T>(Expression<Func<T, object>> expr);
    int OffsetOf(Type type, string memberName);
    int SizeOf<T>();
    T Read<T>(ReadOnlySpan<byte> source) where T : unmanaged;
    void Write<T>(T value, Span<byte> destination) where T : unmanaged;
}

public interface ICustomMemoryMapper : IMemoryMapper
{
    void SetOverrideForOffsetOf(FieldInfo member, int offset);
    void SetOverrideForOffsetOf<T>(Expression<Func<T, object>> expr, int offset);
    bool HasOverrideForOffsetOf<T>(Expression<Func<T, object>> expr);
    bool HasOverrideForOffsetOf<T>(FieldInfo member);
    void ResetOverrideForOffsetOf<T>(Expression<Func<T, object>> expr);
    void ResetOverrideForOffsetOf<T>(FieldInfo member);
}

public interface IConfigurableMemoryContext : IMemoryContext
{
    void UseMemoryPool(ArrayPool<byte> memoryPool);
    void UseMemoryMapper(IMemoryMapper mapper);
}
```

## Process extensions in this source version

Older documentation called this set `ProcessExtensions` and the mapper method
`SetOffset`. Here the class is `MemoryExtensions` and the method is
`SetOverrideForOffsetOf`. These signatures share the ownership/address contracts above.

```csharp
public static ICustomMemoryMapper UseCustomMemoryMapper(this IProcess process);
public static ICustomMemoryMapper UseCustomMemoryMapper(this IProcess process, int pack);
public static ICustomMemoryMapper UseCustomMemoryMapper32(this IProcess process);
public static void UseMemoryMapper(this IProcess process, IMemoryMapper mapper);
public static void UseMemoryPool(this IProcess process, ArrayPool<byte> memoryPool);
public static bool TryFindProcessModule(this IProcess process, string moduleName,
    out IReadOnlyList<ProcessModuleInformation> modules, out ProcessModuleInformation pmi);
public static bool TryFindProcessModule(this IProcess process, string moduleName,
    out ProcessModuleInformation pmi);
public static ProcessModuleInformation GetProcessModule(this IProcess process, string moduleName);
public static IMemory MemoryOfModule(this IProcess process, ProcessModuleInformation pmi);
public static IMemory MemoryOfModule(this IProcess process, string moduleName);
public static IEnumerable<MemoryBasicInformation> EnumerateMemoryRegions(this IProcess reader);
```
