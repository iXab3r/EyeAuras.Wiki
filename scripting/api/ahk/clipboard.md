---
title: AutoHotkey Migration: Clipboard
description: Mapping AutoHotkey clipboard APIs to EyeAuras clipboard services.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, clipboard
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: Clipboard

Use this page for `A_Clipboard`, `ClipboardAll`, `ClipWait`, and
`OnClipboardChange`.

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Read or write clipboard text | `A_Clipboard`, `ClipWait`, `OnClipboardChange` | `IClipboardManager` service | `Clipboard.SetText("hello");` | Basic text is okay; full AHK clipboard behavior is weak. | There is a native clipboard service, but no dedicated script-facing wrapper is documented in the API maps yet. `ClipWait`, `ClipboardAll`, and change events are open gaps. |

## Clipboard Text

AutoHotkey v2:

```ahk
A_Clipboard := "hello"
```

Top-level C# Action in the desktop host with native services registered:

```csharp
IClipboardManager Clipboard { get; init; }

Clipboard.SetText("hello");
Log.Info($"Read: {Clipboard.GetText() ?? "<no text>"}");
```

**Recommendation:** Use the native module's registered `IClipboardManager` for basic text.
Full AHK clipboard migration is not ready: `ClipWait`, `ClipboardAll`, and
change events need dedicated recipes.

## Verification Links

- AHK docs:
  [A_Clipboard](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/A_Clipboard.htm),
  [ClipboardAll](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ClipboardAll.htm),
  [ClipWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ClipWait.htm).
- AHK source:
  [clipboard.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/clipboard.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp).
- EyeAuras source: [ClipboardManager](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Native/Native/ClipboardManager.cs).

The clipboard should contain `hello`; the log records the value read back.
`GetText()` may return null when no text is present or opening fails. `SetText()`
can throw, including when the clipboard is busy. These calls are synchronous and
have no cancellation token. The service is borrowed; do not dispose it from the
script. Ordinary classes receive it explicitly.

The text path uses Win32 on the caller's thread; an injected UI scheduler does not
mean an automatic thread hop. Image/data-object methods call WinForms directly,
so arrange a suitable STA/UI context separately. This example covers text only;
all-format preservation and wait/change recipes remain [AHK-009](ahk-gaps).

AHK v2 `ClipWait` defaults to text or files, accepts a timeout in seconds, and
returns false on timeout. `WaitFor = 1` accepts any data. A single `GetText()`
call is not that wait operation or an all-format clipboard snapshot.
