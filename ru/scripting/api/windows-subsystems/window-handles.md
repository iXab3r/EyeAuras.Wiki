---
title: AI Windows — дескрипторы окон
description: AI-first карта дескрипторов окон, селекторов, матчеров и провайдеров.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, windows, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта API по HWND, сопоставлению и отслеживанию окон

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

## Найти и активировать окно

Откройте Блокнот и выполните в C# Action:

```csharp
IFactory<IWindowSelector> WindowSelectorFactory { get; init; }

{
    using var selector = WindowSelectorFactory.Create();
    var window = selector.FindWindow("notepad.exe");
    if (window == null)
    {
        Log.Info("Подходящее окно пока не найдено");
        return;
    }
    window.Activate(TimeSpan.FromMilliseconds(500));
    Log.Info($"Выбрано окно: {window.Title}");
}
```

Отдельным selector владеет этот запуск, `using` освобождает его подписки. Дескриптор и внедрённая фабрика остаются за инфраструктурой host. В обычный класс передайте фабрику через конструктор. Пример требует работающего desktop-host, его нативных регистраций и UI Core; SDK предоставляет типы, а не живой список окон.

`FindWindow` назначает выражение и сразу читает `ActiveWindow`; он не ждёт появления окна. `GetWindow` делает то же, но при `null` бросает `InvalidOperationException`. `ActiveWindow` — выбранная цель selector, не foreground ОС. Живой список обновляется с задержкой; текущая цель сохраняется, пока ещё соответствует выражению.

Selector по умолчанию не требует видимость (`OnlyVisible = false`), а при назначении цели выбирает тип top-level и внешние окна, если выражение не меняет эти параметры. Простой текст ищется в path/title/args; process name сравнивается целиком. Поэтому `notepad.exe` не равно ограничителю AHK `ahk_exe`. `#2` означает второе совпадение после сортировки, несмотря на комментарий о zero-based index в XML.

Активация синхронна, может восстановить свёрнутое окно и не принимает токен отмены. Успех зависит от foreground-политики Windows; не переносите её на UI-поток только потому, что это операция с окном.

## Дождаться окна конкретного процесса

Чтобы искать только процесс, задайте `WindowFilter`, а затем читайте живую
цель selector. В этом примере верхнеуровневого C# Script откройте Блокнот
после запуска скрипта:

```csharp
using System;
using System.IO;
using System.Threading.Tasks;
using EyeAuras.Shared.Services;
using PoeShared.Native;
using PoeShared.Prism;

{
    var runToken = cancellationToken;
    var factory = GetService<IFactory<IWindowSelector>>();
    using var selector = factory.Create();
    selector.OnlyVisible = true;
    selector.WindowFilter = candidate => string.Equals(
        Path.GetFileNameWithoutExtension(candidate.ProcessName),
        "notepad", StringComparison.OrdinalIgnoreCase);
    selector.TargetWindow = "#1";

    IWindowHandle window;
    while (true)
    {
        runToken.ThrowIfCancellationRequested();
        window = selector.ActiveWindow;
        if (window != null && window.IsWindow)
        {
            break;
        }
        await Task.Delay(250, runToken);
    }
    Log.Info($"Найден Блокнот: {window.Title}");
}
```

`#1` выбирает первое совпадение **после** фильтрации; наличие нескольких окон
не гарантирует выбор нужного документа. `ProcessName` в этом срезе берётся
из имени исполняемого файла, а при недоступности пути — из
`Process.ProcessName`. Поэтому здесь убрано расширение и сравнивается всё
имя без учёта регистра. Совпадение текста в чужом заголовке больше не подходит.

Цикл ждёт появления цели; Stop прерывает задержку и освобождает selector.
`IsWindow` проверяет HWND в момент чтения, но окно всё равно может исчезнуть
перед следующим вызовом. Для повторяющейся работы заново читайте
`selector.ActiveWindow` на каждой итерации: сохранённая переменная `window`
сама не переключается на новое окно. Дескриптор заимствован у инфраструктуры,
его не добавляют в собственный `using`.

## Получить независимый список окон процесса

Чтобы сохранить выбор другого selector, читайте снимок `IWindowListProvider`,
не меняя `TargetWindow`. В C# Script с работающим desktop-host:

```csharp
using System;
using System.IO;
using System.Linq;
using EyeAuras.Shared.Services;

var provider = GetService<IWindowListProvider>();
provider.RefreshWindowList();
var snapshot = provider.WindowList.Items.ToArray();
var matches = snapshot.Where(w => w.IsWindow && string.Equals(
    Path.GetFileNameWithoutExtension(w.ProcessName),
    "notepad", StringComparison.OrdinalIgnoreCase)).ToArray();
foreach (var w in matches)
    Log.Info($"{w.Title}, PID: {w.ProcessId}");
```

