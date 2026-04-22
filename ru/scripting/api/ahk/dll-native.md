---
title: Миграция с AutoHotkey — DLL и нативный interop
description: План переноса AutoHotkey DllCall, callback-функций, буферов, структур и нативного interop на C# и API EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, dll, native, interop, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Миграция с AutoHotkey — DLL и native interop

Используйте эту страницу для миграции `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, `NumPut`, сырых указателей, native-структур и прямого Win32 interop.

Здесь разобран именно прямой перенос `DllCall`. Более высокоуровневые API EyeAuras или PoeShared тоже могут подойти, но это уже вариант переписывания кода, а не прямой эквивалент `DllCall`.

## Краткая схема

| Что нужно в AutoHotkey | API AHK | Путь в EyeAuras | Первый вариант на C# | Оценка | Примечания |
|---|---|---|---|---|---|
| Вызов native DLL | `DllCall`, `Buffer`, `NumGet`, `NumPut`, `CallbackCreate` | Типизированные P/Invoke-обёртки на C#; при желании — переписывание на готовые API EyeAuras/PoeShared | `[DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();` | Хорошо подходит для простых вызовов, но требует больше явного кода и шаблонной обвязки, чем AHK. | Сначала показывайте прямую P/Invoke-сигнатуру. API EyeAuras/PoeShared упоминайте как более удобный путь переписывания, а не как единственный вариант. |

## Простой DllCall

AutoHotkey v2:

```ahk
hwnd := DllCall("user32.dll\GetForegroundWindow", "ptr")
```

Скрипт EyeAuras на C#:

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

В версии на C# строковый вызов из AHK заменяется типизированной сигнатурой. Для небольшого скрипта такой helper-класс можно оставить в том же файле, а в более крупном проекте — вынести в отдельный `.cs` файл.

Необязательный вариант через EyeAuras, если вам нужен `IWindowHandle`, а не сырой `HWND`:

```csharp
IWindowListProvider WindowsProvider { get; init; }

var foreground = WindowsProvider.GetForegroundWindow();
```

**Рекомендация:** хороший вариант для простых native-вызовов. Сначала показывайте прямую миграцию через P/Invoke, а затем уже упоминайте API EyeAuras/PoeShared, если для пользователя это более удобный способ переписать код.

## DllCall с аргументами

AutoHotkey v2:

```ahk
DllCall("user32.dll\MessageBoxW", "ptr", 0, "str", "Hello", "str", "EyeAuras", "uint", 0, "int")
```

Скрипт EyeAuras на C#:

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

**Рекомендация:** после того как сигнатура описана правильно, этот вариант надёжнее и понятнее, чем сырые строковые типы в AHK. Но риск просто смещается в другую сторону: теперь важно правильно выбрать типы C#, `charset`, `calling convention` и правила времени жизни объектов.

## Базовое сопоставление типов

| Тип AHK | Вариант в C# | Примечания |
|---|---|---|
| `ptr` | `IntPtr` или `nint` | В примерах лучше использовать `IntPtr` — он привычнее для большинства пользователей. |
| `int`, `uint` | `int`, `uint` | Следите за знаковостью; многие Win32-boolean значения описываются как `bool` с `[return: MarshalAs(UnmanagedType.Bool)]`. |
| `int64`, `uint64` | `long`, `ulong` | Значения размером с указатель лучше оставлять как `IntPtr`. |
| `float`, `double` | `float`, `double` | Тип должен точно совпадать с native ABI. |
| `str` | `string` | Для современных Win32-вызовов используйте `CharSet.Unicode` или `W`-вариант entry point. |
| Буфер выходной строки | `StringBuilder` или выделенный буфер | Обычный `string` подходит только для входных строк. |
| `Buffer`, `NumGet`, `NumPut` | `byte[]`, `Span<byte>`, `MemoryMarshal`, структуры с `StructLayout` | Если layout известен, обычно лучше использовать типизированные структуры. |
| `CallbackCreate` | delegate плюс `Marshal.GetFunctionPointerForDelegate(...)` | Держите delegate живым всё время, пока native-код может его вызвать. |
| Опция `Cdecl` | `CallingConvention = CallingConvention.Cdecl` | Используйте только если native-функция действительно работает через `cdecl`. |

## Ссылки для проверки

- Документация AHK:
  [DllCall](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/DllCall.htm),
  [CallbackCreate](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/CallbackCreate.htm),
  [Buffer](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Buffer.htm),
  [NumGet](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/NumGet.htm),
  [NumPut](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/NumPut.htm).
- Документация EyeAuras:
  [Window Handles](../windows-subsystems/window-handles),
  [Scripting Runtime](../scripting/runtime).
- Исходники EyeAuras:
  [UnsafeNative.WindowUtils.cs](../../../../../Sources/PoeShared.Native/Native/UnsafeNative.WindowUtils.cs),
  [WindowHandleExtensions.cs](../../../../../Sources/PoeShared.Wpf/Scaffolding/WindowHandleExtensions.cs).