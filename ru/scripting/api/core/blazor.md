---
title: Основа Blazor в AI Core
description: AI-ориентированная карта reactive-компонентов PoeShared.Blazor, разрешения view, репозитория контента и JS-утилит.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, blazor, razor, reactive, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта Blazor Foundation

Справочная карта общей Blazor/Razor-инфраструктуры, которая используется в UI приложения EyeAuras, Blazor-окнах, C#-оверлеях, WebView2 host'ах и переиспользуемых UI-контролах.

Для native window hosting используйте [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows), для screen overlay rendering — [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay). Общие принципы `PropertyBinder`, Rx/ReactiveUI и DynamicData, на которых построены реактивные view-model и отслеживание коллекций, описаны в [core/reactivity.md](/ru/scripting/api/core/reactivity).

## Типовые задачи

- Собрать Razor UI, который реагирует на изменения состояния view-model.
- Передать view-model в Razor-компонент через `DataContext`.
- Отрисовать динамический компонент для объекта модели.
- Зарегистрировать или разрешить Razor view по типу контента.
- Использовать JS-хелперы для фокуса, буфера обмена, CSS, keyboard hooks и dynamic roots.
- Понять, почему компонент перерисовывается или не перерисовывается.
- Добавить в host ресурсы для Blazor или metadata JS-компонентов.

## Основные понятия

- `PoeShared.Blazor` — общий базовый слой Blazor.
- `ReactiveComponentBase` — низкоуровневая базовая реализация компонента с `Anchors`, `WhenRefresh`, sampling refresh-событий, счётчиками рендеров, lifecycle-флагами, логированием и очередью задач after-render.
- `BlazorReactiveComponentBase` добавляет Blazor-специфичное отслеживание состояния, `DataContext`, `Class`, `Id`, `Style`, безопасную обёртку над JS runtime и реактивную привязку refresh.
- `BlazorReactiveComponent` — обычный базовый класс для Razor-компонентов.
- `BlazorReactiveComponent<TContext>` — вариант с типизированным `DataContext`.
- `ReactiveSection` — предпочтительный способ перерисовывать только часть UI, когда меняются выбранные observables или реактивные коллекции.
- `BlazorContentPresenter` отрисовывает динамическое view для объекта `Content`.
- `IBlazorViewRepository` разрешает типы view по типу контента и необязательному ключу.
- `IBlazorContentRepository` хранит дополнительные статические файлы и metadata JS-компонентов, которые используют Blazor host'ы.
- `IJsPoeBlazorUtils` оборачивает типовые операции JavaScript/DOM/WebView2.

## Ключевые типы и API

- `ReactiveComponentBase` — базовый `ComponentBase` с `IReactiveComponent`, `IDisposable`, `IAsyncDisposable`, `Anchors` и `WhenRefresh`.
- `BlazorReactiveComponentBase` — добавляет `DataContext`, безопасный `IJSRuntime`, отслеживание выражений через `Track(...)` и `ReactiveTrackerList`.
- `BlazorReactiveComponent` — базовый класс по умолчанию для не-generic Razor-компонентов.
- `BlazorReactiveComponent<TContext>` — базовый класс с типизированным `DataContext`.
- `ReactiveSection` — локальная реактивная граница перерисовки компонента.
- `ReactiveTrackerList` — список observables, выражений `WhenAnyValue`, списков/кэшей DynamicData и change set'ов, которые могут вызывать обновление section.
- `BlazorContentPresenter` — presenter для динамических компонентов, который использует явный `ViewType` или поиск view через repository.
- `IBlazorViewRepository` — разрешает зарегистрированные view.
- `IBlazorViewRegistrator` — регистрирует view assemblies или отдельные типы view.
- `BlazorViewAttribute` — переопределяет тип DataContext, ключ view или помечает view как доступное только для manual registration.
- `AssemblyHasBlazorViewsAttribute` — marker assembly, который используется при автоматическом сканировании view.
- `IBlazorContentRepository` / `BlazorContentRepository` — дополнительные статические файлы плюс `JSComponentConfigurationStore`.
- `IJsPoeBlazorUtils` — clipboard, focus, click, scroll, загрузка CSS/JS, dynamic root components, keyboard hooks, хелперы для class/attribute и DOM breadcrumbs.
- `BlazorCommandWrapper` — оборачивает команды ReactiveUI для поверхностей команд Blazor/WPF и предоставляет состояние busy/error.
- `BlazorErrorBoundary` — error boundary с колбэком `OnError`.
- `PoeSharedBlazorRegistrations` — модуль регистрации Unity/DI для общих сервисов Blazor.

