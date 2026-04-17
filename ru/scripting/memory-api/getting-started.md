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

То есть вы меняете backend, а большая часть инструментов остаётся прежней.

## Какие backend'ы уже есть

- `LocalProcess` — обычный локальный процесс через WinAPI. Это нормальная первая точка входа. С защищёнными процессами он не подходит. Подробнее: [LocalProcess](/ru/scripting/memory-api/backends/local-process).
- `NativeLocalProcess` — тот же локальный сценарий, но поверх handle, который вы уже получили своим способом.
- `LCProcess` — backend через MemProcFS и LeechCore. Основной сценарий здесь это `DMA`, обычно через `FPGA`. Подробнее: [LCProcess](/ru/scripting/memory-api/backends/lc-process). По теме полезны [Ulf Frisk](https://github.com/ufrisk), [LeechCore](https://github.com/ufrisk/LeechCore), [MemProcFS](https://github.com/ufrisk/MemProcFS) и [PCILeech](https://github.com/ufrisk/pcileech).
- `KDProcess` — backend через kernel driver. Нужен там, где обычного WinAPI уже мало.

> `KernelDriver` сейчас в закрытом бета-тесте. Если вы автор пака и вам нужен доступ, напишите мне отдельно. `FPGA` и `DMA` сценарии уже доступны всем желающим.
{.is-warning}

> Если у вас свой драйвер или свой способ чтения памяти, его тоже можно встроить в Memory API. Для этого есть отдельные точки расширения: [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process) и [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends).
{.is-info}

## Куда читать дальше по backend'ам и расширению

Если вам нужна не только базовая работа с `LocalProcess`, а более конкретный сценарий, удобнее всего идти так:

- для обычного локального чтения и user-mode контроля: [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- для `DMA`, `MemProcFS` и `LeechCore`: [LCProcess](/ru/scripting/memory-api/backends/lc-process)
- если хотите подключить свой драйвер, bridge или внешний reader как полноценный процесс: [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
- если хотите оборачивать уже существующий backend в кэш, логирование, статистику или другие decorator-слои: [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends)

## Что значит `IProcess`

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

Самый безопасный стартовый сценарий это открыть текущий процесс EyeAuras, взять модуль и прочитать его экспорты.

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var kernel32 = process.MemoryOfModule("kernel32.dll");

Log.Info($"Process: {process.ProcessName} ({process.ProcessId})");
Log.Info($"Modules: {process.GetProcessModules().Count}");
Log.Info($"kernel32 exports: {kernel32.ReadExports().Count}");
```

Этот пример хорош тем, что в нём уже есть вся базовая модель: процесс, модуль и работа не с "магическим адресом", а с нормальным окном на память модуля.

## Базовый маршрут

Обычно работа выглядит так:

1. открыть процесс
2. выбрать нужный модуль
3. ограничить память через `MemoryOfModule(...)`
4. найти опорную точку через export, import или сигнатуру
5. уже потом читать структуры и указатели

Если хотите лучше понять, почему так надёжнее, чем просто хранить один жёсткий адрес, очень помогают [Game Fundamentals](https://gamehacking.academy/pages/1/02/), [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/) и [Pattern Scanner](https://gamehacking.academy/pages/7/02/).

## Что доступно всегда, а что нет

Здесь есть простое правило:

- чтение памяти доступно почти всегда
- активный контроль процесса зависит от backend'а

Почти любой backend хорошо покрывает:

- чтение памяти
- модули, потоки и регионы
- `MemoryOfModule(...)`
- импорты, экспорты и сигнатуры

А вот вещи вроде заморозки процесса, выделения памяти, смены protection, `DLL inject`, `APC`, `remote thread` или `manual mapping` доступны не везде.

- `LocalProcess` и `NativeLocalProcess` подходят и для чтения, и для обычного user-mode контроля процесса.
- `LCProcess` в первую очередь про внешнее чтение и анализ памяти. Для активного управления процессом он обычно не используется.
- `KDProcess` нужен там, где нужен более глубокий контроль и обычный WinAPI уже не справляется.

## Выделение, `ProtectMemory(...)` и `FreeMemory(...)`

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

Простейший маршрут выглядит так:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
var control = (IProcessControlApi) process;

var region = control.AllocateMemory(
    IntPtr.Zero,
    4096,
    MemoryAllocationType.Commit | MemoryAllocationType.Reserve,
    MemoryProtectionType.ReadWrite);

try
{
    var oldProtection = control.ProtectMemory(
        region.Address,
        region.Size,
        MemoryProtectionType.ExecuteRead);

    // Здесь можно писать данные, делать patching или готовить payload.

    control.ProtectMemory(region.Address, region.Size, oldProtection);
}
finally
{
    control.FreeMemory(region);
}
```

Важно помнить:

- `ProtectMemory(...)` и `FreeMemory(...)` относятся к активному управлению процессом, а не просто к чтению памяти
- обычно это имеет смысл с `LocalProcess`, `NativeLocalProcess` и `KDProcess`
- не каждый backend обязан это поддерживать; если не поддерживает, можно получить `NotSupportedException`

## Зачем нужен `DLL inject`

Пока вы читаете память снаружи, вы в основном наблюдаете за процессом. `DLL inject` нужен, когда код должен выполняться уже внутри целевой программы: вызывать её внутренние функции, ставить хуки, делать `code cave`, строить internal-логику. Отдельная статья с разбором вариантов, `manual mapping` и особенностей запуска здесь: [DLL inject](/ru/scripting/memory-api/dll-inject). Если нужен внешний фон, полезны [DLL Memory Hack](https://gamehacking.academy/pages/3/03/), [DLL Injector](https://gamehacking.academy/pages/7/01/), [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/) и [Triggerbot](https://gamehacking.academy/pages/5/05/).

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
