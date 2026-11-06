---
title: AI Windows — ввод, хуки и горячие клавиши
description: AI-ориентированная карта сервисов отправки ввода, хуков, перехвата и горячих клавиш.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, input, hotkeys, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта API по Input Hooks, Hotkeys и Send Input

Справочная карта по хукам клавиатуры и мыши, хоткеям, биндам методов скрипта, API для отправки ввода, симуляторам ввода, сглаживанию, подавлению ввода и нативным detour-механизмам.

## Что обычно хотят сделать

- Привязать методы скрипта к хоткеям.
- Отслеживать состояние хоткея как триггер ауры.
- Отправлять ввод с клавиатуры, мыши или текст.
- Выбрать backend для input simulator или smoother.
- Получать сырые события клавиатуры и мыши.
- Подавлять ввод для keybind-сценариев, когда это нужно.

## Модель понятий

- `[Keybind]` — это метаданные метода скрипта для привязки хоткея.
- `HotkeyIsActiveTrigger` — условие хоткея для ауры.
- `ISendInputScriptingApi` — скриптовый API для отправки ввода.
- `IKeyboardEventsSource` предоставляет потоки событий клавиатуры и мыши от хоста.
- `IInputSimulatorProvider` выбирает backend для send-input.
- `IUserInputSmootherProvider` выбирает smoother для движения мыши.
- Низкоуровневые hook/detour API — это инфраструктура, а не основной API для скриптов.

## Основные API

- `KeybindAttribute` — метаданные привязки хоткея для скрипта.
- `KeybindAttribute.Hotkey` — строковый жест, например `F5` или `Ctrl+Shift+P`.
- `KeybindAttribute.SuppressKey` — если `true`, исходное событие клавиши помечается как обработанное/подавленное и для key-down, и для key-up.
- `KeybindAttribute.IgnoreModifiers` — если `true`, обязательные модификаторы должны присутствовать, но дополнительные тоже допускаются.
- `KeybindAttribute.ActivationType` — выбирает вызов по `KeyDown` или `KeyUp`.
- `KeybindActivationType` — enum для key-down/key-up, который использует `[Keybind]`.
- `HotkeyGesture` — удобное для кода представление хоткея. Если хоткей заранее известен в коде, лучше использовать конструкторы и enum-значения.
- `IHotkeyConverter` — преобразование строки в `HotkeyGesture`. Обычно нужен для сохранённых пользовательских настроек, ввода в редакторе или текста из конфигов.
- `IHotkeyTracker` — отслеживание хоткея во время выполнения. `IsEnabled` по умолчанию равен `true`; меняйте его только если действительно хотите временно выключить и потом снова включить трекер.
- `HotkeyIsActiveTrigger` — триггер ауры по состоянию хоткея.
- `ISendInputScriptingApi` — API отправки ввода для скриптов.
- `IInputSimulatorProvider`, `IInputSimulatorEx` — обнаружение симулятора и выбор backend.
- `IUserInputSmootherProvider`, `IUserInputSmoother` — сглаживание движения мыши.
- `IKeyboardEventsSource` — потоки событий клавиатуры и мыши.
- `HookEngine` — продвинутый движок нативных detour-функций.

## Что использовать в первую очередь

- Для простых клавиатурных шорткатов в скрипте — `[Keybind]`.
- Для пользовательских условий хоткея в ауре — `HotkeyIsActiveTrigger`.
- Если клавиша и модификаторы заранее известны в коде — `new HotkeyGesture(...)`.
- Если хоткей читается из сохранённого текста или пользовательского ввода — `IHotkeyConverter`.
- Для отправки ввода из скрипта — `ISendInputScriptingApi`.
- Для simulator/smoother — id, найденные через provider.
- Для начала работы с целевым окном — [osd/selection.md](/ru/scripting/api/osd/selection).

## Чего лучше избегать

- Не используйте сырые подписки на глобальные хуки для простых хоткеев.
- Не парсьте захардкоженные строки хоткеев через `IHotkeyConverter`, если `HotkeyGesture` через конструктор будет понятнее.
- Не пишите в примерах `IHotkeyTracker.IsEnabled = true`, если до этого трекер не был отключён — `true` уже стоит по умолчанию.
- Не рассчитывайте, что id симуляторов будут установлены на каждой машине.
- Не используйте нативные detour-механизмы для обычных хуков клавиатуры и мыши.

## Типовые сценарии

