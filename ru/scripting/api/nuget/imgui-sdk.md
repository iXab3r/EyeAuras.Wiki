---
title: AI NuGet для ImGui SDK
description: Карта AI-документации для необязательного пакета EyeAuras ImGui SDK
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, imgui, nuget, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта API для ImGui SDK

Справочная карта по опциональному пакету `EyeAuras.ImGuiSdk`: цикл рендера ImGui, управляемые окна ImGui, переиспользуемый контент, изображения, шрифты и RE-стиль tool windows.

## Что обычно хотят сделать

- Добавить ImGui UI в скриптовый проект.
- Рендерить ImGui-контент каждый кадр.
- Открывать управляемые tool windows на ImGui.
- Хостить переиспользуемый объект контента.
- Использовать изображения и шрифты ImGui.
- Хостить UI `ReProcess`.
- Собрать корневую control surface для большого скриптового приложения или бота.

## Модель API

- `EyeAuras.ImGuiSdk` — это опциональный NuGet-пакет.
- Скрипты должны явно подключить его через ссылку на пакет и `ImGuiContainerExtensions`.
- Ссылка на пакет нужна, чтобы типы ImGui SDK компилировались; расширение контейнера делает сервисы ImGui SDK доступными из script container.
- `IImGuiExperimentalApi` отвечает за точку входа overlay/render-loop.
- `AddRenderer(...)` подписывает per-frame renderer.
- `RunOnce(...)` планирует callback на один кадр.
- `ImGuiWindowManager` управляет managed tool windows.
- `ICanBeDisplayedInImGui` — контракт для переиспользуемого контента.
- `IImGuiWindowContent` получает `ImGuiWindowCtx`.
- Хелперы для шрифтов, изображений и markdown в ImGui могут использовать embedded resources через `IScriptFileProvider`.

## Обязательная настройка

Для script mini-apps у `EyeAuras.ImGuiSdk` есть два обязательных шага настройки:

1. Подключите пакет: `EyeAuras.ImGuiSdk`.
2. Добавьте extension контейнера до того, как будете получать сервисы ImGui:

```csharp
AddNewExtension<ImGuiContainerExtensions>();

var imgui = GetService<IImGuiExperimentalApi>();
```

Не рассчитывайте, что `IImGuiExperimentalApi`, `ImGuiWindowManager` или другие сервисы ImGui SDK будут доступны только потому, что пакет успешно компилируется. Без `ImGuiContainerExtensions` получение сервисов может завершиться ошибкой или вернуть неполностью настроенный host.

## Детали API

- `IImGuiExperimentalApi` — render loop, настройки, шрифты, изображения.
- `ImGuiContainerExtensions` — регистрирует сервисы ImGui SDK в script DI.
- `WhenRender`, `AddRenderer`, `RunOnce` — интеграция в кадр.
- `NoActivate`, `ShowInTaskbar`, `VSync`, `MaxFramesPerSecond` — поведение overlay/окна и pacing кадров.
- `ImGuiWindowManager.OpenNew(...)` — managed windows.
- `ImGuiNewWindowArgs` — параметры создания окна.
- `ImGuiWindowHost` — lifetime хостируемого окна.
- `ICanBeDisplayedInImGui` — `ToImGui()`.
- `IImGuiWindowContent` — контент, знающий об окне.
- `IImGuiWindowContentPreBegin` — pre-`Begin` hook.
- `ImGuiWindowCtx` — заголовок, фокус, запрос на закрытие.
- `ImGuiEx` — вспомогательные контролы и утилиты.
- `IImGuiExperimentalApi.AddFont(...)` — добавить байты шрифта и получить `ImGuiFontSpec`.
- `IImGuiExperimentalApi.ReplaceFont(...)` — сделать шрифт шрифтом по умолчанию.
- `IImGuiExperimentalApi.RemoveFont(...)` — удалить зарегистрированный шрифт.
- `IImGuiExperimentalApi.GetOrAddImage(...)` / `RemoveImage(...)` — явная регистрация texture/image.

## Как устроен пакет и extension

- Ссылка на пакет: `EyeAuras.ImGuiSdk`.
- Основные namespace: `EyeAuras.ImGuiSdk`, `ImGuiNET` и часто `System.Numerics`.
- В script mini-apps всегда добавляйте `ImGuiContainerExtensions` до получения сервисов ImGui SDK из script container.
- В обычном app/plugin-коде используйте DI/composition-паттерн хоста, а не рассчитывайте на script-only helpers.
- Добавляйте созданный API/window/render subscription в lifetime владельца.
- Render callback вызывается каждый кадр, поэтому он должен быть быстрым и неблокирующим.

