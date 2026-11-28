---
title: Чтение известного значения из памяти
description: Как прочитать известное число из памяти собственного процесса
published: true
date: 2025-09-04T08:42:25.753Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---
# Прочитать известное число из собственной памяти

Чтобы что-то прочитать, нужны настоящий адрес и известный тип. Создадим в процессе EyeAuras свой участок на четыре байта, запишем туда `int` 742 и прочитаем его через `process.Memory.Read<int>`. Потом запишем в тот же участок 743 и прочитаем ещё раз.

Нужен настольный EyeAuras на Windows с загруженным **EyeAuras.Memory**. Скрипт работает со своей учебной памятью, поэтому драйверы, DMA и поиск адресов не нужны.

## Запустить чтение

1. Создайте действие **C# Script** и вставьте весь код в `Script.csx`:

```csharp
using System;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    var address = Marshal.AllocHGlobal(sizeof(int));
    try
    {
        Marshal.WriteInt32(address, 742);
        using var process = LocalProcess.ByProcessId(Environment.ProcessId);
        cancellationToken.ThrowIfCancellationRequested();
        var before = process.Memory.Read<int>(address);
        Log.Info($"PID={process.ProcessId}; address=0x{address.ToInt64():X}; int={before}");
        process.Memory.Write<int>(address, 743);
        var after = process.Memory.Read<int>(address);
        Log.Info($"After write: {after}");
    }
    finally
    {
        Marshal.FreeHGlobal(address);
    }
}
```

2. Нажмите **Run** и откройте журнал. В первой строке должны быть текущий PID, адрес с `0x` и `int=742`, во второй — `After write: 743`.
3. Нажмите Run ещё раз: значения те же, а адрес может быть другим. В конце блок освобождает память, поэтому адрес прошлого запуска использовать нельзя.

| Вход или владелец | Почему это важно |
| --- | --- |
| `Environment.ProcessId` | Процесс, в котором выполняется сам скрипт. Ему же принадлежит выделенный участок. |
| `address` | Абсолютный виртуальный адрес, который вернул `AllocHGlobal`. Это не RVA и не смещение от модуля. |
| `int` / `sizeof(int)` | Тип и размер известны с самого начала: 32-битное целое, 4 байта. Сам по себе адрес о типе ничего не говорит. |
| `Marshal.WriteInt32` | Записывает исходное значение обычным .NET-вызовом. Чтение и следующая запись идут уже через высокоуровневые методы EyeAuras. |
| `using var process` | Внутри явного блока закрывает читатель раньше, чем освободится участок. `process.Memory` отдельно освобождать не нужно. |

`Read<T>` и `Write<T>` работают со скалярами `unmanaged` и структурами. Для обычного `int` не нужны массивы байтов или `BinaryPrimitives`. Байтовые операции — для другого: настоящих бинарных блоков, строк в кодировке, машинного кода. Если чтение не удалось, `Read<int>` не выдаст вместо ошибки ноль. Токен проверяется перед операциями, сам синхронный вызов его не получает.

Для своего отдельного приложения нужны его текущий PID, адрес, полученный из самого приложения, и схема данных, которая ему соответствует. Для адресов внутри DLL сначала получите [базу загруженного модуля](/ru/scripting/examples/advanced/memory/read-exports), а потом используйте известное смещение для нужной версии.

<details>
<summary>Прежний пример: список процессов и источники LeechCore</summary>

Если нужен только список, хватит такого скрипта:

```csharp
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

![Пример списка в журнале](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

В [примере со списком процессов](/ru/scripting/examples/advanced/memory/get-processes) объясняется, что такое `Id`, как выбрать экземпляр и чем запись списка отличается от открытого читателя. Во встроенном SDK-хосте `UseMemory()`/`EnsureReadyAsync()` вызываются отдельно, при подготовке хоста.

Варианты ниже — **замена перечисления для уже настроенного MPFS/LeechCore**, а не дополнение к локальному скрипту чтения. Нужны совместимые сборки `EyeAuras.Memory.MPFS`, нативные библиотеки и подходящее устройство или драйвер. Про источник читайте в [LeechCore](https://github.com/ufrisk/LeechCore), [его руководстве](https://github.com/ufrisk/LeechCore/wiki) и [описании LCProcess](/ru/scripting/memory-api/backends/lc-process). Библиотеку разработал [Ulf Frisk](https://github.com/ufrisk).

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.MPFS;
using PoeShared.Scaffolding;

var processes = LCProcess.WinPMEM().GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

Вместо строки `var processes = ...` выберите **одну** из альтернатив:

```csharp
var processes = LCProcess.WinPMEM().WithAdditionalArguments("-printf", "-v").GetProcesses();
var processes = LCProcess.FPGA().GetProcesses();
var processes = LCProcess.HyperV().UseVirtualMachineByIndex(0).GetProcesses();
var processes = LCProcess.Custom("-device", "pmem").GetProcesses();
```

| Вариант | Подготовленный источник |
| --- | --- |
| `WinPMEM()` / `Custom("-device", "pmem")` | Локальная память через настроенный WinPMEM. `-printf` и `-v` добавляют диагностический вывод. |
| `FPGA()` | Совместимое DMA-устройство. Список относится к той системе, чью память оно отдаёт, а не обязательно к локальному EyeAuras. |
| `HyperV().UseVirtualMachineByIndex(0)` | Гостевая система с явно выбранным индексом. Замените 0 своим значением. |

`GetProcesses()` возвращает список на момент вызова и освобождает временный VMM. Чтобы открыть читатель, нужны отдельные `ByProcessId`/`ByProcessName` и своя область жизни для него.

</details>