Это снимок списка, а не гарантия существования каждого окна во время
последующей операции. Провайдер и handles заимствованы; не освобождайте их.
Для **строкового выражения**, которое может совпадать с разными полями,
используйте `GetService<IWindowMatcher>().FindMatches(snapshot, expression)`.
Передавайте материализованный массив: контракт метода принимает
`IReadOnlyList<IWindowHandle>`, а не произвольный ленивый `IEnumerable`.

## Проверить процесс foreground-окна

Это отдельный запрос, он не читает и не меняет цель существующего selector:

```csharp
using System;
using System.IO;
using EyeAuras.Shared.Services;

var foreground = GetService<IWindowListProvider>().GetForegroundWindow();
var isNotepad = foreground != null && foreground.Handle != IntPtr.Zero &&
    foreground.IsWindow && string.Equals(
        Path.GetFileNameWithoutExtension(foreground.ProcessName),
        "notepad", StringComparison.OrdinalIgnoreCase);
Log.Info($"Блокнот на переднем плане: {isNotepad}");
```

Провайдер может вернуть обёртку нулевого HWND, поэтому одной проверки
managed-ссылки на `null` недостаточно. Состояние foreground меняется сразу
после чтения; эта проверка не блокирует переключение окна пользователем.

## Перевести точку относительно рамки окна

У найденного `IWindowHandle` методы `ToScreen(Point)` и `FromScreen(Point)` прибавляют или вычитают начало `DwmFrameBounds`; невалидные границы дают исключение. Это координаты относительно рамки, а не обещание Win32 client area. Сначала выберите систему координат входа и backend ввода; свойства матриц OSD сами по себе не доказывают нужное преобразование.

Для наблюдения границ `IWindowBoundsTrackerFactory.Track(window)` возвращает `IObservable<Rectangle?>`. Освобождайте свою подписку в конце операции; тип допускает `null`. В реализации этого среза связь освобождения нативного hook с подпиской явно не установлена, поэтому это не обещание полного завершения всех нативных ресурсов. Не предполагайте UI-поток доставки без проверки host.

## Наблюдать границы выбранного окна

Полный пример для C# Action: откройте Блокнот, запустите скрипт и перемещайте
окно в течение десяти секунд. Выбор здесь использует обычное широкое выражение;
для ограничения процессом примените фильтр из предыдущей операции.

```csharp
using System;
using System.Reactive.Linq;
using System.Threading.Tasks;
using EyeAuras.Shared.Services;
using EyeAuras.Shared.Scaffolding;
using PoeShared.Native;
using PoeShared.Prism;

{
    using var selector = GetService<IFactory<IWindowSelector>>().Create();
    var window = selector.FindWindow("notepad.exe");
    if (window == null || !window.IsWindow)
    {
        Log.Info("Окно пока не найдено; запустите пример ещё раз");
        return;
    }

    var tracker = GetService<IWindowBoundsTrackerFactory>();
    using var subscription = tracker.Track(window).Subscribe(
        bounds => Log.Info(bounds.HasValue
            ? $"Границы: {bounds.Value}"
            : "Границы недоступны"),
        error => Log.Error("Отслеживание границ завершилось ошибкой", error));
    await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);
}
```

Первое значение приходит при подписке, следующие — при изменении границ.
Через десять секунд или при Stop подписка освобождается. Это наблюдение за
одним HWND, оно не переподключается к новой цели selector. Допустимый `null`
не следует считать гарантированным событием закрытия окна; поток может
завершиться ошибкой. Фабрика — общий сервис, поэтому сам `tracker` здесь
не освобождается.

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
  - При неудаче бросает `InvalidStateException`. Нулевой foreground может продлить ожидание до 10 секунд; timeout не является строгим пределом. Для null/нулевого HWND вызов ничего не делает.
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
  - сравнение текста, включая полное совпадение в кавычках, использует `OrdinalIgnoreCase`; regex использует `RegexOptions.IgnoreCase`. Проверяются также аргументы запуска; process name сравнивается целиком, остальные поля могут давать частичное совпадение;
  - текст в кавычках — строгое совпадение;
  - `/pattern/` — это regex;
  - `0x...` или `&H...` сопоставляется с нативным handle;
  - `#2` выбирает второе подходящее окно;
  - в `FindMatches` `&&` последовательно сужает результат, а `||` выбирает первую непустую альтернативу; это не объединение всех результатов. `IsMatch` принимает простое выражение;
  - selector обрабатывает `[type=toplevel]`, `[type=child]` и `[ownedBy=...]`; свойства `[visible]` и `[focus]` не становятся фильтрами только оттого, что парсер их прочитал. Видимость задаётся `OnlyVisible`.

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
