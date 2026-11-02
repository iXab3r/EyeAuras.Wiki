---
title: Переход с AutoHotkey на работу с окнами
description: Как сопоставить поиск окон, проверку активного окна, ожидание и активацию из AutoHotkey с API окон EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, windows, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Миграция с AutoHotkey на Windows

Эта страница поможет при переходе с `WinExist`, `WinActive`, `WinWait`, `WinWaitActive`, `WinActivate`, `ControlClick` и `ControlSend`.

## Краткая карта соответствий

| Что нужно в AutoHotkey | API AHK | Аналог в EyeAuras | Первый вариант на C# | Оценка | Примечания |
|---|---|---|---|---|---|
| Проверить окно или выбрать его | `WinExist`, `WinActive`, `WinWait`, `WinWaitActive` | `IWindowSelector.FindWindow(...)`, `IWindowListProvider.GetForegroundWindow()`, `IWindowMatcher` | `var window = WindowSelector.FindWindow("notepad.exe");` | Хорошо подходит для поиска одного окна; особенно удобен как явное состояние. | EyeAuras использует `WindowMatchExpression`, а не токены AHK `WinTitle`. AHK Last Found Window лучше заменить на явную переменную `IWindowHandle`. Используйте `IWindowMatcher.FindMatches(...)` только если действительно нужны все совпадения или запрос без состояния. Для `WinWait*` всё ещё нужен более удобный helper/pattern. |
| Активировать окно | `WinActivate` | `IWindowSelector.GetWindow(...)`, `WindowHandleExtensions.Activate(...)`, `UnsafeNative.ActivateWindow(...)` | `WindowSelector.GetWindow("notepad.exe").Activate(...)` | Хорошо подходит как прямой вызов из скрипта после получения handle. | Не используйте `WinActivateAction` как scripting API wrapper. Активация может завершиться по таймауту или быть заблокирована Windows, поэтому поведение при ошибке и таймауте лучше оставлять явным. |

## Принятое именование в EyeAuras

API в EyeAuras в целом следует обычным соглашениям C#:

| Форма имени | Что означает |
|---|---|
| `GetSomething(...)` | Возвращает значение или бросает исключение, если его не удалось найти. |
| `FindSomething(...)` | Возвращает значение или `null`, если ничего не найдено. |
| `TryGetSomething(..., out value)` | Возвращает `bool` и записывает значение в `out`-параметр. |

Это важно для примеров миграции. Не оборачивайте `GetWindow(...)` в `try`/`catch`, если отсутствие окна — нормальная ветка сценария. В таком случае лучше выбрать вариант без исключений. Для простого разового поиска используйте `FindWindow(...)`.

## Проверка, существует ли окно и активно ли оно

AutoHotkey v2:

```ahk
if WinExist("ahk_exe notepad.exe")
    MsgBox "Notepad is open"

if WinActive("ahk_exe notepad.exe")
    SendText "hello"
```

Скрипт EyeAuras, разовая проверка:

```csharp
IFactory<IWindowSelector> WindowSelectorFactory { get; init; }
IWindowListProvider WindowsProvider { get; init; }
IWindowMatcher WindowMatcher { get; init; }
ISendInputScriptingApi SendInput { get; init; }

{
    using var WindowSelector = WindowSelectorFactory.Create();
    WindowMatchExpression target = "notepad.exe";

    var window = WindowSelector.FindWindow(target);
    if (window == null)
    {
        Log.Info("Notepad is not open");
        return;
    }

    Log.Info($"Window exists: {window.Title}");

    var foreground = WindowsProvider.GetForegroundWindow();
    if (foreground != null && WindowMatcher.IsMatch(foreground, target))
    {
        SendInput.Text("hello");
    }
}
```

Используйте `FindWindow(...)`, когда отсутствие окна — это нормальный сценарий. Такой вариант понятнее, чем перехватывать исключение от `GetWindow(...)`, и сразу даёт `IWindowHandle`, который стоит хранить явно вместо AHK-подхода с Last Found Window. Для проверки аналога `WinActive(...)` сравнивайте `WindowsProvider.GetForegroundWindow()` с тем же `WindowMatchExpression`.

Используйте `IWindowMatcher.FindMatches(...)` только если скрипту действительно нужны все совпадения или запрос без состояния по переданному списку окон:

```csharp
IWindowListProvider WindowsProvider { get; init; }
IWindowMatcher WindowMatcher { get; init; }

WindowMatchExpression target = "notepad.exe";

WindowsProvider.RefreshWindowList();

var matches = WindowMatcher.FindMatches(
    WindowsProvider.WindowList.Items.ToArray(),
    target);
```

`WindowSelector` хранит состояние: он поддерживает в актуальном виде `TargetWindow`, `MatchingWindowList` и `ActiveWindow`. Это удобно для auras и mini-apps. Используйте `GetWindow(...)` только тогда, когда отсутствие окна действительно считается исключительной ситуацией и выброс исключения уместен.

