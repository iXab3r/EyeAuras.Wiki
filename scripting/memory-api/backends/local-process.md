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