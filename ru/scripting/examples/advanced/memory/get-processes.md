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

Прежде чем читать память, нужно выбрать нужный экземпляр программы. Этот скрипт выводит список локальных процессов на момент запуска: имя и PID. По PID потом можно открыть читатель памяти. Память найденных процессов скрипт ещё не читает.

Нужен настольный EyeAuras на Windows с загруженным модулем **EyeAuras.Memory**. Тип `LocalProcess` описан в метаданных SDK, но его реализацию регистрирует модуль — одного `using` или ссылки на сборку мало.

## Получить список

1. Оставьте открытой программу, PID которой хотите узнать. Если запущено несколько экземпляров с одним именем, заранее разберитесь в Диспетчере задач, какой из них ваш.
2. Создайте действие **C# Script** и вставьте в `Script.csx` весь код:

```csharp
using System.Linq;
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.OrderBy(x => x.ProcessName).DumpToNamedTable("Processes"));
```

3. Нажмите **Run** и откройте журнал событий скрипта. Найдите строку своей программы и запишите `Id` — это PID. Каждый Run получает список заново.

![Прежний вывод списка процессов в журнале](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

| Поле или операция | Как понимать результат |
| --- | --- |
| `ProcessInformation.Id` | PID из источника списка, а не адрес памяти. Когда процесс завершится, тот же PID может достаться другому процессу. |
| `ProcessName` | Имя процесса, а не полный путь к исполняемому файлу. Имена могут повторяться. |
| `GetProcesses()` | Записи `ProcessInformation` на момент вызова, а не открытые читатели. У записей нет своего `Dispose`. |
| `LocalProcess.ByProcessId(pid)` | Следующий шаг — открыть конкретный локальный процесс. Созданный читатель нужно освободить. Получится ли открыть, зависит от прав и состояния процесса. |

Что делать с PID дальше, показывают два отдельных примера: [просмотр экспортов](/ru/scripting/examples/advanced/memory/read-exports) и [первое чтение значения](/ru/scripting/examples/advanced/memory/rpm-read). `ByProcessName` открывает первый процесс с подходящим именем, поэтому при нескольких экземплярах PID точнее. То, что процесс есть в списке, ещё не значит, что его можно открыть или прочитать его память.

<details>
<summary>Другой источник: WinPMEM или Hyper-V</summary>

Эти варианты нужны, только если у вас уже настроена интеграция **EyeAuras.Memory.MPFS** с совместимыми MemProcFS/LeechCore и нативными библиотеками. Для WinPMEM нужен настроенный [драйвер WinPmem](https://github.com/Velocidex/WinPmem), для Hyper-V — доступное устройство захвата памяти гостевой системы. Обычному локальному примеру всё это не нужно.

[LeechCore](https://github.com/ufrisk/LeechCore), который разработал [Ulf Frisk](https://github.com/ufrisk), выбирает источник памяти по аргументу устройства. Отдельный скрипт для WinPMEM:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Если Hyper-V настроен, замените код этим вариантом и укажите индекс своей VM:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Это список процессов выбранной гостевой системы. Он может не совпадать с локальным списком хоста.

![Пример списка процессов гостевой системы](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_Irub5Wxahg.png)

В конфигурации Hyper-V, с которой сделан снимок, **Dynamic Memory** была отключена. Требования зависят от установленного Hyper-V acquisition plugin, а не от `LocalProcess`.

![Dynamic Memory в настройках Hyper-V](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_gOcli4xKIn.png)

Проверить подготовленный нативный модуль можно его командой:

```bash
MemProcFS.exe -device hvmm://listvm
```

Старый пример вывода plugin 1.2.20240329:

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

Индекс 0 здесь — пример, нужная VM сама не выбирается. Как устроены фабрики и кто чем владеет, видно в [исходнике LCProcess](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Memory.MPFS/LCProcess.cs). В managed API есть ещё `LCProcess.HyperV().ListVirtualMachines()`. `GetProcesses()` создаёт временный VMM и освобождает его, когда список получен. Когда вы открываете процесс, владелец уже другой — сам читатель `LCProcess`. Параметры и требования — на странице [LCProcess](/ru/scripting/memory-api/backends/lc-process).

</details>

Если вы встраиваете SDK в своё приложение, `UseMemory()` и ожидание `EnsureReadyAsync()` относятся к запуску хоста, а не к обычному `Script.csx`. `Log` есть только в верхнеуровневом скрипте, обычному C#-классу журнал передают явно.
