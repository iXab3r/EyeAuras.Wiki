---
title: Кастомный IProcess
description: Как подключить свой драйвер или свой способ чтения памяти к Memory API
published: true
date: 2026-04-16T16:20:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:20:00.000Z
---

# Как сделать кастомный IProcess

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

Сверху реализация `IProcess` связывает транспорт с контекстом процесса. Входы интеграции — уже открытый клиент транспорта, PID в его адресном пространстве, сведения о модулях/потоках/регионах и явный владелец подключения. Универсального `MyDriverClient` в SDK нет: эти операции должен дать ваш транспорт.

Полный минимальный контракт сборки такой:

1. `IMemoryBackend` отдаёт `BaseAddress` (`long`), `MemorySize` (`int`), `IsValid` и raw-чтение/запись по абсолютному адресу. `true` означает успешную операцию; интерфейс не сообщает число переданных байт и не принимает токен отмены. Не скрывайте частичное чтение как полное.
2. Создайте `new MemoryAccessor(log, backend)` и верните его как `IProcessMemory Memory`. Типизированное чтение, строки и PE-helper'ы работают через этот accessor, их не нужно реализовывать в драйвере.
3. `IProcess` также предоставляет `IFluentLog Log`, `bool IsValid`, `string? ProcessName`, `int ProcessId`, `GetProcessModules()`, `GetThreads()`, `VirtualQuery(IntPtr)` и `GetMemoryRegions()`. Модули возвращают реальные базы/размеры цели, без них `MemoryOfModule` не сможет выбрать диапазон.
4. Владелец останавливает потребителей и освобождает accessor, backend и транспорт согласно выбранному владению. Конструктор `MemoryAccessor` не привязывает backend к своему `Dispose`; нельзя считать одну эту строку полной реализацией lifetime.

Результат — объект, который можно передать обычному коду без знания транспорта:

```csharp
static int ReadValue(EyeAuras.Memory.IProcess process, long absoluteAddress)
{
    return process.Memory.Read<int>(absoluteAddress);
}
```

Метод возвращает `int` или передаёт ошибку чтения вызывающему коду. Он заимствует процесс, не закрывает его и не доказывает работоспособность транспорта. Контракты сверены с EyeAuras `20fd3d4`; подключение конкретного драйвера остаётся входом интеграции.

## Ещё один вариант - DLL внутри процесса и IPC

Не каждый кастомный `IProcess` обязан читать память снаружи. Ещё один рабочий вариант - загрузить свою `DLL` внутрь процесса, поднять там транспорт и дальше общаться с ней по `named pipe`, `shared memory` или другому `IPC`.

В такой схеме внешний код обычно больше не ходит в память напрямую. Вместо этого он отправляет запрос агенту внутри процесса:

- прочитать диапазон памяти
- записать диапазон памяти
- вернуть список модулей
- вернуть список потоков
- вернуть карту памяти

Снаружи это всё равно обычно выглядит как тот же самый стек:

1. transport client
2. `IMemoryBackend` поверх транспорта
3. `IProcess` поверх backend'а

То есть верхний слой `Memory API` почти не меняется. Меняется только то, откуда реально берутся данные.

Такой подход полезен, если вам нужно:

- выполнять часть логики прямо внутри процесса
- читать данные, которые удобнее собирать internal-кодом
- поверх raw memory сразу отдавать более высокий уровень, например готовые структуры игры

У такого варианта есть и цена:

- сначала нужно как-то доставить `DLL` внутрь процесса
- протокол, сериализация и versioning транспорта теперь на вас
- падение агента может уронить целевой процесс
- с точки зрения защиты это уже другой класс техники, не просто external read


Если вас интересует именно доставка `DLL` внутрь процесса, дальше стоит читать [DLL inject](/ru/scripting/memory-api/dll-inject).

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
- [DLL inject](/ru/scripting/memory-api/dll-inject)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
