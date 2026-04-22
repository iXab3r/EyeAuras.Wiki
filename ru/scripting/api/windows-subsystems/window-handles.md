---
title: AI Windows — дескрипторы окон
description: AI-first карта дескрипторов окон, селекторов, матчеров и провайдеров.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, windows, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта API по `HWND`, сопоставлению и отслеживанию окон

Справочная карта по нативным дескрипторам окон, преобразованию сырого `HWND`, перечислению окон, сопоставлению, отслеживанию foreground-окна и изменений границ окна.

Интерактивный выбор окна описан в `osd/selection.md`.

## Что обычно нужно сделать

- Преобразовать сырой `HWND` / `IntPtr` в `IWindowHandle`.
- Прочитать для окна process id, title, bounds, owner, parent и visibility.
- Перечислить известные окна.
- Сопоставлять окна по title, process, path, handle или выражению.
- Поддерживать живой выбор целевого окна.
- Отслеживать foreground window или изменения bounds.

## Модель сущностей

- `IWindowHandle` — это обёртка PoeShared над нативным окном.
- `IWindowHandleProvider` преобразует сырые handle в обёртки.
- `IWindowListProvider` отвечает за живое перечисление, ignored windows, blacklists и определение foreground window.
- `IWindowMatcher` выполняет stateless-сопоставление по выражению.
- `IWindowSelector` хранит stateful active target на основе match expression.
- `IWindowHandleMatcher` и `IComplexWindowHandleMatcher` — это инфраструктурные include/exclude predicates.
- Трекеры foreground и bounds работают поверх нативных event hooks.

## Детали API

- `PoeShared.Native.IWindowHandle`
  - Используйте `Handle` только там, где действительно нужен сырой `IntPtr`.
  - Вместо повторных Win32-запросов предпочитайте `ProcessId`, `ProcessName`, `Title`, `Bounds` и метаданные owner/parent/state.

- `PoeShared.Native.IWindowHandleProvider`
  - `GetByWindowHandle(IntPtr hwnd)` преобразует сырой handle.
  - `GetMonitorByWindowHandle(IntPtr hwnd)` определяет monitor context.
  - Не занимается выбором или перечислением окон.

- `IWindowListProvider`
  - `AllWindowList`, `WindowList`, `IgnoredWindows`, `BlacklistedWindows`.
  - `ResolveByHandle(IntPtr)`, `GetForegroundWindow()`, `RefreshWindowList()`.

- `IWindowMatcher`
  - `IsMatch(...)` и `FindMatches(...)` для `WindowMatchExpression`.

- `IWindowSelector`
  - `TargetWindow`, `ActiveWindow`, `MatchingWindowList`, `OnlyVisible`, `WindowFilter`.
  - Используйте, когда коду нужно постоянное выбранное целевое окно, которое следует за match expression.

- `WindowSelectorExtensions`
  - `FindWindow(...)` устанавливает `TargetWindow` и возвращает выбранное `ActiveWindow`, либо `null`, если совпадений нет.
  - `GetWindow(...)` устанавливает `TargetWindow` и возвращает выбранное `ActiveWindow`; используйте его, когда отсутствие окна считается исключительной ситуацией.
  - Используйте `TargetWindow` вместе с `ActiveWindow`, если отсутствие окна ожидаемо и его нужно обрабатывать без исключений, при этом коду важно сохранить состояние selector.
  - Используйте `IWindowMatcher.FindMatches(...)`, если коду намеренно нужны несколько совпадений или сопоставление по переданному списку.

- `WindowHandleExtensions`
  - `Activate(...)` выводит `IWindowHandle` на передний план.
  - `Activate(...)` делегирует вызов в `UnsafeNative.ActivateWindow(...)`.
  - `ToWindowMatchExpressionOrDefault(...)` создаёт переиспользуемое match expression из известного handle окна.

- `UnsafeNative.ActivateWindow(...)`
  - Низкоуровневый helper для активации с overload-ами для `IntPtr`, `IWindowHandle`, timeout и log.
  - Перед активацией восстанавливает свёрнутые окна и ждёт переключения foreground window.
  - Выбрасывает исключение, если целевое окно не стало foreground до истечения timeout.
  - В примерах для скриптов и документации предпочтительнее `WindowHandleExtensions.Activate(...)`.

- `IForegroundWindowTracker`, `IWindowTracker`
  - Отслеживание foreground/active window.

- `IWindowBoundsTrackerFactory`
  - Отслеживает изменения прямоугольника окна.

## Типовые сценарии

- Сырой handle в обёртку:
  - получите `IntPtr hwnd`;
  - вызовите `IWindowHandleProvider.GetByWindowHandle(hwnd)`;
  - передайте дальше `IWindowHandle`.

