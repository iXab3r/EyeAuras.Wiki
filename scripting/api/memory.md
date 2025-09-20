---
title: Memory API
description: 
published: true
date: 2025-09-20T21:17:57.774Z
tags: 
editor: markdown
dateCreated: 2025-09-20T21:17:57.774Z
---

```csharp

/// <summary>
/// Context is describing HOW to work with memory and provides additional utilities
/// Represents a shared context used for working with memory inside a script.
/// This is like a toolbox that gives you logging, memory layout tools and other global utility functions.
/// </summary>
public interface IMemoryContext
{
    /// <summary>
    /// Lets you log messages from your script (like debug info or errors).
    /// </summary>
    /// <value>An instance of <see cref="IFluentLog"/> for logging memory-related messages.</value>
    /// <remarks>
    /// Useful for writing out diagnostic information or tracking memory access issues.
    /// </remarks>
    IFluentLog Log { get; }

    /// <summary>
    /// Helps you figure out where fields are located in structs (their offsets and sizes).
    /// </summary>
    /// <value>An instance of <see cref="IMemoryMapper"/> for working with memory layouts.</value>
    /// <remarks>
    /// Use this to get or calculate field offsets and struct sizes dynamically during runtime.
    /// </remarks>
    IMemoryMapper MemoryMapper { get; }
    
    /// <summary>
    /// Provides a shared pool of reusable byte arrays to reduce memory allocations when working with temporary buffers.
    /// </summary>
    /// <remarks>
    /// This is useful when you frequently read or write memory in short-lived spans and want to avoid allocating new arrays each time.
    /// Using the pool can improve performance and reduce GC pressure in memory-intensive scenarios.
    /// </remarks>
    ArrayPool<byte> MemoryPool { get; }
}

/// <summary>
/// Represents a chunk or window of memory you can read from or write to.
/// Think of it like a slice of memory with a starting point and a size.
/// Usually you can read outside the region as well, so it is mostly FYI-mechanism
/// </summary>
public interface IMemorySpan
{
    /// <summary>
    /// The starting memory address of this region.
    /// Imagine this is where your memory block begins.
    /// </summary>
    long BaseAddress { get; }

    /// <summary>
    /// The size of the memory region in bytes.
    /// Tells you how big the memory slice is (like how many bytes it holds).
    /// </summary>
    int MemorySize { get; }
}

/// <summary>
/// Gives you access to a specific memory region along with helpful tools like logging and layout info.
/// Think of it as a smart memory handle — it knows where it starts, how big it is, and gives you tools to work with it.
/// </summary>
public interface IMemoryAccessor : IMemorySpan
{
    /// <summary>
    /// Provides access to the logging interface for the script.
    /// </summary>
    /// <value>The IFluentLog used for logging memory-related messages.</value>
    /// <remarks>
    /// This property exposes a logging interface that scripts can use to log messages, warnings, and errors.
    /// </remarks>
    IFluentLog Log { get; }
    
    /// <summary>
    /// Represents a shared context used for working with memory inside a script.
    /// This is like a toolbox that gives you logging and memory layout tools.
    /// </summary>
    IMemoryContext Context { get; }
}

/// <summary>
/// A read-only view of memory — you can look, but you can’t touch.
/// </summary>
public interface IReadOnlyMemory : IMemoryReader
{
}

/// <summary>
/// The full-featured memory API — lets you read, write, map, and inspect memory all in one place.
/// This is what most tools and scripts will use to do everything with memory.
/// </summary>
/// <remarks>
/// Combines reading, writing, raw backend access, and struct layout tools into a single interface.
/// </remarks>
public interface IMemory : IMemoryWriter, IMemoryBackend, IReadOnlyMemory, IMemoryMapper
{
}

/// <summary>
/// Lets you write data into memory — like saving new values into the game or changing fields in memory.
/// Think of it as a memory pen: you point to an address and write stuff there.
/// </summary>
public interface IMemoryWriter : IMemoryAccessor
{
    /// <summary>
    /// Tries to write data from a span of unmanaged type to the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to write.</typeparam>
    /// <param name="addr">The target memory address to write to.</param>
    /// <param name="source">A span containing the data to write.</param>
    /// <returns>
    /// <c>true</c> if the write operation was successful; otherwise, <c>false</c>.
    /// </returns>
    /// <remarks>
    /// This method performs preliminary checks on the length of the data and the validity of the address
    /// before attempting the write. If the number of bytes to write exceeds a defined threshold, a warning is logged.
    /// </remarks>
    /// <example>
    /// <code language="csharp">
    /// // Example: Write an array of 10 integers to a specific memory address.
    /// Span&lt;int&gt; data = stackalloc int[10] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    /// bool success = memoryAccessor.TryWrite(new IntPtr(0x12345678), data);
    /// if (!success)
    /// {
    ///     // Handle the failure (e.g., log an error or throw an exception).
    /// }
    /// </code>
    /// </example>
    public bool TryWrite<T>(IntPtr addr, ReadOnlySpan<T> source) where T : unmanaged;

    /// <summary>
    /// Tries to write a span of managed structs to the specified memory address using marshaling semantics.
    /// </summary>
    /// <typeparam name="T">
    /// The struct type to write. Must be a value type with explicit or sequential layout and compatible with marshaling rules.
    /// </typeparam>
    /// <param name="addr">The target memory address in the external process or memory region.</param>
    /// <param name="source">A span containing the data to marshal and write.</param>
    /// <returns>
    /// <c>true</c> if the write operation was successful; otherwise, <c>false</c>.
    /// </returns>
    /// <remarks>
    /// Each element in <paramref name="source"/> is marshaled to its unmanaged representation using <see cref="System.Runtime.InteropServices.StructureToPtr"/>. 
    /// This supports non-blittable types with <see cref="System.Runtime.InteropServices.MarshalAsAttribute"/>, including fixed-size arrays and strings.
    /// <para>
    /// The method assumes that the memory layout of <typeparamref name="T"/> matches the target process exactly. If layout mismatches exist,
    /// behavior is undefined and may lead to memory corruption.
    /// </para>
    /// <para>
    /// If the total size of the data exceeds a predefined threshold, the buffer is allocated on the heap and a warning may be logged.
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
    /// Writes a single value of unmanaged type to the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to write.</typeparam>
    /// <param name="addr">The target memory address.</param>
    /// <param name="value">The value to write.</param>
    void Write<T>(IntPtr addr, T value) where T : unmanaged;

    /// <summary>
    /// Writes an array of unmanaged values to the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to write.</typeparam>
    /// <param name="addr">The target memory address.</param>
    /// <param name="value">The array of values to write.</param>
    void Write<T>(IntPtr addr, T[] value) where T : unmanaged;

    /// <summary>
    /// Writes an array of bytes to the specified memory address.
    /// </summary>
    /// <param name="addr">The target memory address.</param>
    /// <param name="source">The byte array to write.</param>
    void Write(IntPtr addr, byte[] source);

    /// <summary>
    /// Writes the specified UTF8 string (with a null terminator) to the specified memory address.
    /// </summary>
    /// <param name="addr">The target memory address.</param>
    /// <param name="text">The string to write.</param>
    void WriteString(IntPtr addr, string text);
}

/// <summary>
/// Provides methods to read various data types from unmanaged memory.
/// Commonly used for low-level memory access in game debugging, modding, and reverse engineering scenarios.
/// </summary>
public interface IMemoryReader : IMemoryAccessor
{
    /// <summary>
    /// Attempts to read a span of unmanaged elements from the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged data type to read (e.g., <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">The memory address (pointer) to read from.</param>
    /// <param name="target">A span that will be filled with the read data.</param>
    /// <returns><c>true</c> if read was successful; otherwise, <c>false</c>.</returns>
    /// <remarks>
    /// This method is safer than raw reads as it avoids exceptions and provides a fail flag.
    /// It is often used for reading structured data like player coordinates or game state.
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
    /// Attempts to read a single unmanaged element from the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged data type to read (e.g., <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">The memory address (pointer) to read from.</param>
    /// <param name="target">A span that will be filled with the read data.</param>
    /// <returns><c>true</c> if read was successful; otherwise, <c>false</c>.</returns>
    /// <remarks>
    /// This method is safer than raw reads as it avoids exceptions and provides a fail flag.
    /// It is often used for reading structured data like player coordinates or game state.
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
    /// Attempts to read a span of unmanaged elements from the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged data type to read (e.g., <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">The memory address (pointer) to read from.</param>
    /// <param name="target">A span that will be filled with the read data.</param>
    /// <returns><c>true</c> if read was successful; otherwise, <c>false</c>.</returns>
    /// <remarks>
    /// This method is safer than raw reads as it avoids exceptions and provides a fail flag.
    /// It is often used for reading structured data like player coordinates or game state.
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
    /// Attempts to read a single unmanaged element from the specified memory address.
    /// </summary>
    /// <typeparam name="T">The unmanaged data type to read (e.g., <c>int</c>, <c>float</c>).</typeparam>
    /// <param name="addr">The memory address (pointer) to read from.</param>
    /// <param name="target">A span that will be filled with the read data.</param>
    /// <returns><c>true</c> if read was successful; otherwise, <c>false</c>.</returns>
    /// <remarks>
    /// This method is safer than raw reads as it avoids exceptions and provides a fail flag.
    /// It is often used for reading structured data like player coordinates or game state.
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
    /// Attempts to read a span of marshaled structures from the specified memory address into managed memory.
    /// </summary>
    /// <typeparam name="T">
    /// The structure type to read from memory. Must be a value type with an explicit layout declaration (e.g., <see cref="StructLayoutAttribute"/>)
    /// and may include marshaling attributes like <see cref="MarshalAsAttribute"/>.
    /// </typeparam>
    /// <param name="addr">The base memory address to read from. This must be a valid address within the target process.</param>
    /// <param name="target">
    /// A span of <typeparamref name="T"/> that will be populated with the data read from memory. 
    /// The length of the span determines how many structures will be read.
    /// </param>
    /// <returns>
    /// <c>true</c> if all data was read and marshaled successfully; otherwise, <c>false</c>.
    /// </returns>
    /// <remarks>
    /// This method allows reading of complex structures that are not strictly unmanaged (e.g., contain fixed-size arrays or use <see cref="MarshalAsAttribute"/>),
    /// by using the <see cref="Marshal.PtrToStructure{T}(IntPtr)"/> API on each element individually. While more flexible than <see cref="TryRead{T}"/>,
    /// it is also significantly slower and incurs memory allocation overhead.
    ///
    /// Internally, the method reads the full byte buffer into a temporary buffer (stack-allocated if small),
    /// then iterates through it, unmarshaling each individual structure. For performance-sensitive code involving
    /// simple unmanaged types, prefer <see cref="TryRead{T}"/> instead.
    ///
    /// To be used safely, the type <typeparamref name="T"/> should be decorated with <see cref="StructLayout(LayoutKind.Sequential)"/>
    /// and have no reference-type fields other than fixed-size arrays or blittable structs.
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
    /// Reads a single managed element from an IntPtr address.
    /// </summary>
    /// <typeparam name="T">The managed type to read.</typeparam>
    /// <param name="addr">The address to read from.</param>
    /// <returns>The value read from memory.</returns>
    T ReadManaged<T>(IntPtr addr) where T : struct;

    /// <summary>
    /// Reads a single managed element from a long address.
    /// </summary>
    /// <typeparam name="T">The managed type to read.</typeparam>
    /// <param name="addr">The address to read from.</param>
    /// <returns>The value read from memory.</returns>
    T ReadManaged<T>(long addr) where T : struct;

    /// <summary>
    /// Reads a byte array from the specified memory address.
    /// </summary>
    /// <param name="addr">The memory address (IntPtr) to read from.</param>
    /// <param name="size">Number of bytes to read.</param>
    /// <returns>The byte array read from memory.</returns>
    /// <exception cref="ArgumentException">Thrown if the address is invalid or inaccessible.</exception>
    byte[] Read(IntPtr addr, int size);

    /// <summary>
    /// Reads a byte array from a 64-bit address (long).
    /// </summary>
    /// <param name="addr">The 64-bit address to read from.</param>
    /// <param name="size">Number of bytes to read.</param>
    /// <returns>The byte array read from memory.</returns>
    /// <remarks>
    /// This overload is useful when addresses are provided as long values (e.g., from external tools or pointer arithmetic).
    /// </remarks>
    byte[] Read(long addr, int size);

    /// <summary>
    /// Reads a single unmanaged element from an IntPtr address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read.</typeparam>
    /// <param name="addr">The address to read from.</param>
    /// <returns>The value read from memory.</returns>
    T Read<T>(IntPtr addr) where T : unmanaged;

    /// <summary>
    /// Reads a single unmanaged element from a 64-bit address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read.</typeparam>
    /// <param name="addr">The memory address.</param>
    /// <returns>The value read from memory.</returns>
    /// <remarks>
    /// Use this for reading values like player health or ammo counts at known addresses.
    /// </remarks>
    T Read<T>(long addr) where T : unmanaged;

    /// <summary>
    /// Reads a value of type <typeparamref name="T"/> by following a 64-bit pointer chain starting from the specified address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read from memory.</typeparam>
    /// <param name="addr">The starting memory address (64-bit pointer).</param>
    /// <param name="offsets">An array of offsets to follow through the pointer chain, where the last offset points to the target value.</param>
    /// <returns>The value of type <typeparamref name="T"/> read from memory.</returns>
    T ReadPointerChain<T>(IntPtr addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Reads a value of type <typeparamref name="T"/> by following a 64-bit pointer chain starting from the specified address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read from memory.</typeparam>
    /// <param name="addr">The starting memory address (as a 64-bit integer).</param>
    /// <param name="offsets">An array of offsets to follow through the pointer chain, where the last offset points to the target value.</param>
    /// <returns>The value of type <typeparamref name="T"/> read from memory.</returns>
    T ReadPointerChain<T>(long addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Reads a value of type <typeparamref name="T"/> by following a 32-bit pointer chain starting from the specified address.
    /// Intended for targets with 32-bit pointer width.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read from memory.</typeparam>
    /// <param name="addr">The starting memory address (32-bit pointer context).</param>
    /// <param name="offsets">An array of offsets to follow through the pointer chain, where the last offset points to the target value.</param>
    /// <returns>The value of type <typeparamref name="T"/> read from memory.</returns>
    T ReadPointerChain32<T>(IntPtr addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Reads a value of type <typeparamref name="T"/> by following a 32-bit pointer chain starting from the specified address.
    /// Intended for targets with 32-bit pointer width.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read from memory.</typeparam>
    /// <param name="addr">The starting memory address (as a 64-bit integer representing a 32-bit address).</param>
    /// <param name="offsets">An array of offsets to follow through the pointer chain, where the last offset points to the target value.</param>
    /// <returns>The value of type <typeparamref name="T"/> read from memory.</returns>
    T ReadPointerChain32<T>(long addr, params int[] offsets) where T : unmanaged;

    /// <summary>
    /// Reads an array of unmanaged elements from the specified IntPtr address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read.</typeparam>
    /// <param name="addr">The memory address.</param>
    /// <param name="size">Number of elements of type <typeparamref name="T"/> to read.</param>
    /// <returns>An array of the read elements.</returns>
    T[] Read<T>(IntPtr addr, int size) where T : unmanaged;

    /// <summary>
    /// Reads an array of unmanaged elements from a 64-bit address.
    /// </summary>
    /// <typeparam name="T">The unmanaged type to read.</typeparam>
    /// <param name="addr">The memory address.</param>
    /// <param name="size">Number of elements of type <typeparamref name="T"/> to read.</param>
    /// <returns>An array of the read elements.</returns>
    /// <remarks>
    /// This overload accepts long addresses, often used in game debugging when working with 64-bit process spaces.
    /// </remarks>
    T[] Read<T>(long addr, int size) where T : unmanaged;

    /// <summary>
    /// Reads ASCII string from memory.
    /// </summary>
    /// <param name="addr">The memory address.</param>
    /// <param name="length">Maximum length of the string in characters (default: 256).</param>
    /// <param name="replaceNull">If true, replaces null terminators with string trimming.</param>
    /// <returns>The string read from memory, or an empty string if unreadable.</returns>
    string ReadStringA(long addr, int length = 256, bool replaceNull = true);

    /// <summary>
    /// Reads a UTF-8 string from memory.
    /// </summary>
    /// <param name="addr">The memory address.</param>
    /// <param name="length">Maximum length of the string in characters (default: 256).</param>
    /// <param name="replaceNull">If true, replaces null terminators with string trimming.</param>
    /// <returns>The string read from memory, or an empty string if unreadable.</returns>
    string ReadString(long addr, int length = 256, bool replaceNull = true);

    /// <summary>
    /// Reads a Unicode (UTF-16) string from memory.
    /// </summary>
    /// <param name="addr">The memory address.</param>
    /// <param name="lengthBytes">Maximum length in bytes (default: 256).</param>
    /// <param name="replaceNull">If true, trims at the first null character.</param>
    /// <returns>The Unicode string read from memory, or empty if unreadable.</returns>
    string ReadStringU(long addr, int lengthBytes = 256, bool replaceNull = true);

    /// <summary>
    /// Reads a byte array from a 64-bit address.
    /// </summary>
    /// <param name="addr">The memory address.</param>
    /// <param name="size">The number of bytes to read.</param>
    /// <returns>The byte array read from memory.</returns>
    byte[] ReadBytes(long addr, int size);

    /// <summary>
    /// Reads a byte array from a 64-bit address with large size support.
    /// </summary>
    /// <param name="addr">The memory address.</param>
    /// <param name="size">The number of bytes to read (long).</param>
    /// <returns>The byte array read from memory.</returns>
    /// <remarks>
    /// Use this overload when reading large memory regions (e.g., entire game state snapshots).
    /// </remarks>
    byte[] ReadBytes(long addr, long size);

    /// <summary>
    /// Reads an array of pointers (addresses) from memory between the specified start and end addresses.
    /// </summary>
    /// <param name="startAddress">The starting memory address.</param>
    /// <param name="endAddress">The ending memory address.</param>
    /// <param name="offset">The byte offset between elements (default: 8 for 64-bit pointers).</param>
    /// <returns>A list of pointers (addresses) read from the specified range.</returns>
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
/// Represents information about a loaded module (DLL, EXE, etc.) within a process.
/// Typically used for process inspection and debugging tools to analyze memory layouts.
/// </summary>
public readonly record struct ProcessModuleInformation
{
    /// <summary>
    /// Gets or sets the name of the module (e.g., "kernel32.dll").
    /// </summary>
    /// <remarks>
    /// This value may be <c>null</c> if the module name is unavailable or could not be resolved.
    /// </remarks>
    public string? ModuleName { get; init; }

    /// <summary>
    /// Gets or sets the full file path of the module on disk.
    /// </summary>
    /// <remarks>
    /// This value may be <c>null</c> if the module path is unavailable (e.g., for dynamically generated modules).
    /// </remarks>
    public string? FilePath { get; init; }

    /// <summary>
    /// Gets or sets the base address where the module is loaded in process memory.
    /// </summary>
    /// <remarks>
    /// Can be used to compute relative offsets within the module (e.g., when patching memory).
    /// </remarks>
    public IntPtr BaseAddress { get; init; }

    /// <summary>
    /// Gets or sets the size (in bytes) of the loaded module in memory.
    /// </summary>
    /// <remarks>
    /// Useful for validating address ranges within the module.
    /// </remarks>
    public int Size { get; init; }

    /// <summary>
    /// Returns a string representation of the module information, including non-default values.
    /// </summary>
    /// <returns>A formatted string with key property values.</returns>
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
/// Represents information about a running process.
/// Useful for identifying processes when attaching debuggers or performing memory scans.
/// </summary>
public readonly record struct ProcessInformation
{
    /// <summary>
    /// Gets or sets the name of the process (e.g., "explorer", "game.exe").
    /// </summary>
    /// <remarks>
    /// This value is typically retrieved from the system process table.
    /// </remarks>
    public string ProcessName { get; init; }

    /// <summary>
    /// Gets or sets the unique process ID (PID).
    /// </summary>
    /// <remarks>
    /// Use this ID when attaching to a process or querying system APIs.
    /// </remarks>
    public int Id { get; init; }
}

/// <summary>
/// Represents metadata about a single export entry in a module's export directory table,
/// as defined by the PE (Portable Executable) format.
/// </summary>
/// <remarks>
/// This structure is typically extracted by parsing the Export Directory Table of a PE file,
/// using the DOS and NT headers to locate and interpret the export table. It includes both
/// named and ordinal exports, and may represent forwarded exports as well.
/// </remarks>
public readonly record struct ModuleExportEntry
{
    /// <summary>
    /// The name of the exported symbol, if available.
    /// May be <c>null</c> for ordinal-only exports (i.e., exports without a name, referenced by ordinal number only).
    /// 
    /// This is the raw export name as it appears in the PE export table.
    /// It may be:
    /// - A plain C-style name (e.g., "DllMain", "Direct3DCreate9")
    /// - A decorated C++ symbol name (mangled, e.g., "?GEngine@@3PAVUGameEngine@@A")
    /// - A forwarded export (e.g., "kernel32.dll!HeapAlloc")
    /// 
    /// Use this when interacting directly with PE parsing or when needing the exact symbol string as defined in the DLL.
    /// </summary>
    public string? ExportName { get; init; }

    /// <summary>
    /// The undecorated (demangled) version of the export name, if applicable.
    /// This is typically available for symbols compiled with MSVC and mangled using Microsoft's C++ name decoration format.
    /// May be <c>null</c> for symbols that were not mangled or were exported by ordinal only.
    ///
    /// This is particularly useful for C++ exports where the mangled name is not human-readable.
    /// 
    /// Examples:
    /// - ?GCache@@3VFMemCache@@A     → class FMemCache GCache
    /// - ??0AAIController@@QAE@XZ    → public: __thiscall AAIController::AAIController(void)
    /// - ??_7AActor@@6B@             → const AActor::`vftable'
    /// - ?StaticClass@UGameEngine@@SAPAVUClass@@XZ → public: static class UClass * __cdecl UGameEngine::StaticClass(void)
    /// 
    /// You can use this to:
    /// - Display readable names in tools or reverse engineering UIs
    /// - Detect vtables, static fields, or global object pointers
    /// - Identify patterns like StaticClass functions or global singletons (e.g., GEngine)
    /// </summary>
    public string? UnDecoratedExportName { get; init; }

    /// <summary>
    /// The ordinal of the export, relative to the module’s export ordinal base.
    /// </summary>
    public ushort Ordinal { get; init; }

    /// <summary>
    /// The Relative Virtual Address (RVA) of the export within the module.
    /// </summary>
    /// <remarks>
    /// This is the address relative to the module base where the export entry points.
    /// If <see cref="IsForwarder"/> is <c>true</c>, this RVA points to a forwarder string instead of code.
    /// </remarks>
    public uint RVA { get; init; }

    /// <summary>
    /// Indicates whether this export is a forwarder to another module’s symbol.
    /// </summary>
    public bool IsForwarder { get; init; }

    /// <summary>
    /// If this export is a forwarder, this contains the forwarder name string (e.g., "KERNEL32.Sleep").
    /// Otherwise, <c>null</c>.
    /// </summary>
    public string? ForwarderName { get; init; }

    /// <summary>
    /// The index of the export in the module’s Export Address Table (EAT).
    /// </summary>
    public int ExportAddressTableIndex { get; init; }

    /// <summary>
    /// The index into the module’s Name Pointer Table (used for binary search by name).
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
/// Backend is low-level engine that actually reads from and writes to memory.
/// Think of it as the raw memory driver — it knows how to fetch or store bytes at specific addresses.
/// </summary>
public interface IMemoryBackend : IDisposable, IMemorySpan
{
    /// <summary>
    /// Checks if this memory source is still usable.
    /// For example, if the target process is still running or the memory is still mapped.
    /// </summary>
    bool IsValid { get; }

