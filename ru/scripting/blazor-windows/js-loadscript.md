---
title: 11. Подключение JavaScript
description: Подключение JavaScript.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-12T00:32:40.408Z
---
# JavaScript и зачем он нужен в 2025 году

JS уже давно превратил статические страницы в интерактивные порталы. Сегодня поверх JavaScript построено столько библиотек и фреймворков, что проще найти места, где он *не* используется.

Рано или поздно вам захочется подключить JS-библиотеку, чтобы улучшить пользовательский опыт. В качестве примера возьмём абсолютно бесполезный, но красивый сниппет с https://codepen.io/ — это творческая площадка для множества талантливых людей. Очень рекомендую.

Итак, как загружать JavaScript в Blazor?

## LoadScript

Как и в случае с [CSS](/ru/scripting/blazor-windows/toggles-styling-cssfile), можно использовать `IJsPoeBlazorUtils`, чтобы загружать скрипт тогда, когда он нужен.

```csharp
/// <summary>
/// Loads a JavaScript file dynamically and returns a promise that completes when the script loads.
/// </summary>
Task LoadScript(string scriptPath);
```

> ВАЖНО: Этот метод предназначен для загрузки обычного JavaScript. Если вам нужно подключать [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), используйте [другой подход](https://learn.microsoft.com/en-us/aspnet/core/blazor/javascript-interoperability/location-of-javascript?view=aspnetcore-9.0).

## Что мы хотим получить?

Поскольку это всего лишь демонстрация загрузки скриптов (а скрипты могут делать что угодно), мы не гонимся за функциональностью — нам нужна только анимация.

![Demo](https://s3.eyeauras.net/media/2025/05/9dIx2khkoQ.gif)

## Код

По мере роста примеров я буду показывать только те части, которые действительно стоит разобрать. Остальное можно посмотреть, скачав пример проекта с [этой страницы](https://wiki.eyeauras.net/ru/scripting/blazor-windows/1-intro).

---

## Разбор кода

### UserOverlay.cs

```csharp
[Inject]
public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }
```

Как и `IAuraTreeScriptingApi`, здесь мы внедряем ещё один сервис — на этот раз для загрузки CSS и скриптов.

```csharp
protected override async Task OnAfterFirstRenderAsync()
{
    await base.OnAfterFirstRenderAsync();
    await PoeBlazorUtils.LoadCss("Styles.css");
    await PoeBlazorUtils.LoadScript("https://raw.githack.com/strangerintheq/rgba/0.0.8/rgba.js");
    await PoeBlazorUtils.LoadScript("Script.js");
}
```

Здесь в одном месте загружаются стили и два скрипта. Один скрипт берётся с CDN (`rgba.js`), второй — локальный (`Script.js`). Подходы можно комбинировать по ситуации, хотя в EyeAuras обычно предпочтительнее локальное хранение.

Обратите внимание: всё загружается сразу после первого рендера. Как программист, вы сами должны решать, какие скрипты загружать и в какой момент. В этом примере выбран `OnAfterFirstRenderAsync`, но в других случаях может подойти `OnInitializedAsync` или даже комбинация разных вариантов. Подробнее о жизненном цикле компонентов — в [статье Microsoft](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).

```css
canvas {
    position: absolute;
    width: 100% !important;
    left: 0;
    top: 1.5em;
    height: calc(100% - 1.5em) !important;
}
```

Немного CSS-магии:

- `position: absolute;` — рисует элемент в абсолютных координатах, независимо от его места в дереве. Часто используется для графики, всплывающих окон и подобных задач.
- `width: 100% !important;` — задаёт ширину 100%; `!important` переопределяет другие стили. Здесь это нужно, потому что `rgba.js` сам выставляет размер canvas.
- `left: 0;` — при абсолютном позиционировании обычно явно задают положение элемента; здесь он прижат к левому краю.
- `top: 1.5em;` — добавляет отступ сверху, чтобы оставить место для заголовка. Есть более надёжный способ, но для демо этого достаточно.
- `height: calc(100% - 1.5em) !important;` — итог всех настроек выше: «Важно! Высота элемента должна быть 100% высоты страницы минус 1.5em (заголовок).»