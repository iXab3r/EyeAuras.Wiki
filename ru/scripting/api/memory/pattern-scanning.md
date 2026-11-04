---
title: Сканирование сигнатур в памяти
description: Краткая карта helper-методов pattern scanning, сигнатур и работы смещений в memory API.
published: true
date: 2026-04-23T00:00:00.000Z
tags: scripting, api, ai, memory, pattern-scanning, ai-translated
editor: markdown
dateCreated: 2026-04-23T00:00:00.000Z
---
# Сканирование сигнатур в памяти

Сигнатура помогает найти последовательность байтов, когда её адрес заранее
неизвестен. `BytePattern` хранит байты и маску, `StringPattern` — совместимая
обёртка над шаблоном. Готовые helpers работают с `IReadOnlyMemory`, в том числе
с module view, полученным через `MemoryOfModule`.

## Найти сигнатуру в конкретном модуле

Нужны живой EyeAuras с модулем `EyeAuras.Memory`, PID и настоящее имя модуля
из `GetProcessModules()`. В standalone host сначала подключите Runtime и Memory,
объявите `UseMemory()` и дождитесь `EnsureReadyAsync()` —
[настройка Embedded SDK](../nuget/embedded-sdk).
Следующий обычный C# helper принимает эти входы и возвращает абсолютный адрес
совпадения либо `null`. Шаблон передаёт вызывающий код для своей версии цели:

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

static long? FindSignature(int processId, string moduleName, string template)
{
    using var process = LocalProcess.ByProcessId(processId);
    using var memory = process.MemoryOfModule(moduleName);
    var pattern = BytePattern.FromTemplate(template);
    int offset = memory.FindOffset(pattern);
    return offset < 0 ? null : memory.BaseAddress + offset;
}
```

Например, шаблон `48 8B ?? 74 0A` сравнивает четыре фиксированных байта,
а третий пропускает. Он иллюстрирует формат и не обещает найти объект в
произвольном процессе. Возвращённый адрес действует в цели; это не локальный
указатель для разыменования C# кодом. Reader принадлежит helper и освобождается
после поиска. Для последующих чтений нужно сохранить открытый reader у владельца.

`FindOffset` возвращает **смещение начала** относительно `memory.BaseAddress`;
`-1` означает отсутствие совпадения. Ошибка чтения памяти может выбросить
исключение. `GetOffset` дополнительно выбрасывает `ArgumentException`, если
сигнатура не найдена. Одиночный поиск читает весь диапазон в массив, не является
атомарным snapshot цели и не принимает `CancellationToken`.

## Выбрать формат шаблона и позицию внутри совпадения

```csharp
using EyeAuras.Memory.Scaffolding;

var exact = BytePattern.FromPattern(new byte[] { 0x48, 0x8B, 0xC0 });
var masked = BytePattern.FromMaskedPattern(
    new byte[] { 0x48, 0x8B, 0x00 }, "xx?");
var marked = BytePattern.FromTemplate("48 8B ^ ?? ?? ?? ??");
var cStyle = BytePattern.FromTemplate(@"\x48\x8B\xC0");
var compatible = new StringPattern("48 8B ??");
```

`x` в маске требует совпадения, `?` разрешает любой байт. В текстовом шаблоне
поддерживаются `?` и `??`, hex-байты разделяются пробелами либо буквальным `\x`.
`^` — отдельный элемент шаблона перед интересующим байтом; в примере
`marked.PatternOffset == 2`. Ставить его первым элементом нельзя.

Для одиночного `FindOffset(marked)` позиция отмеченного поля равна
`matchOffset + marked.PatternOffset`, только если `matchOffset >= 0`.
Сначала прибавьте базу модуля, если нужен VA. `^` сам по себе не декодирует
RIP-relative displacement: для этого нужно знать формат инструкции, длину
поля и базу относительного адреса. Не считайте найденное поле готовым pointer.

## Найти несколько разных сигнатур

В обычном C# helper `process` — заимствованный открытый `IProcess`,
`moduleName` — имя его модуля, оба шаблона заданы вызывающим кодом:

```csharp
using System.Collections.Generic;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

static IReadOnlyDictionary<IBytePattern, int> FindBoth(
    IProcess process, string moduleName, string first, string second)
{
    using var memory = process.MemoryOfModule(moduleName);
    var a = BytePattern.FromTemplate(first);
    var b = BytePattern.FromTemplate(second);
    return memory.FindOffsets(a, b);
}
```

Результат — словарь по pattern-объектам; для отсутствующей сигнатуры значение
`-1`. У найденных значений `PatternOffset` **уже прибавлен**. Для абсолютного
адреса добавьте базу модуля один раз. `GetOffsets` требует найти все шаблоны
и выбрасывает исключение, если хотя бы одного нет. `BytePattern` сравнивается
по `Template`: одинаковые шаблоны с разными `Name` не становятся разными
ключами. Передавайте разные шаблоны.

В исходной реализации EyeAuras `20fd3d4` множественный поиск идёт параллельно
блоками по 84000 байтов без перекрытия. Сигнатура на границе блоков может быть
пропущена; при нескольких совпадениях не гарантирован самый младший адрес.
`StartOffset` применяется одиночным поиском, но не этим параллельным путём.
Поэтому `FindOffsets` не является точной заменой нескольких одиночных поисков,
если важны эти условия. Ни один из этих helpers не даёт полной коллекции
всех совпадений одного шаблона.

## Сигнатуры API и версия

Срез EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`, namespace
`EyeAuras.Memory.Scaffolding`, сборка `EyeAuras.Memory.Shared`:

```csharp
public static int FindOffset(this IReadOnlyMemory m, IBytePattern pattern);
public static int GetOffset(this IReadOnlyMemory m, IBytePattern pattern);
public static IReadOnlyDictionary<IBytePattern, int> FindOffsets(
    this IReadOnlyMemory m, params IBytePattern[] patterns);
public static IReadOnlyDictionary<IBytePattern, int> GetOffsets(
    this IReadOnlyMemory m, params IBytePattern[] patterns);
```

`MemoryExtensionsForPatterns` делегирует поиск в `MemoryUtils`.
`MemoryOfModule` задаёт базу и размер, но не ограничивает обычные чтения:
адреса для `Read<T>` остаются абсолютными. Полный основной контракт —
[Memory API](../memory), выбор reader — [процессы](./processes),
пошаговое руководство — [pattern scanning](../../memory-api/pattern-scanning).
Сверяйте сигнатуры со SDK/XML установленной версии; это описание исходного
контракта, без проверки native runtime или доступности памяти вашей цели.
