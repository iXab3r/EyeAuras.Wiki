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

C# Action в desktop-host с зарегистрированными нативными сервисами:

```csharp
IClipboardManager Clipboard { get; init; }

Clipboard.SetText("hello");
Log.Info($"Прочитано: {Clipboard.GetText() ?? "<нет текста>"}");
```

**Рекомендация:** Для базового текста используйте сервис, зарегистрированный как `IClipboardManager` в нативном модуле.
Полная миграция поведения AHK для буфера обмена пока не готова: для `ClipWait`, `ClipboardAll` и событий изменения нужны отдельные рецепты.

После вызова в буфере должен быть текст `hello`, в журнале — прочитанное значение. `GetText()` может вернуть `null`, если текста нет или буфер не удалось открыть; `SetText()` может бросить исключение, например при занятом буфере. Это синхронная операция, токена отмены в контракте нет.

Сервис общий, скрипт не должен его освобождать. В обычный класс передавайте `IClipboardManager` явно. Текстовый путь использует Win32 на вызывающем потоке; наличие UI scheduler в реализации не означает автоматический переход на него. Методы изображений и data object используют WinForms напрямую: для них отдельно обеспечьте подходящий STA/UI-контекст. Здесь показан только текст, без обещания переноса всех форматов, `ClipWait` или событий. См. [AHK-009](./ahk-gaps).

## Ссылки для проверки

- Документация AHK:
  [A_Clipboard](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/A_Clipboard.htm),
  [ClipboardAll](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ClipboardAll.htm),
  [ClipWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ClipWait.htm).
- Исходники AHK:
  [clipboard.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/clipboard.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp).
- Контракты EyeAuras: [контекст скрипта](../scripting/runtime), [ввод](../ISendInputScriptingApi), [окна](../windows-subsystems/window-handles). Точные типы и сигнатуры сверяйте с SDK/XML своей версии; базовый срез — EyeAuras `20fd3d4`, PoeEye `0e02c98`.

AHK v2 `ClipWait` по умолчанию ждёт текст или файлы, принимает timeout в секундах
и возвращает false при его истечении. `WaitFor = 1` допускает любые данные.
Один вызов `GetText()` не заменяет это ожидание или снимок всех форматов.