    /// <summary>
    /// Tries to read raw bytes from memory into a buffer.
    /// You give it an address and a span to fill, and it tries to put the memory contents there.
    /// </summary>
    /// <param name="address">Where to start reading from (in the target memory).</param>
    /// <param name="target">Where to store the read bytes (in your program).</param>
    /// <returns><c>true</c> if it read successfully; <c>false</c> otherwise.</returns>
    bool TryReadMemory(IntPtr address, Span<byte> target);

    /// <summary>
    /// Tries to write raw bytes from a buffer into memory.
    /// You give it an address and some bytes, and it tries to copy those into the target memory.
    /// </summary>
    /// <param name="address">Where to start writing to (in the target memory).</param>
    /// <param name="source">The bytes you want to write (from your program).</param>
    /// <returns><c>true</c> if it wrote successfully; <c>false</c> otherwise.</returns>
    bool TryWriteMemory(IntPtr address, ReadOnlySpan<byte> source);
}


/// <summary>
/// Think of this like a map that tells you where each field in your struct lives in memory.
/// You can ask it what a field is, what it's called, where it starts (offset), or how big the whole thing is.
/// </summary>
public interface IMemoryMapper
{
    /// <summary>
    /// Given a field like <c>x => x.Health</c>, this tells you everything about that field (its type, name, etc.).
    /// </summary>
    /// <typeparam name="T">The type of the struct or class that owns the field.</typeparam>
    /// <param name="expr">An expression that points to a field (like <c>x => x.Health</c>).</param>
    /// <returns>Information about the field (as a <see cref="FieldInfo"/>).</returns>
    FieldInfo FieldOf<T>(Expression<Func<T, object>> expr);

