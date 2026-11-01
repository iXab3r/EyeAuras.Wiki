---
title: 11. Подключение JavaScript
description: Подключение JavaScript.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---
# Подключить JavaScript к компоненту

Для обычной сторонней библиотеки есть `IJsPoeBlazorUtils.LoadScript(string scriptPath)`. Он загружает классический скрипт и возвращает `Task`; это не импорт ES-модуля и не регистрация с автоматической очисткой. Если библиотека требует собственных файлов, глобальных объектов или завершения работы, это отдельный контракт самой библиотеки.

Для собственного поведения удобнее ES-модуль. Создадим кнопку, которая через JavaScript меняет текст соседнего элемента. Код не требует глобальных функций или подписок на DOM-события.

## Файлы C# Overlay v3

Создайте ауру с **C# Overlay v3**. Добавьте файл `Status.js` в ресурсы проекта (см. [встроенные ресурсы](/ru/scripting/embedded-resources)). Его полный manifest-путь зависит от пространства имён: ниже используется `MyScript.Status.js`. Замените его фактическим именем своего ресурса; отладочный журнал подготовки скрипта перечисляет manifest-имена. При папках имя включает и их: `MyScript.UI.Status.js`. Простое окончание имени не является универсальным путём.

Замените `UserOverlay.razor` целиком; в `UserOverlay.cs` не должно быть прежних одноимённых полей или методов. Хост предоставляет файловый провайдер проекта и внедряет `JsRuntime` в `BlazorReactiveComponent`.

### Status.js

```javascript
export function setStatus(element, text) {
    element.textContent = text;
}
```

### UserOverlay.razor

```razor
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components
@using Microsoft.JSInterop
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<button class="btn btn-primary" disabled="@(module == null)" @onclick="ShowStatus">
    Изменить текст через JS
</button>
<span @ref="statusElement">Ожидание</span>

@code {
    private ElementReference statusElement;
    private IJSObjectReference module;

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        module = await JsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./MyScript.Status.js");
        await Refresh("module-loaded");
    }

    private async Task ShowStatus()
    {
        await module.InvokeVoidAsync("setStatus", statusElement, "Готово");
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (module != null)
            {
                await module.DisposeAsync();
            }
        }
        finally
        {
            await base.DisposeAsync();
        }
    }
}
```

После первого рендера загружается модуль и становится доступна кнопка. Нажмите её: вместо «Ожидание» появится «Готово». Импорт и вызовы нужно ожидать через `await`; отсутствие ресурса проверяйте по полному пути и ошибкам WebView2. Пример рассчитан на хост, который раздаёт этот ресурс по указанному URL.

При уничтожении компонента освобождается `IJSObjectReference`. Если вы добавите в JS таймеры, обработчики событий или экземпляры библиотеки, одного `DisposeAsync` ссылки недостаточно: экспортируйте метод очистки и вызовите его перед освобождением модуля. DOM этого примера меняется только в выделенном `span`, дочерним содержимым которого Razor не управляет.

## Загрузить классический скрипт

Для уже существующей интеграции внедрите в компонент `PoeShared.Blazor.Services.IJsPoeBlazorUtils` через `[Inject]` и в `OnAfterFirstRenderAsync` вызовите `await PoeBlazorUtils.LoadScript("MyScript.Library.js")`, указав реальный полный путь ресурса. Для CSS есть `await PoeBlazorUtils.LoadCss("MyScript.Styles.css")`. Это дополнение к примеру выше, а не код для импорта `Status.js`: у него экспортируемые функции ES-модуля.

В старом примере из [набора этой серии](/ru/scripting/blazor-windows/1-intro) так подключались `rgba.js` с CDN, локальный `Script.js` и CSS для canvas. Следующая иллюстрация показывает тот вариант анимации; простой пример выше меняет только текст. Доступность CDN и контракт сторонней библиотеки нужно проверять отдельно.

![Demo](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)
