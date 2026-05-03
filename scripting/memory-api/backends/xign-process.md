---
title: XignProcess
description: Memory API backend via the XignCode3 driver
published: true
date: 2026-05-03T00:00:00.000Z
tags: scripting, c#, memory, reverse-engineering, backend, xign, driver, ai-translated
editor: markdown
dateCreated: 2026-05-03T00:00:00.000Z
---
# XignProcess

`XignProcess` is an `IProcess` implementation that works through a specific version of the XignCode3 driver.

From the outside, it behaves like a normal Memory API backend: you still use `process.Memory`, `MemoryOfModule(...)`, module/region helpers, manual mapping, and the shared process-control layer. The difference is how access is obtained: instead of the usual user-mode `OpenProcess`, it uses `xhunter1.sys`.

In short:

- `LocalProcess` — standard WinAPI
- `LCProcess` — memory access through a DMA board
- `XignProcess` — a local process accessed through the XignCode3 driver

## Why use it

The main advantage over `LocalProcess` is driver-level access. The driver is signed and loaded through the official Windows path via the Service Control Manager. That is noticeably more stable than custom driver-loading bypasses, while still letting you keep the usual Memory API on top.

As of **May 1, 2026**, the XignCode3 driver version we tested also works with protected processes. In cases where `LocalProcess` may hit `OpenProcess` / `Access denied`, `XignProcess` can open the process through the driver.

This is not a promise for all future versions of Windows, XignCode3, or anti-cheats. It is simply a practical observation about one specific driver version and the environments we tested.

## Disclaimer

Under the hood, this relies on Xign/XignCode3, so there is a third-party driver dependency. On real machines, conflicts with other drivers, anti-cheats, security software, Code Integrity/VBS, and local driver-loading policies are all possible.

Treat `XignProcess` as a pragmatic temporary solution: use it while it works in your controlled scenario. For a commercial or public-facing product, it is better to look at a [custom `IProcess`](/scripting/memory-api/backends/custom-process). That is the only way to truly control the user experience.

The good news is that the Memory API is built around backend interfaces. If your code accepts `IProcess` and works through `process.Memory` and helpers, replacing `XignProcess` with another backend is usually a local change at the process-creation point.

## How to open it

If the driver is already loaded:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess.ByProcessId(pid);

var health = process.Memory.Read<int>(healthAddress);
process.Memory.Write<int>(healthAddress, 100);
```

If the driver needs to be loaded before opening the process:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess
    .WithLoadDriver()
    .ByProcessName("game.exe");
```

The driver is loaded through the standard SCM path. The SDK does not bypass driver signature checks or Windows policies.

## EnterOpenProcess()

By default, `XignProcess` opens the process handle through the driver for the duration of each operation, then closes it afterward. That is fine for one-off calls, but it adds unnecessary overhead for a longer series of operations.

`EnterOpenProcess()` keeps the handle open until you leave the `using` block:

```csharp
using var process = XignProcess
    .WithLoadDriver()
    .ByProcessId(pid);

using (process.EnterOpenProcess())
{
    var regions = process.GetMemoryRegions();
    var module = process.MemoryOfModule("game.exe");
    var value = process.Memory.Read<int>(address);
}
```

Use it around batches of reads/writes, module or region enumeration, manual mapping, or allocation/write/execute sequences. Nested `EnterOpenProcess()` calls reuse the same handle and only close it after the last scope exits.

If the handle should stay open for the entire lifetime of the object, create the process with `WithOpenProcess()`:

```csharp
using var process = XignProcess
    .WithLoadDriver()
    .WithOpenProcess()
    .ByProcessId(pid);
```

## Important details

`XignProcess` does not mean every method is a separate driver command. Some operations go through Xign, while others use normal WinAPI on top of a handle that was obtained through the driver. For Memory API users, this usually does not matter, but it is useful to know when diagnosing issues.

`ExecuteCode` calls code that is already present inside the target process. For an x86 process, addresses must fit into the 32-bit user-mode range. Manual mapping is built on top of the shared `LibraryMapper`, so it uses the same `process.Memory` and `ExecuteCode` as other backends.

The APC path uses regular `OpenThread` / `QueueUserAPC`, so the APC will run only when the target thread enters an alertable wait.

## Limits and requirements

Do not think of `XignProcess` as a magical `LocalProcess`. You still need a compatible `xhunter1.sys`, an x64 process to talk to the driver, permission to load/open the driver, and an environment where XignCode3 does not conflict with other kernel components.

If the process opens fine through normal WinAPI, start with [LocalProcess](/scripting/memory-api/backends/local-process). If you need to access memory externally, see [LCProcess](/scripting/memory-api/backends/lc-process). If predictable behavior matters for a public product, design your own [`IProcess`](/scripting/memory-api/backends/custom-process).

## Read next

- [Xign SDK](/scripting/api/nuget/xign-sdk)
- [Memory API - Getting started](/scripting/memory-api/getting-started)
- [LocalProcess](/scripting/memory-api/backends/local-process)
- [LCProcess](/scripting/memory-api/backends/lc-process)
- [Custom IProcess](/scripting/memory-api/backends/custom-process)