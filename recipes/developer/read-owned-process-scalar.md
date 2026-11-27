---
title: "Read an Int32 from your own prepared process"
description: "Build a tiny owned fixture, obtain its live PID and address, then read its declared integer through the typed memory API."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Read an Int32 from your own prepared process

Read the known value **1234** from a separate process that you created for this task. The fixture owns a four-byte allocation and publishes its actual PID, address and schema. No game address or scanner is involved.

Use Windows x64, a .NET 8 SDK for the fixture, and x64 desktop EyeAuras with **EyeAuras.Memory actually loaded and ready**. A compile-time metadata reference does not load its runtime builder. This route uses the ordinary local user-mode process backend and your permitted own process; it needs neither DMA hardware nor a kernel-driver workaround.

1. Create a new, empty **C:\EARecipeScalar** folder. Save **TelemetryFixture.csproj** and **Program.cs** below there. Keep one fixture instance at a time and do not reuse another program's descriptor file.
2. In that folder's terminal, run `dotnet run --project TelemetryFixture.csproj -- "C:\EARecipeScalar\telemetry-fixture.json"`. The fixture prints its runtime PID, hexadecimal address, `Int32`, four-byte size and 64-bit schema, and creates the JSON receipt. **Keep this terminal waiting at its Enter prompt.**
3. In EyeAuras create `RecipeScalar` through **Add new → New Aura → Actions → On Enter → C# Script**. Replace **Script.csx** with the complete file below, then use its manual **Run** and **Event Log**. No extra NuGet directive replaces the required loaded Memory module.
4. Compare the log's `Int32=1234` with the fixture's declaration. The script checks bitness/schema and process start time to reject an obviously stale/reused PID, opens its own process reader and reads `process.Memory.Read<int>(address)` once.
5. After the read finishes, press Enter in the fixture terminal. It frees its allocation and removes its receipt. To repeat, start the fixture again and use the newly written identity; never reuse the previous address after exit.

| Boundary | Meaning |
| --- | --- |
| Receipt `Address` | Absolute virtual address of this live fixture's allocation, not an RVA or exported function pointer. |
| `Int32`, 4 bytes | Matches C# `int` and the fixture's `Marshal.WriteInt32`; no byte-packing wrapper is needed. |
| `using var process` | Owns the reader handle. Its `Memory` property is borrowed; do not dispose it separately. |

Keep the fixture alive throughout the read. Checking the descriptor does not freeze another process's lifetime. An inaccessible address/read error is not a successful value of zero; inspect the exception and live fixture identity. Disposing the reader does not kill the child process. The EyeAuras script performs no memory write.

The standalone fixture uses normal .NET console APIs. The script's `Log` and `cancellationToken` belong to top-level **Script.csx**, not to arbitrary helper classes. See [local process readers](/en/scripting/examples/advanced/memory/get-processes), [typed reads](/en/scripting/examples/advanced/memory/rpm-read) and [module/export addresses](/en/scripting/examples/advanced/memory/read-exports) for the separate concepts.

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
