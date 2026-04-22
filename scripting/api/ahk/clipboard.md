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

EyeAuras script, provisional shape:

```csharp
IClipboardManager Clipboard { get; init; }

Clipboard.SetText("hello");
```

**Recommendation:** Basic text should be fine after DI availability is verified.
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
- EyeAuras source:
  [IClipboardManager.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Native/Native/IClipboardManager.cs),
  [ClipboardManager.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Native/Native/ClipboardManager.cs).
