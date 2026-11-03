---
title: Буфер обмена и DOM из Razor
description: Операции IJsPoeBlazorUtils для текста файлов фокуса прокрутки и диагностики элементов
published: true
date: 2026-11-03T00:00:00.000Z
tags: scripting, api, blazor, razor, clipboard, dom
editor: markdown
dateCreated: 2026-11-03T00:00:00.000Z
---
# Буфер обмена и DOM из Razor

`IJsPoeBlazorUtils` выполняет операции с браузерной частью Blazor: копирует текст, предлагает загрузку файла, управляет выделением, фокусом и DOM-элементами. Для обычных операций используйте этот сервис; собственный JS-модуль нужен для поведения, которого в нём нет.

Примеры предназначены для Razor-компонента внутри настроенного Blazor-host EyeAuras/PoeShared, где зарегистрирован `PoeShared.Blazor.Services.IJsPoeBlazorUtils` и доступны ресурсы `PoeShared.Blazor`. Создание самого окна описано в [Blazor Windows](/ru/scripting/blazor-windows/getting-started). Это другой контекст, чем верхнеуровневый C# Action.

## Скопировать текст и предложить загрузку файла

Создайте компонент `ReportPanel.razor` со следующим содержимым и покажите его в существующем Blazor-окне:

```razor
@using System
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using PoeShared.Blazor.Services
@inherits PoeShared.Blazor.BlazorReactiveComponent
@inject IJsPoeBlazorUtils Js

<textarea id="@fieldId" @ref="field" @bind="report"></textarea>
<button @onclick="Copy">Копировать</button>
<button @onclick="ReadClipboard">Прочитать буфер</button>
<button @onclick="Download">Скачать отчёт</button>
<button @onclick="Select">Выделить текст</button>
<button @onclick="Scroll">Показать поле</button>

@code {
    private readonly string fieldId = "report-" + Guid.NewGuid().ToString("N");
    private ElementReference field;
    private string report = "Результат проверки";

    private Task Copy() => Js.SetClipboardText(report);

    private async Task ReadClipboard()
    {
        report = await Js.GetClipboardText();
        await Refresh(nameof(ReadClipboard));
    }

    private Task Download() =>
        Js.DownloadTextFile("report.txt", report, "text/plain;charset=utf-8");

    private async Task Select()
    {
        await Js.FocusElementById(fieldId);
        await Js.SelectAllTextInElement(field);
    }

    private Task Scroll() =>
        Js.ScrollElementIntoView(field, behavior: "smooth", block: "center", inline: "nearest");
}
```

«Копировать» передаёт содержимое поля в буфер. «Прочитать буфер» заменяет текст поля полученной строкой. «Скачать отчёт» предлагает браузерную загрузку UTF-8-файла с указанным именем: это не запись по произвольному пути на диске. Доступ к буферу и загрузкам зависит от возможностей и разрешений host.

Обработчики выполняются после появления поля в DOM, поэтому `ElementReference` уже можно использовать. Для начального фокуса без кнопки вызывайте операцию после отрисовки компонента, а не в конструкторе или `OnInitialized`. Условно создаваемое поле также нужно сначала отрисовать.

Сервис внедрён host и не принадлежит компоненту; не вызывайте его `DisposeAsync` после копирования. Все операции ожидаются через `Task`, поэтому ошибки остаются в обычной цепочке обработки события.

## Получить элементы под точкой

В `DomInspector.razor` координаты мыши передаются непосредственно из браузерного события:

```razor
@using System.Linq
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor.Services
@inherits PoeShared.Blazor.BlazorReactiveComponent
@inject IJsPoeBlazorUtils Js

<div data-role="inspection-area" @onmousedown="Inspect">
    Нажмите здесь для диагностики DOM.
</div>
<pre>@summary</pre>

@code {
    private string summary = "";

    private async Task Inspect(MouseEventArgs e)
    {
        var hits = await Js.GetElementBreadcrumbsAt(
            e.ClientX, e.ClientY, maxDepth: 5,
            attributeNames: new[] { "data-role", "id" });

        summary = string.Join("\n", hits.Select(hit => hit.Node.Tag));
        await Refresh(nameof(Inspect));
    }
}
```

Метод возвращает `HtmlElementBreadcrumb[]`: для каждого найденного элемента доступны `Node` и путь предков `Path`. Координаты — `ClientX/ClientY` в viewport браузера, а не физические экранные координаты окна.

Параметр `maxDepth` ограничивает число элементов в стеке попаданий под точкой; он не задаёт глубину цепочки предков. `attributeNames` определяет, какие атрибуты включить в описания. При необходимости передайте токен операции последним аргументом `cancellationToken`.

## Выделение и прокрутка

| Вызов | Аргументы и результат |
|---|---|
| `SelectAllTextInElementById(string elementId)` | Выделяет текст по DOM-id |
| `SelectAllTextInElement(ElementReference elementRef)` | Выделяет текст уже отрисованного поля |
| `SelectTextRangeInElement(ElementReference elementRef, int? start = default, int? end = default, JsSelectionRangeDirection direction = Forward)` | Передаёт начало, конец и направление выделения; смещения относятся к текстовому полю |
| `FocusElementById(string elementId)` | Устанавливает фокус по id, без символа `#` |
| `ClickElementById(string elementId)` | Вызывает браузерный click элемента, а не глобальный ввод мыши |
| `ScrollElementIntoView(ElementReference elementRef, string behavior = "smooth", string block = "nearest", string inline = "nearest")` | Прокрутка к элементу; `block` — вертикальное, `inline` — горизонтальное выравнивание |
| `ScrollToTop(string elementSelector)` и `ScrollToBottom(string elementSelector)` | Принимают селектор, например `#report-list` |
| Те же методы с `TimeSpan duration` | Передают длительность анимации в миллисекундах |

