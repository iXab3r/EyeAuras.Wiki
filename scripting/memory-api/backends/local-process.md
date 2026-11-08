---
title: LocalProcess
description: The main WinAPI backend in EyeAuras and what it can actually do
published: true
date: 2026-04-16T17:05:00.000Z
tags: c#, scripting, memory, reverse-engineering, backend, localprocess, ai-translated
editor: markdown
dateCreated: 2026-04-16T17:05:00.000Z
---
# `LocalProcess`

`LocalProcess` is the main user-mode backend in EyeAuras. If you need the most direct way to work with a local process through WinAPI, this is usually the right place to start. Conceptually, it is the same external approach as in [External Memory Hack](https://gamehacking.academy/pages/3/02/), just with a more convenient high-level API on top.

## Enumerate modules of a selected process

Run in an EyeAuras C# Script with `MemoryModule` loaded:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    foreach (var module in process.GetProcessModules())
        Log.Info($"{module.ModuleName}: 0x{module.BaseAddress:X}");
}
```

The result is a snapshot of EyeAuras process modules. For another target, supply
its PID. Name lookup chooses the first match and does not distinguish identical
process names. `LocalProcess` is a metadata-assembly facade returning
`ILocalProcess`; `MemoryModule` registers its builder. An embedded host needs
`UseMemory()` and completed `EnsureReadyAsync()` after WPF/Prism startup.
An SDK reference alone does not register the builder.

The reader owns its lazily opened handles and closes them on disposal. Borrow
`Memory` only during the reader's lifetime. `IsValid` does not prove that any
specific address is readable. Reads and enumeration are synchronous and are not
interrupted by a cancellation token. Permissions, architecture and `OpenProcess`
success depend on the actual target environment.

## When to use it

`LocalProcess` is a good fit when:

- you need to work with a regular local process
- you want a quick start without building a custom backend
- you need not only memory access, but also standard process control

Its main limitation is simple:

- it opens the process through the normal WinAPI path, so it does not work for protected processes

In those cases, you would usually look at:

- `NativeLocalProcess` — if you already have the required handle
- `LCProcess` — if memory is being read externally, for example through `DMA`
- `KDProcess` — if you need deeper access through a kernel driver

## Opening a process

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

using var byPid = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var byName = LocalProcess.ByProcessName("notepad");

var processes = LocalProcess.GetProcesses();
```

## What it gives you

With `LocalProcess`, you get two things right away:

- normal memory access through `process.Memory`
- standard user-mode process control

That gives you access to:

- `MemoryOfModule(...)`
- `ReadExports()`, `ReadImports()`, `ReadSections()`
- `pattern scanning`
- `code caves`
- `DLL inject`, `manual mapping`, `APC`, `remote thread`

That is why `LocalProcess` is the main backend for most practical scenarios.

## Typical workflow

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessName("game");
using var moduleMemory = process.MemoryOfModule("game.exe");

var sections = moduleMemory.ReadSections();
var imports = moduleMemory.ReadImports();
var exports = moduleMemory.ReadExports();
```

If you later want to move from external reading toward more active internal techniques, these are good next reads: [DLL Memory Hack](https://gamehacking.academy/pages/3/03/), [DLL Injector](https://gamehacking.academy/pages/7/01/), and [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/).

## When `NativeLocalProcess` is better

`NativeLocalProcess` is not a replacement for `LocalProcess`. It is useful when the process has already been opened the way you need, and you want to place the Memory API on top of an existing handle.

## What to read next

- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Code Cave](/scripting/memory-api/code-caves)
- [Memory API - Getting Started](/scripting/memory-api/getting-started)
- [Custom IProcess](/scripting/memory-api/backends/custom-process)
- [Custom memory backends](/scripting/memory-api/backends/custom-memory-backends)

## NativeLocalProcess handle ownership and controls

`NativeLocalProcess.ByProcessHandle(handle, ownsHandle: false)` borrows an
already-open handle by default. Keep it valid for the wrapper's lifetime and
close it yourself afterward. With `ownsHandle: true`, ownership transfers to
the wrapper. `ByProcessId` opens and owns a new handle. Its `isReadOnly` flag
omits write access; `omitCreateThreadPermissions` omits thread-creation access.
Neither flag grants privileges the caller does not have.

`AllocateMemory` returns an address/size descriptor, not an owning disposable;
release the allocation explicitly with `FreeMemory`. `ProtectMemory` returns
the previous protection. `CreateRemoteThread` returns a thread ID and closes
its temporary thread handle; it does not wait for completion. `ExecuteCode`
waits for the thread result and closes its handle in `finally`. An accepted
APC request does not establish that the target thread executed it.
`IsValid` on this native wrapper only means it has not been disposed.

[NativeLocalProcess at c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory/NativeLocalProcess.cs).
