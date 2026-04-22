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
    [DllImport("user32.dll", SetLastError = true)]
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

NativeMethods.MessageBoxW(IntPtr.Zero, "Hello", "EyeAuras", 0);

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
- EyeAuras source:
  [UnsafeNative.WindowUtils.cs](../../../../../Sources/PoeShared.Native/Native/UnsafeNative.WindowUtils.cs),
  [WindowHandleExtensions.cs](../../../../../Sources/PoeShared.Wpf/Scaffolding/WindowHandleExtensions.cs).