Для `ScrollElementIntoView` используйте `behavior` `auto` или `smooth`; выравнивание — `start`, `center`, `end` или `nearest`. Не путайте параметр `elementId` у методов фокуса/выделения с селектором у методов прокрутки. Метод реализации `ScrollToTopById` не входит в интерфейс и в рассматриваемом срезе бросает `NotImplementedException`; используйте `ScrollToTop`.

## CSS и атрибуты

У `AddClass`, `RemoveClass`, `ToggleClass` и `HasClass` есть перегрузки для строкового селектора и для `ElementReference`. Первые два принимают `params string[] classNames`, последние два — одно имя класса. `HasClass` возвращает `Task<bool>`.

`SetClass(ElementReference, params string[])` заменяет набор классов. `SetAttribute(ElementReference, string name, string? value)` задаёт атрибут, а при `null` удаляет его; `RemoveAttribute(ElementReference, string name)` удаляет явно. Применяйте их после отрисовки; постоянное состояние UI удобнее задавать через Razor и модель.

Например, внутри обработчика компонента с существующим `field`:

```csharp
await Js.AddClass(field, "selected");
await Js.SetAttribute(field, "data-state", "ready");
bool selected = await Js.HasClass(field, "selected");
await Js.RemoveAttribute(field, "data-state");
await Js.RemoveClass(field, "selected");
```

## Регистрации с временем жизни

| Операция | Кто завершает регистрацию |
|---|---|
| `AddKeyboardHook<THandler>(ElementReference, THandler, string methodName)` | Возвращает `ElementKeyboardHookRef`; владелец вызывает `DisposeAsync` |
| Перегрузка `AddKeyboardHook<THandler>` с `DotNetObjectReference<THandler>` | Вызывающий сохраняет ссылку, снимает hook через `RemoveKeyboardHook` и освобождает свой `DotNetObjectReference` |
| `SuppressWellKnownBrowserShortcuts(JsBrowserShortcutSuppressionOptions? options = null)` | Возвращает `JsBrowserShortcutSuppressionRef` с асинхронным освобождением |
| `RegisterWindowTitleBarGestures<THandler>(ElementReference, DotNetObjectReference<THandler>, double? dragThresholdPixels = null)` | Возвращает `JsWindowTitleBarGestureRef`; ссылка на callback также принадлежит вызывающему |
| `AddRootComponent(string elementId, string componentIdentifier, object initialParameters = default)` | Возвращает `IDynamicRootComponent`; освобождайте созданный компонент вместе с владельцем |

Для callback передайте объект с нужным JS-invokable методом. Идентификатор динамического компонента и его metadata должны быть зарегистрированы в host до создания; наличие обычного Razor-типа не заменяет регистрацию. Эти операции предназначены для интеграции компонента с host, а не для неограниченного создания глобальных обработчиков.

У `JsBrowserShortcutSuppressionOptions` есть `Shortcuts`, `AllowCtrlAInEditable`, `AllowSelector`, `PreventDefault` и `StopPropagation`. По умолчанию Ctrl+A сохраняет обычное поведение в редактируемых элементах; поддеревья с `data-poe-browser-shortcuts="allow"` исключены, `PreventDefault` включён, `StopPropagation` выключен. Это регистрация в DOM текущего браузера, а не глобальный keyboard hook ОС.

`RegisterAncestorContextMenuTarget(ElementReference, string ancestorSelector, string registrationId)` возвращает уникальный селектор отмеченного предка. Для снятия передайте тот же селектор и id в `UnregisterAncestorContextMenuTarget(string targetSelector, string registrationId)`. Не переносите маркер другой регистрации на своего владельца.

## Дополнительные операции host

- `ShowAlert(string message)` показывает текстовое сообщение через SweetAlert.
- `LoadCss(string cssPath)` подключает CSS; путь должен быть доступен браузеру.
- `LoadScript(string scriptPath)` загружает JS-файл. Для собственного кода с API и очисткой предпочитайте [ES-модуль](/ru/scripting/blazor-windows/js-loadscript).
- `RegisterFileDropTarget(ElementReference)` подключает приём файлов через WebView2. Host должен обработать `WebMessageReceived` и переданные объекты; это не готовый callback с путями файлов в Razor. В контракте указан WebView2 SDK не ниже 1.0.1518.46.
- `DisposeAsync()` освобождает JS-модуль сервиса. Для внедрённого экземпляра временем жизни управляет host.

## Версия и связанные операции

Контракты и реализация сверены с PoeEye `0e02c98dcab4bff263684f1c0647eed120e2700f`: [IJsPoeBlazorUtils](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor/Services/IJsPoeBlazorUtils.cs), [JsPoeBlazorUtils](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor/Services/JsPoeBlazorUtils.cs). Доступность конкретной операции зависит от версии host и поставляемых ресурсов.

- [Основа Blazor](blazor)
- [Окна Blazor](../windows-subsystems/blazor-windows)
- [Время жизни и подписки](../scripting/reactive-lifetime)
