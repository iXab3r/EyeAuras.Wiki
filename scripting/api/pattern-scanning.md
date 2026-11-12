---
title: Pattern Scanning
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-12-15T10:55:40.847Z
---

> AI-first navigation: see [AI Memory / Processes](./memory/processes) for process attachment, pointer access, readers, and where pattern scanning fits in memory workflows.
{.is-info}

# Find a byte sequence

## Search a known buffer

This complete operation uses public memory abstractions without opening a process:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

{
    using var memory = MemoryAccessor.FromByteArray(
        new byte[] { 0x00, 0x55, 0x8B, 0x12, 0xEC, 0x00 });
    var pattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
    var start = memory.FindOffset(pattern); // 1
    var marked = start < 0 ? -1 : start + pattern.PatternOffset; // 4
}
```

`??` accepts any byte. This array has base zero. For a module, add its base to
the found offset; never add it to `-1`. `GetOffset` throws on a missing match.
Single search honors `StartOffset` but does not add `PatternOffset`; multi-search
adds `PatternOffset`, ignores `StartOffset`, may miss block-boundary matches and
need not return the lowest match. Both are synchronous without cancellation;
keep large scans off the UI/render callback. See [exact contracts](memory/pattern-scanning).

The process example below additionally requires the loaded Memory module.
Embedded hosts must declare `UseMemory()` and await `EnsureReadyAsync()`;
metadata references alone are insufficient.

## What is Pattern Scanning?
Pattern scanning is a method used to search for specific byte sequences in memory. It’s useful for finding functions, data, or code that doesn’t always stay at the same location when a program is running.

### Why is it Needed?
1. **Dynamic Locations**: Programs often load code and data into different places each time they run. Pattern scanning helps find what you’re looking for, no matter where it ends up.
2. **Unique Matches**: Patterns are like fingerprints—they help identify specific areas in memory based on unique byte sequences.

---

## BytePattern
The `BytePattern` class has been added to support multiple ways of defining patterns. These updates make it easier to work with different types of patterns commonly used in scanning memory.

Pattern scanning is available on any type implementing `IMemory` interface, e.g.
```csharp
using var process = LocalProcess.ByProcessName("pathofexile"); //uses naive RPM under the hood
Log.Info($"Process: {process}");
var modules = process.GetProcessModules(); //enumerate all loaded modules

using var memory = process.MemoryOfModule("pathofexile.exe"); //memory implements IMemory
Log.Info($"Process memory: {memory}, base: {memory.BaseAddress.ToHexadecimal()}");

// Single search returns the match start; add PatternOffset separately.
var offset = memory.FindOffset(BytePattern.FromTemplate("55 8B ?? ^ EC 00")); 

// will return dictionary with all found offsets for all given patterns
var playerPattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
var targetPattern = BytePattern.FromTemplate("BB AA ??");
var offsetsByPattern = memory.FindOffsets(playerPattern, targetPattern);

// by using Get* instead of Find* the code will throw an exception in case pattern is not found
var criticalOffset = memory.GetOffset(BytePattern.FromTemplate("55 8B ?? ^ EC 00")); 
```

### Supported Pattern Types
1. **Byte Arrays**:
   - Define patterns using exact byte values.
   - Example: 
   ```csharp
   var pattern = BytePattern.FromPattern(new byte[] {0x55, 0x8B, 0xEC});
   ```
   matches exactly those bytes.

2. **C-Style Patterns**:
   - Use escape sequences like `\xAA\xBB\xCC`, like in C-Style patterns.
   - Example:  
   ```csharp
   var pattern = BytePattern.FromTemplate(@"\x55\x8B\xEC");
   ```
   is equivalent to the byte array `[0x55, 0x8B, 0xEC]`.

3. **Hexadecimal Strings with Wildcards**:
   - Define patterns as hex strings with `??` for wildcards (any byte).
   - Example: 
   ```csharp
   var pattern = BytePattern.FromTemplate("55 8B ?? 83");
   ``` 
   matches any sequence starting with `55 8B`, followed by any byte, and then `83`.

4. **Masked Patterns**:
   - Combine a byte array with a mask to specify which bytes are fixed (`x`) and which are wildcards (`?`).
   - Example:
     ```csharp
     var pattern = BytePattern.FromMaskedPattern(new byte[] { 0x55, 0x8B, 0xEC, 0x00, 0x08 }, "xxx??");
     ```
     Matches any sequence starting with `55 8B EC`, followed by any two bytes.

5. **Templates with Offsets**:
   - Define patterns using a template and mark the match offset with `^`.
   - Example: 
   ```csharp
   var pattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
   ``` 
   sets `PatternOffset = 3`. Single `FindOffset`/`GetOffset` return the match start; multi-pattern methods add that offset.
