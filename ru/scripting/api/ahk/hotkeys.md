---
title: Миграция с AutoHotkey — горячие клавиши
description: Как перенести горячие клавиши и контекстные хоткеи из AutoHotkey в keybinds, trackers, triggers и actions EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, hotkeys, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Миграция с AutoHotkey — горячие клавиши

Эта страница пригодится, если в AHK вы используете метки горячих клавиш, `Hotkey`, `#HotIf` и простые действия по хоткею. Опрос состояния клавиатуры и клики мыши разобраны на странице [Keyboard And Mouse](./keyboard-mouse).

## Краткое соответствие

| Что нужно в AutoHotkey | AHK API | Как это делается в EyeAuras | Первая форма на C# | Оценка | Примечания |
|---|---|---|---|---|---|
| Запустить код по горячей клавише | Метки хоткеев вроде `^!s::`, `Hotkey`, `#HotIf` | методы с `[Keybind]`, `IHotkeyTracker` с Rx | `[Keybind("Ctrl+Alt+S")] void Run() { ... }` | `[Keybind]` лучше всего подходит для простых статических хоткеев; tracker/Rx лучше, когда нужен динамический контроль. | У `KeybindAttribute` есть `SuppressKey`, `IgnoreModifiers` и `ActivationType`. `IHotkeyTracker` поддерживает настройку во время выполнения и композицию через observable. Пользовательские AHK-комбинации, `~`, `*`, `$` и контекстно-зависимые хоткеи потребуют дополнительного сопоставления. |

## Отправка текста по горячей клавише

AutoHotkey v2:

```ahk
^!s::SendText "hello"
```

C# Action в EyeAuras:

```csharp
ISendInputScriptingApi SendInput { get; init; }

await Task.Delay(Timeout.Infinite, cancellationToken);

[Keybind("Ctrl+Alt+S", SuppressKey = true)]
void SendHello()
{
    SendInput.Text("hello");
}
```

Пример остаётся работающим C# Action благодаря ожиданию с токеном запуска. Пока запуск не завершён, Ctrl+Alt+S отправляет `hello` активному приложению; завершение Run отключает дальнейшие вызовы. Уже запланированный callback при этом не обязан завершиться или отмениться. Уберите ожидание, если запуск уже удерживается вашим окном или основной задачей.

Используйте `SuppressKey = false`, если исходная горячая клавиша должна по-прежнему доходить до активного приложения — это похоже на хоткеи AHK с префиксом `~`.

Вариант через tracker/Rx:

```csharp
ISendInputScriptingApi SendInput { get; init; }
IFactory<IHotkeyTracker> HotkeyTrackerFactory { get; init; }

var tracker = HotkeyTrackerFactory.Create().AddTo(ExecutionAnchors);
tracker.Hotkey = new HotkeyGesture(Key.S, ModifierKeys.Control | ModifierKeys.Alt);
tracker.HotkeyMode = HotkeyMode.Hold;
tracker.SuppressKey = true;

tracker.WhenAnyValue(x => x.IsActive)
    .Where(x => x)
    .SubscribeSafe(_ => SendInput.Text("hello"))
    .AddTo(ExecutionAnchors);
```

Этот пример с tracker предполагает, что вы вставляете его в скрипт, у которого уже есть основной цикл выполнения — например, в окно, цикл, hosted service или более крупное mini-app. Не добавляйте в каждый пример искусственное ожидание только ради того, чтобы подписка не завершалась.

**Рекомендация:** хороший вариант. Для фиксированных хоткеев используйте `[Keybind]`; `IHotkeyTracker` с Rx нужен только тогда, когда скрипту требуются горячие клавиши, настраиваемые во время выполнения, или композиция через observable.

У `KeybindAttribute` по умолчанию `SuppressKey = true`, `IgnoreModifiers = false`, `ActivationType = KeyDown`. Обработчик планируется на фоновом планировщике; параметры разрешаются через контейнер скрипта, возвращённый `Task` ожидается. Это не перенос UI-вызовов на диспетчер и не автоматическая отмена всего кода обработчика.

Трекер из фабрики и подписка в примере принадлежат текущему запуску (`ExecutionAnchors`). `IsEnabled` уже равен `true`. У обычного C# класса нет глобальных `SendInput`, `ExecutionAnchors` или `cancellationToken`: передайте зависимости и владельца ресурсов явно.

## Ссылки для сверки

- Документация AHK:
  [Hotkeys](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Hotkeys.htm),
  [Hotkey](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Hotkey.htm),
  [#HotIf](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/_HotIf.htm),
  [#UseHook](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/_UseHook.htm).
- Исходники AHK:
  [hotkey.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/hotkey.cpp).
- Документация EyeAuras:
  [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys),
  [ISendInputScriptingApi](../ISendInputScriptingApi),
  [Scripting Runtime](../scripting/runtime).
- Контракты EyeAuras: [контекст скрипта](../scripting/runtime), [ввод](../ISendInputScriptingApi), [окна](../windows-subsystems/window-handles). Точные типы и сигнатуры сверяйте с SDK/XML своей версии; базовый срез — EyeAuras `20fd3d4`, PoeEye `0e02c98`.

В примере tracker выбран `Hold`: `IsActive` становится true при нажатии и false
при отпускании. `Click` переключает состояние при отпускании и вызывал бы
отправку лишь через цикл нажатия. AHK `~` пропускает исходную клавишу, `*` допускает
лишние модификаторы, `$` принудительно использует keyboard hook против
самовызова через Send. Первым двум намерениям соответствуют `SuppressKey = false`
и `IgnoreModifiers = true`; полного аналога `$`/SendLevel здесь не обещается.
Обязательные модификаторы сохраняются, подавление происходит до фильтра edge.
См. [время жизни keybind](/ru/scripting/keybinds).
