---
title: "Подсветить свой элемент модулем проекта"
description: "Загрузите ES-модуль после отрисовки, передайте ему один ElementReference и освободите модуль вместе с компонентом."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Подсветить свой элемент модулем проекта

Небольшой JavaScript-модуль подсвечивает один элемент вашей панели. Текст и кнопка — в Razor. JS только добавляет или убирает один класс у элемента, который ему явно передали.

Нужен настольный EyeAuras с сервисами Blazor/WebView2 для скриптов и файловым сервисом проекта. Удалённая страница, сеанс браузера и скачанные JS-библиотеки не нужны.

1. Создайте ауру `RecipeHighlight` и добавьте **Actions → On Enter → C# Script** для ручного **Run**. Через **New file → Component** добавьте `MainWindow` и замените его единственный Razor-файл кодом ниже. Если появился сгенерированный code-behind с дублирующим счётчиком, уберите его.
2. Через **New file → Component** создайте `_Imports.razor` в корне проекта и замените его содержимое импортами ниже. Через **New file → JavaScript** и **New file → CSS** создайте два файла и переименуйте их в `wwwroot/highlight.js` и `wwwroot/panel.css`. Целиком замените содержимое. JS-файл здесь — ES-модуль, а не классический скрипт из шаблона.
3. Замените **Script.csx**, дождитесь компиляции и нажмите **Run**. В окне появятся текст в рамке и кнопка **Toggle highlight**. Кнопка станет доступна после первой отрисовки, когда модуль загрузится.
4. Нажмите кнопку: жёлтый фон и обводку получит только этот элемент. Повторное нажатие уберёт подсветку. Другие приложения и элементы модуль не выбирает.
5. Закройте окно или нажмите **Stop**. При уничтожении компонент очистит модуль, освободит ссылку на него и выполнит базовую очистку. При следующем Run подсветка будет выключена.

## Script.csx

```csharp
using System;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using PoeShared.Blazor.Wpf;
using RecipeHighlight;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.Title = "Own DOM highlight";
    window.Width = 480;
    window.Height = 320;
    var closed = window.WhenClosed.Take(1).ToTask(cancellationToken);
    window.Show();
    try { await closed; }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
}
```

## _Imports.razor

```razor
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.JSInterop
@using PoeShared.Blazor
```

## MainWindow.razor

```razor
@namespace RecipeHighlight
@inherits BlazorReactiveComponent

<HeadContent>
    <link rel="stylesheet" href="wwwroot/panel.css" />
</HeadContent>
<div class="recipe-highlight" @ref="panel">Only this element is highlighted.</div>
<button class="btn btn-primary" disabled="@(!ready)" @onclick="ToggleHighlight">
    Toggle highlight
</button>

@code {
    private ElementReference panel;
    private Task<IJSObjectReference> moduleTask;
    private bool ready;
    private bool highlighted;
    private bool closing;

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        moduleTask = JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./wwwroot/highlight.js").AsTask();
        await moduleTask;
        if (closing) return;
        ready = true;
        await Refresh("highlight module loaded");
    }

    private async Task ToggleHighlight()
    {
        var module = await moduleTask;
        highlighted = !highlighted;
        await module.InvokeVoidAsync("setHighlight", panel, highlighted);
    }

    public override async ValueTask DisposeAsync()
    {
        closing = true;
        try
        {
            if (moduleTask != null)
            {
                var module = await moduleTask;
                try { await module.InvokeVoidAsync("clearHighlight", panel); }
                finally { await module.DisposeAsync(); }
            }
        }
        finally { await base.DisposeAsync(); }
    }
}
```

## wwwroot/highlight.js

```javascript
export function setHighlight(element, enabled) {
    element.classList.toggle("is-highlighted", enabled);
}

export function clearHighlight(element) {
    element.classList.remove("is-highlighted");
}
```

## wwwroot/panel.css

```css
.recipe-highlight { padding: 16px; border: 2px solid #666; margin-bottom: 12px; }
.recipe-highlight.is-highlighted { background: #fff2a8; outline: 3px solid #956b00; }
```


| Часть | За что отвечает |
| --- | --- |
| `OnAfterFirstRenderAsync` | Импортирует модуль, когда DOM-элемент из `@ref` уже появился. |
| `./wwwroot/highlight.js` | URL относительно базового URI страницы этого окна. Находит уникальный ресурс проекта, а не путь на диске. |
| `IJSObjectReference` | Ссылка на модуль. Ею владеет компонент и через неё вызывает экспорты. |
| `ElementReference panel` | Передаёт один свой элемент — без глобального поиска по ID и без вспомогательных функций в `window`. |
| `clearHighlight`, затем `DisposeAsync`, затем base | Убирает свой класс, освобождает ссылку на модуль и выполняет очистку базового компонента. |

Модуль не создаёт таймеров и не подписывается на события. Если добавите их позже, снимайте их в очистке сами: освобождение `IJSObjectReference` их не отменяет. Если окно закрыли во время загрузки, очистка дождётся начатого импорта и не бросит его ссылку. Скрытие окна компонент не уничтожает.

Файловый сервис находит ресурс по такому уникальному окончанию пути вместе с папкой. Сохраняйте пути и регистр букв как здесь и не создавайте дубликаты ресурсов. Если имена неоднозначны, полные manifest-имена описаны во [встроенных ресурсах](/ru/scripting/embedded-resources). Namespace проекта может входить в них как префикс. `@namespace RecipeHighlight` ресурсы не переименовывает.

Чем импорт модуля отличается от классического `LoadScript` — в [Загрузке JavaScript](/ru/scripting/blazor-windows/js-loadscript). Если текст или цвет полностью зависят от состояния в C#, проще [реактивное обновление Razor](/ru/scripting/blazor-windows/reactive-toggle). Модуль нужен, когда действительно надо работать с DOM.