    /// <summary>
    /// Just gives you the name of a field like "Health" from <c>x => x.Health</c>.
    /// </summary>
    /// <typeparam name="T">The type of the struct or class that owns the field.</typeparam>
    /// <param name="expr">An expression that points to a field.</param>
    /// <returns>The name of the field as a string.</returns>
    string NameOf<T>(Expression<Func<T, object>> expr);

    /// <summary>
    /// Tells you how many bytes from the start of the struct this field is located.
    /// Useful when reading/writing raw memory.
    /// </summary>
    /// <typeparam name="T">The type of the struct or class.</typeparam>
    /// <param name="expr">An expression pointing to a field.</param>
    /// <returns>The offset (in bytes) of the field.</returns>
    int OffsetOf<T>(Expression<Func<T, object>> expr);

    /// <summary>
    /// Tells you how many bytes the whole struct takes up in memory.
    /// </summary>
    /// <typeparam name="T">The type of struct or class.</typeparam>
    /// <returns>The total size in bytes.</returns>
    int SizeOf<T>();

    void Write<T>(T value, Span<byte> destination) where T : unmanaged;
}


/// <summary>
/// Represents a handle to a running process. 
/// This gives you access to high-level process information and the ability to inspect its memory.
/// </summary>
public interface IProcess : IDisposable
{
    /// <summary>
    /// Logging interface used to write debug info, warnings, and errors during memory operations.
    /// </summary>
    IFluentLog Log { get; }

