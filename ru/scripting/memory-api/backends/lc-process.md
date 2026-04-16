---
title: LCProcess
description: Acquisition backend через MemProcFS, LeechCore, Hyper-V и FPGA
published: true
date: 2026-04-16T18:25:00.000Z
tags: c#, scripting, memory, reverse-engineering, backend, lcprocess, mpfs, ai-translated
editor: markdown
dateCreated: 2026-04-16T18:25:00.000Z
---

# `LCProcess`

`LCProcess` это acquisition backend поверх [LeechCore](https://github.com/ufrisk/LeechCore) и [MemProcFS](https://github.com/ufrisk/MemProcFS). Если `LocalProcess` работает с локальным процессом через обычный WinAPI, то `LCProcess` читает память через внешний источник. Главный автор этой экосистемы это [Ulf Frisk](https://github.com/ufrisk).

Для Memory API это важно по одной причине: вы всё ещё получаете привычный `IProcess`-подобный слой с модулями, регионами, `MemoryOfModule(...)`, импортами, экспортами и сигнатурами, но источник памяти уже другой.

## ELI5 - что такое `DMA`, `FPGA` и зачем здесь `Hyper-V`
- `DMA` — **Direct Memory Access**, это сценарий, где память читается не через обычный `OpenProcess`, а через более низкий и более внешний путь.
- `FPGA` — это программируемое железо, на базе которого в экосистеме Ulf Frisk строятся DMA-устройства.
- `Hyper-V` — это сценарий, где хост читает память гостевой виртуальной машины снаружи.

Если совсем по-простому:

- `LocalProcess` — "открой процесс как обычная программа"
- `LCProcess` — "получи память извне и потом уже работай с ней как с процессом"

Именно поэтому `LCProcess` особенно интересен там, где обычный user-mode путь не хочется или не получается использовать.

## Когда использовать

`LCProcess` нужен, когда обычного WinAPI уже мало или он вообще не подходит.

Главные сценарии здесь такие:

- `FPGA` — основной DMA-сценарий
- `Hyper-V` — чтение памяти гостевой машины из хоста
- `WinPMEM` — локальный acquisition backend для проверки пайплайна без FPGA

Если ничего из этого не нужно, почти всегда проще начать с `LocalProcess`.

## Какие режимы есть

### `FPGA`

Это основной сценарий для `LCProcess`. Именно ради него этот backend чаще всего и берут.

В экосистеме Ulf Frisk это путь, где память читается через DMA-устройство на базе FPGA, а сверху уже строится привычный process-shaped API:

```csharp
using EyeAuras.Memory.MPFS;

var processes = LCProcess.FPGA().GetProcesses();
using var process = LCProcess.FPGA().ByProcessName("game.exe");
```

Практически это даёт главное преимущество `LCProcess`: чтение идёт внешним путём, а не через обычное открытие процесса. По документации PCILeech и PCILeech FPGA, именно FPGA-сценарий даёт полный доступ к 64-bit memory space без зависимости от обычного process handle на целевой системе.

Если хочется глубже в железную часть, смотри:

- [LeechCore FPGA device docs](https://github.com/ufrisk/LeechCore/wiki/Device_FPGA)
- [PCILeech](https://github.com/ufrisk/pcileech)
- [PCILeech Wiki](https://github.com/ufrisk/pcileech/wiki)
- [PCILeech FPGA](https://github.com/ufrisk/pcileech-fpga)
- [PCILeech FPGA Wiki](https://github.com/ufrisk/pcileech-fpga/wiki)

### `Hyper-V`

Это второй по важности сценарий. Здесь хост читает память гостевой Windows-машины снаружи.

Для старта есть отдельный builder:

```csharp
using EyeAuras.Memory.MPFS;

var vms = LCProcess.HyperV().ListVirtualMachines();

using var process = LCProcess.HyperV()
    .UseVirtualMachineByIndex(0)
    .ByProcessName("game.exe");
```

Главная ценность здесь в том, что память читается **снаружи виртуальной машины**. Это даёт несколько очень понятных плюсов:

- не нужно запускать ваш код внутри гостя
- guest можно анализировать из хоста
- меньше зависимости от того, что происходит внутри самой VM
- удобно для лабораторий, тестовых стендов и сценариев, где не хочется "трогать" гостевую систему

Практическая оговорка здесь одна и важная: для стабильной работы Hyper-V сценария обычно нужно отключить `Dynamic Memory` у виртуальной машины.

Полезные материалы по этой ветке:

- [MemProcFS VM Wiki](https://github.com/ufrisk/MemProcFS/wiki/VM)
- [MemProcFS CommandLine Wiki](https://github.com/ufrisk/MemProcFS/wiki/_CommandLine)

### `WinPMEM`

`WinPMEM` полезен как более простой локальный вход в ту же acquisition-модель:

```csharp
using EyeAuras.Memory.MPFS;

var processes = LCProcess.WinPMEM().GetProcesses();
using var process = LCProcess.WinPMEM().ByProcessId(1234);
```

Обычно это самый удобный способ проверить, что ваш сценарий вообще работает в модели `LCProcess`, ещё до перехода на `FPGA`.

По теме:

- [LeechCore WinPMEM device docs](https://github.com/ufrisk/LeechCore/wiki/Device_WinPMEM)
- [WinPMEM](https://github.com/Velocidex/WinPmem)

### `Custom`

Если готовых builder'ов мало, можно уйти в свои аргументы LeechCore:

```csharp
using EyeAuras.Memory.MPFS;

using var process = LCProcess.Custom("-device", "hvmm://id=0")
    .ByProcessName("game.exe");
```

Сюда же относятся `WithDevice(...)`, `WithRemote(...)`, `WithAdditionalArguments(...)`, `WithPrinting(...)` и `WaitForInitialize(...)`.

Если вы интегрируете что-то своё, полезны:

- [LeechCore API](https://github.com/ufrisk/LeechCore/wiki/LeechCore_API)
- [LeechCore Python API](https://github.com/ufrisk/LeechCore/wiki/LeechCore_API_Python)

## Что даёт `LCProcess`

Несмотря на acquisition-природу, сверху вы получаете знакомую модель:

- `process.Memory`
- `GetProcessModules()`
- `GetThreads()`
- `GetMemoryRegions()`
- `MemoryOfModule(...)`
- `ReadImports()`, `ReadExports()`, `ReadSections()`
- `pattern scanning`

Это и есть главный смысл `LCProcess`: менять транспорт чтения памяти, не меняя весь остальной инструментарий.

## Где его границы

`LCProcess` это backend для чтения и анализа памяти, а не основной backend для управления процессом.

От него не стоит ждать того же профиля, что у `LocalProcess`:

- это не лучший старт для `DLL inject`, `APC` и `remote thread`
- активный process control здесь не главный сценарий
- запись возможна, но в целом это более осторожный и более капризный путь, чем обычный локальный backend
- успех зависит не только от скрипта, но и от того, как поднят acquisition stack

Если задача звучит как "открыть локальный процесс и быстро что-то пропатчить", почти всегда лучше `LocalProcess` или `KDProcess`, а не `LCProcess`.

## Что почитать для общей картины

Если хочется лучше понять именно разницу между внешним чтением памяти и internal-сценариями, полезны:

- [External Memory Hack](https://gamehacking.academy/pages/3/02/)
- [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/)
- [Pattern Scanner](https://gamehacking.academy/pages/7/02/)
- [DLL Injector](https://gamehacking.academy/pages/7/01/)
- [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/)

## С чего начать

Если нужен самый практичный маршрут, я бы рекомендовал такой порядок:

1. сначала проверить идею через `WinPMEM`
2. потом перейти на `FPGA` или `Hyper-V`
3. только после этого тащить в сценарий сигнатуры, PE-разбор и более сложную логику

Так проще отделить проблемы логики от проблем acquisition stack.

## Что читать дальше

- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Получение списка запущенных процессов](/ru/scripting/examples/advanced/memory/get-processes)
- [Чтение памяти через разные backend](/ru/scripting/examples/advanced/memory/rpm-read)
