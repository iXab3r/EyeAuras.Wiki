---
title: Pattern Scanning
description: 
published: true
date: 2024-12-15T10:56:55.901Z
tags: 
editor: markdown
dateCreated: 2024-12-15T10:55:40.847Z
---

## What is Pattern Scanning?
Pattern scanning is a method used to search for specific byte sequences in memory. It’s useful for finding functions, data, or code that doesn’t always stay at the same location when a program is running.

### Why is it Needed?
1. **Dynamic Locations**: Programs often load code and data into different places each time they run. Pattern scanning helps find what you’re looking for, no matter where it ends up.
2. **Unique Matches**: Patterns are like fingerprints—they help identify specific areas in memory based on unique byte sequences.

---

## `BytePattern`
The `BytePattern` class has been added to support multiple ways of defining patterns. These updates make it easier to work with different types of patterns commonly used in scanning memory.

Pattern scanning is available on any type implementing `IMemory` interface, e.g.
```csharp
using var process = LocalProcess.ByProcessName("pathofexile"); //uses naive RPM under the hood
Log.Info($"Process: {process}");
var modules = process.GetProcessModules(); //enumerate all loaded modules

using var memory = process.MemoryOfModule("pathofexile.exe"); //memory implements IMemory
Log.Info($"Process memory: {memory}, base: {memory.BaseAddress.ToHexadecimal()}");

// will find a singular offset pointing at 4th byte in the sequence
var offset = memory.FindOffset(BytePattern.FromTemplate("55 8B ?? ^ EC 00")); 

// will return dictionary with all found offsets for all given patterns
var playerPattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
var targetPattern = BytePattern.FromTemplate("BB AA ??");
var offsetsByPattern = memory.FindOffset(playerPattern, targetPattern);

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
   var pattern = BytePattern.FromTemplate("\x55\x8B\xEC");
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
   sets the offset right before `EC` (skipping `3` bytes). That means after the pattern is found, final offset will be `Offset + 3`
