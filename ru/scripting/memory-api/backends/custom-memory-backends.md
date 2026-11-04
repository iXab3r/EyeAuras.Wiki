---
title: Кастомные memory backend
description: Как строить цепочки IMemoryBackend и добавлять поверх них кэширование, трекинг и другие возможности
published: true
date: 2026-04-16T16:45:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, backend, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:45:00.000Z
---

# Кастомные IMemoryBackend и их цепочки

`IMemoryBackend` в EyeAuras маленький, и это хорошо: его удобно использовать не только как "финальный reader", но и как слой-декоратор. Поэтому поверх одного backend'а легко навесить статистику, логирование, кэширование или временную трассировку.

Вместо такой схемы:

```text
MemoryAccessor -> DriverBackend
```

можно собрать такую:

```text
MemoryAccessor -> CacheBackend -> StatsBackend -> LoggingBackend -> DriverBackend
```

## Временно поставить декоратор над существующей памятью

Если `process` уже принадлежит хосту, передайте его в обычный метод. Сначала остановите параллельные чтения: замена backend не является синхронизированной транзакцией.

```csharp
static int ReadThroughDecorator(EyeAuras.Memory.IProcess process, long address)
{
    var original = process.Memory.Backend;
    using var tracing = new MyTracingBackend(original);
    process.Memory.UseMemoryBackend(tracing);
    try
    {
        return process.Memory.Read<int>(address);
    }
    finally
    {
        process.Memory.UseMemoryBackend(original);
    }
}
```

Полный класс `MyTracingBackend` ниже пока просто перенаправляет вызовы, поэтому результат совпадает с обычным чтением `int`. Добавлять сбор статистики можно в его raw-методы. Он **заимствует** `inner`, а не освобождает чужой reader.

В EyeAuras `20fd3d4` `UseMemoryBackend(IMemoryBackend)` только меняет ссылку. Он не освобождает старый backend и не принимает новый во владение; сам `MemoryAccessor.Dispose()` также не закрывает backend. Восстанавливайте ссылку до освобождения временного декоратора. Представление от `MemoryOfModule` обращается к исходной памяти и увидит подмену, но это не обещание для любого независимо созданного accessor. Адреса raw-вызовов остаются абсолютными; `BaseAddress` не прибавляется автоматически.

## Две важные точки API

У `IProcessMemory` есть всё, что нужно для такой подмены:

```csharp
var currentBackend = process.Memory.Backend;
process.Memory.UseMemoryBackend(new MyTracingBackend(currentBackend));
```

После этого новый low-level слой начинает использоваться и для обычного чтения, и для `MemoryOfModule(...)`, и для `ReadExports()`, `ReadImports()`, сигнатур и `code cave`.

## Минимальный decorator backend

```csharp
using System;
using EyeAuras.Memory;

internal sealed class MyTracingBackend : IMemoryBackend
{
    private readonly IMemoryBackend inner;

    public MyTracingBackend(IMemoryBackend inner) => this.inner = inner;

    public bool IsValid => inner.IsValid;
    public long BaseAddress => inner.BaseAddress;
    public int MemorySize => inner.MemorySize;

    public bool TryReadMemory(IntPtr address, Span<byte> target)
    {
        return inner.TryReadMemory(address, target);
    }

    public bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source)
    {
        return inner.TryWriteMemory(address, source);
    }

    // В этом варианте inner принадлежит вызывающему коду.
    public void Dispose() { }
}
```

Это базовый шаблон. Дальше вы добавляете свой код до или после вызова `inner`.

## Самые полезные сценарии

- статистика — сколько чтений, записей и байт реально проходит через backend
- suspicious logging — быстро ловить `null`, near-null, мусорные и подозрительные адреса
- page cache — уменьшать число дорогих чтений у драйвера, DMA или удалённого bridge

Именно такие backend'ы уже были в `ScriptShock.MemoryApi`: `StatsMemoryBackend`, `SuspiciousAddressLoggingBackend`, `PageCachingMemoryBackend`, `CompositeMemoryBackend`. Это исторические примеры, не обещание наличия этих классов в базовом SDK.

## Порядок слоёв важен

Эти две цепочки отвечают на разные вопросы:

```text
Stats -> Cache -> Driver
Cache -> Stats -> Driver
```

В первом случае статистика видит итоговую пользовательскую картину. Во втором — только реальные обращения, которые дошли до драйвера. Обычно ближе к драйверу кладут то, что должно видеть физические обращения, а ближе к `MemoryAccessor` то, что должно видеть финальное поведение.

## О чём легко забыть

- Не меняйте семантику `TryReadMemory(...)` и `TryWriteMemory(...)` без явной причины.
- Если есть кэш, запись должна инвалидировать затронутые диапазоны.
- Заранее выберите владельца нижнего слоя. Заимствующий декоратор не закрывает `inner`; владеющий закрывает его ровно один раз.
- Чем умнее backend, тем важнее thread-safety.

## Что читать дальше

- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
