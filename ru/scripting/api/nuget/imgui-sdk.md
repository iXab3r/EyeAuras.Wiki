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


## Версии пакета

Сборки из [источника EyeAuras](https://packages.eyeauras.net/v3/index.json) различаются:

| Пакет | Подтверждённая поверхность |
| --- | --- |
| `0.1.17` | Старые `DrawFrame`, `DrawBox`, `MeasureText`, `AddFontFromMemoryTTF` |
| `0.1.42` | `AddFont`, `ReplaceFont`, `RemoveFont`, `RunOnce`, настройки FPS; без `ImGuiWindowManager` |
| `0.1.47` | Управляемые окна и `ComboBoxEx`, `DropdownButton`, `ToggleButton`; CTO `11.5.28` |

Сигнатуры проверяются по DLL/XML конкретной версии; поведение ниже описано по исходникам `c8b2304ac`. Карта включает более новые возможности, поэтому не переносите весь каталог в проект с `0.1.42`. Отдельный `TableTabState` принадлежит `EyeAuras.AI.Desktop`, а не пакету ImGui. Наличие символов не является проверкой нативного запуска.

## Показать окно на время запуска скрипта

В верхнеуровневом C#-скрипте EyeAuras подключите пакет и зарегистрируйте расширение до получения API. Этот пример рисует счётчик кадров до остановки скрипта:

```csharp
#r "nuget: EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System;
using System.Threading;
using System.Threading.Tasks;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var frame = 0;
    using var rendering = imgui.AddRenderer(_ =>
    {
        var visible = ImGui.Begin("Frame counter##operation-demo");
        try
        {
            if (visible)
                ImGui.TextUnformatted($"Frame: {++frame}");
        }
        finally
        {
            ImGui.End();
        }
    });
    try
    {
        await Task.Delay(Timeout.Infinite, cancellationToken);
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
}
```

Окно обновляется в потоке рендера. Подписка `AddRenderer(Action<IImGuiExperimentalApi>)` возвращает `IDisposable`; пример освобождает её перед API благодаря обратному порядку `using`. Получение через `GetService` само по себе не гарантирует освобождение. Обычный C#-класс получает API и токен от владельца, скриптовые методы в нём недоступны.

Исходники EyeAuras `20fd3d4` регистрируют `IImGuiExperimentalApi` как создаваемый экземпляр, но экземпляры арендуют общий overlay `Main`. Его настройки, шрифты и изображения общие: изменение `NoActivate`, `VSync`, FPS или шрифта по умолчанию затрагивает других пользователей overlay. `AddRenderer` не привязывает возвращённую подписку к lifetime API. В callback нельзя ждать, читать процесс или выполнять долгую работу.

`RunOnce(Action<IImGuiExperimentalApi>)` планирует один callback и возвращает отменяемую через `Dispose` регистрацию; это не ожидание завершения кадра. У этих методов нет параметра токена отмены. Нативный запуск и совместимость опубликованных версий пакета здесь не проверены.

### Прочитать размер на ближайшем кадре

После настройки пакета и `ImGuiContainerExtensions` выполните в верхнеуровневом
скрипте. Этот блок получает собственный API и освобождает его после операции:

```csharp
using ImGuiNET;
using EyeAuras.ImGuiSdk;
using System.Threading.Tasks;

{
    using var imgui = GetService<IImGuiExperimentalApi>();
    var done = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    using var once = imgui.RunOnce(_ =>
    {
        var size = ImGui.GetIO().DisplaySize;
        Log.Info($"Размер области ImGui: {size.X} x {size.Y}");
        done.TrySetResult(true);
    });
    await done.Task.WaitAsync(cancellationToken);
}
```

Чтение выполняется в render-контексте, не в обычном потоке скрипта.
`DisplaySize` — размер основной области отображения в единицах ImGui;
не подменяйте его `GetContentRegionAvail()` текущего окна. Для многовидового
режима нужны контракты соответствующего viewport своей версии ImGui.NET.
В отличие от `AddRenderer`, `RunOnce` не повторяет обработчик каждый кадр.
Освобождение регистрации до callback отменяет ещё не выполненный вызов,
но не прерывает уже начавшийся. Здесь Stop прерывает ожидание, затем `using`
снимает регистрацию. Сама регистрация не является Task выполнения.

### Что общее у двух скриптов

`Main` содержит `OsdOverlay`, наследующий `ClickableTransparentOverlay.Overlay`.
CTO создаёт нативный ImGui-контекст для этого overlay. Поэтому два экземпляра
API и две подписки не означают два независимых контекста. Скриптам принадлежат
их модели, callbacks и управляемые окна, но общий render-loop, контекст,
настройки overlay, атлас шрифтов и зависимости ImGui.NET/нативной ImGui
используются совместно. Управляемое окно — область внутри общего overlay,
не отдельное нативное окно Windows.

Не вызывайте `ImGui.CreateContext()` поверх работающего контекста EyeAuras
и не считайте другую версию ImGui.NET независимой от ABI нативной библиотеки
хоста. Версию пакета подбирают к поставке EyeAuras; отдельный проект скрипта
не даёт изоляцию процесса. Отдельный CTO overlay — другой сценарий с
собственным render-loop и ответственностью за совместимость.

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

Не рассчитывайте, что `IImGuiExperimentalApi` или другие сервисы ImGui SDK будут доступны только потому, что пакет успешно компилируется. Без `ImGuiContainerExtensions` получение сервисов может завершиться ошибкой или вернуть неполностью настроенный host.

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
- `ImGuiWindowManager` — статический менеджер, не сервис DI. Его окна закрывайте адресно через `Close(window)`; `CloseAll()` затронет чужие окна.
- API и подписки освобождает их владелец; менеджер освобождает закрытое окно при обработке кадров.
- Render callback вызывается каждый кадр, поэтому он должен быть быстрым и неблокирующим.

## Открыть несколько управляемых окон

Основная перегрузка — `OpenNew<TContent>(Func<TContent> factory, string titleBase, ...)`,
где `TContent : ICanBeDisplayedInImGui`; результат — `ImGuiWindowHost`.
Фабрика создаёт **отдельный экземпляр** состояния для каждого окна. В
[`getting-started`](/ru/scripting/imgui/getting-started) есть полный пример
двух счётчиков, адресного закрытия и ожидания очистки при Stop.

Host вызывает `ImGui.Begin` и гарантированный `ImGui.End`; в `ToImGui()`
контента рисуйте только содержимое. Менеджер выделяет `InstanceId`, а host
использует стабильный `Id` в метке `Title###Id`: одинаковые видимые заголовки
не объединяют состояние. Крестик или `ImGuiWindowCtx.Close()` запрашивает
закрытие этого host. Менеджер удаляет закрытый host и освобождает его при
обработке кадров; для контента с `IDisposable` вызывается `Dispose`.
`Close(window)` — запрос, а не синхронное подтверждение удаления.

`IImGuiWindowContent.ToImGui(ImGuiWindowCtx)` получает контекст уже после
`Begin`, а `IImGuiWindowContentPreBegin.PreBegin` вызывается **до** `Begin`.
Не вызывайте глобальный `CloseAll()` для очистки своего запуска.

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

Чтение bytes ресурса или декодирование картинки можно сделать до отрисовки,
но `GetOrAddImage`, `AddFont`, `RemoveImage` и `RemoveFont` меняют ресурсы,
которые использует renderer. Выполняйте регистрацию и удаление в render-контексте:
через `RunOnce` либо однократную ветку первого кадра. Сам `GetService` не
переносит эти вызовы на нужный поток. Не ставьте регистрацию в каждый кадр.

При Stop сначала запретите новые обращения и снимите свой `AddRenderer`,
затем запланируйте удаление принадлежащих вам image/font регистраций через
`RunOnce` и дождитесь callback, пока API ещё удерживает overlay. Только после
этого освобождайте свою долю API и загруженное изображение. Выбирайте собственные
стабильные имена текстур: атлас и cache общие, удаление чужого имени затронет
другой скрипт. Без работающего render-loop завершение такой очистки не гарантировано.

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
public sealed record ReaderOption(string Name);

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
- Для архитектуры root-window, bot-loop и ImGui-plus-Blazor используйте [recipes/bot-memory-imgui-interface.md](/ru/scripting/api/recipes/bot-memory-imgui-interface).
- Для Razor UI используйте [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows).
- Для экранных аннотаций используйте [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay).
- Для всех stateful и повторяющихся контролов используйте стабильные ImGui ID.
- Для правил по пакетам, ресурсам и embedded files используйте [scripting/references-and-resources.md](/ru/scripting/api/scripting/references-and-resources).

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

## ImGui window cleanup и выбор операции

Для immediate mode UI подключите `EyeAuras.ImGuiSdk` и зарегистрируйте
`ImGuiContainerExtensions`, затем получите `IImGuiExperimentalApi` в скрипте.
`AddRenderer` добавляет callback в render loop и возвращает отдельную подписку.
Владелец tool window / ImGui overlay освобождает эту подписку **до** API;
само получение API через `GetService` не задаёт cleanup. Дождитесь отмены Run
вне callback, как в [полном примере окна](/ru/scripting/imgui/getting-started).

| Операция | Контракт и существенное условие |
| --- | --- |
| Однократное чтение в ImGui context | `RunOnce` планирует callback, но не ожидает кадр; отдельно ожидайте результат с токеном |
| ImGui image или embedded image | Используйте image helpers и `IScriptFileProvider`; сохраняйте договорённость владельца ресурса |
| ImGui font, embedded font, font range | Используйте регистрацию шрифтов SDK; `AddFontFromMemoryTTF` напрямую требует корректного render-контекста и времени жизни памяти |
| Stateful control и custom ImGui control | Стабильный ImGui ID, `PushID`, hidden label / stable label отделяют control state от отображаемого текста |
| Property grid, hotkey editor, markdown, Font Awesome | Начните с готовых `ImGuiEx` и контролов SDK, описанных выше |
| World to screen и ESP drawing | Используйте явное преобразование координат перед отрисовкой; screen и world координаты не взаимозаменяемы |

Overlay `Main`, настройки и ресурсы общие для его пользователей. Изменение
свойств одного API не создаёт независимый ImGui singleton. Совместимость
нескольких ImGui.NET versions и native render loop нельзя вывести из одной
успешной компиляции скрипта.

## Связанные карты

- [auras/overlays.md](/ru/scripting/api/auras/overlays)
- [recipes/bot-memory-imgui-interface.md](/ru/scripting/api/recipes/bot-memory-imgui-interface)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay)
- [reverse-engineering/reprocess.md](/ru/scripting/api/reverse-engineering/reprocess)
- [scripting/container-extensions.md](/ru/scripting/api/scripting/container-extensions)
- [scripting/references-and-resources.md](/ru/scripting/api/scripting/references-and-resources)

Правила ID: [Dear ImGui FAQ](https://github.com/ocornut/imgui/blob/v1.91.6/docs/FAQ.md#q-about-the-id-stack-system).
