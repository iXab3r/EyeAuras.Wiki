---
title: API памяти
description: API для работы с памятью
published: true
date: 2025-09-20T21:17:57.774Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-20T21:17:57.774Z
---
```csharp

/// <summary>
/// Контекст описывает, КАК работать с памятью, и предоставляет дополнительные утилиты.
/// Представляет общий контекст для работы с памятью внутри скрипта.
/// Это своего рода набор инструментов с логированием, средствами описания layout памяти и другими глобальными вспомогательными функциями.
/// </summary>
public interface IMemoryContext
{
    /// <summary>
    /// Позволяет писать сообщения в лог из скрипта (например, отладочную информацию или ошибки).
    /// </summary>
    /// <value>Экземпляр <see cref="IFluentLog"/> для логирования сообщений, связанных с памятью.</value>
    /// <remarks>
    /// Полезно для вывода диагностической информации или отслеживания проблем при доступе к памяти.
    /// </remarks>
    IFluentLog Log { get; }

    /// <summary>
    /// Помогает определять, где находятся поля в структурах (их смещения и размеры).
    /// </summary>
    /// <value>Экземпляр <see cref="IMemoryMapper"/> для работы с layout памяти.</value>
    /// <remarks>
    /// Используйте это, чтобы получать или вычислять смещения полей и размеры структур динамически во время выполнения.
    /// </remarks>
    IMemoryMapper MemoryMapper { get; }
    
    /// <summary>
    /// Предоставляет общий пул переиспользуемых массивов байтов, чтобы уменьшить количество выделений памяти при работе с временными буферами.
    /// </summary>
    /// <remarks>
    /// Это полезно, если вы часто читаете или записываете память в короткоживущих буферах и не хотите каждый раз создавать новые массивы.
    /// Использование пула может повысить производительность и снизить нагрузку на GC в сценариях с интенсивной работой с памятью.
    /// </remarks>
    ArrayPool<byte> MemoryPool { get; }
}

/// <summary>
/// Представляет фрагмент или окно памяти, из которого можно читать или в которое можно писать.
/// Проще говоря, это срез памяти с начальным адресом и размером.
/// Обычно читать можно и за пределами региона, поэтому это скорее FYI-механизм.
/// </summary>
public interface IMemorySpan
{
    /// <summary>
    /// Начальный адрес памяти этого региона.
    /// Можно считать, что именно отсюда начинается блок памяти.
    /// </summary>
    long BaseAddress { get; }

    /// <summary>
    /// Размер региона памяти в байтах.
    /// Показывает, насколько велик этот срез памяти (то есть сколько байт он содержит).
    /// </summary>
    int MemorySize { get; }
}

/// <summary>
/// Даёт доступ к конкретному региону памяти вместе с полезными инструментами, например логированием и информацией о layout.
/// По сути это «умный» дескриптор памяти — он знает, откуда начинается, какого размера и какие инструменты доступны для работы с ним.
/// </summary>
public interface IMemoryAccessor : IMemorySpan
{
    /// <summary>
    /// Предоставляет доступ к интерфейсу логирования для скрипта.
    /// </summary>
    /// <value>Экземпляр IFluentLog, используемый для логирования сообщений, связанных с памятью.</value>
    /// <remarks>
    /// Это свойство открывает интерфейс логирования, который скрипты могут использовать для записи сообщений, предупреждений и ошибок.
    /// </remarks>
    IFluentLog Log { get; }
    
    /// <summary>
    /// Представляет общий контекст для работы с памятью внутри скрипта.
    /// Это своего рода набор инструментов с логированием и средствами описания layout памяти.
    /// </summary>
    IMemoryContext Context { get; }
}

/// <summary>
/// Представление памяти только для чтения — смотреть можно, менять нельзя.
/// </summary>
public interface IReadOnlyMemory : IMemoryReader
{
}

/// <summary>
/// Полнофункциональный API для работы с памятью — позволяет читать, писать, маппить и анализировать память в одном месте.
/// Именно этот интерфейс используют большинство инструментов и скриптов для полной работы с памятью.
/// </summary>
/// <remarks>
/// Объединяет чтение, запись, низкоуровневый backend-доступ и инструменты описания layout структур в одном интерфейсе.
/// </remarks>
public interface IMemory : IMemoryWriter, IMemoryBackend, IReadOnlyMemory, IMemoryMapper
{
}

/// <summary>
/// Позволяет записывать данные в память — например, сохранять новые значения в игре или менять поля в памяти.
/// Можно представить это как ручку для памяти: указываете адрес и записываете туда данные.
/// </summary>
public interface IMemoryWriter : IMemoryAccessor
{
    /// <summary>
    /// Пытается записать данные из span неуправляемого типа по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для записи.</typeparam>
    /// <param name="addr">Целевой адрес памяти для записи.</param>
    /// <param name="source">Span с данными, которые нужно записать.</param>
    /// <returns>
    /// <c>true</c>, если операция записи прошла успешно; иначе <c>false</c>.
    /// </returns>
    /// <remarks>
    /// Перед попыткой записи метод выполняет предварительные проверки длины данных и корректности адреса.
    /// Если количество записываемых байтов превышает заданный порог, в лог записывается предупреждение.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// // Пример: записать массив из 10 целых чисел по конкретному адресу памяти.
    /// Span&lt;int&gt; data = stackalloc int[10] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    /// bool success = memoryAccessor.TryWrite(new IntPtr(0x12345678), data);
    /// if (!success)
    /// {
    ///     // Обработать ошибку (например, записать её в лог или выбросить исключение).
    /// }
    /// </code>
    /// </example>
    public bool TryWrite<T>(IntPtr addr, ReadOnlySpan<T> source) where T : unmanaged;

    /// <summary>
    /// Пытается записать span управляемых структур по указанному адресу памяти, используя семантику marshaling.
    /// </summary>
    /// <typeparam name="T">
    /// Тип структуры для записи. Должен быть value type с явным или последовательным layout и совместимый с правилами marshaling.
    /// </typeparam>
    /// <param name="addr">Целевой адрес памяти во внешнем процессе или регионе памяти.</param>
    /// <param name="source">Span с данными, которые нужно маршалить и записать.</param>
    /// <returns>
    /// <c>true</c>, если операция записи прошла успешно; иначе <c>false</c>.
    /// </returns>
    /// <remarks>
    /// Каждый элемент <paramref name="source"/> маршалится в unmanaged-представление с помощью <see cref="System.Runtime.InteropServices.StructureToPtr"/>. 
    /// Это поддерживает неблиттабельные типы с <see cref="System.Runtime.InteropServices.MarshalAsAttribute"/>, включая массивы фиксированного размера и строки.
    /// <para>
    /// Метод предполагает, что layout памяти <typeparamref name="T"/> точно соответствует целевому процессу. Если layout не совпадает,
    /// поведение не определено и может привести к повреждению памяти.
    /// </para>
    /// <para>
    /// Если общий объём данных превышает заранее заданный порог, буфер выделяется в куче, и в лог может быть записано предупреждение.
    /// </para>
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    /// struct MyStruct
    /// {
    ///     public int Id;
    ///     [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
    ///     public string Name;
    /// }
    ///
    /// Span&lt;MyStruct&gt; data = stackalloc MyStruct[2];
    /// data[0] = new MyStruct { Id = 1, Name = "Alpha" };
    /// data[1] = new MyStruct { Id = 2, Name = "Beta" };
    ///
    /// bool success = memoryAccessor.TryWriteManaged(new IntPtr(0x12345678), data);
    /// </code>
    /// </example>
    bool TryWriteManaged<T>(IntPtr addr, ReadOnlySpan<T> source) where T : struct;

    /// <summary>
    /// Записывает одно значение неуправляемого типа по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для записи.</typeparam>
    /// <param name="addr">Целевой адрес памяти.</param>
    /// <param name="value">Значение для записи.</param>
    void Write<T>(IntPtr addr, T value) where T : unmanaged;

    /// <summary>
    /// Записывает массив неуправляемых значений по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для записи.</typeparam>
    /// <param name="addr">Целевой адрес памяти.</param>
    /// <param name="value">Массив значений для записи.</param>
    void Write<T>(IntPtr addr, T[] value) where T : unmanaged;

    /// <summary>
    /// Записывает массив байтов по указанному адресу памяти.
    /// </summary>
    /// <param name="addr">Целевой адрес памяти.</param>
    /// <param name="source">Массив байтов для записи.</param>
    void Write(IntPtr addr, byte[] source);

    /// <summary>
    /// Записывает указанную UTF8-строку (с null-терминатором) по указанному адресу памяти.
    /// </summary>
    /// <param name="addr">Целевой адрес памяти.</param>
    /// <param name="text">Строка для записи.</param>
    void WriteString(IntPtr addr, string text);
}

/// <summary>
/// Предоставляет методы для чтения различных типов данных из unmanaged-памяти.
/// Обычно используется для низкоуровневого доступа к памяти при отладке игр, моддинге и reverse engineering.
/// </summary>
public interface IMemoryReader : IMemoryAccessor
{
    /// <summary>
    /// Пытается прочитать span неуправляемых элементов по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип данных для чтения (например, <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">Адрес памяти (указатель), из которого выполняется чтение.</param>
    /// <param name="target">Span, который будет заполнен прочитанными данными.</param>
    /// <returns><c>true</c>, если чтение прошло успешно; иначе <c>false</c>.</returns>
    /// <remarks>
    /// Этот метод безопаснее сырых чтений, так как избегает исключений и вместо этого возвращает флаг ошибки.
    /// Его часто используют для чтения структурированных данных, например координат игрока или состояния игры.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// Span&lt;float&gt; position = stackalloc float[3];
    /// if (memoryReader.TryRead(new IntPtr(0x1234ABCD), position))
    /// {
    ///     Console.WriteLine($"X={position[0]}, Y={position[1]}, Z={position[2]}");
    /// }
    /// </code>
    /// </example>
    bool TryRead<T>(IntPtr addr, Span<T> target) where T : unmanaged;
    
    /// <summary>
    /// Пытается прочитать один неуправляемый элемент по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип данных для чтения (например, <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">Адрес памяти (указатель), из которого выполняется чтение.</param>
    /// <param name="target">Переменная, в которую будет записано прочитанное значение.</param>
    /// <returns><c>true</c>, если чтение прошло успешно; иначе <c>false</c>.</returns>
    /// <remarks>
    /// Этот метод безопаснее сырых чтений, так как избегает исключений и вместо этого возвращает флаг ошибки.
    /// Его часто используют для чтения структурированных данных, например координат игрока или состояния игры.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// Span&lt;float&gt; position = stackalloc float[3];
    /// if (memoryReader.TryRead(new IntPtr(0x1234ABCD), position))
    /// {
    ///     Console.WriteLine($"X={position[0]}, Y={position[1]}, Z={position[2]}");
    /// }
    /// </code>
    /// </example>
    bool TryRead<T>(IntPtr addr, out T target) where T : unmanaged;
    
    /// <summary>
    /// Пытается прочитать span неуправляемых элементов по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип данных для чтения (например, <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">Адрес памяти (указатель), из которого выполняется чтение.</param>
    /// <param name="target">Span, который будет заполнен прочитанными данными.</param>
    /// <returns><c>true</c>, если чтение прошло успешно; иначе <c>false</c>.</returns>
    /// <remarks>
    /// Этот метод безопаснее сырых чтений, так как избегает исключений и вместо этого возвращает флаг ошибки.
    /// Его часто используют для чтения структурированных данных, например координат игрока или состояния игры.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// Span&lt;float&gt; position = stackalloc float[3];
    /// if (memoryReader.TryRead(new IntPtr(0x1234ABCD), position))
    /// {
    ///     Console.WriteLine($"X={position[0]}, Y={position[1]}, Z={position[2]}");
    /// }
    /// </code>
    /// </example>
    bool TryRead<T>(long addr, Span<T> target) where T : unmanaged;
    
    /// <summary>
    /// Пытается прочитать один неуправляемый элемент по указанному адресу памяти.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип данных для чтения (например, <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">Адрес памяти (указатель), из которого выполняется чтение.</param>
    /// <param name="target">Переменная, в которую будет записано прочитанное значение.</param>
    /// <returns><c>true</c>, если чтение прошло успешно; иначе <c>false</c>.</returns>
    /// <remarks>
    /// Этот метод безопаснее сырых чтений, так как избегает исключений и вместо этого возвращает флаг ошибки.
    /// Его часто используют для чтения структурированных данных, например координат игрока или состояния игры.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// Span&lt;float&gt; position = stackalloc float[3];
    /// if (memoryReader.TryRead(new IntPtr(0x1234ABCD), position))
    /// {
    ///     Console.WriteLine($"X={position[0]}, Y={position[1]}, Z={position[2]}");
    /// }
    /// </code>
    /// </example>
    bool TryRead<T>(long addr, out T target) where T : unmanaged;

    /// <summary>
    /// Пытается прочитать span маршалируемых структур по указанному адресу памяти в управляемую память.
    /// </summary>
    /// <typeparam name="T">
    /// Тип структуры для чтения из памяти. Должен быть value type с явным объявлением layout (например, <see cref="StructLayoutAttribute"/>)
    /// и может включать атрибуты marshaling, такие как <see cref="MarshalAsAttribute"/>.
    /// </typeparam>
    /// <param name="addr">Базовый адрес памяти, из которого выполняется чтение. Это должен быть корректный адрес в целевом процессе.</param>
    /// <param name="target">
    /// Span типа <typeparamref name="T"/>, который будет заполнен прочитанными из памяти данными. 
    /// Длина span определяет, сколько структур будет прочитано.
    /// </param>
    /// <returns>
    /// <c>true</c>, если все данные были успешно прочитаны и маршалированы; иначе <c>false</c>.
    /// </returns>
    /// <remarks>
    /// Этот метод позволяет читать сложные структуры, которые не являются строго unmanaged (например, содержат массивы фиксированного размера или используют <see cref="MarshalAsAttribute"/>),
    /// применяя API <see cref="Marshal.PtrToStructure{T}(IntPtr)"/> к каждому элементу по отдельности. Хотя метод гибче, чем <see cref="TryRead{T}"/>,
    /// он также заметно медленнее и создаёт дополнительную нагрузку из-за выделений памяти.
    ///
    /// Внутри метод сначала читает весь буфер байтов во временный буфер (размещённый на стеке, если он небольшой),
    /// а затем проходит по нему и выполняет unmarshaling каждой структуры по отдельности. Для производительного кода,
    /// работающего с простыми unmanaged-типами, лучше использовать <see cref="TryRead{T}"/>.
    ///
    /// Для безопасного использования тип <typeparamref name="T"/> должен быть помечен <see cref="StructLayout(LayoutKind.Sequential)"/>
    /// и не должен содержать полей ссылочных типов, кроме массивов фиксированного размера или blittable-структур.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// [StructLayout(LayoutKind.Sequential)]
    /// public struct MyStruct
    /// {
    ///     public int Id;
    ///     
    ///     [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
    ///     public byte[] Flags;
    /// }
    ///
    /// Span&lt;MyStruct&gt; values = stackalloc MyStruct[2];
    /// bool success = memoryReader.TryReadManaged(new IntPtr(0x500000), values);
    /// if (success)
    /// {
    ///     Console.WriteLine($"First ID = {values[0].Id}");
    /// }
    /// </code>
    /// </example>
    bool TryReadManaged<T>(IntPtr addr, Span<T> target) where T : struct;

    /// <summary>
    /// Читает один управляемый элемент по адресу типа IntPtr.
    /// </summary>
    /// <typeparam name="T">Управляемый тип для чтения.</typeparam>
    /// <param name="addr">Адрес, из которого выполняется чтение.</param>
    /// <returns>Значение, прочитанное из памяти.</returns>
    T ReadManaged<T>(IntPtr addr) where T : struct;

    /// <summary>
    /// Читает один управляемый элемент по адресу типа long.
    /// </summary>
    /// <typeparam name="T">Управляемый тип для чтения.</typeparam>
    /// <param name="addr">Адрес, из которого выполняется чтение.</param>
    /// <returns>Значение, прочитанное из памяти.</returns>
    T ReadManaged<T>(long addr) where T : struct;

    /// <summary>
    /// Читает массив байтов по указанному адресу памяти.
    /// </summary>
    /// <param name="addr">Адрес памяти (IntPtr), из которого выполняется чтение.</param>
    /// <param name="size">Количество байтов для чтения.</param>
    /// <returns>Массив байтов, прочитанный из памяти.</returns>
    /// <exception cref="ArgumentException">Выбрасывается, если адрес недопустим или недоступен.</exception>
    byte[] Read(IntPtr addr, int size);

    /// <summary>
    /// Читает массив байтов по 64-битному адресу (long).
    /// </summary>
    /// <param name="addr">64-битный адрес, из которого выполняется чтение.</param>
    /// <param name="size">Количество байтов для чтения.</param>
    /// <returns>Массив байтов, прочитанный из памяти.</returns>
    /// <remarks>
    /// Эта перегрузка полезна, когда адреса передаются как значения long (например, из внешних инструментов или при арифметике указателей).
    /// </remarks>
    byte[] Read(long addr, int size);

    /// <summary>
    /// Читает один неуправляемый элемент по адресу IntPtr.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения.</typeparam>
    /// <param name="addr">Адрес, из которого выполняется чтение.</param>
    /// <returns>Значение, прочитанное из памяти.</returns>
    T Read<T>(IntPtr addr) where T : unmanaged;

    /// <summary>
    /// Читает один неуправляемый элемент по 64-битному адресу.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения.</typeparam>
    /// <param name="addr">Адрес памяти.</param>
    /// <returns>Значение, прочитанное из памяти.</returns>
    /// <remarks>
    /// Используйте это для чтения значений вроде здоровья игрока или количества патронов по известным адресам.
    /// </remarks>
    T Read<T>(long addr) where T : unmanaged;

    /// <summary>
    /// Читает значение типа <typeparamref name="T"/>, проходя по 64-битной цепочке указателей, начиная с указанного адреса.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения из памяти.</typeparam>
    /// <param name="addr">Начальный адрес памяти (64-битный указатель).</param>
    /// <param name="offsets">Массив смещений для прохода по цепочке указателей, где последнее смещение указывает на целевое значение.</param>
    /// <returns>Значение типа <typeparamref name="T"/>, прочитанное из памяти.</returns>
    T ReadPointerChain<T>(IntPtr addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Читает значение типа <typeparamref name="T"/>, проходя по 64-битной цепочке указателей, начиная с указанного адреса.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения из памяти.</typeparam>
    /// <param name="addr">Начальный адрес памяти (как 64-битное целое число).</param>
    /// <param name="offsets">Массив смещений для прохода по цепочке указателей, где последнее смещение указывает на целевое значение.</param>
    /// <returns>Значение типа <typeparamref name="T"/>, прочитанное из памяти.</returns>
    T ReadPointerChain<T>(long addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Читает значение типа <typeparamref name="T"/>, проходя по 32-битной цепочке указателей, начиная с указанного адреса.
    /// Предназначено для целей с 32-битной шириной указателя.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения из памяти.</typeparam>
    /// <param name="addr">Начальный адрес памяти (в контексте 32-битных указателей).</param>
    /// <param name="offsets">Массив смещений для прохода по цепочке указателей, где последнее смещение указывает на целевое значение.</param>
    /// <returns>Значение типа <typeparamref name="T"/>, прочитанное из памяти.</returns>
    T ReadPointerChain32<T>(IntPtr addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Читает значение типа <typeparamref name="T"/>, проходя по 32-битной цепочке указателей, начиная с указанного адреса.
    /// Предназначено для целей с 32-битной шириной указателя.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения из памяти.</typeparam>
    /// <param name="addr">Начальный адрес памяти (как 64-битное целое, представляющее 32-битный адрес).</param>
    /// <param name="offsets">Массив смещений для прохода по цепочке указателей, где последнее смещение указывает на целевое значение.</param>
    /// <returns>Значение типа <typeparamref name="T"/>, прочитанное из памяти.</returns>
    T ReadPointerChain32<T>(long addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Читает массив неуправляемых элементов по указанному адресу IntPtr.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения.</typeparam>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="size">Количество элементов типа <typeparamref name="T"/> для чтения.</param>
    /// <returns>Массив прочитанных элементов.</returns>
    T[] Read<T>(IntPtr addr, int size) where T : unmanaged;

    /// <summary>
    /// Читает массив неуправляемых элементов по 64-битному адресу.
    /// </summary>
    /// <typeparam name="T">Неуправляемый тип для чтения.</typeparam>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="size">Количество элементов типа <typeparamref name="T"/> для чтения.</param>
    /// <returns>Массив прочитанных элементов.</returns>
    /// <remarks>
    /// Эта перегрузка принимает адреса типа long, что часто используется при отладке игр при работе с 64-битным адресным пространством процесса.
    /// </remarks>
    T[] Read<T>(long addr, int size) where T : unmanaged;

    /// <summary>
    /// Читает ASCII-строку из памяти.
    /// </summary>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="length">Максимальная длина строки в символах (по умолчанию: 256).</param>
    /// <param name="replaceNull">Если true, заменяет null-терминаторы обрезкой строки.</param>
    /// <returns>Строка, прочитанная из памяти, или пустая строка, если чтение невозможно.</returns>
    string ReadStringA(long addr, int length = 256, bool replaceNull = true);

    /// <summary>
    /// Читает UTF-8 строку из памяти.
    /// </summary>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="length">Максимальная длина строки в символах (по умолчанию: 256).</param>
    /// <param name="replaceNull">Если true, заменяет null-терминаторы обрезкой строки.</param>
    /// <returns>Строка, прочитанная из памяти, или пустая строка, если чтение невозможно.</returns>
    string ReadString(long addr, int length = 256, bool replaceNull = true);

    /// <summary>
    /// Читает Unicode-строку (UTF-16) из памяти.
    /// </summary>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="lengthBytes">Максимальная длина в байтах (по умолчанию: 256).</param>
    /// <param name="replaceNull">Если true, обрезает строку по первому null-символу.</param>
    /// <returns>Unicode-строка, прочитанная из памяти, или пустая строка, если чтение невозможно.</returns>
    string ReadStringU(long addr, int lengthBytes = 256, bool replaceNull = true);

    /// <summary>
    /// Читает массив байтов по 64-битному адресу.
    /// </summary>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="size">Количество байтов для чтения.</param>
    /// <returns>Массив байтов, прочитанный из памяти.</returns>
    byte[] ReadBytes(long addr, int size);

    /// <summary>
    /// Читает массив байтов по 64-битному адресу с поддержкой больших размеров.
    /// </summary>
    /// <param name="addr">Адрес памяти.</param>
    /// <param name="size">Количество байтов для чтения (long).</param>
    /// <returns>Массив байтов, прочитанный из памяти.</returns>
    /// <remarks>
    /// Используйте эту перегрузку при чтении больших регионов памяти (например, целых снимков состояния игры).
    /// </remarks>
    byte[] ReadBytes(long addr, long size);

    /// <summary>
    /// Читает массив указателей (адресов) из памяти между указанными начальным и конечным адресами.
    /// </summary>
    /// <param name="startAddress">Начальный адрес памяти.</param>
    /// <param name="endAddress">Конечный адрес памяти.</param>
    /// <param name="offset">Смещение в байтах между элементами (по умолчанию: 8 для 64-битных указателей).</param>
    /// <returns>Список указателей (адресов), прочитанных из указанного диапазона.</returns>
    /// <example>
    /// <code language="csharp">
    /// IList&lt;long&gt; pointers = memoryReader.ReadPointersArray(0x1000, 0x2000);
    /// foreach (var ptr in pointers)
    /// {
    ///     Console.WriteLine($"Pointer: 0x{ptr:X}");
    /// }
    /// </code>
    /// </example>
    IList<long> ReadPointersArray(long startAddress, long endAddress, int offset = 8);
}

/// <summary>
/// Представляет информацию о загруженном модуле (DLL, EXE и т. д.) внутри процесса.
/// Обычно используется в инструментах анализа процессов и отладки для изучения layout памяти.
/// </summary>
public readonly record struct ProcessModuleInformation
{
    /// <summary>
    /// Возвращает или задаёт имя модуля (например, "kernel32.dll").
    /// </summary>
    /// <remarks>
    /// Это значение может быть <c>null</c>, если имя модуля недоступно или не удалось его определить.
    /// </remarks>
    public string? ModuleName { get; init; }

    /// <summary>
    /// Возвращает или задаёт полный путь к файлу модуля на диске.
    /// </summary>
    /// <remarks>
    /// Это значение может быть <c>null</c>, если путь к модулю недоступен (например, для динамически сгенерированных модулей).
    /// </remarks>
    public string? FilePath { get; init; }

    /// <summary>
    /// Возвращает или задаёт базовый адрес, по которому модуль загружен в память процесса.
    /// </summary>
    /// <remarks>
    /// Можно использовать для вычисления относительных смещений внутри модуля (например, при патчинге памяти).
    /// </remarks>
    public IntPtr BaseAddress { get; init; }

    /// <summary>
    /// Возвращает или задаёт размер загруженного модуля в памяти (в байтах).
    /// </summary>
    /// <remarks>
    /// Полезно для проверки диапазонов адресов внутри модуля.
    /// </remarks>
    public int Size { get; init; }

    /// <summary>
    /// Возвращает строковое представление информации о модуле, включая значения, отличающиеся от значений по умолчанию.
    /// </summary>
    /// <returns>Отформатированная строка с ключевыми значениями свойств.</returns>
    public override string ToString()
    {
        var toString = new ToStringBuilder(nameof(ProcessModuleInformation));
        toString.AppendParameterIfNotDefault(nameof(ModuleName), ModuleName);
        toString.AppendParameterIfNotDefault(nameof(FilePath), FilePath);
        toString.AppendParameter(nameof(BaseAddress), BaseAddress.ToHexadecimal());
        toString.AppendParameter(nameof(Size), Size);
        return toString.ToString();
    }
}

/// <summary>
/// Представляет информацию о запущенном процессе.
/// Полезно для идентификации процессов при подключении отладчиков или выполнении сканирования памяти.
/// </summary>
public readonly record struct ProcessInformation
{
    /// <summary>
    /// Возвращает или задаёт имя процесса (например, "explorer", "game.exe").
    /// </summary>
    /// <remarks>
    /// Это значение обычно извлекается из системной таблицы процессов.
    /// </remarks>
    public string ProcessName { get; init; }

    /// <summary>
    /// Возвращает или задаёт уникальный идентификатор процесса (PID).
    /// </summary>
    /// <remarks>
    /// Используйте этот ID при подключении к процессу или запросах к системным API.
    /// </remarks>
    public int Id { get; init; }
}

/// <summary>
/// Представляет метаданные об одной записи экспорта в таблице каталога экспортов модуля,
/// как это определено форматом PE (Portable Executable).
/// </summary>
/// <remarks>
/// Эта структура обычно извлекается путём разбора Export Directory Table PE-файла
/// с использованием DOS- и NT-заголовков для поиска и интерпретации таблицы экспортов. Она включает
/// как именованные, так и ordinal-only экспорты, а также может представлять форвардные экспорты.
/// </remarks>
public readonly record struct ModuleExportEntry
{
    /// <summary>
    /// Имя экспортируемого символа, если оно доступно.
    /// Может быть <c>null</c> для ordinal-only экспортов (то есть экспортов без имени, на которые ссылаются только по ordinal number).
    /// 
    /// Это сырое имя экспорта в том виде, в каком оно присутствует в PE-таблице экспортов.
    /// Оно может быть:
    /// - обычным именем в стиле C (например, "DllMain", "Direct3DCreate9")
    /// - декорированным именем символа C++ (mangled, например, "?GEngine@@3PAVUGameEngine@@A")
    /// - форвардным экспортом (например, "kernel32.dll!HeapAlloc")
    /// 
    /// Используйте это при прямой работе с разбором PE или когда нужен точный текст символа, как он определён в DLL.
    /// </summary>
    public string? ExportName { get; init; }

    /// <summary>
    /// Недекорированная (demangled) версия имени экспорта, если применимо.
    /// Обычно доступна для символов, скомпилированных MSVC и mangled по формату декорирования имён Microsoft C++.
    /// Может быть <c>null</c> для символов, которые не были mangled или экспортируются только по ordinal.
    ///
    /// Это особенно полезно для экспортов C++, где mangled-имя трудно читать человеку.
    /// 
    /// Примеры:
    /// - ?GCache@@3VFMemCache@@A     → class FMemCache GCache
    /// - ??0AAIController@@QAE@XZ    → public: __thiscall AAIController::AAIController(void)
    /// - ??_7AActor@@6B@             → const AActor::`vftable'
    /// - ?StaticClass@UGameEngine@@SAPAVUClass@@XZ → public: static class UClass * __cdecl UGameEngine::StaticClass(void)
    /// 
    /// Это можно использовать, чтобы:
    /// - показывать читаемые имена в инструментах или UI для reverse engineering
    /// - находить vtable, статические поля или указатели на глобальные объекты
    /// - распознавать паттерны вроде функций StaticClass или глобальных singleton-объектов (например, GEngine)
    /// </summary>
    public string? UnDecoratedExportName { get; init; }

    /// <summary>
    /// Порядковый номер экспорта относительно ordinal base модуля.
    /// </summary>
    public ushort Ordinal { get; init; }

    /// <summary>
    /// Relative Virtual Address (RVA) экспорта внутри модуля.
    /// </summary>
    /// <remarks>
    /// Это адрес относительно базы модуля, на который указывает запись экспорта.
    /// Если <see cref="IsForwarder"/> равно <c>true</c>, этот RVA указывает на строку форвардера, а не на код.
    /// </remarks>
    public uint RVA { get; init; }

    /// <summary>
    /// Указывает, является ли этот экспорт форвардером на символ другого модуля.
    /// </summary>
    public bool IsForwarder { get; init; }

    /// <summary>
    /// Если этот экспорт является форвардером, здесь содержится строка имени форвардера (например, "KERNEL32.Sleep").
    /// Иначе — <c>null</c>.
    /// </summary>
    public string? ForwarderName { get; init; }

    /// <summary>
    /// Индекс экспорта в Export Address Table (EAT) модуля.
    /// </summary>
    public int ExportAddressTableIndex { get; init; }

    /// <summary>
    /// Индекс в Name Pointer Table модуля (используется для бинарного поиска по имени).
    /// </summary>
    public int NamePointerIndex { get; init; }

    public override string ToString()
    {
        var builder = new ToStringBuilder("PEExport");
        builder.AppendParameter(nameof(Ordinal), Ordinal);
        builder.AppendParameter(nameof(ExportName), ExportName);
        builder.AppendParameter(nameof(RVA), $"{RVA.ToHexadecimal()} ({RVA})");
        builder.AppendParameter(nameof(UnDecoratedExportName), UnDecoratedExportName);
        builder.AppendParameter(nameof(IsForwarder), IsForwarder);
        builder.AppendParameter(nameof(ForwarderName), ForwarderName);
        builder.AppendParameter(nameof(ExportAddressTableIndex), ExportAddressTableIndex);
        builder.AppendParameter(nameof(NamePointerIndex), NamePointerIndex);
        return builder.ToString();
    }
}


