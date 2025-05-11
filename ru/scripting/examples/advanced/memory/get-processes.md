---
title: Getting Process list
description: 
published: true
date: 2025-05-11T00:13:27.986Z
tags: 
editor: markdown
dateCreated: 2025-05-11T00:12:14.976Z
---

## Получение списка запущенных процессов

Начнём с очень простой задачи — что если мы хотим получить список запущенных процессов на локальной машине?

В классическом C# это решается вызовом [Process.GetProcesses()](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.getprocesses?view=net-8.0)

Но так как мы работаем в рамках API EyeAuras, нам придётся использовать немного другой подход, который позволит нам очень легко переключаться между различными способами чтения памяти.

### Самый простой способ — эквивалент работы через `Process`
```csharp
using EyeAuras.Memory;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
````

В результате выполнения этого скрипта вы должны увидеть нечто подобное в `EventLog` — список с очень базовой информацией о запущенных процессах, содержащей их `ProcessId` (или `PID`) и `ProcessName`.
![Event Log](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

### Использование LeechCore PMEM-драйвера

Теперь мы используем другой подход — вместо `LocalProcess` как точки входа, мы вызовем `LCProcess` ([LeechCore](https://github.com/ufrisk/LeechCore)). LeechCore — это отличная библиотека, разработанная [Ulf Frisk](https://github.com/ufrisk).

Внутри у неё реализованы различные методы чтения памяти целевой (не только локальной) системы, включая, конечно, информацию о процессах.

Для конечного пользователя переключение между методами чтения памяти сводится к замене одного класса, добавлению пространства имён и указанию аргументов запуска.

В этом примере мы передадим библиотеке командную строку `-device pmem`, что заставит её загрузить и использовать драйвер [WinPMEM](https://github.com/Velocidex/WinPmem).

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS; // обратите внимание на новое пространство имён — LCProcess находится здесь

var processes = LCProcess.GetProcesses("-device", "pmem");
Log.Info(processes.DumpToNamedTable("Processes"));
```

Результат можно опустить — он должен быть точно таким же, как и ранее.

### Использование LeechCore Hyper-V

Сделаем кое-что интересное — попробуем получить список процессов, запущенных **ВНУТРИ** виртуальной машины Hyper-V (гостевой системы) из хостовой.

Для простоты я выберу ID первой попавшейся виртуалки (id=0), в вашем случае может понадобиться другой ID.

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;

var processes = LCProcess.GetProcesses("-device", "hvmm://id=0");
Log.Info(processes.DumpToNamedTable("Processes"));
```

![VM Processes](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

### Настройка Hyper-V машины

Здесь приведу только самый важный момент — не забудьте **отключить** `Dynamic Memory` в настройках виртуальной машины.
![Dynamic memory](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

### Получение списка виртуальных машин Hyper-V

На данный момент это требует запуска MemProcFS (основанного на LeechCore) отдельно.

```bash
MemProcFS.exe -device hvmm://listvm
```

Вот как может выглядеть вывод в случае простой конфигурации с одной виртуальной машиной:

```bash
   Microsoft Hyper-V Virtual Machine plugin 1.2.20240329(beta) for MemProcFS (by Ulf Frisk).

   plugin parameters:
      hvmm://id=<vm id number>
      hvmm://id=<vm id number>,unix
      hvmm://listvm
      hvmm://enumguestosbuild
      hvmm://loglevel=<log level number>
   Example: MemProcFS.exe -device hvmm://listvm

   Virtual Machines:
    --> [id = 0] ShadowForge (PartitionId = 0x2, Full VM)
   You selected the following virtual machine: ShadowForge
```

