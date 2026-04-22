---
title: Переход с AutoHotkey на EyeAuras
description: Материалы для переноса скриптов AutoHotkey в скриптинг, триггеры, действия и сервисы EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Переход с AutoHotkey на EyeAuras

Это основная страница по миграции скриптов AutoHotkey в EyeAuras. Тема AHK слишком большая для одного документа, поэтому подробные заметки по переходу вынесены в отдельные страницы по направлениям.

Используйте эту страницу вместе с [AHK Gaps](./ahk-gaps). Там собраны моменты, которые требуют дополнительной проверки, прежде чем их можно будет считать полноценными эквивалентами.

## План

- Держать эту страницу небольшой: навигация, рамки темы и краткая сводная таблица.
- Подробные примеры кода, рекомендации и ссылки на проверку выносить в тематические страницы, например [Windows](./windows), [Hotkeys](./hotkeys) и [DLL And Native Interop](./dll-native).
- На каждой тематической странице должна быть короткая таблица соответствий, несколько точечных примеров конверсии, отдельные абзацы `**Recommendation:**` и ссылки на документацию или исходники.
- Если тематическая страница становится слишком большой, разбивать её дальше. Например, `windows.md` со временем можно разделить на `windows/matching.md`, `windows/activation.md` и `windows/controls.md`.
- Всё поведение, в котором остаётся неопределённость, фиксировать в [AHK Gaps](./ahk-gaps) и ссылаться на ID оттуда, а не прятать оговорки внутри примеров.

## Как читать это руководство

- В примерах AutoHotkey в первую очередь используются имена и синтаксис v2. Отличия v1, включая командный синтаксис и особенности `ErrorLevel`, отмечаются как нюансы миграции.
- Скрипты EyeAuras — это C#-скрипты. У файлов верхнего уровня есть доступ к host members, таким как `Sleep(...)`, `AuraTree`, `Variables` и `cancellationToken`; сервисы обычно внедряются как свойства скрипта.
- В примерах миграции отдавайте приоритет прямым script API и сервисам. `Actions`, `Triggers` и `Overlays` имеет смысл упоминать только тогда, когда пользователь собирает настраиваемое поведение в Aura Tree, либо когда компонент даёт существенную runtime-логику по домену, а не просто тонкую обёртку над API.
- У каждого соответствия должна быть короткая оценка. Недостаточно написать просто «возможно» — в гайде должно быть понятно, когда подход EyeAuras чище, когда он просто приемлем, когда неудобен, а когда лучше оформить решение как helper или recipe.

## Разделы

