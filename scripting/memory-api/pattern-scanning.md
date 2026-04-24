---
title: Pattern Scanning
description: Which signature types EyeAuras supports and how to scan memory patterns
published: true
date: 2026-04-16T15:55:00.000Z
tags: c#, scripting, memory, reverse-engineering, pattern-scanning, ai-translated
editor: markdown
dateCreated: 2026-04-16T15:55:00.000Z
---
# Pattern Scanning in the Memory API

`Pattern scanning` is useful when you cannot rely on a fixed address because of updates, `ASLR`, or changing memory layouts. Instead of “read from `0x12345678`”, you search for a stable byte sequence near the place you need. For background, a good starting point is [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/) and [Pattern Scanner](https://gamehacking.academy/pages/7/02/).

## Where to start

In most cases, you should scan the memory of a specific module instead of the entire process:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var memory = process.MemoryOfModule("kernel32.dll");
```

This is both faster and easier to reason about, because the resulting offset is immediately tied to that module.

## Supported signature formats

Everything is built around `BytePattern`. Out of the box, it supports:

- exact byte sequences
- hex strings
- wildcards with `?` and `??`
- C-style syntax like `\xAA\xBB`
- byte arrays with a separate mask
- the `^` marker, which marks the point of interest inside the match

```csharp
var exact = BytePattern.FromPattern(new byte[] { 0x48, 0x85, 0xC0, 0x74, 0x0A });
var hex = BytePattern.FromTemplate("48 85 C0 74 0A");
var wildcards = BytePattern.FromTemplate("48 85 ?? 74 0A");
var cStyle = BytePattern.FromTemplate(@"\x48\x85\xC0\x74\x0A");
var masked = BytePattern.FromMaskedPattern(new byte[] { 0x48, 0x85, 0xC0, 0x74, 0x0A }, "xxxxx");
var withOffset = BytePattern.FromTemplate("48 ^ 85 C0 74 0A");
```

In the examples below, we use the same pattern `48 85 C0 74 0A` throughout so it is easier to connect the diagram, code, and search result.

The `^` marker is especially useful when you do not need the start of the match, but a specific byte inside the instruction. For example, `48 ^ 85 C0 74 0A` returns the offset of `85`, not the first byte `48`.

![](/assets/pattern-scan-match.svg)

Quick breakdown of the diagram:

1. The `Memory` block contains a normal sequence of bytes.
2. The highlighted fragment `48 85 C0 74 0A` is the matched pattern.
3. The arrow shows the start of the match. That point is what the returned `offset` usually refers to.
4. From there, you decide what to do next: use the instruction as an anchor, add an offset, or follow a pointer chain to the final address.

## How to search

Main methods:

- `FindOffset(...)` — returns the offset or `-1`
- `GetOffset(...)` — returns the offset or throws an exception
- `FindOffsets(...)` and `GetOffsets(...)` — the same idea for multiple signatures

```csharp
var pattern = BytePattern.FromTemplate("48 85 C0 74 0A");
var offset = memory.FindOffset(pattern);

if (offset >= 0)
{
    var va = memory.BaseAddress + offset;
    Log.Info($"Found at 0x{offset:X}, VA={va.ToHexadecimal()}");
}
```

## Offset vs address

- `offset` is the position inside the current `IMemory`
- `VA` is the absolute virtual address in the process

If you search inside `MemoryOfModule(...)`, the absolute address is usually calculated as `memory.BaseAddress + offset`.

Using the diagram above as an example, `FindOffset(BytePattern.FromTemplate("48 85 C0 74 0A"))` returns the offset of the first highlighted byte, `48`.

## When to use `Find*` and `Get*`

- Use `Find*` when a missing signature is an expected scenario.
- Use `Get*` when a missing signature already means an incompatible client version or an error.

## Practical tips

- Scan a module, not the whole process, if you know which `.exe` or `.dll` you need.
- Do not make the signature too short.
- Hide unstable bytes behind wildcards.
- If you need a point inside an instruction, use `^` instead of doing extra manual offset math.
- In game-related scenarios like an `entity list` or `view matrix`, the signature is usually just an anchor point. After that, you still read pointers and structures.

## What to read next

- [PE basics](/scripting/memory-api/pe-basics)
- [Code Cave](/scripting/memory-api/code-caves)
- [API pattern scanning](/scripting/api/memory/pattern-scanning)