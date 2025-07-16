---
title: DMA
description: Integration with DMA/FPGA-cards
published: true
date: 2025-07-16T11:25:58.112Z
tags: 
editor: markdown
dateCreated: 2025-07-16T11:25:58.112Z
---

📎 More information, examples, and scripts — [here](https://wiki.eyeauras.net/en/scripting/examples/advanced/memory/rpm-read)

---

# DMA Integration

**DMA (Direct Memory Access)** is a technology that allows reading or writing data directly into a computer’s memory **bypassing both the CPU and operating system**. This makes it possible to access the memory of any process, even if it is protected by anti-cheat systems or mechanisms like:
- Kernel Patch Protection (KPP),
- Hypervisor Protected Code Integrity (HVCI),
- User-mode hooks,
- Secure Boot / VBS / Credential Guard, etc.

EyeAuras uses **[LeechCore](https://github.com/ufrisk/LeechCore)** — an open-source library by [Ulf Frisk](https://github.com/ufrisk), widely recognized as the standard for working with PCIe/Thunderbolt/FPGA DMA devices. It powers popular projects like PCILeech and is frequently used in debuggers, forensic tools, automation, and low-level memory inspection utilities.

---

## What do you get?

With DMA, you gain:
- 🔓 **Full access to system memory**, including the kernel and protected processes — both reading and writing.
- 🕵️ The ability to analyze anti-cheat protected games **without detection**.
- 💻 Full scripting support in **C#** on top of the hardware — you interact with memory just like with `ReadProcessMemory`, while under the hood everything goes through a physical PCIe bus.

All this is now available through standard EyeAuras scripting — no need to learn HDL, PCIe internals, virtualization, or write your own drivers.

---

## Setup #1 — Game and bot on separate PCs

This is the **primary and most secure setup**. The game and the bot run on **different computers**, connected via a DMA device.

- The PC running the game remains untouched — no software is installed, no suspicious processes or drivers.
- The DMA device (e.g., FPGA board) mimics an SSD, Wi-Fi adapter, or other PCIe device.
- The second PC runs EyeAuras and interacts with the game machine fully externally.

This setup is very difficult to detect and is generally used in security research and bot development targeting high-security environments.

---

## Setup #2 — Game and bot on the same PC

This setup is **less secure**:
- Everything runs on the same machine.
- An anti-cheat may detect EyeAuras, the DMA device, or the driver.

However — in many real-world cases, **DMA is so far outside the detection surface** of the game/anti-cheat that no one even checks for it. In those cases, this setup becomes completely viable and much easier to configure.

---

## Usage Example

From a scripting perspective, **nothing changes**. You use the same `IMemory` interface:

```csharp
var playerHp = CoreMem.Read<int>(playerBase + 0x1C4);
if (playerHp < 30)
{
    Log.Warn($"Low HP: {playerHp}");
}
````

* `CoreMem` can now point to a DMA-backed memory interface.
* `playerBase` might be a virtual or physical address — you don’t have to worry about it.
* EyeAuras handles address translation, retries, paging, and memory backend management automatically.

---

## Hardware Requirements

To use DMA, you’ll need a **LeechCore-compatible FPGA board**.

The good news: as of 2025, **99% of common FPGA boards are compatible**. Just flash the right firmware and connect.

Popular options:

* **Screamer M.2 / Thunderbolt** (popular and plug-and-play)
* **Xilinx SP605 / KC705 / AC701**
* **Lecroy bridges**, FT601 devices, STM32 custom builds, etc.

---

## Technical Implementation in EyeAuras

DMA integration is built on a backend layer called `IMemoryBackend`, which supports:

* ✅ Reading/writing via **physical or virtual addresses**
* ✅ Support for both x64 and x86 processes
* ✅ **Automatic reinitialization** and recovery on error
* ✅ Hot-swapping between DMA and `ReadProcessMemory` at runtime — great for debugging or fallback scenarios