- Постоянный выбор целевого окна:
  - получите `IWindowSelector`;
  - установите `TargetWindow`;
  - читайте `ActiveWindow` и `MatchingWindowList`.

- Поиск одного целевого окна:
  - получите `IWindowSelector`;
  - вызывайте `FindWindow(...)`, если отсутствие окна ожидаемо и должно обрабатываться без исключения;
  - вызывайте `GetWindow(...)` только если отсутствие окна — исключительная ситуация;
  - используйте `TargetWindow` вместе с `ActiveWindow`, если коду нужно постоянное состояние selector;
  - сохраняйте возвращённый `IWindowHandle`, а не запрашивайте окно повторно по сырому handle или строке.

- Несколько совпадений или stateless-запрос:
  - получите `IWindowListProvider` и `IWindowMatcher`;
  - прочитайте `WindowsProvider.WindowList.Items`;
  - вызовите `IWindowMatcher.FindMatches(..., targetExpression)`.

- Одноразовая проверка "окно активно":
  - получите `IWindowListProvider` и `IWindowMatcher`;
  - вызовите `IWindowListProvider.GetForegroundWindow()`;
  - вызовите `IWindowMatcher.IsMatch(foregroundWindow, targetExpression)`.

- Активация найденного окна:
  - получите `IWindowSelector`;
  - вызывайте `FindWindow(...)`, если сценарий с отсутствующим окном должен обрабатываться явно;
  - вызывайте `GetWindow(...)` только если отсутствие окна — исключительная ситуация;
  - вызовите `Activate(...)` у handle.

- Базовые правила `WindowMatchExpression`:
  - обычный текст сопоставляется с process path, process name или title;
  - текст в кавычках — строгое совпадение;
  - `/pattern/` — это regex;
  - `0x...` или `&H...` сопоставляется с нативным handle;
  - `#2` выбирает второе подходящее окно;
  - `&&` и `||` объединяют более простые выражения;
  - свойства вроде `[type=toplevel]`, `[type=child]`, `[visible]` и `[focus]` дополнительно ограничивают сопоставление.

- Отслеживание bounds:
  - получите `IWindowBoundsTrackerFactory`;
  - вызовите `Track(window)`;
  - освободите subscription вместе с lifetime владельца.

## Что предпочтительно использовать

- Предпочитайте `IWindowHandle` после выбора/разрешения окна.
- Используйте `IWindowHandleProvider` только для преобразования сырого handle.
- Для живого сопоставления целевого окна предпочитайте `IWindowSelector`.
- Для поиска одного окна без исключений предпочитайте `IWindowSelector.FindWindow(...)`.
- `IWindowSelector.GetWindow(...)` используйте только когда отсутствие окна — исключительная ситуация.
- Для сопоставления нескольких окон, работы с переданными списками или проверок active window без изменения состояния selector предпочитайте `IWindowMatcher` вместе с `IWindowListProvider`.
- Для простых операций с окнами предпочитайте прямые API, работающие с window handle.
- Вместо сырых native event hooks предпочитайте trackers.

## Чего лучше избегать

- Не храните сырой `IntPtr` как долгоживущий контракт.
- Не используйте `IWindowHandleProvider` как selector или enumerator.
- Не используйте aura Actions, Triggers или Overlays как лёгкие обёртки для простых script/API-операций. Это stateful-объекты runtime Aura Tree со своей конфигурацией и lifecycle.
- Не копируйте AutoHotkey `WinTitle` tokens вроде `ahk_exe` или `ahk_class` напрямую в `WindowMatchExpression`; переносите их осознанно.
- Не считайте активацию гарантированной: foreground activation может завершиться по timeout или быть заблокирована Windows.
- Не пишите прямой низкоуровневый WinEvent code, если уже есть trackers.

## Опорные сущности для поиска

- `IWindowHandle`, `IWindowHandleProvider`, `IWindowListProvider`,
  `IWindowMatcher`, `IWindowSelector`, `WindowMatchExpression`,
  `WindowSelectorExtensions`, `WindowHandleExtensions`,
  `UnsafeNative.ActivateWindow`,
  `IWindowHandleMatcher`, `IComplexWindowHandleMatcher`,
  `IForegroundWindowTracker`, `IWindowBoundsTrackerFactory`,
  `IWinEventHookWrapper`.

## Поисковые синонимы

- HWND
- IntPtr window handle
- window handle wrapper
- window selector
- window matcher
- foreground window
- active window
- target window
- window exists
- WinExist
- WinActive
- WinActivate
- window bounds tracker
- WinEvent hook

## Связанные карты

- `osd/selection.md`
- `osd/screen-overlay.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `memory/processes.md`