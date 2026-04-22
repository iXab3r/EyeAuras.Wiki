---
title: Миграция с AutoHotkey — буфер обмена
description: Сопоставление API буфера обмена AutoHotkey со службами буфера обмена EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, clipboard, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Миграция с AutoHotkey — буфер обмена

Эта страница пригодится при переносе `A_Clipboard`, `ClipboardAll`, `ClipWait` и `OnClipboardChange`.

## Краткая сводка

| Что нужно из AutoHotkey | API AHK | Чем заменить в EyeAuras | Первый вариант на C# | Оценка | Примечания |
|---|---|---|---|---|---|
| Чтение или запись текста буфера обмена | `A_Clipboard`, `ClipWait`, `OnClipboardChange` | сервис `IClipboardManager` | `Clipboard.SetText("hello");` | С базовым текстом всё нормально, но полного аналога поведения AHK пока нет. | Есть нативный сервис буфера обмена, но в API-картах пока не описан отдельный wrapper для скриптов. Для `ClipWait`, `ClipboardAll` и событий изменения буфера обмена готового решения пока нет. |

## Текст в буфере обмена

AutoHotkey v2:

```ahk
A_Clipboard := "hello"
```

Скрипт EyeAuras, предполагаемый вариант:

```csharp
IClipboardManager Clipboard { get; init; }

Clipboard.SetText("hello");
```

**Рекомендация:** Для базовой работы с текстом этого должно хватить после проверки доступности через DI.  
Полная миграция поведения AHK для буфера обмена пока не готова: для `ClipWait`, `ClipboardAll` и событий изменения нужны отдельные рецепты.

## Ссылки для проверки

- Документация AHK:
  [A_Clipboard](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/A_Clipboard.htm),
  [ClipboardAll](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ClipboardAll.htm),
  [ClipWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ClipWait.htm).
- Исходники AHK:
  [clipboard.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/clipboard.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp).
- Исходники EyeAuras:
  [IClipboardManager.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Native/Native/IClipboardManager.cs),
  [ClipboardManager.cs](../../../../../Submodules/PoeEye/PoeEye/PoeShared.Native/Native/ClipboardManager.cs).