/// <summary>
/// Backend — это низкоуровневый движок, который фактически читает из памяти и пишет в неё.
/// Можно представить его как сырой драйвер памяти — он знает, как получить или сохранить байты по конкретным адресам.
/// </summary>
public interface IMemoryBackend : IDisposable, IMemorySpan
{
    /// <summary>
    /// Проверяет, можно ли ещё использовать этот источник памяти.
    /// Например, запущен ли ещё целевой процесс или память всё ещё отображена.
    /// </summary>
    bool IsValid { get; }

    /// <summary>
    /// Пытается прочитать сырые байты из памяти в буфер.
    /// Вы передаёте адрес и span для заполнения, а метод пытается поместить туда содержимое памяти.
    /// </summary>
    /// <param name="address">Откуда начинать чтение (в целевой памяти).</param>
    /// <param name="target">Куда сохранять прочитанные байты (в вашей программе).</param>
    /// <returns><c>true</c>, если чтение прошло успешно; иначе <c>false</c>.</returns>
    bool TryReadMemory(IntPtr address, Span<byte> target);

    /// <summary>
    /// Пытается записать сырые байты из буфера в память.
    /// Вы передаёте адрес и набор байтов, а метод пытается скопировать их в целевую память.
    /// </summary>
    /// <param name="address">Куда начинать запись (в целевую память).</param>
    /// <param name="source">Байты, которые нужно записать (из вашей программы).</param>
    /// <returns><c>true</c>, если запись прошла успешно; иначе <c>false</c>.</returns>
    bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source);
}


