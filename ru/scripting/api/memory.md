---
title: API работы с памятью
description: Документация по API работы с памятью
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-20T21:17:57.774Z
---
# API работы с памятью

Для чтения известного значения используйте `process.Memory.Read<T>(address)`.
Для выбора процесса начните с [карты процессов](./memory/processes), для поиска
адреса по байтам — со [сканирования сигнатур](./memory/pattern-scanning).
Здесь собраны операции чтения и записи и точный срез основных контрактов.

## Прочитать и изменить значение по известному адресу

Нужны живой EyeAuras с загруженным модулем `EyeAuras.Memory`, PID цели и
абсолютный адрес значения типа `int`. Адрес и layout предоставляет вызывающий
код; они зависят от конкретной версии цели. В обычном C# классе передавайте их
параметрами. В top-level скрипте EyeAuras можно объявить и вызвать такой метод:

```csharp
using System;
using EyeAuras.Memory;

static int ReplaceInt32(int processId, IntPtr address, int newValue)
{
    using var process = LocalProcess.ByProcessId(processId);
    int previous = process.Memory.Read<int>(address);
    process.Memory.Write<int>(address, newValue);
    return previous;
}
```

Метод возвращает прежнее значение и записывает новое. Это две отдельные
операции, без атомарности относительно других потоков цели. Для чтения без
изменения достаточно `Read<int>`. Для unmanaged-структуры используйте свой тип
с layout, соответствующим памяти цели. Не упаковывайте обычные числа вручную
через `BinaryPrimitives` или `MemoryMarshal`.

`LocalProcess.ByProcessId` возвращает принадлежащий вам `ILocalProcess`;
`using` закрывает его OS handles. `process.Memory` заимствован у процесса:
держите процесс живым до конца всех обращений. `IsValid` не гарантирует,
что конкретный адрес доступен. Ошибки открытия процесса и доступа возможны
и у методов `Try*`; это не обещание работы без исключений.

Ссылки SDK дают типы, но не загружают реализацию. Во внешнем приложении нужны
`EyeAuras.SDK.Runtime`, пакет `EyeAuras.Memory`, `UseMemory()` и завершённый
`EnsureReadyAsync()` — см. [Embedded SDK](./nuget/embedded-sdk).

## Прочитать байтовый блок или массив

В обычном helper-классе уже открытый `IProcess` можно принять от владельца.
Следующая операция читает именно payload из `byteCount` байтов и возвращает
его копию; процесс здесь не освобождается:

```csharp
using System;
using EyeAuras.Memory;

static byte[] ReadPayload(IProcess process, IntPtr address, int byteCount)
{
    return process.Memory.Read(address, byteCount);
}
```

Для массива чисел `Read<int>(address, count)` принимает **число элементов**.
У `Read(address, size)` и `ReadBytes` размер задан в байтах. В этой версии
неположительный размер типизированного массива возвращает пустой массив;
`ReadBytes(long, long)` не поддерживает размер больше `int.MaxValue`.
Не воспринимайте эту перегрузку как потоковое чтение произвольного объёма.

Для своего буфера используйте `TryRead<byte>(address, buffer.AsSpan())`;
для byte payload на запись — `TryWriteMemory(address, payload.AsSpan())`.
Они возвращают `bool`, без количества переданных байтов. При `false` не
используйте буфер как полный результат. Обёртка локального backend копирует
данные в целевой span только после успешного native-вызова; частичное чтение
не является отдельным публичным результатом. Ошибки открытия OS handle могут
выбросить исключение до получения `bool`.

## Прочитать значение через цепочку указателей

Пусть известен адрес ячейки с первым 64-битным указателем и layout цепочки
`0x20`, затем `0x10`. Вход `rootAddress` — абсолютный адрес в том же процессе:

```csharp
using EyeAuras.Memory;

static int ReadChainedInt32(IProcess process, long rootAddress)
{
    return process.Memory.ReadPointerChain<int>(rootAddress, 0x20, 0x10);
}
```

Сначала читается `p = Read<long>(rootAddress)`, затем `p = Read<long>(p + 0x20)`,
наконец `Read<int>(p + 0x10)`. Результат — значение `int`, а не адрес последнего
поля. Нулевой указатель даёт `default(int)`, поэтому ноль не отличает пустую
цепочку от настоящего нулевого значения. Ошибка чтения может привести к исключению.
Передавайте хотя бы одно смещение. Для 32-битных указателей цели есть
`ReadPointerChain32<T>`; разрядность машины, на которой работает helper,
не выбирает layout цели автоматически.