## Подготовить компонент и увидеть обновление

Примеры ниже предназначены для Razor-компонентов внутри настроенного
Blazor-host EyeAuras/PoeShared, где доступны `PoeShared.Blazor`,
`PoeShared.Blazor.Scaffolding`, `PoeShared.Blazor.Services` и `ReactiveUI`.
Для отслеживания модели она должна отправлять `PropertyChanged`; обычное
свойство без уведомлений не заставит `ReactiveSection` обновиться.

Минимальный компонент с собственным состоянием не требует отдельной модели:

```razor
@inherits PoeShared.Blazor.BlazorReactiveComponent

<button @onclick="Increment">Добавить</button>
<span>@count</span>

@code {
    private int count;
    private async Task Increment()
    {
        count++;
        await Refresh("Increment");
    }
}
```

После нажатия число увеличивается. `Refresh` проходит через инфраструктуру
компонента; для части UI с внешними observables используйте `ReactiveSection`,
как ниже. Его `DebounceTime` по умолчанию равен нулю; положительное значение
использует выборку событий (`Sample`), а не ожидание полной тишины в потоке.
Подписки компонента добавляйте в `Anchors` и освобождайте вместе с компонентом.

## Буфер обмена файлы и DOM

Для законченных примеров `IJsPoeBlazorUtils` используйте [буфер обмена и DOM из Razor](blazor-js-operations). Там показаны копирование и чтение текста, загрузка UTF-8-файла, фокус после отрисовки, выделение, прокрутка и получение элементов под точкой. Также разобраны перегрузки CSS/атрибутов и владение регистрациями обработчиков.

Внедрённый JS-сервис принадлежит host. Освобождаются созданные компонентом регистрации, а не сервис после каждого вызова. Для начальной работы с `ElementReference` дождитесь отрисовки элемента.

## Типовые сценарии

### Реактивный Razor-компонент

Для следующего фрагмента создайте `MyViewModel` с уведомляющим свойством
`Status` и коллекцией DynamicData `Items`, передайте экземпляр через
`DataContext`. Это схема подключения вашей модели, а не отдельный готовый
компонент:

```razor
@inherits BlazorReactiveComponent<MyViewModel>

<ReactiveSection Trackers="@(new ReactiveTrackerList()
    .With(DataContext.WhenAnyValue(x => x.Status))
    .With(DataContext.Items))">
    <div>@DataContext.Status</div>
</ReactiveSection>
```

Используйте `ReactiveSection` для состояния, которое должно обновлять этот фрагмент. Старые component API `Track(...)` / `TrackState(...)` всё ещё существуют, но помечены как заменённые реактивными секциями.

### Динамическое view для модели

Здесь `currentModel` — поле компонента с вашим объектом модели. До первого
показа зарегистрируйте соответствующее view в host:

```razor
<BlazorContentPresenter Content="@currentModel" />
```

Presenter разрешает view через `IBlazorViewRepository` по типу модели и ключу.
При отсутствии соответствия repository возвращает `null`; поздняя регистрация
сама по себе не гарантирует обновления уже показанного presenter. Если найденное view наследуется от `BlazorReactiveComponent`, presenter передаёт модель в `DataContext`.

### Регистрация типа view

В инициализации модуля получите `IBlazorViewRegistrator` через DI;
`MyDetailsView` и `MyModel` ниже — ваши типы:

```csharp
registrator.RegisterViewType(typeof(MyDetailsView), typeof(MyModel), "Details");
```

Автоматическое сканирование ожидает, что assembly помечена `AssemblyHasBlazorViewsAttribute`. View также может наследоваться от `BlazorReactiveComponent<TContext>`, и тогда repository сможет вывести тип контента автоматически.