/// <summary>
/// Это можно представить как карту, которая показывает, где в памяти находится каждое поле вашей структуры.
/// У неё можно узнать, что это за поле, как оно называется, где начинается (offset) и каков размер всей структуры.
/// </summary>
public interface IMemoryMapper
{
    /// <summary>
    /// Для поля вроде <c>x => x.Health</c> возвращает всю информацию об этом поле (тип, имя и т. д.).
    /// </summary>
    /// <typeparam name="T">Тип структуры или класса, которому принадлежит поле.</typeparam>
    /// <param name="expr">Выражение, указывающее на поле (например, <c>x => x.Health</c>).</param>
    /// <returns>Информация о поле (в виде <see cref="FieldInfo"/>).</returns>
    FieldInfo FieldOf<T>(Expression<Func<T, object>> expr);

    /// <summary>
    /// Просто возвращает имя поля, например "Health", из <c>x => x.Health</c>.
    /// </summary>
    /// <typeparam name="T">Тип структуры или класса, которому принадлежит поле.</typeparam>
    /// <param name="expr">Выражение, указывающее на поле.</param>
    /// <returns>Имя поля в виде строки.</returns>
    string NameOf<T>(Expression<Func<T, object>> expr);

    /// <summary>
    /// Показывает, на сколько байт от начала структуры расположено это поле.
    /// Полезно при чтении и записи сырой памяти.
    /// </summary>
    /// <typeparam name="T">Тип структуры или класса.</typeparam>
    /// <param name="expr">Выражение, указывающее на поле.</param>
    /// <returns>Смещение поля (в байтах).</returns>
    int OffsetOf<T>(Expression<Func<T, object>> expr);

