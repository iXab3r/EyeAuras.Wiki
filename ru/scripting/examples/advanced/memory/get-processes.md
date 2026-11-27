---
title: Getting Process list
description: 
published: true
date: 2025-05-11T00:13:27.986Z
tags: 
editor: markdown
dateCreated: 2025-05-11T00:12:14.976Z
---
# Узнать PID своего процесса

Перед чтением памяти выберите нужный экземпляр программы. Этот скрипт выводит снимок локального списка процессов: имя и PID, по которому затем можно открыть читатель. Он ещё не читает память каждого найденного процесса.

Нужен настольный Windows-хост EyeAuras с загруженным модулем **EyeAuras.Memory**. Тип `LocalProcess` находится в метаданных SDK, но его реализацию регистрирует модуль; одного `using` или ссылки на сборку недостаточно.

## Получить список

1. Оставьте открытой свою программу, PID которой хотите узнать. При нескольких одинаковых именах заранее различите экземпляры в Диспетчере задач.
2. Создайте действие **C# Script**, вставьте в `Script.csx` весь код:

```csharp
using System.Linq;
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.OrderBy(x => x.ProcessName).DumpToNamedTable("Processes"));
```

3. Нажмите **Run** и откройте журнал событий скрипта. Найдите строку своей программы и запишите `Id` — это PID. Повторный Run получает новый список.

![Прежний вывод списка процессов в журнале](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

| Поле или операция | Как понимать результат |
| --- | --- |
| `ProcessInformation.Id` | PID в источнике списка; это не адрес памяти. После завершения процесса PID может быть использован снова. |
| `ProcessName` | Имя процесса, не полный путь к исполняемому файлу. Одинаковые имена допустимы. |
| `GetProcesses()` | Снимок записей `ProcessInformation`, а не открытые читатели. У записей нет своего `Dispose`. |
| `LocalProcess.ByProcessId(pid)` | Следующий шаг: открыть конкретный локальный процесс. Созданный читатель нужно освободить; доступ определяется правами и состоянием процесса. |

Для [просмотра экспортов](/ru/scripting/examples/advanced/memory/read-exports) и [первого чтения значения](/ru/scripting/examples/advanced/memory/rpm-read) есть отдельные законченные примеры. Открытие по имени через `ByProcessName` выбирает первый подходящий процесс, поэтому PID точнее для нескольких экземпляров. Перечисление не обещает возможность открыть любую строку или получить её память.

<details>
<summary>Другой источник: WinPMEM или Hyper-V</summary>

Эти варианты нужны для уже подготовленной интеграции **EyeAuras.Memory.MPFS** с совместимыми MemProcFS/LeechCore и нативными библиотеками. WinPMEM требует настроенного [драйвера WinPmem](https://github.com/Velocidex/WinPmem); Hyper-V — доступного устройства захвата памяти гостевой системы. Это не необходимые шаги обычного локального примера.

[LeechCore](https://github.com/ufrisk/LeechCore), разработанный [Ulf Frisk](https://github.com/ufrisk), выбирает источник памяти аргументом устройства. Самостоятельный вариант для WinPMEM:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Для настроенной Hyper-V-среды замените программу этим вариантом, указав свой индекс VM:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Это список из выбранной гостевой системы; он не обязан совпадать с локальным списком хоста.

![Пример списка процессов гостевой системы](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

В прежней конфигурации Hyper-V использовалась отключённая **Dynamic Memory**. Снимок показывает именно эту настройку; требования зависят от установленного Hyper-V acquisition plugin, а не от `LocalProcess`.

![Dynamic Memory в настройках Hyper-V](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

Для диагностики подготовленного нативного модуля можно использовать его команду:

```bash
MemProcFS.exe -device hvmm://listvm
```

Исторический пример вывода plugin 1.2.20240329:

```text
Microsoft Hyper-V Virtual Machine plugin 1.2.20240329(beta) for MemProcFS (by Ulf Frisk).
hvmm://id=<vm id number>
hvmm://id=<vm id number>,unix
hvmm://listvm
hvmm://enumguestosbuild
hvmm://loglevel=<log level number>
Virtual Machines:
 --> [id = 0] ShadowForge (PartitionId = 0x2, Full VM)
```

Индекс 0 здесь — пример, не автоматический выбор нужной VM. Фабрики и владение сверены с [исходником LCProcess](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Memory.MPFS/LCProcess.cs). В managed API также есть `LCProcess.HyperV().ListVirtualMachines()`. `GetProcesses()` создаёт временный VMM и освобождает его после получения списка. При открытии процесса владелец уже другой — сам читатель `LCProcess`. Параметры и требования: [LCProcess](/ru/scripting/memory-api/backends/lc-process).

</details>

В собственном встроенном SDK-приложении подключение памяти через `UseMemory()` и ожидание `EnsureReadyAsync()` относятся к запуску хоста, а не к телу обычного `Script.csx`. `Log` — возможность верхнеуровневого скрипта; обычному C# классу передают журнал явно.
