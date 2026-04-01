---
title: Получение списка запущенных процессов
description: Получение списка запущенных процессов в системе
published: true
date: 2025-09-04T08:42:25.753Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---
# Получение списка запущенных процессов

Начнём с очень простой задачи: как получить список процессов, запущенных на локальной машине?

В классическом C# для этого обычно используют [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0).

Но так как мы работаем через API EyeAuras, у нас есть дополнительные возможности. Они позволяют легко переключаться между разными способами чтения памяти и при необходимости обходить защитные механизмы.

## Использование .NET-примитивов — аналог работы через `Process`

```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

После запуска этого скрипта в `EventLog` вы увидите примерно такой результат — список процессов с самой базовой информацией: `ProcessId` (или `PID`) и `ProcessName`.

![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

## Использование LeechCore

Теперь воспользуемся другим подходом: вместо `LocalProcess` в качестве точки входа будем использовать `LCProcess` (`[LeechCore](https://github.com/ufrisk/LeechCore) Process`). LeechCore — отличная библиотека, разработанная [Ulf Frisk](https://github.com/ufrisk).

В LeechCore доступны так называемые `acquisition device`. Полный список аргументов и параметров можно найти в его [Wiki](https://github.com/ufrisk/LeechCore/wiki).

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; //LCProcess is inside MPFS

var processes = LCProcess.WinPMEM().GetProcesses(); //use kernel driver
Log.Info(processes.DumpToNamedTable("Processes"));
```

### Билдеры LeechCore для конкретных устройств

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; 

LCProcess.WinPMEM().GetProcesses(); //use WinPMEM Kernel driver 
LCProcess.WinPMEM().WithAdditionalArguments("-printf", "-v").GetProcesses(); //same, but with verbose logging

//using other acquisition devices
LCProcess.FPGA().GetProcesses(); //use FPGA DMA PCI-E 
LCProcess.HyperV().GetProcesses(); //read info from the first system Hyper-V VM 

//or go full-custom with LeechCore args
LCProcess.Custom("-device", "pmem").GetProcesses(); //allows to supply any custom arguments
```

### Использование DMA-устройств

DMA поддерживается через интеграцию с LeechCore — просто используйте тип `LCProcess` с `.FPGA()`.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; 

var processList = LCProcess.FPGA().GetProcesses(); //get list of processes by reading it via DMA device
Log.Info($"Processes: \n\t{processList.DumpToTable()}"); // dump process list to the log
```