    /// <summary>
    /// Показывает, сколько байт занимает вся структура в памяти.
    /// </summary>
    /// <typeparam name="T">Тип структуры или класса.</typeparam>
    /// <returns>Общий размер в байтах.</returns>
    int SizeOf<T>();

    void Write<T>(T value, Span<byte> destination) where T : unmanaged;
}


/// <summary>
/// Представляет дескриптор запущенного процесса. 
/// Даёт доступ к высокоуровневой информации о процессе и возможности исследовать его память.
/// </summary>
public interface IProcess : IDisposable
{
    /// <summary>
    /// Интерфейс логирования для записи отладочной информации, предупреждений и ошибок во время операций с памятью.
    /// </summary>
    IFluentLog Log { get; }

    /// <summary>
    /// Указывает, что дескриптор процесса всё ещё корректен и пригоден к использованию.
    /// </summary>
    bool IsValid { get; }

    /// <summary>
    /// Имя целевого процесса (например, "game.exe").
    /// </summary>
    string? ProcessName { get; }

    /// <summary>
    /// Системный Process ID (PID) целевого процесса.
    /// </summary>
    int ProcessId { get; }

    /// <summary>
    /// Предоставляет низкоуровневый доступ к памяти процесса (чтение/запись, разрешение указателей, сканирование регионов).
    /// </summary>
    /// <remarks>
    /// Это точка входа для чтения/записи памяти и разрешения адресов по экспортам или символам.
    /// </remarks>
    IProcessMemory Memory { get; }