- Runtime-хоткей через Rx:
  - создайте `IHotkeyTracker` через `IFactory<IHotkeyTracker>`.
  - задайте `Hotkey` через `new HotkeyGesture(...)`, если хоткей определён в коде, или через `IHotkeyConverter`, если он пришёл из сохранённой строки или пользовательского ввода.
  - задавайте `HotkeyMode`, `SuppressKey`, `IgnoreModifiers` или `HandleApplicationKeys` только если значения по умолчанию вам не подходят.
  - подпишитесь на `WhenAnyValue(x => x.IsActive)` и отфильтруйте только `true`.
  - освобождайте tracker и подписку вместе со временем жизни владельца; в top-level scripts используйте `ExecutionAnchors` для ресурсов на один запуск.

- Метод скрипта с `[Keybind]`:
  - помечайте атрибутом instance-методы объекта скрипта.
  - методы могут быть public или non-public.
  - на один метод можно повесить несколько атрибутов `[Keybind]`.
  - во время выполнения строка разбирается через `IHotkeyConverter`.
  - вызов обработчика планируется в background scheduler.
  - параметры метода перед вызовом разрешаются через script DI container.
  - если метод возвращает `Task`, runtime ждёт завершения задачи.
  - исключения пишутся в event log ауры как failed keybind events.
  - регистрация активна только пока execution tracker скрипта находится в состоянии running.

## Отправить ввод без создания компонента ауры

В C# Action внедрите сервис и отправьте клавишу активному приложению:

```csharp
ISendInputScriptingApi SendInput { get; init; }

SendInput.KeyPress(Key.F1);
Log.Info("Запрос F1 отправлен");
```

Регистрацию API предоставляет Roxy; стандартный симулятор — `Windows Input`. Журнал подтверждает завершение вызова, а не обработку клавиши приложением. `TargetWindow` не гарантирует background input. Задержки, координаты и ограничения отмены описаны рядом с [операциями SendInput](../ISendInputScriptingApi).

Для реакции на клавишу используйте законченный пример [Keybind](../../keybinds). Для динамического tracker создавайте экземпляр фабрикой и освобождайте его вместе с подпиской в конце запуска. Нативные события и фоновые keybind-обработчики не дают разрешения менять UI напрямую; при необходимости используйте диспетчер соответствующего UI. В обычные классы передавайте сервисы явно.

## Опорные точки для исследования

- `KeybindAttribute`, `KeybindActivationType`,
  `HotkeyTrackerRuntimeVisitor`, `HotkeyGesture`, `IHotkeyConverter`,
  `IHotkeyTracker`, `HotkeyIsActiveTrigger`, `ISendInputScriptingApi`,
  `IInputSimulatorProvider`, `IUserInputSmootherProvider`,
  `IKeyboardEventsSource`, `HookEngine`.

## По каким словам искать

- hotkey
- keybind
- keyboard hook
- mouse hook
- send input
- input simulator
- input smoother
- target window input
- suppress key
- ignore modifiers
- key down
- key up
- keybind activation type
- method parameter injection
- native detour

## Связанные карты

- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)
- [auras/triggers.md](/ru/scripting/api/auras/triggers)
- [auras/actions.md](/ru/scripting/api/auras/actions)
- [osd/selection.md](/ru/scripting/api/osd/selection)
- [windows-subsystems/window-handles.md](/ru/scripting/api/windows-subsystems/window-handles)

## Границы tracker, provider и detour

У `IHotkeyTracker` режим `Hold` следует за нажатием/отпусканием, а `Click` переключает состояние на отпускании; фильтр `IsActive == true` в Click не означает вызов на каждое нажатие. `HandleApplicationKeys = false` исключает Click-события, когда активно само приложение. Это контракт tracker, а не способ изменить `KeybindAttribute.ActivationType`.

`InputSimulatorProvider.ResolveById` возвращает зарегистрированный объект, а `Resolve(idOrName)` возвращает observable и может создать proxy до регистрации реального backend. Наличие имени не доказывает `IsAvailable`. Provider сглаживания также разрешает зарегистрированные ID; каталог страницы не устанавливает драйверы.

[HookEngine](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Hooking/HookEngine.cs) — отдельный механизм нативных detour текущего процесса. Он удерживает delegate, возвращает delegate оригинального вызова и требует отдельного включения hook; Dispose отключает hooks и освобождает allocator. Это не регистрация клавиатурного хоткея и не гарантия безопасного изменения функций, уже исполняемых другими потоками.