| Раздел | Для чего использовать | Текущее состояние |
|---|---|---|
| [Hotkeys](./hotkeys) | Метки горячих клавиш, `Hotkey`, `#HotIf`, простые действия по хоткею | Есть первые примеры конверсии и ссылки на исходники. Нужна доработка для custom combo/prefix. |
| [Keyboard And Mouse](./keyboard-mouse) | `Send`, `SendText`, `SendInput`, `GetKeyState`, `KeyWait`, `MouseMove`, `Click` | Есть конверсии для прямого ввода, ожидания клавиши и кликов по координатам. Грамматика `Send` пока остаётся пробелом. |
| [Windows](./windows) | `WinExist`, `WinActive`, `WinWait`, `WinActivate`, `ControlClick`, `ControlSend` | Есть поиск и активация одного окна. Нужна полная таблица токенов `WinTitle`. |
| [CV, Pixels, And Images](./cv-pixels-images) | `CoordMode`, `PixelGetColor`, `PixelSearch`, `ImageSearch` | Есть конверсия `PixelSearch`. Нужны `CoordMode` и таблицы для чтения цвета одного пикселя. |
| [Runtime, Timers, And State](./runtime-state) | `Sleep`, `SetTimer`, переменные, globals, shared state | Есть `sleep` и обычное состояние. Нужны recipes для таймеров и общих переменных. |
| [Clipboard](./clipboard) | `A_Clipboard`, `ClipboardAll`, `ClipWait`, события буфера обмена | Есть заготовка. Нужна проверка script DI и событий. |
| [DLL And Native Interop](./dll-native) | `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, `NumPut`, raw Win32 | Сначала прямые примеры P/Invoke; существующие API EyeAuras/PoeShared можно использовать как варианты переписывания. |
| [AHK Gaps](./ahk-gaps) | Междоменные семантические различия и список того, что ещё надо проверить | Здесь ведётся учёт нерешённых моментов и кандидатов на helper-функции. |

## Сводная матрица

| Что нужно в AutoHotkey | API AHK | Основной раздел | Путь в EyeAuras | Оценка |
|---|---|---|---|---|
| Запускать код по хоткею | Метки хоткеев вроде `^!s::`, `Hotkey`, `#HotIf` | [Hotkeys](./hotkeys) | `[Keybind]`, `IHotkeyTracker` | Хорошо подходит для статических хоткеев; для динамических и контекстных нужно больше сопоставлений. |
| Отправлять ввод с клавиатуры или текст | `Send`, `SendText`, `SendInput` | [Keyboard And Mouse](./keyboard-mouse) | `ISendInputScriptingApi` | Хорошо подходит для явного ввода; слабое место — полная грамматика `Send` из AHK. |
| Читать состояние клавиш или мыши | `GetKeyState`, `KeyWait` | [Keyboard And Mouse](./keyboard-mouse) | `ISendInputScriptingApi.IsKeyDown`, `IsMouseDown` | `GetKeyState` выглядит нормально; для `KeyWait` нужен helper. |
| Двигать мышь и кликать | `MouseMove`, `Click`, `MouseClick`, `MouseGetPos` | [Keyboard And Mouse](./keyboard-mouse) | `ISendInputScriptingApi` | Хорошо, особенно с overloads по координатам. |
| Проверять и выбирать окна | `WinExist`, `WinActive`, `WinWait`, `WinWaitActive` | [Windows](./windows) | `IWindowSelector.FindWindow(...)`, `IWindowMatcher`, window services | Хорошо для поиска одного окна; для семантики ожидания нужен отдельный паттерн. |
| Активировать окна | `WinActivate` | [Windows](./windows) | `IWindowSelector.GetWindow(...)`, `WindowHandleExtensions.Activate(...)` | Хорошо работает как прямой script code после получения handle. |
| Спать или повторить позже | `Sleep`, `SetTimer` | [Runtime, Timers, And State](./runtime-state) | Script `Sleep(...)`, loops, services, observables | `Sleep` реализуется хорошо; `SetTimer` требует переработки подхода. |
| Искать пиксели или изображения | `PixelGetColor`, `PixelSearch`, `ImageSearch`, `CoordMode` | [CV, Pixels, And Images](./cv-pixels-images) | `CV.ForScreen()`, `CV.ForWindow(...)`, `ICvAccessor` | Более явно, чем в AHK, но и тяжелее по структуре. |
| Читать или писать текст в буфер обмена | `A_Clipboard`, `ClipWait`, `OnClipboardChange` | [Clipboard](./clipboard) | `IClipboardManager` | Базовый текст, скорее всего, покрывается нормально; полное поведение буфера обмена пока слабое место. |
| Хранить состояние скрипта | Переменные, built-in variables, globals | [Runtime, Timers, And State](./runtime-state) | Локальные переменные/поля/объекты C#; `ScriptVariable<T>` — только для shared state | Для обычного состояния лучше, чем в AHK; для общего состояния нужны понятные recipes. |
| Вызывать нативные DLL | `DllCall`, `CallbackCreate`, `Buffer`, `NumGet`, `NumPut` | [DLL And Native Interop](./dll-native) | Типизированные C#-обёртки P/Invoke; существующие API как варианты переписывания | Прямой эквивалент есть, но в C# нужны явные сигнатуры и понимание правил lifetime. |

## Ссылки по EyeAuras

- [Scripting Runtime](../scripting/runtime) — правила script host, правила для helper classes, `KeybindAttribute`, `ExecutionAnchors` и `IVariablesScriptingApi`.
- [Input, Hooks, Hotkeys](../windows-subsystems/input-hooks-hotkeys) — keybinds, hotkey triggers, input simulators и `ISendInputScriptingApi`.
- [Window Handles](../windows-subsystems/window-handles) — `IWindowHandle`, `IWindowSelector`, `IWindowListProvider`, matching и activation.
- [OSD Selection](../osd/selection) — интерактивный выбор окон, областей, точек и цветов.
- [Computer Vision / Images](../computer-vision/images) — capture, `ImageSearch`, `PixelSearch`, OCR и обработка изображений.
- [ISendInputScriptingApi](../ISendInputScriptingApi) — вывод клавиатуры и мыши из скриптов.
- [IComputerVisionExperimentalScriptingApi](../IComputerVisionExperimentalScriptingApi) — CV accessors для экрана и окон.
- [IVariablesScriptingApi](../IVariablesScriptingApi) — общие и persistent переменные скрипта.

## Ссылки по AutoHotkey

- [AutoHotkey source repository](https://github.com/AutoHotkey/AutoHotkey)
- [AutoHotkey docs repository](https://github.com/AutoHotkey/AutoHotkeyDocs)
- [Changes from v1.1 to v2.0](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/v2-changes.htm)