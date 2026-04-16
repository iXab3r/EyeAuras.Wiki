---
title: C# Struct Layout
description: Как описывать native-структуры, offsets и fixed-size поля для Memory API в EyeAuras
published: true
date: 2026-04-16T20:12:00.000Z
tags: c#, scripting, memory, reverse-engineering, structs, interop
editor: markdown
dateCreated: 2026-04-16T20:12:00.000Z
---

# C# struct layout для Memory API

Эта страница про то, как описывать данные из памяти в виде C#-структур так, чтобы `Memory API` читал их правильно.

Если коротко:

- если структура простая, делайте её максимально простой и читайте через `Read<T>(...)`
- если у вас есть точные offsets, лучше явно зафиксировать их через `LayoutKind.Explicit`
- если внутри строки или поля через `MarshalAs`, используйте `ReadManaged<T>(...)`

Официальные ссылки по теме:

- [StructLayoutAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.structlayoutattribute)
- [FieldOffsetAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.fieldoffsetattribute)
- [MarshalAsAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.marshalasattribute)
- [InlineArrayAttribute](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.inlinearrayattribute)
- [Type marshalling](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/type-marshalling)

Из reverse engineering-материалов особенно полезны:

- [Game Fundamentals](https://gamehacking.academy/pages/1/02/)
- [External Memory Hack](https://gamehacking.academy/pages/3/02/)
- [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/)

## Самое важное правило

Memory API умеет читать структуры двумя разными путями:

- `Read<T>(...)` / `TryRead<T>(...)` для простых структур
- `ReadManaged<T>(...)` / `TryReadManaged<T>(...)` для структур со строками, `MarshalAs` и похожими вещами

Выигрывает почти всегда тот путь, который проще:

- если структура обычная и без "сложных" полей, не усложняйте и читайте её как простую
- если layout зависит от `MarshalAs`, строк или фиксированных managed-массивов, используйте `ReadManaged<T>(...)`

## `Sequential` и `Explicit`

### `LayoutKind.Sequential`

Подходит, когда поля реально лежат подряд в том же порядке, что и в native-типе.

```csharp
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential)]
public struct PlayerStats
{
    public int Health;
    public float Speed;
    public long TargetId;
}
```

Это хороший вариант, когда:

- у вас есть точное C/C++ описание структуры
- offsets получаются автоматически и без сюрпризов
- специальных дыр и overlapping-полей нет

### `LayoutKind.Explicit`

Подходит, когда offsets известны заранее и вы хотите зафиксировать их вручную.

```csharp
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Explicit, Size = 0x20)]
public struct PlayerData
{
    [FieldOffset(0x0)] public int Health;
    [FieldOffset(0x8)] public float Speed;
    [FieldOffset(0x10)] public long TargetId;
}
```

Именно этот стиль обычно удобнее всего в reverse engineering, потому что вы буквально переносите offsets из SDK, REClass, Cheat Engine или из дизасма в C#.

## `Pack` и выравнивание

Даже если поля идут "по порядку", итоговый layout может сломаться из-за выравнивания.

Пример:

```csharp
[StructLayout(LayoutKind.Sequential, Pack = 1)]
public struct PackedHeader
{
    public byte Type;
    public int Size;
}
```

Если в оригинальном native-типе был `#pragma pack(push, 1)`, а в C# вы забыли `Pack = 1`, offsets уедут.

Практический совет:

- не угадывайте `Pack`
- если исходный layout известен по offsets, проще перейти на `Explicit`
- если вы работаете по header'ам или SDK, копируйте `pack` честно
- если слово `Pack` вам пока ни о чем не говорит, не страшно: в большинстве RE-сценариев проще использовать `Explicit` и выставить offsets вручную

## Указатели внутри struct

Для полей-указателей обычно лучше использовать:

- `nint` / `nuint`
- `IntPtr` / `UIntPtr`
- либо явно `uint` / `ulong`, если layout жёстко завязан на 32/64 bit

Если вы описываете 64-bit игру, не храните указатели в `int`.

```csharp
[StructLayout(LayoutKind.Sequential)]
public struct ActorNode64
{
    public nuint Next;
    public nuint Prev;
    public int Id;
}
```

Если же вы сознательно разбираете 32-bit layout, можно фиксировать это и типом:

```csharp
[StructLayout(LayoutKind.Sequential)]
public struct ActorNode32
{
    public uint Next;
    public uint Prev;
    public int Id;
}
```

## Массивы внутри struct

Здесь есть три основных маршрута.

### `fixed`

Самый прямой `unmanaged`-вариант:

```csharp
[StructLayout(LayoutKind.Sequential)]
public unsafe struct FixedArrayStruct
{
    public int Header;
    public fixed float Values[4];
}
```

Это быстро и хорошо подходит для `Read<T>(...)`, но требует `unsafe`.

### `InlineArray`

Современный и аккуратный вариант для inline-массивов:

```csharp
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

[InlineArray(4)]
public struct Float4
{
    private float _element0;
}

[StructLayout(LayoutKind.Sequential)]
public struct InlineArrayStruct
{
    public int Header;
    public Float4 Values;
}
```

Это тоже хорошо стыкуется с быстрым маршрутом чтения.

### `[MarshalAs(UnmanagedType.ByValArray)]`

Подходит, когда нужен более гибкий маршрут:

```csharp
[StructLayout(LayoutKind.Sequential)]
public struct ManagedArrayStruct
{
    public int Header;

    [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16)]
    public byte[] Data;
}
```

Такую структуру уже лучше читать через:

```csharp
var value = process.Memory.ReadManaged<ManagedArrayStruct>(addr);
```

## Строки внутри struct

Если строка хранится фиксированным полем внутри структуры, это почти всегда сценарий для `ReadManaged<T>(...)`.

```csharp
[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
public struct NameEntry
{
    public int Id;

    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
    public string Name;
}
```

Чтение:

```csharp
var entry = process.Memory.ReadManaged<NameEntry>(addr);
Log.Info(entry.Name);
```

Важно:

- `ByValTStr` зависит от `CharSet` у самой структуры
- для `Unicode` это будет UTF-16-представление
- для `Ansi` это будет однобайтная строка
- такую структуру не стоит читать через `Read<T>(...)`

## Смещения и helper-методы

В `MemoryAccessor` есть полезные helper'ы, чтобы не держать offsets руками в десяти местах:

- `SizeOf<T>()`
- `OffsetOf<T>(...)`
- `OffsetOf(type, memberName)`
- `NameOf<T>(...)`
- `FieldOf<T>(...)`

```csharp
var size = process.Memory.SizeOf<PlayerData>();
var targetOffset = process.Memory.OffsetOf<PlayerData>(x => x.TargetId);
```

Это удобно, когда:

- вы хотите сверять layout на старте
- строите pointer math из имени поля
- переносите offsets между разными участками кода

Но practical rule здесь простой:

- для простых структур такие helper'ы очень удобны
- для сложных `[MarshalAs]`-layout'ов чаще проще читать структуру целиком через `ReadManaged<T>(...)`, чем строить ручной offset math

## Что лучше выбирать на практике

Если структура выглядит как обычный кусок памяти без строк и managed-полей:

- `int`
- `float`
- `long`
- `fixed`
- `InlineArray`
- nested unmanaged-struct

тогда лучше:

- `StructLayout`
- по возможности простой `struct`
- `Read<T>(...)`

Если структура содержит:

- `string`
- `byte[]` через `ByValArray`
- `ByValTStr`
- другой явный marshaling

тогда лучше:

- `ReadManaged<T>(...)`
- `TryReadManaged<T>(...)`
- `TryWriteManaged<T>(...)`

## Что ломает layout чаще всего

- `class` вместо `struct`
- отсутствие `StructLayout`
- неверный `Pack`
- перепутанная 32/64-bit модель указателей
- попытка читать `string` или managed-массив как обычную простую структуру
- ручные offsets, которые уже не совпадают с реальным native layout

Если видите "все значения читаются, но как будто сдвинуты", почти всегда проблема либо в `Pack`, либо в размере указателя, либо в том, что sequential-описание не совпало с оригиналом.

## Практический маршрут

Если у вас есть только offsets из reverse engineering:

1. начните с `LayoutKind.Explicit`
2. проверьте `Size`
3. проверьте 2-3 ключевых поля
4. только потом думайте, можно ли упростить до `Sequential`

Если у вас есть исходный native header:

1. перенесите `StructLayout`
2. перенесите `Pack`, если он был
3. отдельно перепроверьте строки и inline-массивы

## Что читать дальше

- [Memory basics](/ru/scripting/memory-api/memory-basics)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Code Cave](/ru/scripting/memory-api/code-caves)