## Встроенные хелперы и контролы

`ImGuiEx` — первое место, куда стоит смотреть, прежде чем писать собственные виджеты.

- Контролы выбора:
  - `EnumCombo<TEnum>` для выбора enum.
  - `ComboBoxEx<T>` для одиночного и множественного выбора с фильтрацией, preview text и callbacks для checked-state.
  - `DropdownButton<T>` для фильтруемых picker'ов, открывающихся по кнопке.
- Булевы контролы и подтверждения:
  - `Checkbox(label, getter, setter)` для checkbox, привязанного к свойству.
  - `ToggleButton(...)` для кнопок вкл/выкл с активным стилем.
  - `ConfirmButton(...)` для destructive или рискованных команд, которым нужен явный второй клик, подтверждение Enter, отмена через Escape или auto-revert.
- Текстовые поля и hotkey input:
  - `TextField(...)` для строк с label + растянутым полем ввода.
  - `TextFieldWithConfirmButtons(...)` для сценариев edit/save/cancel.
  - `HotkeyEditor(...)` для записи `ImGuiKey`; есть overload'ы для WPF `Key` и WinForms `Keys`.
- Хелперы layout:
  - `FlexHorizontal(...)` для горизонтальных строк на базе таблиц.
  - `Stretched(...)` для layout'а значение + action фиксированной ширины.
  - `ImGuiListClipper()` для больших повторяющихся списков.
- Хелперы отображения:
  - `DisplayPropertyGrid(...)` для просмотра объектов и словарей.
  - `DisplayErrors(...)` для `IHasErrorProvider`.
  - `RenderToImGui(...)` для типовых значений, `ICanBeDisplayedInImGui`, путей, матриц и fallback-значений с copy-on-click.
  - `MarkdownBox(...)` для markdown-текста с опциональным кастомным рендерингом ссылок.
- Изображения и шрифты:
  - `ImageRgba32(...)` для текстур `Image<Rgba32>`.
  - `ImageFromUrl(...)` для рендера изображений из URL/data.
  - `AddFont`, `ReplaceFont`, `PushFont`, `PopFont`, `GetAwesomeFont` и `AwesomeIcon(...)` для кастомных шрифтов и встроенных иконок Font Awesome.
- Хелперы рисования:
  - `TextUnformattedOutlined(...)` и `TextOutline(...)` для читаемых overlay labels.
  - `ColorExtensions` конвертирует `System.Drawing.Color`, `System.Windows.Media.Color` и `Vector4` в форматы цветов ImGui.
  - `ImGuiExtensions` добавляет хелперы draw-list, например rectangles, dashed lines, dashed circles и filled circles.
  - `ImDrawListWorldExtensions` содержит W2S/world-space helpers для ESP-style рисования: линии, 2D/3D boxes, spheres, cylinders и world text.

## Ресурсы, шрифты и ассеты

- Шрифты можно загружать из embedded resource bytes, сгенерированных статических byte array, файлов и других источников байтов.
- Используйте `IImGuiExperimentalApi.AddFont(...)` для регистрации шрифта и `ReplaceFont(...)`, чтобы сделать его шрифтом по умолчанию.
- В старых примерах может встречаться `AddFontFromMemoryTTF`; в текущем SDK используется `AddFont(...)` и опционально `ReplaceFont(...)`.
- Для локального использования шрифта применяйте `ImGuiEx.PushFont(fontSpec)` / `PopFont(fontSpec)`.
- Используйте `ImGuiFontRangeType`, если шрифт должен содержать нестандартные диапазоны glyphs, например Cyrillic, Greek, Japanese, Korean, Thai, Vietnamese или Chinese.
- Используйте `IScriptFileProvider`, чтобы читать embedded bytes шрифтов, изображений и markdown из script project.
- Используйте `ImageRgba32(...)`, если mini-app уже работает с `Image<Rgba32>`.
- Используйте `ImageFromUrl(...)` для URL- или data-image-источников; embedded/local assets обычно лучше читать через `IScriptFileProvider`.
- Используйте стабильные image labels, потому что image helpers из `ImGuiEx` кэшируют состояние загрузки, texture и preview по ImGui ID.

## Состояние контролов и ID

ImGui работает в immediate-mode, но контролы всё равно хранят краткоживущее UI-состояние. Ключ к этому — ImGui ID.