    /// <summary>
    /// Возвращает список всех модулей (DLL и EXE), загруженных в процессе.
    /// </summary>
    /// <returns>Информация о загруженных модулях, включая имена, базовые адреса и размеры.</returns>
    IReadOnlyList<ProcessModuleInformation> GetProcessModules();
}


/// <summary>
/// Даёт полный доступ к памяти процесса — как будто у вас есть карта всего, что процесс может видеть.
/// Вы можете читать и писать память в любой точке адресного пространства процесса.
/// </summary>
/// <remarks>
/// Используйте это для глобальных операций с памятью, например:
/// - чтения игровых данных по известным адресам,
/// - прохода по цепочкам указателей,
/// - разрешения экспортируемых символов (например, "GEngine" или "UWorld"),
/// - или сканирования регионов памяти.
/// 
/// Это основной интерфейс для исследования и изменения памяти запущенного процесса.
/// </remarks>
public interface IProcessMemory : IMemory
{
    /// <summary>
    /// Низкоуровневый движок, который выполняет фактические операции чтения/записи в памяти.
    /// Обычно вам не нужно использовать его напрямую, если только вы не создаёте собственные инструменты для работы с памятью.
    /// </summary>
    IMemoryBackend Backend { get; }
    
    /// <summary>
    /// Заменяет backend памяти, используемый для низкоуровневых операций с памятью.
    /// </summary>
    /// <param name="backend">Новый backend памяти для использования.</param>
    /// <remarks>
    /// Это позволяет внедрять собственное поведение на уровне сырого доступа к памяти — 
    /// например, добавлять логирование, кеширование, повторы, batching или перенаправлять чтение памяти на эмулируемый либо тестовый источник.
    /// 
    /// Используйте с осторожностью: замена backend влияет на все последующие операции чтения и записи.
    /// </remarks>
    void UseMemoryBackend(IMemoryBackend backend);
}


