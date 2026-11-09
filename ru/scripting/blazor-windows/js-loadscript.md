---
title: 11. Подключение JavaScript
description: Подключение JavaScript.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---
# Получить размер элемента через JavaScript

Чтобы узнать фактическую ширину элемента внутри WebView2, нужен браузерный DOM. Создадим собственный ES-модуль: кнопка измерит панель, а Razor покажет полученное число. Это координаты браузерной страницы, а не размер нативного окна в Windows.

1. Создайте собственную ауру с **C# Overlay** и **Fixed Value → Is Active**. В проекте через **New file → JavaScript** создайте `Status.js` и полностью замените код шаблона на приведённый ниже. Файл должен быть ресурсом этого проекта.
2. Получите его полное имя через короткий `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

3. В строке импорта ниже замените `MyScript.Status.js` фактическим полным именем из журнала. При папках имя включает и их, например `MyScript.UI.Status.js`; namespace класса сам по себе это имя не задаёт. Подробнее — [встроенные ресурсы](/ru/scripting/embedded-resources).
4. Замените обе части компонента. `BlazorDemo` должен совпадать в `.cs` и `.razor`; прежние методы счётчика не оставляйте рядом.

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

5. Дождитесь компиляции и загрузки модуля: кнопка станет доступна. Нажмите **Измерить ширину**. Вместо `0` появится фактическая округлённая ширина панели с учётом её рамки и отступов. Измените её CSS-ширину и повторите опыт.

| Часть | Назначение |
| --- | --- |
| `JsRuntime` | Член базового `BlazorReactiveComponent`, предоставленный оконным механизмом; не глобальное имя обычного C# класса. |
| `import` / `IJSObjectReference` | Загружает ES-модуль и даёт ссылку на его экспортируемые функции. |
| `ElementReference` | Передаёт конкретный уже отрисованный элемент, без поиска по глобальному `id`. |
| `getWidth` | Читает DOM через [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) и возвращает число. Razor владеет отображением результата; модуль не меняет его разметку. |
| `DisposeAsync` | Дожидается начатого импорта и освобождает ссылку на модуль при уничтожении компонента, затем выполняет очистку базового класса. |

Здесь нет JS-таймеров и подписок на события. Если они появятся, добавьте экспортируемую очистку и вызовите её перед освобождением ссылки: `IJSObjectReference.DisposeAsync()` сам по себе их не отменяет. Скрытие окна не равно уничтожению компонента.

## Чем отличается LoadScript

| Способ | Для чего подходит |
| --- | --- |
| ES-модуль, как выше | Собственный код с явными `export`; функции вызываются через принадлежащую компоненту ссылку. |
| `IJsPoeBlazorUtils.LoadScript(path)` | Уже существующая библиотека в формате классического скрипта. Создаёт `script` с `type="text/javascript"`, возвращает `Task`; это не импорт модуля. |
| `IJsPoeBlazorUtils.LoadCss(path)` | Подключает CSS. Не возвращает владельца для автоматического удаления стиля. |

Для существующей классической библиотеки внедрите `PoeShared.Blazor.Services.IJsPoeBlazorUtils` через `[Inject]` и после первой отрисовки вызовите `await BlazorUtils.LoadScript("MyScript.Library.js")` с реальным именем её ресурса. Не используйте так `Status.js` с `export`. Загрузчик кеширует путь даже при `loading`/`failed`: повторный вызов не является ожиданием или повторной проверкой успеха. Очистка библиотеки остаётся её отдельным контрактом.

В историческом [наборе серии](/ru/scripting/blazor-windows/1-intro) классический загрузчик подключал `rgba.js` с CDN, локальный `Script.js` и CSS для canvas. Анимация ниже показывает тот сторонний пример, а не измерение панели выше:

![Историческая анимация сторонней библиотеки](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)

<details>
<summary>Изменить выделенный элемент через модуль</summary>

Старый пример менял текст через JS. Для такого поведения добавьте в модуль этот экспорт:

```javascript
export function setStatus(element, text) {
    element.textContent = text;
}
```

В Razor выделите пустой элемент `<span @ref="statusElement"></span>` и поле `private ElementReference statusElement;`. После загрузки модуля обработчик кнопки может вызвать `await module.InvokeVoidAsync("setStatus", statusElement, "Готово");`, где `module = await moduleTask`. Razor не должен одновременно управлять дочерним содержимым этого элемента. Для обычной текстовой подписи проще обновлять C#-значение и вызывать `Refresh`.

</details>