### Использование JS utilities

```razor
@inject IJsPoeBlazorUtils JsUtils

<input id="search-box" />
<button @onclick="FocusSearch">Focus</button>

@code {
    private async Task FocusSearch()
    {
        await JsUtils.FocusElementById("search-box");
    }
}
```

После нажатия Focus фокус переходит в поле `search-box`. Вызывайте это
после появления элемента в DOM. Сервис должен быть зарегистрирован в host.
Всегда ожидайте JS-вызовы через `await`. Безопасная обёртка над JS runtime логирует ошибки JS invocation и сообщает о пропущенных `await` через dispatcher компонента.

## Контекст host'а и runtime

- UI приложения и WebView2 host'ы регистрируют общие сервисы Blazor через `PoeSharedBlazorRegistrations`.
- Razor-компоненты используют Blazor `[Inject]`, `[Parameter]`, lifecycle methods и `DataContext`; глобальные переменные верхнего уровня скрипта не являются глобалами компонента.
- Blazor-окна используют эту основу, но дополнительно работают с native window ownership и WebView2 hosting.
- C#-оверлеи используют ту же основу, но настраиваются через aura overlay settings.
- Blazor в браузере не имеет доступа ко всем сервисам native host'а; например, контроллеры окон host'а — это понятие native host'а.

## Что предпочитать

- Предпочитайте `BlazorReactiveComponent<TContext>`, если компонент рассчитан на конкретный тип view-model.
- Предпочитайте `ReactiveSection` и явные элементы `ReactiveTrackerList`, если нужен точный контроль над перерисовкой.
- Предпочитайте `BlazorContentPresenter` и регистрацию view для динамического UI.
- Предпочитайте `IJsPoeBlazorUtils` для типовых операций с DOM, clipboard, focus, CSS и JS.
- Предпочитайте `Anchors` для подписок компонента и других ресурсов, которыми владеет компонент.
- Если задача связана с открытием, размерами, перемещением или управлением native Blazor-окном, переходите в [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows).

## Чего избегать

- Не предполагаете, что обычные Blazor-компоненты могут обращаться к top-level member'ам скрипта вроде `Log`, `Variables` или `cancellationToken`.
- Не делайте широкие refresh всего компонента, если небольшая `ReactiveSection` может отслеживать нужное состояние напрямую.
- Не используйте устаревшие `Track(...)` / `TrackState(...)` в новых компонентах.
- Не регистрируйте view только по соглашению, если для одной модели существует несколько view; используйте ключ или явную регистрацию.
- Не используйте fire-and-forget для JS interop; вызывайте через `await` и обрабатывайте исключения.
- Не добавляйте JS-компоненты после того, как страница уже загружена, если не уверены, что metadata компонента доступна на стороне клиента.

## Ключевые сущности для поиска

- `ReactiveComponentBase`
- `BlazorReactiveComponentBase`
- `BlazorReactiveComponent`
- `BlazorReactiveComponent<TContext>`
- `ReactiveSection`
- `ReactiveTrackerList`
- `BlazorContentPresenter`
- `IBlazorViewRepository`
- `IBlazorViewRegistrator`
- `BlazorViewAttribute`
- `AssemblyHasBlazorViewsAttribute`
- `IBlazorContentRepository`
- `BlazorContentRepository`
- `IJsPoeBlazorUtils`
- `BlazorCommandWrapper`
- `BlazorErrorBoundary`
- `PoeSharedBlazorRegistrations`

## По каким словам искать

- Blazor foundation
- Razor component
- reactive component
- BlazorReactiveComponent
- ReactiveSection
- ReactiveTrackerList
- DataContext
- dynamic view
- view repository
- BlazorContentPresenter
- JS interop
- IJsPoeBlazorUtils
- WebView2 Blazor
- component refresh
- component anchors

## Связанные карты

- [blazor-windows](../windows-subsystems/blazor-windows)
- [screen-overlay](../osd/screen-overlay)
- [reactivity](reactivity)
- [app-runtime-contexts](app-runtime-contexts)
- [runtime](../scripting/runtime)
- [reactive-lifetime](../scripting/reactive-lifetime)
- [async](../scripting/async)
