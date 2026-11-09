---
title: Получение списка запущенных процессов
description: Получение списка запущенных процессов в системе
published: true
date: 2025-09-04T08:42:25.753Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-10T23:09:15.299Z
---
# Прочитать известное число из собственной памяти

Для первого чтения нужен настоящий адрес и известный тип. Создадим в процессе EyeAuras собственный четырёхбайтовый участок, положим туда `int` со значением 742 и прочитаем его через `process.Memory.Read<int>`. Затем изменим только этот участок на 743 и прочитаем ещё раз. Адрес создаётся при каждом Run, а не берётся из примера чужого процесса.

Нужен настольный Windows-хост EyeAuras с загруженным **EyeAuras.Memory**. Это учебная память самого скрипта; драйверы, DMA и поиск адресов не нужны. Исторический URL `rpm-read` сохранён: прежде здесь повторялось перечисление процессов, теперь основной путь действительно читает значение.

## Запустить чтение

1. Создайте действие **C# Script**. Вставьте весь код в `Script.csx`:

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

2. Нажмите **Run** и откройте журнал. Первая строка должна содержать текущий PID, адрес с `0x` и `int=742`; вторая — `After write: 743`.
3. Повторите Run: значения те же, адрес может быть другим. После завершения блок освобождает память, поэтому использовать адрес прошлого запуска нельзя.

| Вход или владелец | Почему это важно |
| --- | --- |
| `Environment.ProcessId` | Процесс, в котором действительно исполняется этот скрипт. Здесь он же владеет выделенным участком. |
| `address` | Абсолютный виртуальный адрес, возвращённый `AllocHGlobal`; это не RVA и не смещение от модуля. |
| `int` / `sizeof(int)` | Тип и размер известны при создании: 32-битное целое, 4 байта. Произвольный адрес не сообщает свой тип сам. |
| `Marshal.WriteInt32` | Подготовка собственного исходного значения обычным .NET-вызовом. Само чтение и последующая запись выполняются высокоуровневыми методами EyeAuras. |
| `using var process` | Внутри явного блока закрывает читатель до освобождения участка. `process.Memory` отдельно освобождать не нужно. |

`Read<T>` и `Write<T>` принимают скаляры с ограничением `unmanaged` и структуры; для обычного `int` не нужны массивы байтов или `BinaryPrimitives`. Для реального бинарного блока, строки с кодировкой или машинного кода байтовые операции имеют другое назначение. При ошибке чтения `Read<int>` не превращает её в успешный ноль. Проверка токена стоит перед операциями; синхронный вызов не получает токен запуска.

При работе с собственным отдельным приложением нужны его актуальный PID, адрес из самого приложения и согласованная схема данных. Нельзя заменить их «похожим» постоянным адресом. Для адресов внутри DLL сначала получают [базу загруженного модуля](/ru/scripting/examples/advanced/memory/read-exports), а затем используют известное смещение нужной версии.

<details>
<summary>Прежний пример: список процессов и источники LeechCore</summary>

Если нужен только список, используйте самостоятельный скрипт:

```csharp
using EyeAuras.Memory;
using PoeShared.Scaffolding;

var processes = LocalProcess.GetProcesses();
Log.Info(processes.DumpToNamedTable("Processes"));
```

![Пример списка в журнале](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_1k4NSsZyzm.png)

[Список процессов](/ru/scripting/examples/advanced/memory/get-processes) объясняет `Id`, выбор экземпляра и отличие записи списка от открытого читателя. Для встроенного SDK-хоста регистрация `UseMemory()`/`EnsureReadyAsync()` — отдельная подготовка хоста.

Следующие выражения — **альтернативы перечисления для уже настроенного MPFS/LeechCore**, не дополнение к локальной программе чтения. Требуются совместимые сборки `EyeAuras.Memory.MPFS`, нативные библиотеки и соответствующее устройство или драйвер. [LeechCore](https://github.com/ufrisk/LeechCore), [его руководство](https://github.com/ufrisk/LeechCore/wiki) и [контракт LCProcess](/ru/scripting/memory-api/backends/lc-process) описывают источник; библиотеку разработал [Ulf Frisk](https://github.com/ufrisk).

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
| `WinPMEM()` / `Custom("-device", "pmem")` | Доступная локальная память через настроенный WinPMEM. `-printf`, `-v` добавляют диагностический вывод. |
| `FPGA()` | Совместимое DMA-устройство. Список относится к системе, память которой оно предоставляет, а не автоматически к локальному EyeAuras. |
| `HyperV().UseVirtualMachineByIndex(0)` | Гостевая система с явно выбранным индексом; 0 нужно заменить своим значением. |

`GetProcesses()` возвращает снимок и освобождает временный VMM. Для открытого читателя нужны отдельные `ByProcessId`/`ByProcessName` и его область жизни. Простая замена `LocalProcess` на `LCProcess` не подготавливает нативное окружение.

</details>