    /// <summary>
    /// Indicates whether the process handle is still valid and usable.
    /// </summary>
    bool IsValid { get; }

    /// <summary>
    /// The name of the target process (e.g., "game.exe").
    /// </summary>
    string? ProcessName { get; }

    /// <summary>
    /// The system-level Process ID (PID) of the target process.
    /// </summary>
    int ProcessId { get; }

    /// <summary>
    /// Provides low-level access to the memory of the process (read/write, resolve pointers, scan regions).
    /// </summary>
    /// <remarks>
    /// This is the entry point for memory reading/writing and resolving addresses from exports or symbols.
    /// </remarks>
    IProcessMemory Memory { get; }

    /// <summary>
    /// Returns a list of all modules (DLLs and EXE) loaded in the process.
    /// </summary>
    /// <returns>Information about loaded modules including names, base addresses, and sizes.</returns>
    IReadOnlyList<ProcessModuleInformation> GetProcessModules();
}


/// <summary>
/// Gives you full access to the memory of a process — like having a map of everything the process can see.
/// You can read and write memory anywhere inside the process’s address space.
/// </summary>
/// <remarks>
/// Use this to do global memory operations like:
/// - reading game data at known addresses,
/// - following pointer chains,
/// - resolving exported symbols (like "GEngine" or "UWorld"),
/// - or scanning memory regions.
/// 
/// This is the main interface used to explore and modify memory in a running process.
/// </remarks>
public interface IProcessMemory : IMemory
{
    /// <summary>
    /// The low-level engine that performs the actual read/write operations in memory.
    /// You usually don’t need to use this directly unless you’re building custom memory tools.
    /// </summary>
    IMemoryBackend Backend { get; }
    