/// <summary>
/// Эта версия карты памяти позволяет также изменять саму карту.
/// Например, если после обновления игры поле сместилось на новую позицию, вы можете указать mapper использовать новый offset.
/// </summary>
public interface ICustomMemoryMapper : IMemoryMapper
{
    /// <summary>
    /// Сообщает mapper, что конкретное поле теперь начинается с нового смещения в памяти.
    /// </summary>
    /// <param name="member">Поле, которое нужно обновить.</param>
    /// <param name="offset">Новое смещение в байтах от начала структуры.</param>
    void SetOffset(FieldInfo member, int offset);

    /// <summary>
    /// То же самое, что <see cref="SetOffset"/>, но позволяет указать поле выражением вида <c>x => x.Health</c>.
    /// </summary>
    /// <typeparam name="T">Тип, которому принадлежит поле.</typeparam>
    /// <param name="expr">Выражение, указывающее на поле, которое нужно обновить.</param>
    /// <param name="offset">Новое смещение в байтах.</param>
    void SetOffset<T>(Expression<Func<T, object>> expr, int offset);
}


public interface IConfigurableMemoryContext : IMemoryContext
{
    /// <summary>
    /// Настраивает пул памяти, используемый для временных буферов при операциях с памятью.
    /// </summary>
    /// <param name="memoryPool">Пул памяти для выделения временных byte-буферов.</param>
    /// <remarks>
    /// Это позволяет продвинутым пользователям подключать собственный <see cref="ArrayPool{T}"/> для эффективного повторного использования буферов,
    /// что особенно полезно при частом или объёмном чтении/записи памяти, требующем временных выделений.
    /// 
    /// Переданный пул памяти будет использоваться во внутренних операциях, например при marshaling структур или декодировании строк из памяти.
    /// </remarks>
    void UseMemoryPool(ArrayPool<byte> memoryPool);

    /// <summary>
    /// Устанавливает пользовательский <see cref="IMemoryMapper"/> для разрешения смещений полей структур и их размеров.
    /// </summary>
    /// <param name="mapper">Memory mapper, используемый для интерпретации layout памяти.</param>
    /// <remarks>
    /// Используйте это, чтобы внедрить общий или заранее настроенный mapper, который определяет смещения полей,
    /// размеры структур и layout памяти без необходимости пересоздавать их каждый раз.
    /// </remarks>
    void UseMemoryMapper(IMemoryMapper mapper);
}


public static class ProcessExtensions
{
    /// <summary>
    /// Заменяет текущий memory mapper на новый редактируемый mapper (то есть <see cref="ICustomMemoryMapper"/>).
    /// </summary>
    /// <param name="process">Процесс, с памятью которого мы будем работать</param>
    /// <returns>
    /// Новый экземпляр <see cref="ICustomMemoryMapper"/>, который можно использовать для переопределения смещений полей и layout структур.
    /// </returns>
    /// <remarks>
    /// Это полезно, если вы хотите программно определять или корректировать layout структур во время выполнения,
    /// особенно в сценариях reverse engineering или моддинга, где смещения полей отличаются между версиями.
    /// </remarks>
    public static ICustomMemoryMapper UseCustomMemoryMapper(this IProcess process)
    {
        var newMapper = new CustomMemoryMapper();
        UseMemoryMapper(process, newMapper);
        return newMapper;
    }
    
    /// <summary>
    /// Заменяет текущий memory mapper на новый редактируемый mapper (то есть <see cref="ICustomMemoryMapper"/>).
    /// </summary>
    /// <param name="process">Процесс, с памятью которого мы будем работать</param>
    /// <returns>
    /// Новый экземпляр <see cref="ICustomMemoryMapper"/>, который можно использовать для переопределения смещений полей и layout структур.
    /// </returns>
    /// <remarks>
    /// Это полезно, если вы хотите программно определять или корректировать layout структур во время выполнения,
    /// особенно в сценариях reverse engineering или моддинга, где смещения полей отличаются между версиями.
    /// </remarks>
    public static ICustomMemoryMapper UseCustomMemoryMapper32(this IProcess process)
    {
        var newMapper = new CustomMemoryMapper(4);
        UseMemoryMapper(process, newMapper);
        return newMapper;
    }

