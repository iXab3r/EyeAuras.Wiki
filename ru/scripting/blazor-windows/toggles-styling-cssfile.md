---
title: 7. Подключаем CSS файл - HeadContent
description: 
published: true
date: 2025-05-11T16:12:56.395Z
tags: 
editor: markdown
dateCreated: 2025-05-11T16:12:56.395Z
---

# CSS-файлы
Обычно CSS распространяется вместе с проектом в виде отдельных файлов, которые содержат в себе описания классов, иногда их общее количество измеряется тысячами!

## HTML Тег `head` 
Если кликнуть на C# оверлей и нажать `F12` (включить dev-tools), то в верхней части HTML можно увидеть что-нибудь типа такого:
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
В этом месте обычно объявляются дополнительные стили, а иногда и скрипты, которые нужны веб-странице для работы. Браузер их обрабатывает прямо на старте и так узнает что и откуда брать, а при рендеринге использует стили для контроля отрисовки. 
Именно сюда каким-то образом и должен попасть файл с нашими стилями. 
Однако для начала, давайте его просто создадим.

## Создание CSS-файла
Все просто - в скрипте оверлея нажимайте на `New` -> `CSS` и укажите имя. Здесь и далее я буду использовать имя по умолчанию - `Styles`.
Вы можете назвать как вашей душе угодно, но не забывайте, что в коде тоже нужно будет поменять путь, чтобы все совпало.

![New CSS](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

## Default CSS
По умолчанию, EyeAuras создает CSS с примерно таким содержимым:
```css
body, html {
    background: yellow;
}
```
Это должно перекрасить задний фон вашего окна/оверлея в желтый цвет. 
Однако само по себе создание CSS-файла к этому не приведет - нужно еще подключить его, указать браузеру где же его искать.

## HeadContent - декларативный путь
В Blazor управление содержимым заголовочной части HTML-файла делается через компонент [HeadContent](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0) - именно он позволяет _дописать_ в заголовок дополнительный CSS-файл когда нужно.

Ваш компонент загружается, обнаруживает `HeadContent`, тот дописывает в заголовок `head` нужные ссылки - на этом и все, дальше браузер работает сам по себе.

```csharp
<HeadContent>
    <link href="Styles.css" rel="stylesheet"/>
</HeadContent>
```
Вот пример кода, который подключит `Styles.css` в заголовок - я поберег ваши глаза и вместо стандартного CSS уже вставил код для зеленой кнопки без изменения фона.

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
Ключевой момент. То, что приводит к подключению стилей.


## Styles.css 
```css
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```
А это наше хранилище стилей. Сейчас здесь только один, но вы можете создать столько, сколько вашей душе заблагорассудится.
Важный момент - пользовательские стили подключаются последними, так что у вас есть возможность полностью изменить интерфейс безо всяких ограничений.