---
title: AI Memory — Pattern Scanning
description: AI-first map of pattern helpers, signatures, and offset behavior in the memory API.
published: true
date: 2026-04-23T00:00:00.000Z
tags: scripting, api, ai, memory, pattern-scanning, ai-translated
editor: markdown
dateCreated: 2026-04-23T00:00:00.000Z
---
# Memory / Pattern Scanning Map

Reference map for signature helpers, `BytePattern` / `StringPattern`,
single-pattern vs multi-pattern search behavior, and how pattern offsets fit
into memory workflows.

## Find a signature in a selected module

With the EyeAuras Memory module loaded, supply a PID, an actual module name
from `GetProcessModules()` and a template for your target version. In an embedded
host, declare `UseMemory()` and await `EnsureReadyAsync()` first; see
[Embedded SDK](../nuget/embedded-sdk).

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

static long? FindSignature(int processId, string moduleName, string template)
{
    using var process = LocalProcess.ByProcessId(processId);
    using var memory = process.MemoryOfModule(moduleName);
    var pattern = BytePattern.FromTemplate(template);
    int offset = memory.FindOffset(pattern);
    return offset < 0 ? null : memory.BaseAddress + offset;
}
```

The result is a target-process virtual address or `null`, not a local pointer to
dereference in C#. The helper owns and disposes the reader; retain an open reader
in your caller for further reads. `48 8B ?? 74 0A` illustrates a wildcard in the
third byte, not a signature guaranteed to exist in an arbitrary process.

Single search returns the match start relative to `BaseAddress`, or `-1`.
`GetOffset` throws `ArgumentException` for a missing match. Reads can also throw.
The search synchronously copies the entire range, accepts no cancellation token
and does not freeze the target. `^` marks a byte within the pattern, cannot be
its first element, and does not decode a RIP-relative displacement.

## Find two different templates

Here `process` is borrowed and remains owned by the caller:

```csharp
using System.Collections.Generic;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

static IReadOnlyDictionary<IBytePattern, int> FindBoth(
    IProcess process, string moduleName, string first, string second)
{
    using var memory = process.MemoryOfModule(moduleName);
    var a = BytePattern.FromTemplate(first);
    var b = BytePattern.FromTemplate(second);
    return memory.FindOffsets(a, b);
}
```

Missing patterns have value `-1`; found offsets already include `PatternOffset`.
Add the module base once for an absolute address. `GetOffsets` requires all
patterns. `BytePattern` equality uses `Template`, so changing `Name` does not
make an identical template a distinct dictionary key.

In the source implementation at EyeAuras `20fd3d4`, multi-pattern search runs
parallel 84000-byte blocks without overlap. It can miss a boundary-spanning
pattern and need not return the lowest match. Unlike single search, it ignores
`StartOffset`. Neither route returns every occurrence of one pattern.

The extension receiver is `IReadOnlyMemory`, including a module `IMemory` view;
its base/size scope scanning, not every arbitrary direct read. Consult the
[Memory reference](../memory) and SDK/XML for your installed version.

## User Intents

- Scan a module for a stable byte signature.
- Build a signature with wildcards.
- Mark a point of interest inside a match with `^`.
- Find one pattern or scan several in one pass.
- Convert a module-relative offset into a virtual address.
- Use signatures as anchors before reading pointer chains or structs.

## Concept Model

- `BytePattern` is the core signature representation.
- `StringPattern` is the compatibility wrapper around template-based patterns.
- `IMemory` is the usual scan surface, often obtained through
  `MemoryOfModule(...)`.
- `FindOffset(...)` / `GetOffset(...)` return a single raw match start.
- `FindOffsets(...)` / `GetOffsets(...)` scan multiple patterns and return
  offsets keyed by pattern.
- `PatternOffset` is metadata stored on the pattern, not automatically applied
  by every helper.

## API Details

- `BytePattern.FromPattern(...)` - exact byte-sequence signature.
- `BytePattern.FromTemplate(...)` - template-based signature with hex bytes,
  wildcards, and optional `^`.
- `BytePattern.FromMaskedPattern(...)` - byte array plus explicit `x`/`?` mask.
- `StringPattern` - compatibility layer for template signatures.
- `MemoryExtensionsForPatterns` - pattern-scan helpers on `IReadOnlyMemory`.
- `FindOffset(...)` - returns the raw match start or `-1`.
- `GetOffset(...)` - returns the raw match start or throws.
- `FindOffsets(...)` - returns all requested pattern offsets keyed by pattern.
- `GetOffsets(...)` - same as `FindOffsets(...)`, but throws on missing
  patterns.
- `PatternOffset` - pattern-relative index marked by `^` inside a template.

## Common Flows

- Scan a module:
  - create a process reader.
  - narrow scope with `MemoryOfModule(...)`.
  - build `BytePattern` or `StringPattern`.
  - call `FindOffset(...)` / `GetOffset(...)`.
  - add `memory.BaseAddress` if you need an absolute address.

- Scan a RIP-relative instruction:
  - build a template with `^` at the displacement bytes.
  - use a singular helper to get the raw match start.
  - add `pattern.PatternOffset` yourself to reach the marked field.
  - decode the displacement and compute the final address.

- Scan multiple anchors:
  - create several patterns.
  - call `FindOffsets(...)` / `GetOffsets(...)`.
  - read the resulting dictionary by pattern instance.

## Single vs Multi-Pattern Behavior

- `FindOffset(...)` and `GetOffset(...)` return the raw match start.
- `FindOffsets(...)` and `GetOffsets(...)` return offsets with
  `PatternOffset` already applied.
- If you used `^` with a singular helper, add `pattern.PatternOffset`
  yourself.

```csharp
using var process = LocalProcess.ByProcessName("pathofexile");
using var memory = process.MemoryOfModule("pathofexile.exe");

var playerPattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
var targetPattern = BytePattern.FromTemplate("BB AA ??");

var matchOffset = memory.FindOffset(playerPattern);
var displacementOffset = matchOffset >= 0
    ? matchOffset + playerPattern.PatternOffset
    : -1;

var offsetsByPattern = memory.FindOffsets(playerPattern, targetPattern);

var criticalMatchOffset = memory.GetOffset(playerPattern);
var criticalDisplacementOffset =
    criticalMatchOffset + playerPattern.PatternOffset;
```

## Supported Signature Formats

- exact byte arrays
- hex templates like `48 8B ?? 74 0A`
- wildcards with `?` / `??`
- C-style templates like `\x48\x8B\xC0`
- masked byte patterns with `x` and `?`
- templates with `^` to mark a pattern-relative point of interest

## Prefer

- Prefer scanning a specific module instead of the whole process.
- Prefer templates with wildcards over brittle exact signatures when bytes are
  unstable.
- Prefer `Get*` helpers when a missing pattern means an incompatible target.
- Prefer treating signatures as anchors before pointer-chain or struct reads.

## Avoid

- Avoid assuming the returned offset is always the `^` position.
- Avoid using `FindOffset(...)` with multiple patterns; use `FindOffsets(...)`.
- Avoid scanning whole-process memory when you know the target module.
- Avoid extremely short signatures that can match unrelated code or data.

## Research Anchors

- `BytePattern`
- `StringPattern`
- `PatternOffset`
- `FromTemplate`
- `FromMaskedPattern`
- `FindOffset`
- `GetOffset`
- `FindOffsets`
- `GetOffsets`
- `MemoryExtensionsForPatterns`
- `MemoryOfModule`

## Search Synonyms

- pattern scan
- signature scan
- byte pattern
- byte signature
- wildcard pattern
- masked pattern
- memory signature
- pattern offset
- caret offset
- `BytePattern`
- `StringPattern`

## Related Maps

- [processes.md](/en/scripting/api/memory/processes)
- [../../memory-api/pattern-scanning.md](/en/scripting/memory-api/pattern-scanning)
- [../../memory-api/getting-started.md](/en/scripting/memory-api/getting-started)
