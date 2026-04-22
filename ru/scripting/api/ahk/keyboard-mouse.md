---
title: Миграция с AutoHotkey клавиатура и мышь
description: Как перенести send, состояние клавиш, ожидания, движение мыши и клики из AutoHotkey в API ввода EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, keyboard, mouse, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Миграция с AutoHotkey — клавиатура и мышь

Эта страница поможет перенести сценарии с `Send`, `SendText`, `SendInput`, `GetKeyState`, `KeyWait`, `MouseMove`, `Click`, `MouseClick` и `MouseGetPos`.

Сами объявления хоткеев описаны отдельно в [Hotkeys](./hotkeys).

## Краткая карта соответствий

| Что нужно в AutoHotkey | API AHK | Чем пользоваться в EyeAuras | Первый C# вариант | Оценка | Примечания |
|---|---|---|---|---|---|
| Отправить ввод с клавиатуры или текст | `Send`, `SendText`, `SendInput`, `{Key down}`, `{Key up}` | `ISendInputScriptingApi` | `SendInput.KeyPress(Key.F1); SendInput.Text("hello");` | Хорошо подходит для явного ввода, но слабее для полной грамматики AHK `Send`. | Используйте стабильный `ISendInputScriptingApi`, а не устаревшие нестабильные алиасы. Конструкции AHK вроде `{Raw}`, `{Text}`, `{Blind}`, восстановления модификаторов, `SendMode` и `SendLevel` не имеют прямого соответствия один в один. |
| Прочитать состояние клавиши или кнопки мыши | `GetKeyState`, `KeyWait` | `ISendInputScriptingApi.IsKeyDown`, `IsMouseDown` | `if (SendInput.IsKeyDown(Key.LeftCtrl)) { ... }` | Для `GetKeyState` подходит нормально; `KeyWait` пока выглядит неудобно. | Отдельного документированного аналога `KeyWait` пока нет. В качестве низкоуровневого запасного варианта можно использовать цикл со скриптовым `Sleep(...)`; более удобный helper или паттерн пока остаётся пробелом. |
| Переместить мышь и кликнуть | `MouseMove`, `Click`, `MouseClick`, `MouseGetPos` | `ISendInputScriptingApi` | `SendInput.CursorPosition`, `SendInput.MouseMoveTo(x, y)`, `SendInput.MouseLeftClick(x, y)` | Хороший вариант, особенно благодаря перегрузкам с координатами. | Методы EyeAuras работают через выбранный симулятор ввода. При переносе AHK `Click x, y` лучше использовать перегрузки с координатами или `WinPoint`. |

## Прямая отправка ввода

AutoHotkey v2:

```ahk
SendText "hello"
Send "{F1}"
```

Скрипт EyeAuras:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.Text("hello");
SendInput.KeyPress(Key.F1);
```

**Рекомендация:** хороший вариант для явной отправки текста и нажатий клавиш. Полная грамматика строк `Send` из AHK не переносится один в один, поэтому сложные случаи с `{Blind}`, `{Raw}`, повторениями и модификаторами лучше переводить осознанно, а не механически.

## Ожидание отпускания клавиши

AutoHotkey v2:

```ahk
KeyWait "LButton"
```

Скрипт EyeAuras, текущий низкоуровневый вариант:

```csharp
ISendInputScriptingApi SendInput { get; init; }

while (SendInput.IsMouseDown(MouseButton.Left) && !cancellationToken.IsCancellationRequested)
{
    Sleep(10);
}
```

**Рекомендация:** неудобно, но как низкоуровневый запасной вариант использовать можно. Небольшой helper вроде `WaitUntilReleased(...)` был бы дружелюбнее; вопросы timeout, logical vs physical state и семантики down vs up отслеживаются в [AHK Gaps](./ahk-gaps).

## Клик по координатам

AutoHotkey v2:

```ahk
Click 100, 200
```

Скрипт EyeAuras:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.MouseLeftClick(100, 200);
```

**Рекомендация:** хороший вариант. Используйте перегрузки с координатами или `WinPoint`, а не схему «сначала переместить мышь, потом кликнуть», если само движение курсора для вас не важно.

## Ссылки для проверки

- Документация AHK:
  [Send](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Send.htm),
  [SendMode](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/SendMode.htm),
  [SendLevel](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/SendLevel.htm),
  [GetKeyState](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/GetKeyState.htm),
  [KeyWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/KeyWait.htm),
  [MouseMove](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/MouseMove.htm),
  [Click](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Click.htm),
  [MouseGetPos](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/MouseGetPos.htm).
- Исходники AHK:
  [keyboard_mouse.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/keyboard_mouse.cpp),
  [script2.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/script2.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp).
- Документация EyeAuras:
  [ISendInputScriptingApi](../ISendInputScriptingApi),
  [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys).
- Исходники EyeAuras:
  [ISendInputScriptingApi.cs](../../../../../Sources/EyeAuras.Roxy.Shared/Api/ISendInputScriptingApi.cs),
  [SendInputScriptingApi.cs](../../../../../Sources/EyeAuras.Roxy/Api/SendInputScriptingApi.cs).