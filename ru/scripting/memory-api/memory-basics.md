---
title: Memory basics
description: Практические основы чтения и записи памяти через Memory API в C#-скриптах EyeAuras
published: true
date: 2026-04-16T20:27:37.740Z
tags: scripting, c#, memory, reverse-engineering, pointers, performance
editor: markdown
dateCreated: 2026-04-16T19:10:09.373Z
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

Примеры с `LocalProcess` рассчитаны на верхний уровень C#-скрипта в запущенном EyeAuras с загруженным модулем памяти. `Log` даёт хост скрипта. В обычном C#-классе передайте логгер и процесс явно. Одна ссылка на SDK не запускает модуль: во встраиваемом хосте сначала нужны запуск приложения, `UseMemory()` и ожидание `EnsureReadyAsync()`; подробнее в [Embedded SDK](/ru/scripting/api/nuget/embedded-sdk).

`LocalProcess.ByProcessId(...)` возвращает новый `ILocalProcess`, который освобождает создавший его код. `process.Memory` используется вместе с этим reader'ом; отдельно закрывать заимствованный сервис хоста не нужно. Эти примеры не проверяют доступность нативных компонентов вашей сборки.

Для первого чтения не нужен адрес из игры. Выделим собственные 16 байт в текущем процессе, запишем HP и скорость, затем прочитаем их через тот же публичный API:

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    var buffer = Marshal.AllocHGlobal(16);
    try
    {
        process.Memory.Write<int>(buffer, 742);
        process.Memory.Write<float>(buffer + 0x04, 1.5f);
        var hp = process.Memory.Read<int>(buffer);
        var speed = process.Memory.Read<float>(buffer + 0x04);
        Log.Info($"HP={hp}, speed={speed}");
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
    }
}
```

В журнале будут HP `742` и скорость `1.5` с учётом культуры вывода. `Marshal` здесь только владеет локальным буфером; скалярные значения читает и пишет `process.Memory`. Не освобождайте буфер, пока операция его использует.

`process.Memory` в EyeAuras это и есть основной слой для работы с памятью. Через него можно:

- читать числа и структуры
- читать сырые байты
- писать значения обратно
- переходить по pointer chain

## Чтение и запись простых значений

Ниже фрагменты чтения предполагают открытый `process` и действующие адреса.
Помещайте их внутрь блока владения reader из подготовки либо передавайте
reader параметром helper-метода; после закрытия блока его использовать нельзя.

Для простых случаев почти всегда нужны именно эти методы:

- `Read<T>(address)` — прочитать одно значение
- `Read<T>(address, count)` — прочитать массив значений
- `Write(address, value)` — записать одно значение
- `Write(address, spanOrArray)` — записать блок значений
- `Read(address, size)` — прочитать сырые байты

`Read<T>(address, count)` считает элементы `T`, а `Read(address, size)` — байты. Адрес у process backend — абсолютный VA. `Read`/`Write` сообщают о неудаче исключением, `TryRead`/`TryWrite` возвращают `bool`; это не количество переданных байтов. Эти методы синхронные, без токена отмены.

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

Иллюстрация для уже открытого `process`: вход — модуль `game.exe` и известный для его версии RVA `0x123456`, по которому хранится 64-битный указатель. Это не адрес для запуска на произвольной игре. Нужен `using EyeAuras.Memory.Scaffolding;` для `GetProcessModule`.

```csharp
var mainModule = process.GetProcessModule("game.exe");
var playerManagerPtrAddress = new IntPtr(mainModule.BaseAddress.ToInt64() + 0x123456);
var playerManager = process.Memory.ReadPointer(playerManagerPtrAddress);
```

Смысл здесь в том, что база модуля может меняться между запусками, а `RVA` внутри той же версии образа остаётся тем же; обновление программы может изменить его. Поэтому мы обычно думаем не так:

- "мне нужен адрес `0x12345678`"

а так:

- "мне нужен `game.exe + 0x123456`"

### Что такое offset

`Offset` это смещение внутри структуры или объекта.

Если у вас есть:

- базовый адрес игрока `playerBase`
- `0x10` до `Health`
- `0x18` до `Mana`

то чтение выглядит так (фрагмент для уже открытого `process` и известного абсолютного `playerBase`):

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

![Пример pointer chain от статического адреса до значения HP](https://s3.eyeauras.net/media/2026/04/memory-pointer-chain.svg)

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

Для законченного примера создадим цепочку в собственном буфере. Это верхний уровень скрипта EyeAuras с модулем памяти; вариант рассчитан на 64-битный хост и 64-битные указатели.

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    var buffer = Marshal.AllocHGlobal(0x40);
    try
    {
        var player = buffer + 0x10;
        process.Memory.Write<long>(buffer, player.ToInt64());
        process.Memory.Write<int>(player + 0x18, 742);
        var health = process.Memory.ReadPointerChain<int>(buffer, 0x18);
        Log.Info($"HP={health}");
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
    }
}
```

Получим `HP=742`: helper сначала читает указатель из `buffer`, затем значение по `player + 0x18`. В длинной цепочке промежуточные offsets означают разыменование, последний — смещение до `T`. Нужен хотя бы один offset. Нулевой указатель возвращает `default(T)`; неудачное чтение может бросить исключение. Поэтому нулевой HP сам по себе не доказывает, что цепочка была правильной.

