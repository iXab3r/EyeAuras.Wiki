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

Локальный пример ниже выполняется в `C# Script` EyeAuras с загруженным модулем `EyeAuras.Memory`. `LocalProcess.GetProcesses()` возвращает дескрипторы `ProcessInformation`, а не открытые читатели памяти; освобождать каждую запись через `Dispose` не нужно. Для встроенного SDK-хоста модуль подключают через `UseMemory()` и ждут `EnsureReadyAsync()` — это отдельная настройка приложения, не строка обычного скрипта.

Начнём с очень простой задачи: как получить список процессов, запущенных на локальной машине?

В классическом C# для этого обычно используют [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0).

Но так как мы работаем через API EyeAuras, у нас есть дополнительные возможности. Выбор backend меняет источник данных и требования к окружению.

## Использование .NET-примитивов — аналог работы через Process

```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

После запуска этого скрипта в `EventLog` вы увидите примерно такой результат — список процессов с самой базовой информацией: `ProcessId` (или `PID`) и `ProcessName`.

![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

> Следующие варианты сохранены как примеры интеграции с `LCProcess`. Нужны отдельно установленная совместимая MPFS/LeechCore-сборка, её нативные библиотеки и настроенное устройство/драйвер. Фабрики и получение списка сверены с исходниками `c8b2304`; одна замена класса не доказывает готовность нативного окружения.
{.is-warning}

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
LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses(); //select VM index 0 explicitly

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

Несмотря на имя URL `rpm-read`, эта страница перечисляет процессы. Для чтения значения откройте известный PID через `using var process = LocalProcess.ByProcessId(pid)` и используйте `process.Memory.Read<T>(address)` с известными типом и абсолютным адресом; здесь нет самостоятельного примера чтения неизвестной памяти.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Процессы и память](/ru/scripting/api/memory/processes) · [Примитивы памяти](/ru/scripting/memory-api/memory-basics)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.

Фабрики LC и владение временным VMM при перечислении проверены по [LCProcess на c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory.MPFS/LCProcess.cs). `GetProcesses()` возвращает снимок списка и освобождает временный VMM. Нативный запуск не проверялся; [контракт backend](/ru/scripting/memory-api/backends/lc-process) описывает параметры и ограничения.
