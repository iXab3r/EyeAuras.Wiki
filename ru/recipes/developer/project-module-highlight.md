---
title: "Подсветить свой элемент модулем проекта"
description: "Импортируйте ES-модуль после отрисовки, передайте один ElementReference и освободите модуль вместе с компонентом."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Подсветить свой элемент модулем проекта

Небольшой JavaScript-модуль подсветит один элемент вашей панели. Текстом и кнопкой владеет Razor; JS только добавляет или убирает один класс у явно переданного элемента.

Нужен настольный EyeAuras с сервисами Blazor/WebView2 для скрипта и файловым сервисом проекта. Удалённая страница, сеанс браузера и скачанная JS-библиотека не требуются.

1. Создайте свою ауру `RecipeHighlight` с **Actions → On Enter → C# Script** для ручного **Run**. Через **New file → Component** добавьте `MainWindow`, замените его одиночный Razor-файл и уберите дублирующий сгенерированный счётчик code-behind, если он появился.
2. Через **New file → Component** создайте `_Imports.razor` в корне проекта и замените сгенерированное содержимое импортами ниже. Через **New file → JavaScript** и **New file → CSS** создайте ресурсы и переименуйте их в `wwwroot/highlight.js` и `wwwroot/panel.css`. Полностью замените содержимое: JS-файл здесь ES-модуль, а не классический скрипт шаблона.
3. Замените **Script.csx**, дождитесь компиляции, нажмите **Run**. В окне должны появиться текстовый элемент с рамкой и **Toggle highlight**. Кнопка станет доступна после первой отрисовки и успешного импорта модуля.
4. Нажмите кнопку: только этот элемент получит жёлтый фон и обводку. Повторное нажатие уберёт подсветку. Другое приложение или элемент не выбираются.
5. Закройте окно или нажмите **Stop**. Уничтожение компонента вызовет очистку модуля, освободит ссылку и выполнит базовую очистку. При следующем Run подсветка начнёт с выключенного состояния.

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
| `OnAfterFirstRenderAsync` | Импортирует модуль после появления DOM-элемента, указанного через `@ref`. |
| `./wwwroot/highlight.js` | Относительный URL от базового URI страницы этого окна; находит уникальный ресурс проекта, не путь на диске. |
| `IJSObjectReference` | Ссылка на модуль, которой владеет компонент и через которую вызывает явные экспорты. |
| `ElementReference panel` | Передаёт один собственный элемент без глобального поиска по ID и вспомогательных функций в `window`. |
| `clearHighlight`, затем `DisposeAsync`, затем base | Убирает свой класс, освобождает ссылку на модуль и сохраняет очистку базового компонента. |

Модуль не создаёт таймеров или подписок на события. Если добавите их позже, явно снимайте в очистке: освобождение `IJSObjectReference` само их не отменяет. Очистка дожидается уже начатого импорта, не бросая намеренно его ссылку при закрытии во время загрузки. Скрытие окна не уничтожает компонент.

Файловый сервис принимает такой уникальный суффикс ресурса с папкой. Сохраняйте указанные пути и регистр, не дублируйте ресурсы; [встроенные ресурсы](/ru/scripting/embedded-resources) объясняют полные manifest-имена при неоднозначности. Namespace проекта может входить в них префиксом; `@namespace RecipeHighlight` ресурсы не переименовывает.

[Загрузка JavaScript](/ru/scripting/blazor-windows/js-loadscript) отделяет импорт модуля от классического `LoadScript`. Для обычного текста или цвета, полностью определяемого C#-состоянием, проще [реактивное обновление Razor](/ru/scripting/blazor-windows/reactive-toggle); модуль нужен для настоящей работы с DOM.
