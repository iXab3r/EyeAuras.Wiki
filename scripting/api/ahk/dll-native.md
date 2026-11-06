---
title: AutoHotkey Migration: DLL And Native Interop
description: Planned mapping for AutoHotkey DllCall, callbacks, buffers, structs, and native interop to C# and EyeAuras APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, dll, native, interop
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: DLL And Native Interop

Use this page for `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, `NumPut`,
raw pointers, native structs, and direct Win32 interop.

This area starts with literal `DllCall` migration. Higher-level EyeAuras or
PoeShared APIs are still useful, but they are rewrite options, not the direct
equivalent of `DllCall`.

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Call native DLLs | `DllCall`, `Buffer`, `NumGet`, `NumPut`, `CallbackCreate` | Typed C# P/Invoke wrappers; optional rewrite to existing EyeAuras/PoeShared APIs | `[DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();` | Good for simple calls, but more explicit and more boilerplate than AHK. | Show the direct P/Invoke signature first. Mention an EyeAuras/PoeShared API only as a nicer rewrite path, not as the only answer. |

## Simple DllCall

AutoHotkey v2:

```ahk
hwnd := DllCall("user32.dll\GetForegroundWindow", "ptr")
```

EyeAuras C# script:

```csharp
using System.Runtime.InteropServices;

var hwnd = NativeMethods.GetForegroundWindow();
Log.Info($"Foreground HWND: 0x{hwnd.ToInt64():X}");

static class NativeMethods
{
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
```

The C# version moves AHK's string-based call into a typed signature. The helper
class can live in the same script file for a small script or in a separate `.cs`
file for larger projects.

Optional EyeAuras rewrite when you want an `IWindowHandle` instead of a raw
`HWND`:

```csharp
IWindowListProvider WindowsProvider { get; init; }

var foreground = WindowsProvider.GetForegroundWindow();
```

**Recommendation:** Good shape for simple native calls. Show the direct
P/Invoke migration first; then mention an EyeAuras/PoeShared API if it is a
better user-facing rewrite.

## DllCall With Arguments

AutoHotkey v2:

```ahk
DllCall("user32.dll\MessageBoxW", "ptr", 0, "str", "Hello", "str", "EyeAuras", "uint", 0, "int")
```

EyeAuras C# script:

```csharp
using System.Runtime.InteropServices;

var result = NativeMethods.MessageBoxW(IntPtr.Zero, "Hello", "EyeAuras", 0);
Log.Info($"MessageBox result: {result}");

static class NativeMethods
{
    [DllImport("user32.dll", EntryPoint = "MessageBoxW", CharSet = CharSet.Unicode)]
    public static extern int MessageBoxW(
        IntPtr hWnd,
        string text,
        string caption,
        uint type);
}
```

**Recommendation:** Better than raw AHK strings once the signature is correct.
The risk moves from runtime type strings to choosing the correct C# types,
charset, calling convention, and lifetime rules.

## Type Mapping Starter

| AHK Type | C# Shape | Notes |
|---|---|---|
| `ptr` | `IntPtr` or `nint` | Use `IntPtr` in snippets for widest familiarity. |
| `int`, `uint` | `int`, `uint` | Match signedness; many Win32 booleans are `bool` with `[return: MarshalAs(UnmanagedType.Bool)]`. |
| `int64`, `uint64` | `long`, `ulong` | Keep pointer-sized values as `IntPtr` instead. |
| `float`, `double` | `float`, `double` | Match the native ABI exactly. |
| `str` | `string` | Set `CharSet.Unicode` or use the `W` entry point for modern Win32 calls. |
| Output string buffer | `StringBuilder` or allocated buffer | Plain `string` is for input strings. |
| `Buffer`, `NumGet`, `NumPut` | `byte[]`, `Span<byte>`, `MemoryMarshal`, `StructLayout` structs | Prefer typed structs when the layout is known. |
| `CallbackCreate` | delegate plus `Marshal.GetFunctionPointerForDelegate(...)` | Keep the delegate alive for as long as native code can call it. |
| `Cdecl` option | `CallingConvention = CallingConvention.Cdecl` | Use only when the native function is actually cdecl. |

The examples run in a top-level C# Action on Windows. The first logs a numeric
HWND that may be zero; it neither creates nor owns a window. The second displays
a modal Hello dialog, waits for it to close and logs the returned button code.
Neither native call receives the script cancellation token. These examples do
not define a wrapper for arbitrary callbacks or ABIs.

Contracts: [GetForegroundWindow](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getforegroundwindow)
and [MessageBoxW](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messageboxw).
Check the function-specific contract when translating another DLL call.

## Verification Links

- AHK docs:
  [DllCall](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/DllCall.htm),
  [CallbackCreate](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/CallbackCreate.htm),
  [Buffer](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Buffer.htm),
  [NumGet](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/NumGet.htm),
  [NumPut](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/NumPut.htm).
- EyeAuras docs:
  [Window Handles](../windows-subsystems/window-handles),
  [Scripting Runtime](../scripting/runtime).
- EyeAuras contracts: [window handles](/en/scripting/api/windows-subsystems/window-handles).

A function pointer does not keep its managed delegate alive. Keep a strong
reference until native callbacks are unregistered and no callback can still run.
Use the generic `Marshal.GetFunctionPointerForDelegate<TDelegate>` overload and
an ABI-compatible delegate signature; unregister before releasing its owner.

[Marshal callback contract](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.marshal.getfunctionpointerfordelegate).