    /// <summary>
    /// Replaces the memory backend used for low-level memory operations.
    /// </summary>
    /// <param name="backend">The new memory backend to use.</param>
    /// <remarks>
    /// This can be used to inject custom behavior at the raw memory access level — 
    /// such as adding logging, caching, retries, batching, or redirecting memory reads to an emulated or test source.
    /// 
    /// Use with caution: replacing the backend affects all future read/write operations.
    /// </remarks>
    void UseMemoryBackend(IMemoryBackend backend);
}


/// <summary>
/// This version of the memory map lets you change the map too.
/// For example, if a field moved to a new position in a game update, you can tell the mapper to use the new offset.
/// </summary>
public interface ICustomMemoryMapper : IMemoryMapper
{
    /// <summary>
    /// Tells the mapper that a specific field starts at a new memory offset.
    /// </summary>
    /// <param name="member">The field you want to update.</param>
    /// <param name="offset">The new offset in bytes from the start of the struct.</param>
    void SetOffset(FieldInfo member, int offset);

    /// <summary>
    /// Same as <see cref="SetOffset"/>, but lets you specify the field using an expression like <c>x => x.Health</c>.
    /// </summary>
    /// <typeparam name="T">The type that owns the field.</typeparam>
    /// <param name="expr">An expression pointing to the field you want to update.</param>
    /// <param name="offset">The new offset in bytes.</param>
    void SetOffset<T>(Expression<Func<T, object>> expr, int offset);
}