    /// <summary>
    /// Устанавливает пользовательский <see cref="IMemoryMapper"/> для разрешения смещений полей структур и их размеров.
    /// </summary>
    /// <param name="process">Процесс, с памятью которого мы будем работать</param>
    /// <param name="mapper">Memory mapper, используемый для интерпретации layout памяти.</param>
    /// <exception cref="NotSupportedException">
    /// Выбрасывается, если контекст <paramref name="process"/> не поддерживается.
    /// </exception>
    /// <remarks>
    /// Используйте это, чтобы внедрить общий или заранее настроенный mapper, который определяет смещения полей,
    /// размеры структур и layout памяти без необходимости пересоздавать их каждый раз.
    /// </remarks>
    public static void UseMemoryMapper(this IProcess process, IMemoryMapper mapper)
    {
        if (process.Memory.Context is not IConfigurableMemoryContext memoryContext)
        {
            throw new NotSupportedException($"Memory context is not supported - {process.Memory.Context}, process: {process}");
        }

        memoryContext.UseMemoryMapper(mapper);
    }
    
    /// <summary>
    /// Настраивает пул памяти, используемый для временных буферов при операциях с памятью.
    /// </summary>
    /// <param name="process">Целевой процесс, чей memory context будет обновлён.</param>
    /// <param name="memoryPool">Пул памяти для выделения временных byte-буферов.</param>
    /// <exception cref="NotSupportedException">
    /// Выбрасывается, если реализация memory context не поддерживает замену пула памяти.
    /// </exception>
    /// <remarks>
    /// Это позволяет продвинутым пользователям подключать собственный <see cref="ArrayPool{T}"/> для эффективного повторного использования буферов,
    /// что особенно полезно при частом или объёмном чтении/записи памяти, требующем временных выделений.
    /// 
    /// Переданный пул памяти будет использоваться во внутренних операциях, например при marshaling структур или декодировании строк из памяти.
    /// </remarks>
    public static void UseMemoryPool(this IProcess process, ArrayPool<byte> memoryPool)
    {
        if (process.Memory.Context is not IConfigurableMemoryContext memoryContext)
        {
            throw new NotSupportedException($"Memory context is not supported - {process.Memory.Context}, process: {process}");
        }

        memoryContext.UseMemoryPool(memoryPool);
    }
    
    /// <summary>
    ///     Пытается найти модуль, загруженный в целевой процесс, по его имени, возвращая и совпадение, и полный
    ///     список модулей.
    /// </summary>
    /// <param name="process">Процесс, модули которого будут запрошены.</param>
    /// <param name="moduleName">
    ///     Имя модуля для поиска (например, <c>"kernel32.dll"</c>), сравнение
    ///     выполняется без учёта регистра.
    /// </param>
    /// <param name="modules">
    ///     Возвращает полный список модулей, загруженных в процессе, независимо от того, найдено ли совпадение.
    /// </param>
    /// <param name="pmi">
    ///     Если метод возвращает <c>true</c>, содержит <see cref="ProcessModuleInformation" /> для найденного модуля.
    ///     Иначе этому значению присваивается значение по умолчанию.
    /// </param>
    /// <returns>
    ///     <c>true</c>, если в процессе найден модуль с указанным именем; иначе <c>false</c>.
    /// </returns>
    /// <remarks>
    ///     Этот метод выполняет сравнение базового имени каждого модуля без учёта регистра (то есть без пути к каталогу).
    ///     Полезно при диагностике или разрешении символов, когда может понадобиться fallback-логика.
    /// </remarks>
    /// <example>
    ///     <code>
    /// if (process.TryFindProcessModule("ntdll.dll", out var modules, out var module))
    /// {
    ///     Console.WriteLine($"Found: {module.ModuleName} at 0x{module.BaseAddress:X}");
    /// }
    /// else
    /// {
    ///     Console.WriteLine("Module not found.");
    /// }
    /// </code>
    /// </example>
    public static bool TryFindProcessModule(this IProcess process, string moduleName, out IReadOnlyList<ProcessModuleInformation> modules, out ProcessModuleInformation pmi)
    {
        modules = process.GetProcessModules();
        foreach (var module in modules)
        {
            if (string.Equals(module.ModuleName, moduleName, StringComparison.OrdinalIgnoreCase))
            {
                pmi = module;
                return true;
            }
        }

        pmi = default;
        return false;
    }

    /// <summary>
    ///     Пытается найти модуль, загруженный в процесс, по имени и вернуть его, если он найден.
    /// </summary>
    /// <param name="process">Процесс, в списке модулей которого будет выполняться поиск.</param>
    /// <param name="moduleName">Имя модуля для поиска (без учёта регистра).</param>
    /// <param name="pmi">
    ///     Если метод возвращает <c>true</c>, содержит соответствующий <see cref="ProcessModuleInformation" />; иначе —
    ///     значение по умолчанию.
    /// </param>
    /// <returns>
    ///     <c>true</c>, если модуль с указанным именем найден; иначе <c>false</c>.
    /// </returns>
    /// <remarks>
    ///     Это удобная перегрузка, которая не возвращает полный список модулей. Внутри она делегирует вызов полной
    ///     перегрузке
    ///     <see
    ///         cref="TryFindProcessModule(IProcess, string, out IReadOnlyList{ProcessModuleInformation}, out ProcessModuleInformation)" />.
    /// </remarks>
    /// <example>
    ///     <code>
    /// if (process.TryFindProcessModule("user32.dll", out var mod))
    /// {
    ///     Console.WriteLine($"Found at {mod.BaseAddress:X}, size: {mod.Size}");
    /// }
    /// </code>
    /// </example>
    public static bool TryFindProcessModule(this IProcess process, string moduleName, out ProcessModuleInformation pmi)
    {
        return TryFindProcessModule(process, moduleName, out var _, out pmi);
    }

    /// <summary>
    ///     Получает метаданные о загруженном модуле (DLL или EXE) внутри указанного процесса по его имени.
    /// </summary>
    /// <param name="process">Целевой процесс, чьи модули анализируются.</param>
    /// <param name="moduleName">Имя модуля для поиска (без учёта регистра, например <c>"kernel32.dll"</c>).</param>
    /// <returns>
    ///     Экземпляр <see cref="ProcessModuleInformation" />, описывающий модуль, включая базовый адрес, размер и пути.
    /// </returns>
    /// <exception cref="ArgumentException">
    ///     Выбрасывается, если в целевом процессе не найден модуль, соответствующий <paramref name="moduleName" />.
    /// </exception>
    /// <remarks>
    ///     Этот метод оборачивает <see cref="TryFindProcessModule" /> и выбрасывает исключение, если модуль не найден. Поиск
    ///     выполняется без учёта регистра
    ///     и основан на поле <c>BaseDllName</c>, а не на полном пути к файлу.
    /// </remarks>
    /// <example>
    ///     <code>
    /// var module = process.GetProcessModule("ntdll.dll");
    /// Console.WriteLine($"Base: 0x{module.BaseAddress:X}, Size: {module.Size} bytes");
    /// </code>
    /// </example>
    public static ProcessModuleInformation GetProcessModule(this IProcess process, string moduleName)
    {
        if (TryFindProcessModule(process, moduleName, out var modules, out var module))
        {
            return module;
        }

        throw new ArgumentException($"Could not find process module '{moduleName}', modules: {modules.Count}");
    }

