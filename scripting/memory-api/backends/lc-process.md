---
title: LCProcess
description: Acquisition backend using MemProcFS, LeechCore, Hyper-V, and FPGA
published: true
date: 2026-04-16T18:25:00.000Z
tags: c#, scripting, memory, reverse-engineering, backend, lcprocess, mpfs, ai-translated
editor: markdown
dateCreated: 2026-04-16T18:25:00.000Z
---
# `LCProcess`

`LCProcess` is an acquisition backend built on top of [LeechCore](https://github.com/ufrisk/LeechCore) and [MemProcFS](https://github.com/ufrisk/MemProcFS). While `LocalProcess` works with a local process through the regular WinAPI, `LCProcess` reads memory through an external source. The main author behind this ecosystem is [Ulf Frisk](https://github.com/ufrisk).

For the Memory API, that matters for one simple reason: you still get the familiar `IProcess`-like layer with modules, regions, `MemoryOfModule(...)`, imports, exports, and signatures, but the memory source is different.

## ELI5 - what are `DMA`, `FPGA`, and why is `Hyper-V` here

- `DMA` means **Direct Memory Access**. In this setup, memory is read through a lower-level, more external path instead of the usual `OpenProcess`.
- `FPGA` is programmable hardware. In Ulf Frisk's ecosystem, DMA devices are built around it.
- `Hyper-V` is the scenario where the host reads memory from a guest virtual machine from the outside.

In very simple terms:

- `LocalProcess` = "open the process like a normal program would"
- `LCProcess` = "get the memory externally, then work with it as if it were a process"

That is exactly why `LCProcess` is especially useful when the normal user-mode path is undesirable or unavailable.

## When to use it

`LCProcess` is for cases where regular WinAPI is no longer enough, or does not fit at all.

The main scenarios are:

- `FPGA` - the primary DMA scenario
- `Hyper-V` - reading guest memory from the host
- `WinPMEM` - a local acquisition backend for validating your pipeline without FPGA

If you do not need any of that, it is almost always simpler to start with `LocalProcess`.

## Available modes

### `FPGA`

This is the main `LCProcess` scenario, and the reason most people use this backend.

In Ulf Frisk's ecosystem, this is the path where memory is read through an FPGA-based DMA device, while the upper layer still gives you a familiar process-shaped API:

```csharp
using EyeAuras.Memory.MPFS;

var processes = LCProcess.FPGA().GetProcesses();
using var process = LCProcess.FPGA().ByProcessName("game.exe");
```

In practice, this gives you the main advantage of `LCProcess`: memory is read through an external path, not by opening the target process normally. According to the PCILeech and PCILeech FPGA documentation, the FPGA path provides full access to the 64-bit memory space without relying on a regular process handle on the target system.

If you want to go deeper into the hardware side, see:

- [LeechCore FPGA device docs](https://github.com/ufrisk/LeechCore/wiki/Device_FPGA)
- [PCILeech](https://github.com/ufrisk/pcileech)
- [PCILeech Wiki](https://github.com/ufrisk/pcileech/wiki)
- [PCILeech FPGA](https://github.com/ufrisk/pcileech-fpga)
- [PCILeech FPGA Wiki](https://github.com/ufrisk/pcileech-fpga/wiki)

### `Hyper-V`

This is the second most important scenario. Here, the host reads memory from a guest Windows VM externally.

There is a dedicated builder for it:

```csharp
using EyeAuras.Memory.MPFS;

var vms = LCProcess.HyperV().ListVirtualMachines();

using var process = LCProcess.HyperV()
    .UseVirtualMachineByIndex(0)
    .ByProcessName("game.exe");
```

The main value here is that memory is read **from outside the virtual machine**. That gives you a few very practical benefits:

- you do not need to run your code inside the guest
- you can analyze the guest from the host
- there is less dependence on what is happening inside the VM itself
- it is convenient for labs, test setups, and scenarios where you do not want to "touch" the guest system

There is one practical caveat here, and it is important: for stable `Hyper-V` operation, you usually need to disable `Dynamic Memory` for the virtual machine.

Useful references for this path:

- [MemProcFS VM Wiki](https://github.com/ufrisk/MemProcFS/wiki/VM)
- [MemProcFS CommandLine Wiki](https://github.com/ufrisk/MemProcFS/wiki/_CommandLine)

### `WinPMEM`

`WinPMEM` is useful as a simpler local entry point into the same acquisition model:

```csharp
using EyeAuras.Memory.MPFS;

var processes = LCProcess.WinPMEM().GetProcesses();
using var process = LCProcess.WinPMEM().ByProcessId(1234);
```

This is usually the most convenient way to verify that your scenario works in the `LCProcess` model before moving on to `FPGA`.

Related docs:

- [LeechCore WinPMEM device docs](https://github.com/ufrisk/LeechCore/wiki/Device_WinPMEM)
- [WinPMEM](https://github.com/Velocidex/WinPmem)

### `Custom`

If the built-in builders are not enough, you can pass your own LeechCore arguments:

```csharp
using EyeAuras.Memory.MPFS;

using var process = LCProcess.Custom("-device", "hvmm://id=0")
    .ByProcessName("game.exe");
```

This also includes `WithDevice(...)`, `WithRemote(...)`, `WithAdditionalArguments(...)`, `WithPrinting(...)`, and `WaitForInitialize(...)`.

If you are integrating something custom, these may help:

- [LeechCore API](https://github.com/ufrisk/LeechCore/wiki/LeechCore_API)
- [LeechCore Python API](https://github.com/ufrisk/LeechCore/wiki/LeechCore_API_Python)

## What `LCProcess` gives you

Even though it is acquisition-based underneath, the API you get on top is still familiar:

- `process.Memory`
- `GetProcessModules()`
- `GetThreads()`
- `GetMemoryRegions()`
- `MemoryOfModule(...)`
- `ReadImports()`, `ReadExports()`, `ReadSections()`
- `pattern scanning`

That is the main point of `LCProcess`: change the memory acquisition transport without changing the rest of your tooling.

## Where its limits are

`LCProcess` is a backend for reading and analyzing memory, not the main backend for process control.

You should not expect the same profile as `LocalProcess`:

- it is not the best starting point for `DLL inject`, `APC`, and `remote thread`
- active process control is not the main use case here
- writing is possible, but overall this is a more careful and more fragile path than the regular local backend
- success depends not only on the script, but also on how the acquisition stack is set up

If your task sounds like "open a local process and patch something quickly", `LocalProcess` or `KDProcess` is almost always a better fit than `LCProcess`.

## Further reading for the bigger picture

If you want a better understanding of the difference between external memory reading and internal scenarios, these are useful:

- [External Memory Hack](https://gamehacking.academy/pages/3/02/)
- [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/)
- [Pattern Scanner](https://gamehacking.academy/pages/7/02/)
- [DLL Injector](https://gamehacking.academy/pages/7/01/)
- [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/)

## Where to start

If you want the most practical path, this order is a good default:

1. first validate the idea through `WinPMEM`
2. then move to `FPGA` or `Hyper-V`
3. only after that bring in signatures, PE parsing, and more complex logic

This makes it much easier to separate logic problems from acquisition stack problems.

## Read next

- [Memory API - Getting started](/scripting/memory-api/getting-started)
- [LocalProcess](/scripting/memory-api/backends/local-process)
- [PE basics](/scripting/memory-api/pe-basics)
- [Pattern Scanning](/scripting/memory-api/pattern-scanning)
- [Getting a list of running processes](/scripting/examples/advanced/memory/get-processes)
- [Reading memory through different backends](/scripting/examples/advanced/memory/rpm-read)