public interface IConfigurableMemoryContext : IMemoryContext
{
    /// <summary>
    /// Configures the memory pool used for temporary buffer allocations during memory operations.
    /// </summary>
    /// <param name="memoryPool">The memory pool to use for allocating temporary byte buffers.</param>
    /// <remarks>
    /// This allows advanced users to plug in a custom <see cref="ArrayPool{T}"/> for efficient buffer reuse,
    /// which is especially useful when performing frequent or large memory reads/writes that require temporary allocations.
    /// 
    /// The provided memory pool will be used for internal operations such as marshaling structs or decoding strings from memory.
    /// </remarks>
    void UseMemoryPool(ArrayPool<byte> memoryPool);

    /// <summary>
    /// Sets a custom <see cref="IMemoryMapper"/> to be used for resolving struct field offsets and sizes.
    /// </summary>
    /// <param name="mapper">The memory mapper to use for interpreting memory layouts.</param>
    /// <remarks>
    /// Use this to inject a shared or preconfigured mapper that defines field offsets,
    /// structure sizes, and memory layouts without recreating them every time.
    /// </remarks>
    void UseMemoryMapper(IMemoryMapper mapper);
}


public static class ProcessExtensions
{
    /// <summary>
    /// Replaces the current memory mapper with a new, editable one (i.e. <see cref="ICustomMemoryMapper"/>).
    /// </summary>
    /// <param name="process">The process with whose memory we'll be working</param>
    /// <returns>
    /// A new instance of <see cref="ICustomMemoryMapper"/> that can be used to override field offsets and structure layouts.
    /// </returns>
    /// <remarks>
    /// This is useful when you want to programmatically define or adjust struct layouts at runtime,
    /// especially for reverse engineering or modding scenarios where field offsets vary between versions.
    /// </remarks>
    public static ICustomMemoryMapper UseCustomMemoryMapper(this IProcess process)
    {
        var newMapper = new CustomMemoryMapper();
        UseMemoryMapper(process, newMapper);
        return newMapper;
    }
    
