---
title: Кастомные memory backend
description: Как строить цепочки IMemoryBackend и добавлять поверх них кэширование, трекинг и другие возможности
published: true
date: 2026-04-16T16:45:00.000Z
tags: c#, scripting, memory, reverse-engineering, extensibility, backend, ai-translated
editor: markdown
dateCreated: 2026-04-16T16:45:00.000Z
---

# Кастомные `IMemoryBackend` и их цепочки

`IMemoryBackend` в EyeAuras маленький, и это хорошо: его удобно использовать не только как "финальный reader", но и как слой-декоратор. Поэтому поверх одного backend'а легко навесить статистику, логирование, кэширование или временную трассировку.

Вместо такой схемы:

```text
MemoryAccessor -> DriverBackend
```

можно собрать такую:

```text
MemoryAccessor -> CacheBackend -> StatsBackend -> LoggingBackend -> DriverBackend
```

## Две важные точки API

У `IProcessMemory` есть всё, что нужно для такой подмены:

```csharp
var currentBackend = process.Memory.Backend;
process.Memory.UseMemoryBackend(new MyWrappedBackend(currentBackend));
```

После этого новый low-level слой начинает использоваться и для обычного чтения, и для `MemoryOfModule(...)`, и для `ReadExports()`, `ReadImports()`, сигнатур и `code cave`.

## Минимальный decorator backend

```csharp
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

    public void Dispose() => inner.Dispose();
}
```

Это базовый шаблон. Дальше вы добавляете свой код до или после вызова `inner`.

## Самые полезные сценарии

- статистика — сколько чтений, записей и байт реально проходит через backend
- suspicious logging — быстро ловить `null`, near-null, мусорные и подозрительные адреса
- page cache — уменьшать число дорогих чтений у драйвера, DMA или удалённого bridge

Именно такие backend'ы уже были в `ScriptShock.MemoryApi`: `StatsMemoryBackend`, `SuspiciousAddressLoggingBackend`, `PageCachingMemoryBackend`, `CompositeMemoryBackend`.

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
- `Dispose()` должен корректно пробрасываться вниз.
- Чем умнее backend, тем важнее thread-safety.

## Что читать дальше

- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
