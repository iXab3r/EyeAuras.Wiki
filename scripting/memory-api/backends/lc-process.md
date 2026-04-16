---
title: LCProcess
description: Acquisition backend via MemProcFS, LeechCore, Hyper-V, and FPGA
published: true
date: 2026-04-16T20:34:31.247Z
tags: c#, scripting, memory, reverse-engineering, backend, lcprocess, mpfs, ai-translated
editor: markdown
dateCreated: 2026-04-16T18:25:00.000Z
---
# `LCProcess`

`LCProcess` is an acquisition backend built on top of [LeechCore](https://github.com/ufrisk/LeechCore) and [MemProcFS](https://github.com/ufrisk/MemProcFS). While `LocalProcess` works with a local process through the regular WinAPI, `LCProcess` reads memory through an external source. The main author behind this ecosystem is [Ulf Frisk](https://github.com/ufrisk).

For the Memory API, this matters for one simple reason: you still get the familiar `IProcess`-like layer with modules, regions, `MemoryOfModule(...)`, imports, exports, and signatures, but the memory source is different.

## ELI5: what are `DMA`, `FPGA`, and why is `Hyper-V` involved?

- `DMA` means **Direct Memory Access**. In this scenario, memory is read through a lower-level, more external path instead of regular `OpenProcess`.
- `FPGA` is programmable hardware. In the Ulf Frisk ecosystem, DMA devices are built around it.
- `Hyper-V` is the scenario where the host reads the memory of a guest virtual machine from the outside.

In very simple terms:

- `LocalProcess` = "open a process like a normal app"
- `LCProcess` = "get memory from the outside, then work with it as if it were a process"

That is exactly why `LCProcess` is especially useful in cases where the usual user-mode approach is not desirable or simply does not work.

## When to use it

`LCProcess` is meant for cases where regular WinAPI is no longer enough, or is not a good fit at all.

The main scenarios are:

- `FPGA` — the primary DMA scenario
- `Hyper-V` — reading guest VM memory from the host
- `WinPMEM` — a local acquisition backend for testing the pipeline without FPGA

If you do not need any of that, it is almost always easier to start with `LocalProcess`.

## Available modes

### FPGA

This is the main `LCProcess` scenario, and the reason most people use this backend in the first place.

In the Ulf Frisk ecosystem, this is the path where memory is read through an FPGA-based DMA device, while the layer above still looks like a familiar process-shaped API:

```csharp
using EyeAuras.Memory.MPFS;

var processes = LCProcess.FPGA().GetProcesses();
using var process = LCProcess.FPGA().ByProcessName("game.exe");
```

In practice, this gives you the main advantage of `LCProcess`: memory is read externally, not through a normal process handle. According to the PCILeech and PCILeech FPGA documentation, the FPGA scenario provides full access to the 64-bit memory space without relying on a regular process handle on the target system.

If you want to go deeper into the hardware side, see:

- [LeechCore FPGA device docs](https://github.com/ufrisk/LeechCore/wiki/Device_FPGA)
- [PCILeech](https://github.com/ufrisk/pcileech)
- [PCILeech Wiki](https://github.com/ufrisk/pcileech/wiki)
- [PCILeech FPGA](https://github.com/ufrisk/pcileech-fpga)
- [PCILeech FPGA Wiki](https://github.com/ufrisk/pcileech-fpga/wiki)

### Hyper-V

This is the second most important scenario. Here, the host reads the memory of a guest Windows machine from the outside.

There is a dedicated builder for it:

```csharp
using EyeAuras.Memory.MPFS;

var vms = LCProcess.HyperV().ListVirtualMachines();

using var process = LCProcess.HyperV()
    .UseVirtualMachineByIndex(0)
    .ByProcessName("game.exe");
```

The main value here is that memory is read **from outside the virtual machine**. That gives you several clear advantages:

- you do not need to run your code inside the guest
- the guest can be analyzed from the host
- there is less dependency on what is happening inside the VM itself
- it is convenient for labs, test setups, and scenarios where you do not want to "touch" the guest system

There is one practical caveat here, and it matters: for stable Hyper-V operation, you usually need to disable `Dynamic Memory` for the virtual machine.

Useful references for this path:

- [MemProcFS VM Wiki](https://github.com/ufrisk/MemProcFS/wiki/VM)
- [MemProcFS CommandLine Wiki](https://github.com/ufrisk/MemProcFS/wiki/_CommandLine)

### WinPMEM

`WinPMEM` is useful as a simpler local entry point into the same acquisition model:

```csharp
using EyeAuras.Memory.MPFS;

var processes = LCProcess.WinPMEM().GetProcesses();
using var process = LCProcess.WinPMEM().ByProcessId(1234);
```

This is usually the easiest way to verify that your scenario works in the `LCProcess` model before moving on to `FPGA`.

Related docs:

- [LeechCore WinPMEM device docs](https://github.com/ufrisk/LeechCore/wiki/Device_WinPMEM)
- [WinPMEM](https://github.com/Velocidex/WinPmem)

### Custom

If the built-in builders are not enough, you can pass your own LeechCore arguments:

```csharp
using EyeAuras.Memory.MPFS;

using var process = LCProcess.Custom("-device", "hvmm://id=0")
    .ByProcessName("game.exe");
```

This also includes `WithDevice(...)`, `WithRemote(...)`, `WithAdditionalArguments(...)`, `WithPrinting(...)`, and `WaitForInitialize(...)`.

If you are integrating something custom, these are useful:

- [LeechCore API](https://github.com/ufrisk/LeechCore/wiki/LeechCore_API)
- [LeechCore Python API](https://github.com/ufrisk/LeechCore/wiki/LeechCore_API_Python)

## What `LCProcess` gives you

Even though it is acquisition-based, the layer on top still looks familiar:

- `process.Memory`
- `GetProcessModules()`
- `GetThreads()`
- `GetMemoryRegions()`
- `MemoryOfModule(...)`
- `ReadImports()`, `ReadExports()`, `ReadSections()`
- `pattern scanning`

That is the whole point of `LCProcess`: change the memory acquisition transport without changing the rest of your tooling.

## Where its limits are

`LCProcess` is a backend for memory reading and analysis, not the main backend for process control.

You should not expect the same profile as `LocalProcess`:

- it is not the best starting point for `DLL inject`, `APC`, or `remote thread`
- active process control is not the main scenario here
- writing is possible, but overall this is a more careful and more fragile path than a regular local backend
- success depends not only on your script, but also on how the acquisition stack is set up

If your task sounds like "open a local process and quickly patch something," then `LocalProcess` or `KDProcess` is almost always a better fit than `LCProcess`.

## Recommended background reading

If you want a better general picture of the difference between external memory reading and internal-style scenarios, these are useful:

- [External Memory Hack](https://gamehacking.academy/pages/3/02/)
- [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/)
- [Pattern Scanner](https://gamehacking.academy/pages/7/02/)
- [DLL Injector](https://gamehacking.academy/pages/7/01/)
- [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/)

## Where to start

If you want the most practical path, this order works well:

1. first validate the idea with `WinPMEM`
2. then move to `FPGA` or `Hyper-V`
3. only after that bring in signatures, PE parsing, and more complex logic

This makes it much easier to separate logic problems from acquisition stack problems.

## Read next

- [Memory API - Getting Started](/scripting/memory-api/getting-started)
- [LocalProcess](/scripting/memory-api/backends/local-process)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Getting a list of running processes](/scripting/examples/advanced/memory/get-processes)
- [Reading memory through different backends](/scripting/examples/advanced/memory/rpm-read)