    /// <summary>
    ///     Создаёт memory accessor, ограниченный регионом конкретного модуля внутри процесса.
    /// </summary>
    /// <param name="process">Процесс, содержащий модуль.</param>
    /// <param name="pmi">Метаданные модуля, включая базовый адрес и размер.</param>
    /// <returns>
    ///     Экземпляр <see cref="IMemory" />, который читает и пишет только в пределах памяти указанного модуля.
    /// </returns>
    /// <remarks>
    ///     Этот метод оборачивает регион памяти модуля proxy-backend'ом, который ограничивает доступ указанными базовым
    ///     адресом
    ///     и размером. Это особенно полезно для безопасного доступа к символам или заголовкам внутри загруженного модуля без риска
    ///     выхода за границы.
    /// </remarks>
    /// <example>
    ///     <code>
    /// var mod = process.GetProcessModule("user32.dll");
    /// var modMem = process.MemoryOfModule(mod);
    /// var dosHeader = modMem.Read&lt;IMAGE_DOS_HEADER&gt;(0);
    /// </code>
    /// </example>
    public static IMemory MemoryOfModule(this IProcess process, ProcessModuleInformation pmi)
    {
        var moduleName = string.IsNullOrEmpty(pmi.ModuleName) ? "<null>" : pmi.ModuleName;
        var backend = new MemoryProxyBackend(process.Memory, pmi.BaseAddress, pmi.Size, $"Module {moduleName}");
        return new MemoryAccessor(process.Memory.Context, backend);
    }

    /// <summary>
    ///     Создаёт memory accessor, ограниченный модулем внутри процесса, заданным по имени.
    /// </summary>
    /// <param name="process">Процесс для анализа.</param>
    /// <param name="moduleName">Имя модуля (например, <c>"ntdll.dll"</c>).</param>
    /// <returns>
    ///     Экземпляр <see cref="IMemory" />, ограниченный диапазоном адресов целевого модуля.
    /// </returns>
    /// <exception cref="ArgumentException">
    ///     Выбрасывается, если указанный модуль не найден в списке модулей процесса.
    /// </exception>
    /// <remarks>
    ///     Этот метод сначала находит модуль через <see cref="GetProcessModule(IProcess, string)" />, а затем создаёт
    ///     ограниченное представление памяти поверх адресного пространства модуля. Это полезно для разбора PE-структур или анализа
    ///     exports/imports в безопасных границах модуля.
    /// </remarks>
    /// <example>
    ///     <code>
    /// var memory = process.MemoryOfModule("kernelbase.dll");
    /// var peHeader = memory.Read&lt;IMAGE_NT_HEADERS64&gt;(memory.Read&lt;IMAGE_DOS_HEADER&gt;(0).e_lfanew);
    /// </code>
    /// </example>
    public static IMemory MemoryOfModule(this IProcess process, string moduleName)
    {
        var pmi = process.GetProcessModule(moduleName);
        return MemoryOfModule(process, pmi);
    }

    /// <summary>
    ///     Разбирает таблицу экспортов PE-образа (Portable Executable), загруженного в память, и возвращает подробную информацию
    ///     обо всех экспортируемых символах, включая как именованные, так и ordinal-only экспорты.
    /// </summary>
    /// <param name="memory">
    ///     Абстракция <see cref="IMemory" /> над памятью загруженного модуля. Она должна представлять корректный PE-образ,
    ///     начиная с его базового адреса (например, базы модуля в виртуальной памяти).
    /// </param>
    /// <returns>
    ///     Список записей <see cref="ModuleExportEntry" />, описывающих все экспорты, найденные в секции
    ///     <c>.edata</c> модуля. Сюда входят форвардеры, ordinal-only экспорты и именованные экспорты, если они есть.
    ///     Если у модуля нет таблицы экспортов, возвращается пустой список.
    /// </returns>
    /// <remarks>
    ///     <para>
    ///         Этот метод читает PE-заголовки (DOS + NT) и проходит по Export Directory Table в data directories
    ///         optional header'а. Он поддерживает форматы PE32 (32-bit) и PE32+ (64-bit), проверяя поле
    ///         OptionalHeader.Magic.
    ///     </para>
    ///     <para>
    ///         Экспортируемые символы формируются с использованием Export Address Table (EAT), Name Pointer Table и Ordinal Table.
    ///         Для каждого экспорта метод определяет:
    ///         <list type="bullet">
    ///             <item>
    ///                 <description>
    ///                     <see cref="ModuleExportEntry.Ordinal" />: ordinal экспорта относительно
    ///                     ordinal base модуля.
    ///                 </description>
    ///             </item>
    ///             <item>
    ///                 <description><see cref="ModuleExportEntry.ExportName" />: имя экспорта, если оно доступно.</description>
    ///             </item>
    ///             <item>
    ///                 <description><see cref="ModuleExportEntry.RVA" />: относительный виртуальный адрес экспорта.</description>
    ///             </item>
    ///             <item>
    ///                 <description>
    ///                     <see cref="ModuleExportEntry.IsForwarder" />: является ли экспорт форвардером на другую
    ///                     DLL.
    ///                 </description>
    ///             </item>
    ///             <item>
    ///                 <description>
    ///                     <see cref="ModuleExportEntry.ForwarderName" />: строка форвардера, если применимо (например,
    ///                     <c>ADVAPI32.CryptEncrypt</c>).
    ///                 </description>
    ///             </item>
    ///         </list>
    ///     </para>
    ///     <para>
    ///         Метод предполагает, что все указатели, основанные на RVA, корректны и отображены в текущем контексте
    ///         <paramref name="memory" />.
    ///         Некорректные или повреждённые таблицы экспортов могут привести к неправильным данным или пропуску некоторых записей.
    ///         Определение форвардеров выполняется
    ///         путём проверки, попадает ли RVA функции в регион каталога экспортов.
    ///     </para>
    /// </remarks>
    /// <example>
    ///     Пример использования:
    ///     <code>
    /// var exports = memoryAccessor.ReadExports();
    /// foreach (var export in exports)
    /// {
    ///     Console.WriteLine($"{export.ExportName ?? "(ordinal-only)"}: RVA = 0x{export.RVA:X}, Ordinal = {export.Ordinal}");
    /// }
    /// </code>
    /// </example>
    public static IReadOnlyList<ModuleExportEntry> ReadExports(this IMemory memory);
}
```