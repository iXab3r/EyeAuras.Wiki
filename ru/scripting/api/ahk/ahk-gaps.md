---
title: Пробелы при миграции с AutoHotkey
description: Известные расхождения в семантике и список проверки для документации по миграции с AutoHotkey в EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, gaps, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Проблемные места при миграции с AutoHotkey

На этой странице собраны места, где поведение AutoHotkey имеет достаточно скрытой семантики, и поэтому гайд по миграции должен быть особенно аккуратным.

Запись в таблице не всегда означает, что EyeAuras не может решить задачу. Чаще это значит, что нам все еще нужен проверенный рецепт, более понятная карта API или явная пометка «не эквивалентно».

Статусы:

- `Open` — еще не проверено.
- `Mapped` — путь в EyeAuras есть, но все еще нужны документация и примеры.
- `Candidate helper` — небольшой wrapper или готовый рецепт может сильно упростить миграцию.
- `Not equivalent` — такой сценарий лучше переписывать, а не переводить напрямую.

## Базовые расхождения

| ID | Область | Поведение AutoHotkey | Маршрут в EyeAuras | Что еще нужно проверить или описать | Статус |
|---|---|---|---|---|---|
| AHK-001 | Ожидание клавиш | `KeyWait` ждет отпускания или нажатия клавиши/кнопки, поддерживает timeout, logical/physical mode и влияет на поведение потока hotkey. | `ISendInputScriptingApi.IsKeyDown`, `IsMouseDown`, script `Sleep(...)` loop. | Текущий перевод в скрипт выглядит громоздко и слишком низкоуровнево. Нужно проверить паритет logical vs physical state и задокументировать helper с учетом отмены для ожидания up/down с timeout. | Candidate helper |
| AHK-002 | Режимы координат | `CoordMode` меняет значения по умолчанию для AHK thread для координат мыши, пикселей, tooltip, caret и menu. Для многих API по умолчанию используются client coordinates активного окна. | `ForScreen()`, `ForWindow(IWindowHandle)`, OSD region transform matrices, `IWindowHandle` bounds. | Нужна явная таблица соответствия для `Screen`, `Window` и `Client`, а также примеры для window-relative мыши и CV. | Open |
| AHK-003 | Грамматика `Send` | `Send` разбирает символы модификаторов, `{Key down/up}`, counts повтора, raw/text/blind modes и выбирает send modes. `SendMode` также меняет поведение некоторых mouse helper. | `ISendInputScriptingApi.KeyPress`, `KeyDown`, `KeyUp`, `Gesture`, `Text`, input simulator ids. | Нужно решить, учить ли только ручному переводу в документации или дать небольшой helper-парсер AHK send-string для частых случаев. | Open |
| AHK-004 | Восстановление модификаторов | В AHK `Send` есть menu masking, восстановление модификаторов, `{Blind}`, защиты для `Win`-key и управление self-trigger через `#InputLevel` / `SendLevel`. | Manual `KeyDown`/`KeyUp`, `Gesture`, `Text`. | Нужны тесты на stuck modifiers, комбинации с Win-key, активацию Alt-меню и рекурсию send-from-hotkey. | Open |
| AHK-005 | Префиксы hotkey | AHK поддерживает `~`, `*`, `$`, `Up`, left/right modifiers, пользовательские комбинации через `&` и контекстный `#HotIf`. | `KeybindAttribute` with `SuppressKey`, `IgnoreModifiers`, `ActivationType`, plus `IHotkeyTracker` for runtime hotkeys. | Нужно сопоставить префиксы AHK со свойствами keybind в EyeAuras. Для пользовательских комбинаций из двух клавиш и условий `#HotIf` могут понадобиться рецепты, а не прямой перевод. | Mapped |
| AHK-006 | Сопоставление окон | AHK `WinTitle` поддерживает `A`, `ahk_exe`, `ahk_class`, `ahk_id`, `ahk_pid`, `SetTitleMatchMode`, hidden-window rules и per-thread поведение Last Found Window. | `WindowMatchExpression`, `IWindowMatcher`, `IWindowListProvider`, `IWindowSelector`. | Базовое сопоставление по title/process/path/handle уже покрыто. Но все еще нужна таблица token-by-token для AHK `WinTitle`, правил регистра, hidden windows, `A` и Last Found Window. В EyeAuras лучше явно сохранять полученный `IWindowHandle`, а не полагаться на неявное состояние last-found. | Open |
| AHK-007 | Ввод на уровне контролов | `ControlClick` и `ControlSend` могут работать по контролам и иногда позволяют не активировать окно. | `ISendInputScriptingApi.TargetWindow`, send-input actions, possible native/window services. | Нужно проверить, есть ли script-facing API для уровня контролов. Если нет, это стоит пометить как territory для rewrite/native interop. | Open |
| AHK-008 | Таймеры | `SetTimer` создает timed subroutines с period, one-shot negative periods, priority, deletion и правилами reentrancy. | Script services with loops or observables; Aura Tree timer components only for configurable aura behavior. | Нужен рекомендуемый паттерн для повторяющейся работы и раздел с объяснением, что семантика timer thread из AHK напрямую не переносится. Ограничения конкретного `TimerTrigger` нельзя переносить на все таймеры C#-скрипта. | Open |
| AHK-009 | Clipboard wait/events | `A_Clipboard`, `ClipWait`, `ClipboardAll` и `OnClipboardChange` покрывают text, all formats, waiting и events. | `IClipboardManager` has text, image, file-drop, data object, and contains methods. | Нужно проверить доступность через DI в скриптах, ограничения UI thread, доступность сервисов ожидания/событий изменения и сохранение всех форматов. | Open |
| AHK-010 | Чтение пикселя | `PixelGetColor` возвращает одну RGB hex string по координате и имеет режимы `Alt`/`Slow`. | `ICvAccessor.ProcessPixels`, `PixelSearch`, `PickColor`. | Нужен короткий рецепт для цвета одного пикселя и заметки про visibility, перекрытие курсором и различия между full-screen/game capture. | Candidate helper |
| AHK-011 | Ошибки при pixel/image search | В AHK v2 функции могут возвращать значения или бросать исключения в зависимости от функции и типа ошибки; в v1 часто использовался `ErrorLevel`. | EyeAuras `PixelSearch` returns `Point.Empty`, `ImageSearch` returns `Rectangle.Empty`, raw APIs expose processed event args. | Нужна таблица миграции для v1/v2/error-handling. | Open |
| AHK-012 | Переменные | В AHK есть dynamic variables, ошибки unset-variable в v2, built-in variables и свободные паттерны scalar/object. | Primary: C# locals, fields, and objects. Shared/persistent: `IVariablesScriptingApi`, `ScriptVariable<T>`. | Нужны примеры, которые разделяют обычное состояние внутри скрипта и состояние, которое разделяется между запусками, между скриптами или с инфраструктурой EyeAuras. Также все еще нужно покрыть замену dynamic variable и typed conversions. | Open |
| AHK-013 | Активация окна из скрипта | `WinActivate` — это обычная функция, которая может restore/minimize/activate подходящие окна. | Script route: `IWindowSelector.GetWindow(...)`, `WindowHandleExtensions.Activate(...)`, `UnsafeNative.ActivateWindow(...)`. | Отдельного scripting API `WinActivate(...)` нет. Не используйте `WinActivateAction` как тонкую обертку из скриптов — это action component для Aura Tree. Нужно явно показать timeout/failure semantics, потому что foreground activation может не сработать или быть заблокирована Windows. | Mapped |
| AHK-014 | DPI и мониторы | На coordinate APIs в AHK влияют `CoordMode`, DPI, client area активного окна и multi-monitor layouts. | `IWindowHandle` bounds, `ForScreen()`, `ForWindow(...)`, OSD transform matrices. | Нужны примеры для multi-monitor и DPI для мыши, CV и выбора region. | Open |
| AHK-015 | DLL и native interop | `DllCall`, `CallbackCreate`, `Buffer`, `NumGet` и `NumPut` упрощают native calls и работу с pointer/struct, но делают ее очень динамической. | Direct migration is typed C# P/Invoke wrappers or small domain services; existing EyeAuras/PoeShared APIs are rewrite options. | Нужен более полный гайд по native interop для structs, callbacks, ownership, bitness и случаев, когда raw interop лучше заменить уже существующими API. | Open |

## Как пользоваться списком

При переносе сначала выберите тематическую страницу: [ввод](./keyboard-mouse), [окна](./windows), [хоткеи](./hotkeys), [CV](./cv-pixels-images), [состояние](./runtime-state), [буфер обмена](./clipboard), [DLL](./dll-native). Выполните показанную операцию в нужном контексте. Если существенный режим исходного AHK-кода не покрыт, оставьте его отдельным требованием, а не заменяйте похожим методом молча.

Статус в таблице относится к полному соответствию AHK, а не к существованию метода EyeAuras. В срезе EyeAuras `20fd3d4` / PoeEye `0e02c98` уточнены отдельные границы: стандартный ввод использует координаты рабочего стола и не гарантирует background input; selector хранит цель и не ждёт появления окна; запись текста в буфер доступна через нативную регистрацию; пустой `Point` у CV неоднозначен для `(0, 0)`. Это не закрывает паритет всех режимов.

AHK-примеры тематических страниц используют v2. Не переносите из v1 командный синтаксис и `ErrorLevel` без отдельной сверки с [изменениями v2](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/v2-changes.htm). Подробные внешние ссылки находятся рядом с соответствующими операциями.