## Строки и структуры с marshaling

`ReadStringA(address, length: 256)` декодирует ASCII, `ReadString` — UTF-8.
Здесь `length` — бюджет **байтов**, а не гарантированное число символов.
`ReadStringU(address, lengthBytes: 256)` декодирует UTF-16. По умолчанию
`replaceNull: true` обрезает текст по первому NUL. При недоступном чтении
эти helpers могут вернуть пустую строку; ASCII/UTF-8 также возвращают строки
`TextTooLong` и `TextTooShort` для неподходящей длины. Это не универсальный
протокол диагностики. Для UTF-16 задавайте положительный чётный размер не
меньше двух байтов и подходящий предел. `WriteString(IntPtr, string)`
записывает UTF-8 с завершающим NUL; место под весь результат предоставляет цель.

`ReadManaged<T>` / `TryReadManaged<T>` и `TryWriteManaged<T>` предназначены
для `struct` с marshaling layout, например `[MarshalAs]` для строк и массивов.
Для них нужен соответствующий layout и обычный managed-массив как буфер;
`stackalloc` структуры с полем `string` или `byte[]` недопустим.
Для unmanaged-значений оставляйте более простой `Read<T>` / `Write<T>`.

## Модуль, mapper и backend

`MemoryOfModule(...)` задаёт `BaseAddress` и `MemorySize` для сканеров и
PE-хелперов. Обычные чтения в этом view принимают абсолютные адреса:
`memory.Read<int>(memory.BaseAddress + offset)`. View не проверяет границы
модуля и не прибавляет базу к переданному адресу автоматически.
Созданный view — отдельный accessor над общей памятью процесса; его `Dispose`
не заменяет освобождение владельца процесса.

`UseCustomMemoryMapper()` возвращает `ICustomMemoryMapper`, позволяющий
переопределять offsets через `SetOverrideForOffsetOf`. `UseCustomMemoryMapper32()` создаёт
mapper с параметром `4`; это не переключатель всех указателей backend.
`UseMemoryMapper` и `UseMemoryPool` требуют `IConfigurableMemoryContext`.
`UseMemoryBackend` меняет backend будущих обращений; контракт не обещает
автоматически освободить заменённый backend. Владение ресурсами задаёт интеграция.

## Версия и полный контракт

