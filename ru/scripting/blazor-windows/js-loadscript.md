---
title: 11. Подключение JavaScript
description: Как подключить свой JavaScript-модуль к компоненту и чем отличается LoadScript
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---
# Получить размер элемента через JavaScript

Чтобы узнать настоящую ширину элемента внутри WebView2, нужен браузерный DOM. Напишем свой ES-модуль: кнопка измерит панель, а Razor покажет число. Это размер в координатах браузерной страницы, а не размер нативного окна в Windows.

1. Создайте ауру с **C# Overlay** и **Fixed Value → Is Active**. В проекте через **New file → JavaScript** создайте `Status.js` и полностью замените код шаблона кодом ниже. Файл должен быть ресурсом этого проекта.
2. Узнайте его полное имя с помощью короткого `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

3. В строке импорта ниже замените `MyScript.Status.js` полным именем из журнала. Папки тоже входят в имя, например `MyScript.UI.Status.js`. Namespace класса сам это имя не задаёт. Подробнее — [встроенные ресурсы](/ru/scripting/embedded-resources).
4. Замените обе части компонента. `BlazorDemo` должен совпадать в `.cs` и `.razor`. Прежние методы счётчика рядом не оставляйте.

## Status.js

```javascript
export function getWidth(element) {
    return Math.round(element.getBoundingClientRect().width);
}
```

## UserOverlay.cs

```csharp
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.JSInterop
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<div @ref="panel" style="width: 240px; padding: 8px; border: 1px solid lime;">
    Измеряемая панель
</div>
<button class="btn btn-primary" disabled="@(!ready)" @onclick="Measure">
    Измерить ширину
</button>
<p>Ширина: @width CSS px</p>

@code {
    private ElementReference panel;
    private Task<IJSObjectReference> moduleTask;
    private bool ready;
    private bool closing;
    private int width;

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        moduleTask = JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./MyScript.Status.js").AsTask();
        await moduleTask;
        if (closing) return;
        ready = true;
        await Refresh("module loaded");
    }

    private async Task Measure()
    {
        var module = await moduleTask;
        width = await module.InvokeAsync<int>("getWidth", panel);
        if (!closing) await Refresh("element measured");
    }

    public override async ValueTask DisposeAsync()
    {
        closing = true;
        try
        {
            if (moduleTask != null)
                await (await moduleTask).DisposeAsync();
        }
        finally { await base.DisposeAsync(); }
    }
}
```

5. Дождитесь компиляции и загрузки модуля — кнопка станет доступна. Нажмите **Измерить ширину**. Вместо `0` появится округлённая ширина панели вместе с рамкой и отступами. Измените CSS-ширину панели и повторите.

| Часть | Назначение |
| --- | --- |
| `JsRuntime` | Член базового `BlazorReactiveComponent`, его даёт оконный механизм. В обычном C#-классе такого глобального имени нет. |
| `import` / `IJSObjectReference` | Загружает ES-модуль и даёт ссылку на его экспортируемые функции. |
| `ElementReference` | Передаёт конкретный уже отрисованный элемент, без поиска по глобальному `id`. |
| `getWidth` | Читает DOM через [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) и возвращает число. Результат показывает Razor, модуль его разметку не меняет. |
| `DisposeAsync` | При уничтожении компонента дожидается начатого импорта и освобождает ссылку на модуль, затем выполняет очистку базового класса. |

JS-таймеров и подписок на события здесь нет. Если они появятся, добавьте экспортируемую функцию очистки и вызывайте её перед освобождением ссылки: `IJSObjectReference.DisposeAsync()` сам их не отменяет. Скрыть окно — не значит уничтожить компонент.

## Чем отличается LoadScript

| Способ | Для чего подходит |
| --- | --- |
| ES-модуль, как выше | Свой код с явными `export`. Функции вызываются через ссылку, которой владеет компонент. |
| `IJsPoeBlazorUtils.LoadScript(path)` | Готовая библиотека в формате классического скрипта. Создаёт `script` с `type="text/javascript"` и возвращает `Task`. Это не импорт модуля. |
| `IJsPoeBlazorUtils.LoadCss(path)` | Подключает CSS. Не возвращает объект, через который стиль можно было бы автоматически удалить. |

Чтобы подключить готовую классическую библиотеку, внедрите `PoeShared.Blazor.Services.IJsPoeBlazorUtils` через `[Inject]` и после первой отрисовки вызовите `await BlazorUtils.LoadScript("MyScript.Library.js")` с настоящим именем её ресурса. `Status.js` с `export` так подключать нельзя. Загрузчик запоминает путь даже при `loading`/`failed`, поэтому повторный вызов ничего не ждёт и не проверяет успех заново. Как очищать библиотеку, определяет она сама.

Если таблица стилей относится к разметке компонента, подключите [CSS-файл через HeadContent](/ru/scripting/blazor-windows/toggles-styling-cssfile). Если момент подключения выбирает C#, используйте [LoadCss после отрисовки](/ru/scripting/blazor-windows/toggles-styling-css-load). Освобождение ссылки на JS-модуль такую таблицу стилей не удаляет.

В старом [наборе серии](/ru/scripting/blazor-windows/1-intro) классический загрузчик подключал `rgba.js` с CDN, локальный `Script.js` и CSS для canvas. На анимации ниже — тот сторонний пример, а не измерение панели:

![Анимация сторонней библиотеки из старого примера](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)

<details>
<summary>Изменить выделенный элемент через модуль</summary>

Старый пример менял текст через JS. Чтобы сделать так же, добавьте в модуль этот экспорт:

```javascript
export function setStatus(element, text) {
    element.textContent = text;
}
```

В Razor добавьте пустой элемент `<span @ref="statusElement"></span>` и поле `private ElementReference statusElement;`. После загрузки модуля обработчик кнопки может вызвать `await module.InvokeVoidAsync("setStatus", statusElement, "Готово");`, где `module = await moduleTask`. Razor не должен одновременно управлять дочерним содержимым этого элемента. Обычную текстовую подпись проще обновлять через C#-значение и `Refresh`.

</details>
