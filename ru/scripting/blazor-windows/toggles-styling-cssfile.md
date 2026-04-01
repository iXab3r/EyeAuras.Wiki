---
title: 9. Подключение CSS-файла через HeadContent
description: Как подключить CSS-файл с помощью HeadContent.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:12:56.395Z
---
# CSS-файлы
CSS обычно подключается как отдельные файлы с описанием классов — иногда таких классов могут быть тысячи.

## HTML-тег `head`
Если кликнуть по C# overlay и нажать `F12` (открыть dev tools), в верхней части HTML вы увидите примерно следующее:
```html
<head>
    <meta charset="utf-8">
    <base href="/">

    <link href="_content/AntDesign/css/ant-design-blazor.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/bootstrap.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/bootstrap-extra.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/app.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/font-awesome6.min.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Wpf/css/font-play-regular.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Controls/assets/css/main-colors.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Controls/assets/css/main-style.css" rel="stylesheet">
    <link href="_content/PoeShared.Blazor.Controls/assets/css/main-ant-blazor.css" rel="stylesheet">
    <link href="_content/EyeAuras.Blazor.Shared/EyeAuras.Blazor.Shared.bundle.scp.css" rel="stylesheet">
    <link href="EyeAuras.styles.css" rel="stylesheet">
</head>
```

Именно здесь объявляются дополнительные стили и иногда скрипты. Браузер обрабатывает их сразу при запуске, чтобы понимать, что нужно загрузить. Во время рендеринга эти стили используются для управления внешним видом и расположением элементов. Наш CSS-файл тоже должен попасть сюда. Но сначала просто создадим его.

## Создание CSS-файла
В скрипте overlay нажмите `New` -> `CSS` и укажите имя. В примере будем использовать имя по умолчанию — `Styles`. Вы можете выбрать любое имя, но тогда не забудьте обновить путь в коде.

![New CSS](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

## CSS по умолчанию
По умолчанию EyeAuras создаёт такой файл:
```css
body, html {
    background: yellow;
}
```

Этот стиль сделает фон окна/overlay жёлтым. Но одного создания CSS-файла недостаточно — его нужно ещё подключить, чтобы браузер понял, откуда его загружать.

## HeadContent — декларативный способ
В Blazor содержимое заголовка страницы управляется через [HeadContent](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0). Он позволяет при необходимости добавлять дополнительные CSS-файлы в HTML-заголовок.

Когда компонент загружается, он находит `HeadContent` и добавляет ссылки в элемент `head` — дальше браузер всё делает сам. Например:

```csharp
<HeadContent>
    <link href="Styles.css" rel="stylesheet"/>
</HeadContent>
```

Этот код подключает `Styles.css` в заголовок. Чтобы не мучить ваши глаза, вместо стандартного CSS я сразу вставил пример с зелёной кнопкой, не меняя фон.

![Demo](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

## UserOverlay.cs
```csharp
public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public bool TriggerIsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue = value;
    }

    protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
}
```

## UserOverlay.razor
```html
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<HeadContent>
    <link href="Styles.css" rel="stylesheet"/>
</HeadContent>

<h3 class="text-center shadow-1">CSS via HeadContent</h3>

<div class="text-center mt-4">
    <ToggleButton
        @bind-IsChecked="@TriggerIsActive"
        Class="btn custom-button">
                Trigger is Active
    </ToggleButton>
</div>
```

## Styles.css
```css
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

---

# Разбор

## UserOverlay.razor
```html
<HeadContent>
    <link href="Styles.css" rel="stylesheet"/>
</HeadContent>
```

Это ключевая часть, которая подключает стили.

## Styles.css
```css
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

Здесь хранятся наши стили. Сейчас класс только один, но вы можете создать столько классов, сколько нужно. Пользовательские стили подключаются последними, поэтому при необходимости вы можете полностью переопределить интерфейс.