`ReadPointer` и обычная цепочка читают 64-битные указатели без автоматического определения архитектуры цели. Для 32-битной цепочки используйте `ReadPointerChain32<T>`: внутри читается `uint`. Отдельный `ReadPointer32` читает `int` и при преобразовании может расширить знак; для явного беззнакового адреса удобнее `process.Memory.Read<uint>(address)`. Размер `IntPtr` относится к хосту, а не к целевой структуре.

## Строки и кодировки

В Memory API есть три основных helper'а:

- `ReadString(...)` — `UTF-8`
- `ReadStringA(...)` — `Encoding.ASCII`, без системной ANSI code page
- `ReadStringU(...)` — `UTF-16 LE` (`Encoding.Unicode`)

Прочитаем свою строку. Запускайте на верхнем уровне скрипта EyeAuras с модулем памяти; буфер принадлежит только этому примеру.

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    var namePtr = Marshal.AllocHGlobal(64);
    try
    {
        process.Memory.WriteString(namePtr, "Player");
        Log.Info(process.Memory.ReadString(namePtr.ToInt64(), 7));
    }
    finally
    {
        Marshal.FreeHGlobal(namePtr);
    }
}
```

В журнале будет `Player`. Читаем 7 байт — шесть букв и завершающий NUL. При записи произвольного текста заранее выделите место под UTF-8 байты и NUL; `WriteString` не выделяет буфер.

Практические правила здесь такие:

- длина у всех трёх методов измеряется в байтах; по умолчанию 256 байт и `replaceNull=true`
- для UTF-16 нужен чётный достаточный размер; пустой результат также может означать неудачное чтение, а не пустую строку
- по умолчанию строки обрезаются по `\0`
- если в памяти лежит не та кодировка, вы получите "мусор", даже если адрес правильный
- `WriteString(...)` сейчас пишет `UTF-8` строку с `\0` на конце

Если строка лежит не отдельно, а внутри структуры фиксированным полем, можно читать её через `ReadManaged<T>(...)`. Для этого есть отдельная страница: [C# Struct Layout](/ru/scripting/memory-api/csharp-structures).

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

// Объявленный вход — четыре байта поля в big-endian формате.
var raw = new byte[] { 0x00, 0x00, 0x00, 0x01 };
var bigEndianValue = BinaryPrimitives.ReadInt32BigEndian(raw); // 1
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

Для массива однотипных элементов читайте сразу массив структур. Вот законченный C#-helper: вызывающий код передаёт живой `IProcess`, абсолютный адрес первого элемента и число элементов, подтверждённые для версии целевой программы.

```csharp
using System;
using System.Runtime.InteropServices;
using EyeAuras.Memory;

[StructLayout(LayoutKind.Explicit, Size = 0x30)]
public struct ActorEntry
{
    [FieldOffset(0x10)] public int Health;
    [FieldOffset(0x18)] public int Mana;
    [FieldOffset(0x28)] public long TargetId;
}

public static class ActorReader
{
    public static ActorEntry[] ReadActors(IProcess process, IntPtr arrayAddress, int count)
        => process.Memory.Read<ActorEntry>(arrayAddress, count);
}
```

Результат — `count` локальных записей с шагом `0x30`. Здесь layout объявлен явно; это пример формата, а не готовые offsets какой-либо игры. Helper не открывает и не закрывает переданный процесс. Для настоящего байтового формата — файла, пакета или дампа — уместен `Span<byte>` и явное декодирование, но для обычных скалярных полей это лишняя обёртка.

Под капотом `MemoryAccessor` уже делает несколько полезных вещей:

- использует `stackalloc` для небольших буферов
- использует `ArrayPool<byte>` для части unmanaged-чтений
- старается не плодить лишние временные массивы там, где можно работать через `Span<T>`

Но даже с этим batching всё равно важен. Самая быстрая оптимизация в таких задачах обычно не "написать умнее C#", а "сократить количество реальных обращений к памяти процесса".

## Многопоточность

Параллельные чтения и чтение одним блоком не гарантируют согласованный снимок: целевой процесс может менять данные во время копирования. Требования к потокам задаёт конкретный backend; наличие параллельного сценария в тестах не доказывает потокобезопасность всех реализаций.

Не меняйте backend и не освобождайте процесс одновременно с чтением. Если нужна согласованность нескольких полей, используйте протокол целевой программы или проверку версии снимка, а не предположение, что одно чтение атомарно.

## Какой способ чтения выбрать

![Сравнение Read и ReadManaged для native и managed layout](https://s3.eyeauras.net/media/2026/04/memory-read-paths.svg)

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

Это прямой путь для `T : unmanaged`; атрибут `MarshalAs` сам по себе не делает тип подходящим под это ограничение.

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

Контракты на этой странице сверены по EyeAuras `20fd3d4`; это чтение исходников, без запуска примеров. Полные сигнатуры и ограничения своей версии проверяйте по [карте API памяти](/ru/scripting/api/memory) и SDK/XML reference.

## Что читать дальше

- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [C# Struct Layout](/ru/scripting/memory-api/csharp-structures)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
