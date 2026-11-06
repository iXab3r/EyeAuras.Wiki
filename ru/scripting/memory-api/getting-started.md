---
title: Memory API - С чего начать
description: Первое знакомство с Memory API в скриптах EyeAuras
published: true
date: 2026-04-16T00:26:32.678Z
tags: c#, scripting, memory, reverse-engineering, ai-translated
editor: markdown
dateCreated: 2026-04-16T00:26:32.678Z
---

# Memory API в скриптах EyeAuras

Memory API нужен, когда вы хотите читать не экран, а реальные данные из памяти процесса: `entity list`, структуры игрока, координаты, HP, target id, `view matrix` и похожие вещи. Если нужен быстрый игровой контекст, посмотрите [Aimbot](https://gamehacking.academy/pages/5/06/) и [ESP](https://gamehacking.academy/pages/5/09/) у Game Hacking Academy.

Главная идея EyeAuras не в том, что это "ещё один reader памяти". Главное здесь в том, что поверх разных способов доступа к памяти лежит один и тот же верхний слой:

- типизированное чтение и запись
- строки, структуры и pointer math
- `MemoryOfModule(...)`
- `ReadImports()` и `ReadExports()`
- `pattern scanning`
- `code caves`

То есть верхний слой можно сохранить при смене backend, если новый backend поддерживает нужные операции.

## Какие backend'ы уже есть

- `LocalProcess` — обычный локальный процесс через WinAPI. Это нормальная первая точка входа. С защищёнными процессами он не подходит. Подробнее: [LocalProcess](/ru/scripting/memory-api/backends/local-process).
- `NativeLocalProcess` — тот же локальный сценарий, но поверх handle, который вы уже получили своим способом.
- `LCProcess` — backend через MemProcFS и LeechCore. Основной сценарий здесь это `DMA`, обычно через `FPGA`. Подробнее: [LCProcess](/ru/scripting/memory-api/backends/lc-process). По теме полезны [Ulf Frisk](https://github.com/ufrisk), [LeechCore](https://github.com/ufrisk/LeechCore), [MemProcFS](https://github.com/ufrisk/MemProcFS) и [PCILeech](https://github.com/ufrisk/pcileech).
- `KDProcess` — backend через kernel driver. Нужен там, где обычного WinAPI уже мало.

> В исходной версии руководства KD описан как закрытая бета, а FPGA/DMA — как доступные варианты. Это историческая информация, а не проверка доступности в вашей сборке. Для KD/LC нужны соответствующие компоненты и подготовленный хост.
{.is-warning}

> Если у вас свой драйвер или свой способ чтения памяти, его тоже можно встроить в Memory API. Для этого есть отдельные точки расширения: [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process) и [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends).
{.is-info}

## Куда читать дальше по backend'ам и расширению

Если вам нужна не только базовая работа с `LocalProcess`, а более конкретный сценарий, удобнее всего идти так:

- для обычного локального чтения и user-mode контроля: [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- для `DMA`, `MemProcFS` и `LeechCore`: [LCProcess](/ru/scripting/memory-api/backends/lc-process)
- если хотите подключить свой драйвер, bridge или внешний reader как полноценный процесс: [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
- если хотите оборачивать уже существующий backend в кэш, логирование, статистику или другие decorator-слои: [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends)

## Что значит IProcess

Если коротко, `interface` в C# здесь означает не "сложную внутренность", а просто контракт.

- `IProcess` — объект, который представляет процесс
- `IProcessMemory` — объект, через который вы работаете с памятью процесса

Если вы читаете эту страницу именно как автор интеграции, дальше обычно полезно смотреть две статьи:

- [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process) — если хотите подключить новый источник памяти как полноценный process-wrapper
- [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends) — если хотите добавить кэширование, логирование, статистику или другой низкоуровневый слой поверх уже существующего backend'а

Для старта достаточно помнить простую связку:

- `LocalProcess` открывает процесс
- `process.Memory` даёт доступ к памяти

## Первый пример

Примеры с `LocalProcess` рассчитаны на верхний уровень C#-скрипта в запущенном EyeAuras с загруженным модулем памяти. `Log` даёт хост скрипта. В обычном C#-классе передайте логгер и процесс явно. Одна ссылка на SDK не запускает модуль: во встраиваемом хосте сначала нужны запуск приложения, `UseMemory()` и ожидание `EnsureReadyAsync()`; подробнее в [Embedded SDK](/ru/scripting/api/nuget/embedded-sdk).

`LocalProcess.ByProcessId(...)` возвращает новый `ILocalProcess`, который освобождает создавший его код. `process.Memory` используется вместе с этим reader'ом; отдельно закрывать заимствованный сервис хоста не нужно. Эти примеры не проверяют доступность нативных компонентов вашей сборки.

Самый безопасный стартовый сценарий это открыть текущий процесс EyeAuras, взять модуль и прочитать его экспорты.

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    using var kernel32 = process.MemoryOfModule("kernel32.dll");

    Log.Info($"Process: {process.ProcessName} ({process.ProcessId})");
    Log.Info($"Modules: {process.GetProcessModules().Count}");
    Log.Info($"kernel32 exports: {kernel32.ReadExports().Count}");
}
```

В журнале появятся имя и PID текущего процесса, число модулей и экспортов `kernel32.dll`. `MemoryOfModule` задаёт базу и размер модуля для PE-helper'ов и поиска; это не защита от чтения за его границами. Адреса прямого чтения остаются абсолютными. Процесс должен жить дольше представления модуля.

## Базовый маршрут

Обычно работа выглядит так:

1. открыть процесс
2. выбрать нужный модуль
3. ограничить память через `MemoryOfModule(...)`
4. найти опорную точку через export, import или сигнатуру
5. уже потом читать структуры и указатели

Если хотите лучше понять, почему так надёжнее, чем просто хранить один жёсткий адрес, очень помогают [Game Fundamentals](https://gamehacking.academy/pages/1/02/), [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/) и [Pattern Scanner](https://gamehacking.academy/pages/7/02/).

## Что доступно всегда, а что нет

`IProcess` описывает общий доступ к памяти, модулям, потокам и регионам. Фактическая доступность зависит от backend, прав и состояния целевого процесса. Наличие интерфейса не гарантирует успешное чтение любого адреса.

Выделение памяти, смена защиты, запуск кода и загрузка DLL относятся к отдельным возможностям. `ILocalProcess` объединяет `IProcessControlApi`, `IProcessSupportsManualMapping` и `IProcessSupportsUserApc`; это не обещание тех же возможностей у произвольного `IProcess`. Для KD/LC сверяйте контракт своей версии backend.

## Выделение, защита и освобождение памяти

В свежих версиях у `IProcessControlApi` появились явные методы для полного цикла работы с выделенным регионом:

- `AllocateMemory(...)` выделяет память и возвращает `IMemoryRegion`
- `IMemoryRegion` хранит `Address` и `Size`
- `ProtectMemory(...)` меняет protection и возвращает предыдущее значение
- `FreeMemory(...)` явно освобождает ранее выделенный регион

Это удобно в сценариях, где нужно:

- подготовить буфер внутри процесса
- временно открыть страницу под patching или shellcode
- потом вернуть protection назад
- в конце корректно освободить память

Давайте запишем число в собственный временный буфер текущего процесса, прочитаем его и вернём защиту перед освобождением. Это верхний уровень скрипта EyeAuras с загруженным модулем памяти; входных адресов здесь нет.

```csharp
using System;
using System.Diagnostics;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    IProcessControlApi control = process;
    var region = control.AllocateMemory(
        IntPtr.Zero, 4096,
        MemoryAllocationType.Commit | MemoryAllocationType.Reserve,
        MemoryProtectionType.ReadWrite);
    try
    {
        process.Memory.Write<int>(region.Address, 742);
        var oldProtection = control.ProtectMemory(
            region.Address, region.Size, MemoryProtectionType.ReadOnly);
        try
        {
            Log.Info($"Value={process.Memory.Read<int>(region.Address)}");
        }
        finally
        {
            control.ProtectMemory(region.Address, region.Size, oldProtection);
        }
    }
    finally
    {
        control.FreeMemory(region);
    }
}
```

Результат — `Value=742` в журнале. Запись сделана до включения `ReadOnly`. `ProtectMemory` возвращает прежнюю защиту, `FreeMemory` освобождает выделенный регион целиком. Сам `IMemoryRegion` — дескриптор с `Address` и `Size`, а не автоматический владелец памяти. Reader освобождается после буфера. У этих синхронных методов нет параметра отмены; другой backend может не поддерживать управление памятью.

## Зачем нужен DLL inject

Пока вы читаете память снаружи, вы в основном наблюдаете за процессом. `DLL inject` нужен, когда код должен выполняться уже внутри целевой программы: вызывать её внутренние функции, ставить хуки, делать `code cave`, строить internal-логику. Отдельная статья с разбором вариантов, `manual mapping` и особенностей запуска здесь: [DLL inject](/ru/scripting/memory-api/dll-inject). Если нужен внешний фон, полезны [DLL Memory Hack](https://gamehacking.academy/pages/3/03/), [DLL Injector](https://gamehacking.academy/pages/7/01/), [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/) и [Triggerbot](https://gamehacking.academy/pages/5/05/).

Контракты на этой странице сверены по EyeAuras `20fd3d4`; это чтение исходников, без запуска примеров. Полные сигнатуры и ограничения своей версии проверяйте по [карте API памяти](/ru/scripting/api/memory) и SDK/XML reference.

## Что читать дальше

- [Memory basics](/ru/scripting/memory-api/memory-basics)
- [C# Struct Layout](/ru/scripting/memory-api/csharp-structures)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [DLL inject](/ru/scripting/memory-api/dll-inject)
- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [LCProcess](/ru/scripting/memory-api/backends/lc-process)
- [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
- [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends)
- [Получение списка запущенных процессов](/ru/scripting/examples/advanced/memory/get-processes)
- [Чтение экспортов модулей](/ru/scripting/examples/advanced/memory/read-exports)
- [Сканирование паттернов](/ru/scripting/api/pattern-scanning)
- [API памяти](/ru/scripting/api/memory)

В native local backend среза `c8b2304` выделение вызывает `VirtualAllocEx`, освобождение — `VirtualFreeEx` с нулевым размером и `MEM_RELEASE`. Передавайте исходную базу выделения, а не адрес внутри него. Дескриптор хранит запрошенный размер, а не округлённый ОС объём выделения. Защита следует страничным правилам Windows и возвращает прежнее значение через backend. Освобождение process-wrapper не заменяет явного освобождения созданных вами регионов.

[Контракт NativeLocalProcess](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Memory/NativeLocalProcess.cs)
