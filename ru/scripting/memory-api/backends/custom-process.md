---
title: Кастомный IProcess
description: Как подключить свой драйвер или свой способ чтения памяти к Memory API
published: true
date: 2026-04-16T16:20:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:20:00.000Z
---

# Как сделать кастомный `IProcess`

Если у вас уже есть свой драйвер, bridge или другой способ читать память, почти никогда не нужно писать "ещё один Memory API". Обычно достаточно собрать два слоя:

1. `IMemoryBackend` для raw `read/write`
2. `IProcess`, который описывает процесс и отдаёт `Memory`

После этого поверх вашего backend'а сразу начинают работать типизированное чтение, `MemoryOfModule(...)`, импорты, экспорты, сигнатуры и `code cave`.

## На что ориентироваться в коде

- `NativeLocalProcess` — хороший пример process-wrapper поверх уже готового backend'а
- `LCProcess` — хороший ориентир для backend'а, который в основном про чтение и анализ
- `KDProcess` — пример backend'а с более глубоким control API

## Минимальная схема

`IMemoryBackend` остаётся очень маленьким:

```csharp
public interface IMemoryBackend : IDisposable, IMemorySpan
{
    bool IsValid { get; }
    bool TryReadMemory(IntPtr address, Span<byte> target);
    bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source);
}
```

Чаще всего именно сюда ложится ваш вызов драйвера, `IOCTL`, RPC или bridge к DMA.

Сверху вы делаете `IProcess` и сразу отдаёте `MemoryAccessor`:

```csharp
public sealed class MyDriverProcess : DisposableReactiveObject, IProcess
{
    public MyDriverProcess(MyDriverClient driver, int processId, string? processName = null)
    {
        ProcessId = processId;
        ProcessName = processName;

        var memoryBackend = new MyDriverMemoryBackend(driver, processId).AddTo(Anchors);
        Memory = new MemoryAccessor(Log, memoryBackend).AddTo(Anchors);
    }

    public string? ProcessName { get; }
    public int ProcessId { get; }
    public IProcessMemory Memory { get; }

    public IReadOnlyList<ProcessModuleInformation> GetProcessModules() => driver.GetModules(ProcessId);
    public IReadOnlyList<ProcessThreadInformation> GetThreads() => driver.GetThreads(ProcessId);
    public MemoryBasicInformation VirtualQuery(IntPtr address) => driver.VirtualQuery(ProcessId, address);
    public IReadOnlyList<MemoryBasicInformation> GetMemoryRegions() => driver.GetMemoryRegions(ProcessId);
}
```

Ключевая строка здесь одна:

```csharp
Memory = new MemoryAccessor(Log, memoryBackend);
```

Именно она подключает весь верхний слой EyeAuras.

## Что стоит реализовать сразу

Если хотите, чтобы интеграция была действительно удобной, не ограничивайтесь одним `TryReadMemory(...)`. Практический минимум такой:

- `Memory`
- `GetProcessModules()`
- `GetThreads()`
- `VirtualQuery(...)`
- `GetMemoryRegions()`

Без модулей вы теряете нормальный `MemoryOfModule(...)`. Без регионов и `VirtualQuery(...)` хуже живёт анализ памяти.

## Что можно добавить потом

Если ваш драйвер умеет больше, поверх `IProcess` можно объявить и дополнительные capability-интерфейсы:

- `IProcessControlApi` — suspend, allocate, protect, `remote thread`
- `IProcessSupportsManualMapping`
- `IProcessSupportsUserApc`

То есть базовый путь такой:

1. сначала сделать стабильное чтение и описание процесса
2. потом добавить control API
3. только потом идти в `DLL inject` и `manual mapping`

## Частые ошибки

- Пытаться реализовать PE-парсинг, сигнатуры и строки прямо внутри драйверного класса.
- Не отдавать модули и карту памяти, ограничиваясь только raw read/write.
- Смешивать low-level backend и process-wrapper в один большой класс.
- Сразу начинать с инжекта, не проверив обычное чтение, модули и сигнатуры.

Если у игры нестандартный layout структур, это обычно решается не новым backend'ом, а отдельным mapper'ом поверх уже готового `IProcess`.

## Что читать дальше

- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