**Рекомендация:** для поиска одного окна это хороший вариант. Для AHK-подобных веток `WinExist(...)` обычно лучше `FindWindow(...)`; `GetWindow(...)` оставляйте для кода, где окно обязано существовать, а `FindMatches(...)` — только для случаев, когда важны все совпадения или заранее переданный список окон.

Строки AHK `WinTitle` не переносятся буквально. `notepad.exe` в примере выше
ищется также в пути, заголовке и аргументах, поэтому это более широкий поиск,
чем `ahk_exe notepad.exe`. Для ограничения процессом задайте `WindowFilter`
и сравнивайте `ProcessName`; законченный пример с нормализацией расширения —
в [карте окон](../windows-subsystems/window-handles).
Выражения EyeAuras также поддерживают строгое совпадение в кавычках, `/regex/`,
handle в виде `0x...`, `#2` для второго совпадения и свойства вроде
`[type=toplevel]`. Кавычки задают точное сравнение текста, но не выбирают только
поле процесса. Остальные различия — в [AHK Gaps](./ahk-gaps).

## Дождаться появления или смены цели

`FindWindow` — разовая проверка, не перевод `WinWait`. Для ожидания оставьте
selector живым и проверяйте его `ActiveWindow` в цикле с
`await Task.Delay(..., cancellationToken)`. Полный вариант «ждать видимый
Блокнот до Stop» находится в [карте окон](../windows-subsystems/window-handles).
Не сохраняйте найденный handle навсегда: для повторяющейся работы читайте
текущую цель на каждой итерации и проверяйте `IsWindow` перед операцией.

Для аналога `WinWaitActive` условие другое: нужно проверять foreground через
`IWindowListProvider.GetForegroundWindow()`, а не только наличие
`selector.ActiveWindow`. Если выбор ограничен процессом, применяйте то же
ограничение и при проверке foreground; один широкий `IsMatch` его не заменит.

## Активация окна

AutoHotkey v2:

```ahk
WinActivate "ahk_exe notepad.exe"
```

Скрипт EyeAuras:

```csharp
IFactory<IWindowSelector> WindowSelectorFactory { get; init; }

{
    using var WindowSelector = WindowSelectorFactory.Create();
    var window = WindowSelector.GetWindow("notepad.exe");
    window.Activate(TimeSpan.FromMilliseconds(500));
}
```

`GetWindow(...)` бросает исключение, если совпадений нет, а активация тоже может завершиться исключением, если Windows не переключит окно на передний план за время ожидания. В реализации при нулевом foreground ожидание может продолжиться до 10 секунд, поэтому переданные 500 мс не являются строгим пределом длительности вызова. `Activate(...)` — это обёртка `WindowHandleExtensions` над `UnsafeNative.ActivateWindow(...)`.

Не создавайте и не вызывайте `WinActivateAction` из скрипта. Actions, Triggers и Overlays — это stateful-компоненты Aura Tree. Они полезны, когда пользователь настраивает поведение ауры через UI, но для простой операции вроде активации окна это неподходящий уровень абстракции.

**Рекомендация:** в скрипте используйте `WindowHandleExtensions.Activate(...)` после получения `IWindowHandle`. Упоминайте `WinActivateAction` только как вариант настройки в Aura Tree, а не как прямой эквивалент API.

Скрипты выше — C# Action в работающем desktop-host. Фабрика создаёт отдельный selector, чтобы смена цели не влияла на чужой выбор; `using` освобождает его подписки. Полученный `IWindowHandle` принадлежит инфраструктуре окон, его не нужно освобождать. `FindWindow` меняет `TargetWindow` и сразу читает `ActiveWindow`, а не ждёт появления окна. Обновления живого списка могут прийти позже; это не `WinWait`.

`OnlyVisible` у selector по умолчанию `false`, а тип окна и принадлежность после назначения цели по умолчанию — top-level/external. `ActiveWindow` здесь означает выбранную цель, не foreground Windows. `notepad.exe` ищется по правилам EyeAuras и не является точным переводом ограничителя AHK `ahk_exe`. Подробности грамматики и отличие `FindMatches` от `IsMatch` — в [карте окон](../windows-subsystems/window-handles).

## Ссылки для проверки

- Документация AHK:
  [WinTitle and Last Found Window](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/misc/WinTitle.htm),
  [How to Manage Windows](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/howto/ManageWindows.htm),
  [WinActivate](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinActivate.htm),
  [WinWait](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinWait.htm),
  [WinWaitActive](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinWaitActive.htm),
  [WinActive](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinActive.htm),
  [WinExist](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/WinExist.htm),
  [ControlClick](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/ControlClick.htm),
  [Control functions](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Control.htm).
- Исходники AHK:
  [win.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/win.cpp),
  [wait.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/wait.cpp),
  [window.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/window.cpp).
- Документация EyeAuras:
  [Window Handles](../windows-subsystems/window-handles),
  [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys).
- Контракты EyeAuras: [контекст скрипта](../scripting/runtime), [ввод](../ISendInputScriptingApi), [окна](../windows-subsystems/window-handles). Точные типы и сигнатуры сверяйте с SDK/XML своей версии; базовый срез — EyeAuras `20fd3d4`, PoeEye `0e02c98`.