Ниже — объявления из EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`.
XML-комментарии и диагностические реализации `ToString` опущены; сигнатуры
основных интерфейсов и поля DTO сохранены. Внутренние члены mapper опущены.
Типы layout находятся в `EyeAuras.Memory.Mappers`, остальные основные типы —
в `EyeAuras.Memory`; extension helpers — в `EyeAuras.Memory.Scaffolding`. Это срез исходного API, а не
обещание совместимости с любой установленной сборкой NuGet. Для своей версии
сверяйте SDK assemblies и поставляемые с ними XML docs.

| Область | Контракты в этом срезе |
| --- | --- |
| Контекст и адреса | `IMemoryContext`, `IMemorySpan`, `IMemoryAccessor` |
| Чтение и запись | `IMemoryReader`, `IMemoryWriter`, `IReadOnlyMemory`, `IMemory`, `IMemoryBackend` |
| Процесс | `IProcess`, `IProcessMemory`, `ProcessInformation`, `ProcessModuleInformation`, `ProcessThreadInformation`, `ProcessParametersInformation` |
| PE и caves | `ModuleSectionEntry`, `ModuleImportEntry`, `ModuleExportEntry`, `CodeCaveEntry` |
| Layout | `IMemoryMapper`, `ICustomMemoryMapper`, `IConfigurableMemoryContext` |

Сценарии модулей, PE, code caves и расширенных readers собраны в
[карте процессов](./memory/processes). Опциональные API:
[Frida SDK](./nuget/frida-sdk), [ReProcess](./reverse-engineering/reprocess).

```csharp
public interface IMemoryContext
{
    IFluentLog Log { get; }
    IMemoryMapper MemoryMapper { get; }
    ArrayPool<byte> MemoryPool { get; }
}
public interface IMemorySpan
{
    long BaseAddress { get; }
    int MemorySize { get; }
}
public interface IMemoryAccessor : IMemorySpan
{
    IFluentLog Log { get; }
    IMemoryContext Context { get; }
}
public interface IReadOnlyMemory : IMemoryReader
{
}
public interface IMemory : IMemoryWriter, IMemoryBackend, IReadOnlyMemory, IMemoryMapper
{
}
public interface IMemoryWriter : IMemoryAccessor
{
    public bool TryWrite<T>(IntPtr addr, ReadOnlySpan<T> source) where T : unmanaged;
    bool TryWriteManaged<T>(IntPtr addr, ReadOnlySpan<T> source) where T : struct;
    void Write<T>(IntPtr addr, T value) where T : unmanaged;
    void Write<T>(IntPtr addr, T[] value) where T : unmanaged;
    void Write<T>(IntPtr addr, ReadOnlySpan<T> source) where T : unmanaged;
    void Write<T>(IntPtr addr, Span<T> source) where T : unmanaged;
    void WritePointer(IntPtr addr, IntPtr value);
    void WritePointer32(IntPtr addr, IntPtr value);
    void Write(IntPtr addr, byte[] source);
    void WriteString(IntPtr addr, string text);
}
public interface IMemoryReader : IMemoryAccessor
{
    bool TryRead<T>(IntPtr addr, Span<T> target) where T : unmanaged;
    bool TryRead<T>(IntPtr addr, out T target) where T : unmanaged;
    bool TryRead<T>(long addr, Span<T> target) where T : unmanaged;
    bool TryRead<T>(long addr, out T target) where T : unmanaged;
    bool TryReadManaged<T>(IntPtr addr, Span<T> target) where T : struct;
    T ReadManaged<T>(IntPtr addr) where T : struct;
    T ReadManaged<T>(long addr) where T : struct;
    byte[] Read(IntPtr addr, int size);
    byte[] Read(long addr, int size);
    T Read<T>(IntPtr addr) where T : unmanaged;
    T Read<T>(long addr) where T : unmanaged;
    IntPtr ReadPointer(IntPtr addr);
    IntPtr ReadPointer32(IntPtr addr);
    T ReadPointerChain<T>(IntPtr addr, params int[] offsets) where T : unmanaged;
    T ReadPointerChain<T>(long addr, params int[] offsets) where T : unmanaged;
    T ReadPointerChain32<T>(IntPtr addr, params int[] offsets) where T : unmanaged;
    T ReadPointerChain32<T>(long addr, params int[] offsets) where T : unmanaged;
    T[] Read<T>(IntPtr addr, int size) where T : unmanaged;
    T[] Read<T>(long addr, int size) where T : unmanaged;
    string ReadStringA(long addr, int length = 256, bool replaceNull = true);
    string ReadString(long addr, int length = 256, bool replaceNull = true);
    string ReadStringU(long addr, int lengthBytes = 256, bool replaceNull = true);
    byte[] ReadBytes(long addr, int size);
    byte[] ReadBytes(long addr, long size);
    IList<long> ReadPointersArray(long startAddress, long endAddress, int offset = 8);
}
public readonly record struct ProcessThreadInformation
{
    public int ThreadId { get; init; }
    public int ProcessId { get; init; }
    public int BasePriority { get; init; }
    public int DeltaPriority { get; init; }
    public uint UsageCount { get; init; }
    public uint Flags { get; init; }
}
public readonly record struct ProcessModuleInformation
{
    public string? ModuleName { get; init; }
    public string? FilePath { get; init; }
    public IntPtr BaseAddress { get; init; }
    public int Size { get; init; }
}
public readonly record struct ProcessParametersInformation
{
    public IntPtr Address { get; init; }
    public string? CurrentDirectory { get; init; }
    public string? DllPath { get; init; }
    public string? ImagePathName { get; init; }
    public string? CommandLine { get; init; }
    public IntPtr EnvironmentAddress { get; init; }
    public string? WindowTitle { get; init; }
    public string? DesktopInfo { get; init; }
    public string? ShellInfo { get; init; }
    public string? RuntimeData { get; init; }
}
public readonly record struct ProcessInformation
{
    public string ProcessName { get; init; }
    public int Id { get; init; }
}
public readonly record struct CodeCaveEntry
{
    public ModuleSectionEntry Section { get; init; }
    public long StartVA { get; init; }
    public uint StartRva { get; init; }
    public int Size { get; init; }
    public int OffsetInSection { get; init; }
    public bool AlignmentAdjusted { get; init; }
}
public readonly record struct ModuleSectionEntry
{
    public string Name { get; init; }
    public uint VirtualAddress { get; init; }
    public uint VirtualSize { get; init; }
    public uint RawSize { get; init; }
    public uint Characteristics { get; init; }
    public long StartVA { get; init; }
    public long EndVA { get; init; }
    public bool IsExecutable { get; init; }
    public bool IsReadable { get; init; }
    public bool IsWritable { get; init; }
}
public readonly record struct ModuleImportEntry
{
    public string DllName { get; init; }
    public string? FunctionName { get; init; }
    public ushort Hint { get; init; }
    public bool IsByOrdinal { get; init; }
    public ushort Ordinal { get; init; }
    public uint ImportNameTableRva { get; init; }
    public uint ImportAddressTableRva { get; init; }
    public uint IatEntryRva { get; init; }
    public int ThunkIndex { get; init; }
    public ulong ThunkValue { get; init; }
}
public readonly record struct ModuleExportEntry
{
    public string? ExportName { get; init; }
    public string? UnDecoratedExportName { get; init; }
    public ushort Ordinal { get; init; }
    public uint RVA { get; init; }
    public bool IsForwarder { get; init; }
    public string? ForwarderName { get; init; }
    public int ExportAddressTableIndex { get; init; }
    public int NamePointerIndex { get; init; }
}