    /// <summary>
    /// Replaces the current memory mapper with a new, editable one (i.e. <see cref="ICustomMemoryMapper"/>).
    /// </summary>
    /// <param name="process">The process with whose memory we'll be working</param>
    /// <returns>
    /// A new instance of <see cref="ICustomMemoryMapper"/> that can be used to override field offsets and structure layouts.
    /// </returns>
    /// <remarks>
    /// This is useful when you want to programmatically define or adjust struct layouts at runtime,
    /// especially for reverse engineering or modding scenarios where field offsets vary between versions.
    /// </remarks>
    public static ICustomMemoryMapper UseCustomMemoryMapper32(this IProcess process)
    {
        var newMapper = new CustomMemoryMapper(4);
        UseMemoryMapper(process, newMapper);
        return newMapper;
    }

    /// <summary>
    /// Sets a custom <see cref="IMemoryMapper"/> to be used for resolving struct field offsets and sizes.
    /// </summary>
    /// <param name="process">The process with whose memory we'll be working</param>
    /// <param name="mapper">The memory mapper to use for interpreting memory layouts.</param>
    /// <exception cref="NotSupportedException">
    /// Thrown if the <paramref name="process"/> context is not supported.
    /// </exception>
    /// <remarks>
    /// Use this to inject a shared or preconfigured mapper that defines field offsets,
    /// structure sizes, and memory layouts without recreating them every time.
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
    /// Configures the memory pool used for temporary buffer allocations during memory operations.
    /// </summary>
    /// <param name="process">The target process whose memory context will be updated.</param>
    /// <param name="memoryPool">The memory pool to use for allocating temporary byte buffers.</param>
    /// <exception cref="NotSupportedException">
    /// Thrown if the memory context implementation does not support replacing the memory pool.
    /// </exception>
    /// <remarks>
    /// This allows advanced users to plug in a custom <see cref="ArrayPool{T}"/> for efficient buffer reuse,
    /// which is especially useful when performing frequent or large memory reads/writes that require temporary allocations.
    /// 
    /// The provided memory pool will be used for internal operations such as marshaling structs or decoding strings from memory.
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
    ///     Attempts to locate a module loaded into the target process by its name, returning both the match and the full
    ///     module list.
    /// </summary>
    /// <param name="process">The process whose modules will be queried.</param>
    /// <param name="moduleName">
    ///     The name of the module to search for (e.g., <c>"kernel32.dll"</c>), compared
    ///     case-insensitively.
    /// </param>
    /// <param name="modules">
    ///     Outputs the full list of modules currently loaded in the process, regardless of match.
    /// </param>
    /// <param name="pmi">
    ///     When the method returns <c>true</c>, contains the <see cref="ProcessModuleInformation" /> for the matched module.
    ///     Otherwise, this value is set to its default.
    /// </param>
    /// <returns>
    ///     <c>true</c> if a module with the given name is found in the process; otherwise, <c>false</c>.
    /// </returns>
    /// <remarks>
    ///     This method performs a case-insensitive comparison on the base name of each module (i.e., no directory path).
    ///     Useful when performing diagnostics or symbol resolution where fallback logic may be needed.
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
    ///     Attempts to locate a module loaded into the process by name, returning the module if found.
    /// </summary>
    /// <param name="process">The process whose module list will be searched.</param>
    /// <param name="moduleName">The name of the module to search for (case-insensitive).</param>
    /// <param name="pmi">
    ///     When the method returns <c>true</c>, contains the matching <see cref="ProcessModuleInformation" />; otherwise,
    ///     default.
    /// </param>
    /// <returns>
    ///     <c>true</c> if a module with the specified name was found; otherwise, <c>false</c>.
    /// </returns>
    /// <remarks>
    ///     This is a convenience overload that omits the full module list result. Internally delegates to the full
    ///     <see
    ///         cref="TryFindProcessModule(IProcess, string, out IReadOnlyList{ProcessModuleInformation}, out ProcessModuleInformation)" />
    ///     overload.
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
    ///     Retrieves metadata about a loaded module (DLL or EXE) within the specified process by its name.
    /// </summary>
    /// <param name="process">The target process whose modules are being inspected.</param>
    /// <param name="moduleName">The name of the module to find (case-insensitive, e.g., <c>"kernel32.dll"</c>).</param>
    /// <returns>
    ///     A <see cref="ProcessModuleInformation" /> instance describing the module, including base address, size, and paths.
    /// </returns>
    /// <exception cref="ArgumentException">
    ///     Thrown if no module matching <paramref name="moduleName" /> is found in the target process.
    /// </exception>
    /// <remarks>
    ///     This method wraps <see cref="TryFindProcessModule" /> and throws if the module is not found. The search is
    ///     case-insensitive
    ///     and matches based on the <c>BaseDllName</c> field, not full file path.
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
    ///     Creates a memory accessor scoped to the region of a specific module within a process.
    /// </summary>
    /// <param name="process">The process containing the module.</param>
    /// <param name="pmi">The module metadata, including base address and size.</param>
    /// <returns>
    ///     An <see cref="IMemory" /> instance that reads and writes only within the memory bounds of the specified module.
    /// </returns>
    /// <remarks>
    ///     This method wraps the module's memory region with a proxy backend that restricts access to the specified base
    ///     address
    ///     and size. It is particularly useful for safely accessing symbols or headers within a loaded module without risking
    ///     out-of-bounds access.
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
    ///     Creates a memory accessor scoped to a module within a process, identified by its name.
    /// </summary>
    /// <param name="process">The process to inspect.</param>
    /// <param name="moduleName">The name of the module (e.g., <c>"ntdll.dll"</c>).</param>
    /// <returns>
    ///     An <see cref="IMemory" /> instance restricted to the address range of the target module.
    /// </returns>
    /// <exception cref="ArgumentException">
    ///     Thrown if the specified module cannot be found in the process module list.
    /// </exception>
    /// <remarks>
    ///     This method resolves the module using <see cref="GetProcessModule(IProcess, string)" /> and then creates
    ///     a scoped memory view over the module's address space. This is useful for parsing PE structures or analyzing
    ///     exports/imports safely within module boundaries.
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
    ///     Parses the export table of a PE (Portable Executable) image loaded in memory and returns detailed information
    ///     about all exported symbols, including both named and ordinal-only exports.
    /// </summary>
    /// <param name="memory">
    ///     An <see cref="IMemory" /> abstraction over the loaded module's memory space. This must represent a valid PE image,
    ///     starting at its base address (e.g., the module base in virtual memory).
    /// </param>
    /// <returns>
    ///     A list of <see cref="ModuleExportEntry" /> entries describing all exports found in the module’s
    ///     <c>.edata</c> section. This includes forwarders, ordinal-only exports, and named exports, if present.
    ///     If the module has no export table, an empty list is returned.
    /// </returns>
    /// <remarks>
    ///     <para>
    ///         This method reads the PE headers (DOS + NT) and navigates through the Export Directory Table in the optional
    ///         header’s
    ///         data directories. It supports both PE32 (32-bit) and PE32+ (64-bit) formats by inspecting the
    ///         OptionalHeader.Magic field.
    ///     </para>
    ///     <para>
    ///         The export symbols are constructed using the Export Address Table (EAT), Name Pointer Table, and Ordinal Table.
    ///         For each export, the method determines:
    ///         <list type="bullet">
    ///             <item>
    ///                 <description>
    ///                     <see cref="ModuleExportEntry.Ordinal" />: The export’s ordinal, relative to the module’s
    ///                     ordinal base.
    ///                 </description>
    ///             </item>
    ///             <item>
    ///                 <description><see cref="ModuleExportEntry.ExportName" />: The name of the export, if available.</description>
    ///             </item>
    ///             <item>
    ///                 <description><see cref="ModuleExportEntry.RVA" />: The relative virtual address of the export.</description>
    ///             </item>
    ///             <item>
    ///                 <description>
    ///                     <see cref="ModuleExportEntry.IsForwarder" />: Whether the export is forwarded to another
    ///                     DLL.
    ///                 </description>
    ///             </item>
    ///             <item>
    ///                 <description>
    ///                     <see cref="ModuleExportEntry.ForwarderName" />: The forwarder string if applicable (e.g.,
    ///                     <c>ADVAPI32.CryptEncrypt</c>).
    ///                 </description>
    ///             </item>
    ///         </list>
    ///     </para>
    ///     <para>
    ///         The method assumes that all RVA-based pointers are valid and mapped in the current <paramref name="memory" />
    ///         context.
    ///         Invalid or malformed export tables may result in incorrect data or skipped entries. Forwarder detection is done
    ///         by
    ///         checking whether the function RVA lies within the export directory region.
    ///     </para>
    /// </remarks>
    /// <example>
    ///     Example usage:
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