---
title: "Read an Int32 from your own prepared process"
description: "Build a tiny program of your own, take its live PID and address, then read its integer through the typed memory API."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Read an Int32 from your own prepared process

The script reads the known value **1234** from a separate process that you start yourself for this exercise. The program allocates four bytes and reports its actual PID, address and schema.

You need Windows x64, a .NET 8 SDK for the fixture program, and x64 desktop EyeAuras with **EyeAuras.Memory actually loaded and ready**. Compile-time metadata is not enough: it does not load the runtime builder. The recipe uses the ordinary local user-mode process backend and a process of your own that you are allowed to access.

1. Create a new, empty folder **C:\EARecipeScalar** and save **TelemetryFixture.csproj** and **Program.cs** below into it. Run one fixture instance at a time and do not reuse another program's descriptor file.
2. In a terminal in that folder, run `dotnet run --project TelemetryFixture.csproj -- "C:\EARecipeScalar\telemetry-fixture.json"`. The fixture prints its current PID, hexadecimal address, the `Int32` type, the four-byte size and the 64-bit schema, and creates the JSON file. **Leave this terminal waiting at its Enter prompt.**
3. In EyeAuras create `RecipeScalar` through **Add new → New Aura → Actions → On Enter → C# Script**. Replace the whole **Script.csx** with the file below, start it by hand with **Run** and watch **Event Log**.
4. The log should show `Int32=1234`, the same number the fixture declared. The script checks the schema and bitness. It uses the process start time to reject a clearly stale or reused PID. Then it opens its own process reader and calls `process.Memory.Read<int>(address)` once.
5. After the read, press Enter in the fixture terminal. The fixture frees its allocation and deletes its JSON file. To repeat, start it again and use the new PID and address. Never reuse the address of a process that has exited.

| Boundary | Meaning |
| --- | --- |
| Receipt `Address` | The absolute virtual address of the allocation in the live fixture. |
| `Int32`, 4 bytes | The same as C# `int` and the fixture's `Marshal.WriteInt32`. You do not need to assemble the value from bytes. |
| `using var process` | Owns the reader handle. Its `Memory` property is borrowed, so do not dispose it separately. |

The fixture must stay alive for the whole read: checking the descriptor does not freeze another process. A read error or an inaccessible address is not a successfully read zero. Look at the exception and check that the process is the same one and still alive. Disposing the reader does not end the process.

The script's `Log` and `cancellationToken` exist only in top-level **Script.csx**, not in an arbitrary class. For more, see [local process readers](/en/scripting/examples/advanced/memory/get-processes), [typed reads](/en/scripting/examples/advanced/memory/rpm-read) and [module/export addresses](/en/scripting/examples/advanced/memory/read-exports).

## TelemetryFixture.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <PlatformTarget>x64</PlatformTarget>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
```

## Program.cs

```csharp
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;

var receipt = Path.GetFullPath(args.Length == 1 ? args[0] : "telemetry-fixture.json");
if (File.Exists(receipt))
    throw new IOException("Use an empty fixture folder; a receipt already exists.");
var address = Marshal.AllocHGlobal(sizeof(int));
try
{
    Marshal.WriteInt32(address, 1234);
    using var self = Process.GetCurrentProcess();
    var descriptor = new
    {
        Pid = Environment.ProcessId,
        Address = $"0x{address.ToInt64():X}",
        Type = "Int32",
        Bytes = sizeof(int),
        Bitness = IntPtr.Size * 8,
        StartTimeUtcTicks = self.StartTime.ToUniversalTime().Ticks
    };
    var json = JsonSerializer.Serialize(descriptor, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(receipt, json);
    Console.WriteLine(json);
    Console.WriteLine($"Receipt: {receipt}");
    Console.WriteLine("Value is 1234. Keep this process open while reading. Press Enter to release it.");
    Console.ReadLine();
}
finally
{
    Marshal.FreeHGlobal(address);
    if (File.Exists(receipt)) File.Delete(receipt);
}
```

## Script.csx

```csharp
using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using EyeAuras.Memory;

{
    cancellationToken.ThrowIfCancellationRequested();
    using var document = JsonDocument.Parse(
        File.ReadAllText(@"C:\EARecipeScalar\telemetry-fixture.json"));
    var info = document.RootElement;
    if (info.GetProperty("Type").GetString() != "Int32" ||
        info.GetProperty("Bytes").GetInt32() != sizeof(int) ||
        info.GetProperty("Bitness").GetInt32() != IntPtr.Size * 8)
        throw new InvalidOperationException("Fixture schema or bitness differs.");
    var pid = info.GetProperty("Pid").GetInt32();
    var addressText = info.GetProperty("Address").GetString();
    var address = new IntPtr(Convert.ToInt64(addressText.Substring(2), 16));
    using var identity = Process.GetProcessById(pid);
    if (identity.StartTime.ToUniversalTime().Ticks !=
        info.GetProperty("StartTimeUtcTicks").GetInt64())
        throw new InvalidOperationException("PID belongs to a different process instance.");
    using var process = LocalProcess.ByProcessId(pid);
    cancellationToken.ThrowIfCancellationRequested();
    var value = process.Memory.Read<int>(address);
    Log.Info($"Fixture PID={pid}, address={addressText}, Int32={value}; expected 1234");
}
```