public interface IMemoryBackend : IDisposable, IMemorySpan
{
    bool IsValid { get; }
    bool TryReadMemory(IntPtr address, Span<byte> target);
    bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source);
}

public interface IProcess : IDisposable
{
    IFluentLog Log { get; }
    bool IsValid { get; }
    string? ProcessName { get; }
    int ProcessId { get; }
    IProcessMemory Memory { get; }
    IReadOnlyList<ProcessModuleInformation> GetProcessModules();
    public IReadOnlyList<ProcessThreadInformation> GetThreads();
    public MemoryBasicInformation VirtualQuery(IntPtr address);
    public IReadOnlyList<MemoryBasicInformation> GetMemoryRegions();
}

public interface IProcessMemory : IMemory
{
    IMemoryBackend Backend { get; }
    void UseMemoryBackend(IMemoryBackend backend);
}

public interface IMemoryMapper
{
    FieldInfo FieldOf<T>(Expression<Func<T, object>> expr);
    string NameOf<T>(Expression<Func<T, object>> expr);
    int OffsetOf<T>(Expression<Func<T, object>> expr);
    int OffsetOf(Type type, string memberName);
    int SizeOf<T>();
    T Read<T>(ReadOnlySpan<byte> source) where T : unmanaged;
    void Write<T>(T value, Span<byte> destination) where T : unmanaged;
}

public interface ICustomMemoryMapper : IMemoryMapper
{
    void SetOverrideForOffsetOf(FieldInfo member, int offset);
    void SetOverrideForOffsetOf<T>(Expression<Func<T, object>> expr, int offset);
    bool HasOverrideForOffsetOf<T>(Expression<Func<T, object>> expr);
    bool HasOverrideForOffsetOf<T>(FieldInfo member);
    void ResetOverrideForOffsetOf<T>(Expression<Func<T, object>> expr);
    void ResetOverrideForOffsetOf<T>(FieldInfo member);
}

public interface IConfigurableMemoryContext : IMemoryContext
{
    void UseMemoryPool(ArrayPool<byte> memoryPool);
    void UseMemoryMapper(IMemoryMapper mapper);
}
```


## Расширения для процесса в этом срезе

В старом справочнике этот набор назывался `ProcessExtensions`, а mapper
использовал имя `SetOffset`. В указанной версии класс называется
`MemoryExtensions`, а метод — `SetOverrideForOffsetOf`. Ниже сигнатуры
расширений без реализаций; контекст, адреса и владение описаны выше.

```csharp
public static ICustomMemoryMapper UseCustomMemoryMapper(this IProcess process);
public static ICustomMemoryMapper UseCustomMemoryMapper(this IProcess process, int pack);
public static ICustomMemoryMapper UseCustomMemoryMapper32(this IProcess process);
public static void UseMemoryMapper(this IProcess process, IMemoryMapper mapper);
public static void UseMemoryPool(this IProcess process, ArrayPool<byte> memoryPool);
public static bool TryFindProcessModule(this IProcess process, string moduleName,
    out IReadOnlyList<ProcessModuleInformation> modules, out ProcessModuleInformation pmi);
public static bool TryFindProcessModule(this IProcess process, string moduleName,
    out ProcessModuleInformation pmi);
public static ProcessModuleInformation GetProcessModule(this IProcess process, string moduleName);
public static IMemory MemoryOfModule(this IProcess process, ProcessModuleInformation pmi);
public static IMemory MemoryOfModule(this IProcess process, string moduleName);
public static IEnumerable<MemoryBasicInformation> EnumerateMemoryRegions(this IProcess reader);
```