- ID формируется из текущего стека ImGui ID и label контрола.
- `ImGuiEx` использует `ImGui.GetID(label)` и внутренний словарь состояния для многих контролов.
- Если ID остаётся стабильным между кадрами, состояние сохраняется.
- Если ID меняется, состояние сбрасывается.
- Если два контрола используют один и тот же ID, их состояние конфликтует.
- Если два разных типа контролов `ImGuiEx` используют один и тот же ID, один может перезаписать кэш состояния другого.

Примеры stateful-контролов в `ImGuiEx`:

- `ComboBoxEx` хранит текст фильтра, состояние open/closed, закреплённую ширину popup и индексы отфильтрованных элементов.
- `DropdownButton` хранит текст фильтра, pending multi-select edits, ширину popup и snapshots элементов.
- `ConfirmButton` хранит, находится ли кнопка в armed-состоянии, и когда нужно сделать auto-revert.
- `TextFieldWithConfirmButtons` хранит режим редактирования, buffer text и запрос фокуса.
- `HotkeyEditor` хранит состояние записи, pending key, original key и запрос фокуса.
- `ImageRgba32` / `ImageFromUrl` хранят состояние texture/loading/preview.
- `MarkdownBox` хранит состояние парсинга/рендера и состояние image/copy tooltip.

Правила для ID в генерируемом UI:

- Используйте стабильные labels для стабильных контролов: `ImGuiEx.ComboBoxEx("Reader", ...)`.
- Используйте скрытые suffix, если видимые labels повторяются: `Reader##local`, `Reader##kernel`.
- Используйте `##id`, если видимый label рисуется отдельно, а сам виджет должен быть без текстовой метки.
- Используйте `###id`, если видимый текст меняется, но состояние одного и того же контрола нужно сохранить.
- Оборачивайте повторяющиеся строки в `ImGui.PushID(stableItemId)` / `ImGui.PopID()`.
- Предпочитайте domain ID индексам списка, если список может сортироваться, фильтроваться или переупорядочиваться.
- Не генерируйте ID из `Guid.NewGuid()`, timestamps, случайных значений или меняющегося display text.
- Не создавайте бесконечно новые ID каждый кадр; `ImGuiEx` кэширует состояние по ID.

## Собственные контролы

- В script projects и mini-apps делайте переиспользуемые контролы как обычные static helper methods или небольшие классы, которые вызывают `ImGui` и `ImGuiEx`.
- Не пытайтесь расширять `ImGuiEx` через `partial` class из script project; partial-файлы `ImGuiEx` относятся к самой сборке ImGui SDK.
- Обычно контрол должен принимать стабильный `label`, текущее значение и setter или `ref` value, а затем возвращать `true`, если пользователь что-то изменил.
- Для состояния между кадрами предпочитайте поля на объекте контента, который реализует `ICanBeDisplayedInImGui` или `IImGuiWindowContent`.
- Для переиспользуемых static-контролов используйте переданный вызывающим кодом label как корневой ID и изолируйте дочерние виджеты через `PushID` и скрытые labels.
- Если кастомный контрол должен хранить собственное static-состояние, привязывайте его к `ImGui.GetID(label)` в текущем ID stack.
- Используйте `IImGuiWindowContent`, если контролу или панели нужен доступ к `ImGuiWindowCtx`, чтобы менять заголовок, запрашивать фокус или закрытие.
- Используйте `IImGuiWindowContentPreBegin` только тогда, когда контенту действительно нужно вызвать `ImGui.SetNextWindow*` до того, как managed window вызовет `ImGui.Begin`.

Пример формы:

```csharp
static bool ReaderPicker(
    string label,
    IReadOnlyList<ReaderOption> readers,
    ref ReaderOption selected)
{
    return ImGuiEx.ComboBoxEx(label, readers, ref selected,
        new ImGuiEx.ComboBoxExOptions<ReaderOption>
        {
            ItemTextGetter = x => x.Name,
            ShowFilter = true,
            FilterHint = "Filter readers..."
        });
}
```

Для более крупной панели вынесите состояние в класс и реализуйте `ICanBeDisplayedInImGui.ToImGui()`. Такая панель может вызывать хелпер выше на каждом кадре и реагировать только тогда, когда он возвращает `true`.

Форма для stateful custom control:

```csharp
private sealed class SearchBoxState
{
    public bool FocusNext;
}

private static readonly Dictionary<uint, SearchBoxState> SearchBoxStates = new();

static SearchBoxState GetSearchBoxState(string label)
{
    var id = ImGui.GetID(label);
    if (!SearchBoxStates.TryGetValue(id, out var state))
    {
        state = new SearchBoxState();
        SearchBoxStates[id] = state;
    }

    return state;
}

static bool SearchBox(string label, ref string filter)
{
    var state = GetSearchBoxState(label);

    ImGui.PushID(label);
    try
    {
        if (state.FocusNext)
        {
            ImGui.SetKeyboardFocusHere();
            state.FocusNext = false;
        }

        ImGui.SetNextItemWidth(-1);
        return ImGui.InputTextWithHint("##input", "Filter...", ref filter, 256);
    }
    finally
    {
        ImGui.PopID();
    }
}
```

## Что предпочитать

- Используйте эту карту пакета как основную точку входа по ImGui API.
- В скриптах начинайте настройку ImGui с `AddNewExtension<ImGuiContainerExtensions>()`.
- Для корневого overlay-рендера предпочитайте `AddRenderer`.
- Для tool windows предпочитайте `ImGuiWindowManager.OpenNew`.
- Для переиспользуемых панелей предпочитайте `ICanBeDisplayedInImGui`.
- Для архитектуры root-window, bot-loop и ImGui-plus-Blazor используйте `recipes/bot-memory-imgui-interface.md`.
- Для Razor UI используйте `windows-subsystems/blazor-windows.md`.
- Для экранных аннотаций используйте `osd/screen-overlay.md`.
- Для всех stateful и повторяющихся контролов используйте стабильные ImGui ID.
- Для правил по пакетам, ресурсам и embedded files используйте `scripting/references-and-resources.md`.

## Чего избегать

- Не считайте, что ImGui API входит в base SDK.
- Не считайте, что одна только ссылка на пакет регистрирует сервисы ImGui в script DI.
- Не пытайтесь получать `IImGuiExperimentalApi` до добавления `ImGuiContainerExtensions`.
- Не делайте render subscriptions без owner lifetime.
- Не управляйте множеством ad hoc `ImGui.Begin` окон, если есть manager.
- Не дублируйте виджеты, которые уже есть в `ImGuiEx`.
- Не используйте нестабильные labels для stateful и повторяющихся контролов; нестабильные ids приводят к потере фокуса, смешиванию состояния и неправильному выбору.
- Не блокируйте поток и не делайте sleep внутри render callbacks.

## Research Anchors

- `EyeAuras.ImGuiSdk`, `IImGuiExperimentalApi`, `ImGuiWindowManager`,
  `ImGuiWindowHost`, `ImGuiNewWindowArgs`, `ImGuiWindowCtx`,
  `ICanBeDisplayedInImGui`, `IImGuiWindowContent`,
  `IImGuiWindowContentPreBegin`, `ImGuiEx`, `ImGuiModule`,
  `ImGuiContainerExtensions`, `ImGuiExperimentalApi`, `ImGuiFontSpec`,
  `ImGuiFontRangeType`, `AddFont`, `ReplaceFont`, `RemoveFont`,
  `AddFontFromMemoryTTF`, `IScriptFileProvider`,
  `ImGui.GetID`, `ImGui.PushID`, `ImGui.PopID`, `GetOrAddState`,
  `ComboBoxEx`, `DropdownButton`, `ConfirmButton`, `TextField`,
  `TextFieldWithConfirmButtons`, `HotkeyEditor`, `ToggleButton`,
  `DisplayPropertyGrid`, `MarkdownBox`, `ImageRgba32`, `ImageFromUrl`,
  `AwesomeIcon`, `TextUnformattedOutlined`, `ImGuiExtensions`,
  `ImDrawListWorldExtensions`, `ColorExtensions`.

## Синонимы для поиска

- ImGui
- ImGui SDK
- immediate mode UI
- ImGui window
- render loop
- tool window
- ImGui overlay
- ImGui image
- ImGui font
- ImGuiContainerExtensions
- ImGui font range
- AddFontFromMemoryTTF
- embedded font
- embedded image
- ImGuiEx
- ImGui ID
- PushID
- hidden label
- stable label
- stateful control
- control state
- custom ImGui control
- property grid
- hotkey editor
- markdown
- Font Awesome
- world to screen
- ESP drawing

## Связанные карты

- `auras/overlays.md`
- `recipes/bot-memory-imgui-interface.md`
- `windows-subsystems/blazor-windows.md`
- `osd/screen-overlay.md`
- `reverse-engineering/reprocess.md`
- `scripting/container-extensions.md`
- `scripting/references-and-resources.md`