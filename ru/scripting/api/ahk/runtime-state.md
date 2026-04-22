---
title: Миграция с AutoHotkey на runtime, таймеры и состояние
description: Как сопоставить Sleep, SetTimer и переменные AutoHotkey с API runtime и состояния скрипта в EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, runtime, timers, variables, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Переход с AutoHotkey: runtime, таймеры и состояние

Используйте эту страницу как короткую памятку по `Sleep`, `SetTimer`, обычным переменным, глобальным и встроенным переменным, а также общему состоянию.

## Краткое сопоставление

| Что нужно в AutoHotkey | API в AHK | Как это делается в EyeAuras | Базовая форма в C# | Оценка | Комментарий |
|---|---|---|---|---|---|
| Пауза или повтор позже | `Sleep`, `SetTimer` | Скриптовый `Sleep(...)`, циклы, сервисы, observables | `Sleep(250);` или цикл с учетом отмены | `Sleep` подходит хорошо; `SetTimer` требует переосмысления. | Скриптовый `Sleep(...)` в EyeAuras учитывает отмену и может завершиться раньше, если скрипт остановлен. Таймерные actions/triggers в Aura Tree — это настраиваемые компоненты, а не легковесные аналоги скриптового API. |
| Хранить состояние скрипта | Переменные, built-in variables, globals | Обычные локальные переменные C#, поля, объекты; `ScriptVariable<T>` только для общего или постоянного состояния | `var count = 0;` или `int Count { get; set; }` | Для обычного состояния внутри скрипта лучше; script variables нужны только когда состояние надо разделять. | `ScriptVariable<T>` / `IVariablesScriptingApi` нужны для состояния, которое должно сохраняться между запусками, разделяться между скриптами или использоваться инфраструктурой EyeAuras вне самого скрипта. |

## Sleep

AutoHotkey v2:

```ahk
Sleep 250
```

Скрипт EyeAuras:

```csharp
Sleep(250);
```

**Рекомендация:** хорошая и прямая замена. `Sleep(...)` в EyeAuras учитывает отмену, и для скриптов, которые пользователь может остановить в любой момент, это обычно удобнее.

## Обычное состояние скрипта

AutoHotkey v2:

```ahk
count := 0
count += 1
```

Скрипт EyeAuras:

```csharp
var count = 0;
count += 1;
```

Для обычного состояния внутри скрипта используйте стандартные локальные переменные C#, поля и объекты. `ScriptVariable<T>` / `IVariablesScriptingApi` нужны только тогда, когда значение должно сохраняться между запусками, разделяться между скриптами или использоваться инфраструктурой EyeAuras вне скрипта.

**Рекомендация:** для обычного состояния внутри скрипта это лучше, чем в AHK, потому что типы здесь явные и предсказуемые. Для общих и постоянных переменных нужны отдельные примеры.

## Ссылки для проверки

- Документация AHK:
  [Sleep](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Sleep.htm),
  [SetTimer](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/SetTimer.htm),
  [Variables and Expressions](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Variables.htm),
  [Functions](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Functions.htm),
  [Concepts](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Concepts.htm).
- Исходники AHK:
  [script2.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/script2.cpp),
  [vars.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/vars.cpp),
  [var.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/var.cpp).
- Документация EyeAuras:
  [Scripting Runtime](../scripting/runtime),
  [IVariablesScriptingApi](../IVariablesScriptingApi).
- Исходники EyeAuras:
  [AuraScriptSandbox.cs](../../../../../Sources/EyeAuras.Scripting/Api/AuraScriptSandbox.cs),
  [AuraScriptRunner.cs](../../../../../Sources/EyeAuras.Scripting/AuraScriptRunner.cs),
  [IVariablesScriptingApi.cs](../../../../../Sources/EyeAuras.Scripting/Api/IVariablesScriptingApi.cs),
  [ScriptVariable.cs](../../../../../Sources/EyeAuras.Scripting.Metadata/UserSpace/ScriptVariable.cs).