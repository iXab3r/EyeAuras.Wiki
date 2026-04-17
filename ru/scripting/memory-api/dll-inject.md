---
title: DLL inject
description: Практика DLL injection через Memory API и manual mapping
published: true
date: 2026-04-16T23:20:00.000Z
tags: c#, scripting, memory, reverse-engineering, dll-inject, manual-mapping, ai-translated
editor: markdown
dateCreated: 2026-04-16T23:20:00.000Z
---

# DLL inject в Memory API

`DLL inject` нужен, когда код должен выполняться уже внутри target-процесса. Обычно это нужно для hook'ов, internal-логики, вызова внутренних функций и сценариев, где внешний reader уже неудобен.

Если нужен внешний фон, полезны [DLL Injector](https://gamehacking.academy/pages/7/01/), [DLL Memory Hack](https://gamehacking.academy/pages/3/03/) и [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/).

Ниже примеры даны для `LocalProcess`, потому что это самый прямой старт. Те же методы есть и у `NativeLocalProcess`. `LCProcess` для inject-сценариев обычно не берут.

## InjectDll

Это самый простой маршрут.

```csharp
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");
process.InjectDll(@"C:\Tools\MyHack.dll");
```

Внутри Memory API этот вызов делает классический `LoadLibraryW`-инжект:

1. проверяет, что DLL существует
2. сверяет архитектуру DLL и target-процесса
3. находит `LoadLibraryW` в target-процессе
4. выделяет память под UTF-16 путь к DLL
5. пишет туда строку
6. создаёт remote thread

Уникальные черты этого пути:

- DLL должна лежать на диске
- Windows loader сам обрабатывает импорты, `DllMain` и `TLS callbacks`
- это самый понятный путь для старта и отладки

Именно поэтому `InjectDll(...)` почти всегда должен быть первым выбором, если вам просто нужно загрузить библиотеку и проверить гипотезу.

Что важно помнить:

- используйте полный путь к DLL
- архитектура должна совпадать
- защищённые процессы и ограничения прав могут сломать сценарий ещё до самого `LoadLibraryW`

## CreateThread

Если `InjectDll(...)` это готовый high-level helper, то `CreateThread(...)` это уже более низкоуровневый строительный блок.

Memory API даёт его через `IProcessControlApi`:

```csharp
var threadId = process.CreateThread(startAddress, parameter);
```

Это полезно, когда вы уже сами подготовили всё остальное:

- нашли адрес функции внутри target-процесса
- выделили память под аргументы
- записали туда данные
- хотите просто запустить код внутри процесса

На практике это часто выглядит так:

```csharp
using System.Linq;
using System.Text;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

var dllPath = @"C:\Tools\MyHack.dll";
var dllPathBytes = Encoding.Unicode.GetBytes(dllPath + "\0");

var remotePath = process.AllocateMemory(
    dllPathBytes.Length,
    MemoryProtectionType.ReadWrite);

process.Memory.Write(remotePath.Address, dllPathBytes);

using var kernel32 = process.MemoryOfModule("kernel32.dll");
var loadLibraryWExport = kernel32.ReadExports()
    .First(x => x.ExportName == "LoadLibraryW");
var loadLibraryW = new IntPtr(kernel32.BaseAddress + (long) loadLibraryWExport.RVA);

var threadId = process.CreateThread(loadLibraryW, remotePath.Address);
```

По сути это уже "ручной" вариант того, что делает `InjectDll(...)`, только без готовой обёртки.

Уникальные черты этого пути:

- вы сами контролируете `startAddress` и `parameter`
- можно вызывать не только `LoadLibraryW`, но и любую другую подходящую функцию
- это базовый кирпич для более сложных сценариев

## APC

Если нужен запуск через `APC`, в Memory API для этого есть `QueueUserApc(...)`.

Практический пример: положить путь к DLL в remote memory, найти `LoadLibraryW` и поставить его в очередь существующему потоку.

```csharp
using System.Linq;
using System.Text;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

var dllPath = @"C:\Tools\MyHack.dll";
var dllPathBytes = Encoding.Unicode.GetBytes(dllPath + "\0");

var remotePath = process.AllocateMemory(
    IntPtr.Zero,
    dllPathBytes.Length,
    MemoryAllocationType.Commit | MemoryAllocationType.Reserve,
    MemoryProtectionType.ReadWrite);

process.Memory.Write(remotePath.Address, dllPathBytes);

using var kernel32 = process.MemoryOfModule("kernel32.dll");
var loadLibraryWExport = kernel32.ReadExports()
    .First(x => x.ExportName == "LoadLibraryW");
var loadLibraryW = new IntPtr(kernel32.BaseAddress + (long) loadLibraryWExport.RVA);

var threadId = process.GetThreads().First().ThreadId;
process.QueueUserApc(threadId, loadLibraryW, remotePath.Address);
```

Это уже полностью memory-api-шный маршрут:

- `AllocateMemory(...)`
- `process.Memory.Write(...)`
- `MemoryOfModule(...)`
- `ReadExports()`
- `QueueUserApc(...)`

Уникальные черты этого пути:

- код ставится в очередь **существующему** потоку
- новый thread для запуска не создаётся
- сценарий сильно зависит от того, как ведёт себя выбранный поток

Главная особенность APC:

- вызов выполнится только тогда, когда поток войдёт в `alertable wait`

Из этого следуют и практические последствия:

- `APC` нельзя считать "мгновенным запуском"
- строку с путём к DLL нельзя освобождать раньше времени
- выбирать поток "наугад" часто плохая идея

Этот маршрут нужен не для старта, а для случаев, когда вам действительно нужен запуск через уже существующий поток.

## Manual mapping

Если `LoadLibraryW` вам не подходит, в Memory API есть `InjectDllViaManualMapping(...)`.

### Маппинг из файла

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessName("game");

var mapping = process.InjectDllViaManualMapping(
    @"C:\Tools\MyHack.dll",
    LocalProcessMmapFlags.None);

Log.Info($"Base={mapping.BaseAddress.ToHexadecimal()}");
Log.Info($"EntryPoint={mapping.EntryPoint.ToHexadecimal()}");
```

### Маппинг из памяти

```csharp
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

var dllBytes = File.ReadAllBytes(@"C:\Tools\MyHack.dll");
var mapping = process.InjectDllViaManualMapping(dllBytes);
```

Уникальные черты этого пути:

- DLL можно загрузить не только с диска, но и из `byte[]`
- маршрут полностью контролируется mapper'ом
- после загрузки вы получаете `BaseAddress` и `EntryPoint`

То есть это уже не "попросить Windows загрузить DLL", а отдельный loader-путь поверх Memory API.

### Что возвращается

`InjectDllViaManualMapping(...)` возвращает `ManualMappedLibraryDescriptor`:

- `BaseAddress`
- `EntryPoint`

Это полезно в advanced-сценариях, где вы хотите не просто загрузить DLL, а ещё и отдельно управлять её стартом или опираться на её базовый адрес.

### Флаги mapper'а

- `LocalProcessMmapFlags.None` — обычный маршрут
- `LocalProcessMmapFlags.DiscardHeaders` — удалить PE-заголовки после маппинга
- `LocalProcessMmapFlags.SkipInitRoutines` — не вызывать `DllMain` и `TLS callbacks`

Практический смысл флагов такой:

- `None` — нормальный дефолт
- `DiscardHeaders` — уже более узкий сценарий
- `SkipInitRoutines` — advanced-режим, потому что библиотека может оказаться загруженной, но не инициализированной

Если включать `SkipInitRoutines`, то дальше вы уже сами отвечаете за запуск init-логики. В тестах EyeAuras для этого используются отдельные trampoline и явный вызов entrypoint через thread или APC.

## PIC

`PIC` это `position-independent code`, то есть код, который может выполняться не по фиксированному адресу, а из произвольного места в памяти.

В практическом RE-мире это обычно:

- shellcode
- маленький bootstrap stub
- trampoline
- self-contained payload, который сначала что-то подготавливает, а потом уже вызывает нужную функцию

Это уже самый продвинутый путь в этой статье, потому что здесь вы загружаете не DLL через loader и не готовую Windows API-функцию, а свой собственный исполняемый код.

Практически это обычно выглядит так:

```csharp
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessName("game");

byte[] picBytes = GetPicPayloadSomehow();

var remotePic = process.AllocateMemory(
    picBytes.Length,
    MemoryProtectionType.ReadWrite);

process.Memory.Write(remotePic.Address, picBytes);
process.ProtectMemory(remotePic.Address, picBytes.Length, MemoryProtectionType.ExecuteRead);

var threadId = process.CreateThread(remotePic.Address, IntPtr.Zero);
```

Здесь Memory API даёт вам базовые кирпичи:

- `AllocateMemory(...)`
- `process.Memory.Write(...)`
- `ProtectMemory(...)`
- `CreateThread(...)`

А вся ответственность за сам payload уже на вас:

- код должен быть реально position-independent
- адрес входа должен быть корректным
- calling convention и аргументы должны совпадать
- страница должна быть executable

Именно поэтому `PIC` лучше воспринимать не как "ещё один inject-метод", а как отдельный advanced-сценарий запуска своего кода внутри процесса.

## На практике

Если нет специальной причины делать иначе:

1. начните с `InjectDll(...)`
2. если нужен более сырой контроль над стартом кода, используйте `CreateThread(...)`
3. если нужен запуск через существующий поток, идите в `QueueUserApc(...)`
4. если нужен свой loader-путь или DLL из памяти, берите `InjectDllViaManualMapping(...)`
5. если вы уже дошли до shellcode и bootstrap payload'ов, тогда имеет смысл идти в `PIC`

## О чём легко забыть

- `x86` и `x64` смешивать нельзя
- `InjectDll(...)` любит полный и валидный путь на диске
- `CreateThread(...)` требует, чтобы `startAddress` реально указывал на исполняемый код внутри target-процесса
- `QueueUserApc(...)` требует корректного потока и корректного момента выполнения
- `manual mapping` не делает DLL автоматически совместимой с любым случаем
- `PIC` требует максимальной аккуратности, потому что здесь уже почти нет "страховочных" слоёв loader'а
- чем ниже уровень маршрута, тем больше ответственности вы берёте на себя

## Что читать дальше

- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [Memory basics](/ru/scripting/memory-api/memory-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [LCProcess](/ru/scripting/memory-api/backends/lc-process)
