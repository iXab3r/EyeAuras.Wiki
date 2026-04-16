---
title: Memory basics
description: Практические основы чтения и записи памяти через Memory API в C#-скриптах EyeAuras
published: true
date: 2026-04-16T20:05:00.000Z
tags: c#, scripting, memory, reverse-engineering, pointers, performance
editor: markdown
dateCreated: 2026-04-16T20:05:00.000Z
---

# Memory basics для Memory API

Эта страница про самую базовую практику: как читать и писать память, что такое static pointer, pointer chain и offsets, как работать со строками и буферами, и какой способ чтения выбирать в C#.

Если коротко, здесь нам нужны всего три идеи:

- есть адрес в памяти
- по этому адресу лежит либо само значение, либо указатель на другое место
- C#-структура должна совпадать с тем, как данные реально лежат в памяти

Если нужен внешний контекст, очень полезны:

- [Game Fundamentals](https://gamehacking.academy/pages/1/02/)
- [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/)
- [External Memory Hack](https://gamehacking.academy/pages/3/02/)

## С чего начинается работа

Обычно вы открываете процесс и работаете через `process.Memory`:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);

var hp = process.Memory.Read<int>(someHpAddress);
var speed = process.Memory.Read<float>(someSpeedAddress);

process.Memory.Write(someFlagAddress, 1);
```

`process.Memory` в EyeAuras это и есть основной слой для работы с памятью. Через него можно:

- читать числа и структуры
- читать сырые байты
- писать значения обратно
- переходить по pointer chain

## Чтение и запись простых значений

Для простых случаев почти всегда нужны именно эти методы:

- `Read<T>(address)` — прочитать одно значение
- `Read<T>(address, count)` — прочитать массив значений
- `Write(address, value)` — записать одно значение
- `Write(address, spanOrArray)` — записать блок значений
- `Read(address, size)` — прочитать сырые байты

```csharp
var hp = process.Memory.Read<int>(hpAddress);
var positionX = process.Memory.Read<float>(positionAddress);

var header = process.Memory.Read(someAddress, 64);

process.Memory.Write(someAddress, 123);
process.Memory.Write(someAddress + 4, new byte[] { 0x90, 0x90, 0x90, 0x90 });
```

Этот путь лучше всего подходит для:

- `int`, `float`, `long`, `byte`
- `bool`, если вы точно знаете его размер в памяти
- простых `struct`, которые состоят из чисел, указателей и других таких же простых `struct`

Если внутри структуры уже есть `string`, обычный `byte[]` или что-то похожее, лучше смотреть в сторону `ReadManaged<T>(...)`. Ниже будет отдельный раздел про это.

## Static pointer, offsets и pointer chain

### Что такое static pointer

`Static pointer` это адрес, который можно стабильно восстановить через что-то более надёжное, чем "просто число из Cheat Engine". Обычно это:

- `BaseAddress + RVA`
- экспорт модуля
- адрес глобального объекта внутри конкретного модуля

Простейший пример:

```csharp
var mainModule = process.GetProcessModule("game.exe");
var playerManagerPtrAddress = new IntPtr(mainModule.BaseAddress.ToInt64() + 0x123456);
var playerManager = process.Memory.ReadPointer(playerManagerPtrAddress);
```

Смысл здесь в том, что база модуля может меняться между запусками, а `RVA` внутри него остаётся тем же. Поэтому мы обычно думаем не так:

- "мне нужен адрес `0x12345678`"

а так:

- "мне нужен `game.exe + 0x123456`"

### Что такое offset

`Offset` это смещение внутри структуры или объекта.

Если у вас есть:

- базовый адрес игрока `playerBase`
- `0x10` до `Health`
- `0x18` до `Mana`

то чтение выглядит так:

```csharp
var health = process.Memory.Read<int>(playerBase + 0x10);
var mana = process.Memory.Read<int>(playerBase + 0x18);
```

### Что такое pointer chain

`Pointer chain` это ситуация, когда по адресу лежит не само значение, а указатель на следующий объект.

Если совсем по-простому:

- адрес A ведёт к объекту B
- внутри B по offset лежит адрес C
- внутри C уже лежит нужное значение

Типичный маршрут:

1. читаем указатель
2. прибавляем offset
3. снова читаем указатель
4. в конце читаем уже нужное значение

![](/assets/memory-pointer-chain.svg)

Короткий разбор этого примера:

1. У нас есть `Module`, внутри которого известен статический адрес. Это и есть наша первая устойчивая точка входа.
2. По этому адресу лежит pointer на `EntityList`.
3. У `EntityList` берем поле по `+0x10` и читаем следующий pointer. Он ведет на `Entity`.
4. У `Entity` берем поле по `+0x20` и снова читаем pointer. Он ведет на `Monster`.
5. У `Monster` по `+0x18` уже лежит само значение `HP`.

Если записать этот маршрут в коде, получится такая идея:

```csharp
var hp = process.Memory.ReadPointerChain<int>(
    (IntPtr)0x140123456,
    0x10,
    0x20,
    0x18);
```

Адрес и offsets здесь примерные. Смысл не в конкретных числах, а в том, что каждый следующий шаг либо читает pointer, либо в самом конце читает уже обычное значение.

В EyeAuras для этого есть готовые методы:

- `ReadPointer(...)`
- `ReadPointer32(...)`
- `ReadPointerChain<T>(...)`
- `ReadPointerChain32<T>(...)`

```csharp
var health = process.Memory.ReadPointerChain<int>(
    playerManagerPtrAddress,
    0x10,
    0x20,
    0x18);
```

Для 32-bit layout используйте `ReadPointer32(...)` и `ReadPointerChain32<T>(...)`, иначе вы просто будете читать указатели не того размера.

Важно: если в цепочке встретится `null`, `ReadPointerChain<T>(...)` вернёт `default`, а не исключение. Это удобно, но может скрывать ошибки в логике, поэтому в сложных сценариях полезно логировать промежуточные адреса отдельно.

## Строки и кодировки

В Memory API есть три основных helper'а:

- `ReadString(...)` — `UTF-8`
- `ReadStringA(...)` — однобайтная строка в стиле `ASCII` / ANSI
- `ReadStringU(...)` — `UTF-16 LE` (`Encoding.Unicode`)

```csharp
var utf8Name = process.Memory.ReadString(namePtr.ToInt64(), 64);
var ansiName = process.Memory.ReadStringA(namePtr.ToInt64(), 64);
var wideName = process.Memory.ReadStringU(namePtr.ToInt64(), 64);
```

Практические правила здесь такие:

- параметр длины у `ReadStringU(...)` это длина в байтах, а не в символах
- по умолчанию строки обрезаются по `\0`
- если в памяти лежит не та кодировка, вы получите "мусор", даже если адрес правильный
- `WriteString(...)` сейчас пишет `UTF-8` строку с `\0` на конце

Если строка лежит не отдельно, а внутри структуры фиксированным полем, почти всегда лучше читать её через `ReadManaged<T>(...)`. Для этого есть отдельная страница: [C# Struct Layout](/ru/scripting/memory-api/csharp-structures).

Полезный фон по строкам и marshaling:

- [Type marshalling](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/type-marshalling)
- [Default Marshalling for Strings](https://learn.microsoft.com/en-us/dotnet/framework/interop/default-marshalling-for-strings)

## Endianness

На обычных Windows-процессах почти всегда всё просто: `x86` и `x64` — это `little-endian`.

Это значит, что байты:

```text
01 00 00 00
```

означают `int = 1`, а не `16777216`.

Для обычного чтения памяти в Windows вам почти никогда не нужно вручную разворачивать байты. Проще говоря: в обычной Windows-игре этот раздел чаще всего можно просто запомнить и жить дальше.

Но если вы:

- читаете дамп с другой архитектуры
- работаете со своим backend'ом
- парсите сетевые или файловые big-endian структуры

тогда endianness уже нужно учитывать явно.

```csharp
using System.Buffers.Binary;

var raw = process.Memory.Read(someAddress, 4);
var bigEndianValue = BinaryPrimitives.ReadInt32BigEndian(raw);
```

Полезная ссылка:

- [BitConverter.IsLittleEndian](https://learn.microsoft.com/en-us/dotnet/api/system.bitconverter.islittleendian)

## Буферы и производительность

Самая частая ошибка в memory-скриптах это читать слишком много маленьких кусочков по одному полю.

Плохой маршрут:

- 30 отдельных `Read<int>(...)` подряд каждый тик

Обычно лучше:

- одним чтением забрать блок памяти
- уже потом разбирать его локально

```csharp
var buffer = new byte[0x400];

if (process.Memory.TryRead(playerBase, buffer.AsSpan()))
{
    var health = BitConverter.ToInt32(buffer, 0x10);
    var mana = BitConverter.ToInt32(buffer, 0x18);
    var targetId = BitConverter.ToInt64(buffer, 0x28);
}
```

Если у вас массив однотипных элементов, удобнее читать его сразу как массив структур:

```csharp
var actors = process.Memory.Read<ActorEntry>(actorsArrayAddress, actorCount);
```

Под капотом `MemoryAccessor` уже делает несколько полезных вещей:

- использует `stackalloc` для небольших буферов
- использует `ArrayPool<byte>` для части unmanaged-чтений
- старается не плодить лишние временные массивы там, где можно работать через `Span<T>`

Но даже с этим batching всё равно важен. Самая быстрая оптимизация в таких задачах обычно не "написать умнее C#", а "сократить количество реальных обращений к памяти процесса".

## Многопоточность

Несколько reader'ов одновременно в целом допустимы. В тестах EyeAuras есть и несколько последовательных reader'ов, и несколько параллельных reader'ов.

Но важно понимать границу:

- сам API читать параллельно обычно умеет
- целевой процесс при этом может менять данные между вашими чтениями

То есть проблема обычно не в том, что сам `MemoryAccessor` "ломается от потоков", а в том, что данные в процессе в этот момент уже могли измениться.

Практический совет:

- если нужен согласованный snapshot, читайте блок одним куском
- если backend это поддерживает и сценарий безопасен, можно временно зафиксировать процесс отдельно
- не делите один логический объект на десятки независимых чтений из разных потоков без причины

## Какой способ чтения выбрать

![](/assets/memory-read-paths.svg)

Это одно из самых важных различий во всей теме. Но здесь не обязательно запоминать термины, достаточно понять практическое правило.

### Вариант 1 - быстрый путь

Сюда относятся:

- `Read<T>(...)`
- `TryRead<T>(...)`
- `Read<T>(..., count)`
- `Write<T>(...)`

Его берите, если структура простая. Например:

- внутри только числа
- указатели
- `fixed`
- `InlineArray`
- другие такие же простые структуры

И наоборот, этот путь не подходит, если внутри уже есть:

- `string`
- обычный `byte[]`
- другие ссылочные поля

Это самый быстрый путь.

### Вариант 2 - гибкий путь

Сюда относятся:

- `ReadManaged<T>(...)`
- `TryReadManaged<T>(...)`
- `TryWriteManaged<T>(...)`

Его берите, когда структура уже "более C#-шная". Например, внутри есть:

- `[MarshalAs(UnmanagedType.ByValArray, ...)]`
- `[MarshalAs(UnmanagedType.ByValTStr, ...)]`
- фиксированные строковые поля
- layout, который удобно описывать через marshaling

Этот путь заметно гибче, но он медленнее.

Короткое правило:

- если структура простая, берите обычный `Read<T>(...)`
- если внутри строки, `MarshalAs` или более сложный layout, берите `ReadManaged<T>(...)`

Если сомневаетесь:

- сначала попробуйте описать структуру как простую
- если упираетесь в строки или фиксированные managed-поля, переходите на `ReadManaged<T>(...)`

## Что читать дальше

- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [C# Struct Layout](/ru/scripting/memory-api/csharp-structures)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
