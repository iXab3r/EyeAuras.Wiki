---
title: 10. Подключение CSS-файла — LoadCss
description: Как подключить CSS-файл с помощью LoadCss
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---
# Альтернативный способ подключить CSS

## LoadCss — загрузка из кода

В EyeAuras есть набор инструментов `IJsPoeBlazorUtils`. Как и `IAuraTreeScriptingApi`, его можно внедрить в компонент и использовать методы для загрузки CSS во время выполнения.

```csharp
/// <summary>
/// Loads CSS file dynamically
/// </summary>
Task LoadCss(string cssPath);
```

Главное отличие от `HeadContent` или inline-стилей в том, что момент загрузки CSS контролируете именно вы. Это может быть загрузка страницы, нажатие кнопки, переключение темы — что угодно. Полный контроль остается за вами.

![Demo](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

В одной папке создайте ауру с **C# Overlay v3** и ауру `TargetAura`. В каждую целевую ауру добавьте `HotkeyIsActive` и настройте горячую клавишу в режиме переключения. Оставьте целевые ауры загруженными. Путь `./TargetAura` в примере ищется относительно контекста оверлея; при другой структуре дерева замените их. Если подходящих триггеров несколько, выбирается первый.

Замените содержимое `UserOverlay.cs` и `UserOverlay.razor` в этом оверлее кодом ниже. Это две части одного `public partial` класса в одном пространстве имён. `AuraTree` получает компонент через `[Inject]`; глобальные переменные из `Script.csx` в него автоматически не передаются.

## Подготовить ресурс

Добавьте `Styles.css` в файлы этого C# Overlay v3 через `New` → `CSS` и сохраните приведённое ниже содержимое. Файл должен попасть в ресурсы скрипта. В примере входной путь — `MyScript.Styles.css`: **замените `MyScript` на пространство имён проекта**, а при вложенных папках используйте полное имя ресурса. Например, `Theme/Styles.css` в проекте `MyScript` получает имя `MyScript.Theme.Styles.css`.

Имена manifest-ресурсов выводятся в отладочный журнал при подготовке скрипта; их также показывает `ScriptEmbeddedResourceFileProvider.GetManifestNames()` у конкретного провайдера. `GetService<IScriptFileProvider>()` может вернуть составной провайдер, поэтому приведение к этому классу не гарантировано. Используйте полное имя, а не предположение, что любой путь с окончанием `Styles.css` найдётся. Оконный хост подключает файловый провайдер скрипта к WebView2.

## UserOverlay.cs

```csharp
using System;
using System.Reactive.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    [Inject]
    public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }

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

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();

        await PoeBlazorUtils.LoadCss("MyScript.Styles.css");
    }
}
```

## UserOverlay.razor

```html
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">CSS via LoadCss</h3>

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

## Разбор

## UserOverlay.cs

```csharp
[Inject]
public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }
```

Как и в случае с `IAuraTreeScriptingApi`, здесь мы внедряем еще один сервис — для загрузки CSS.

```csharp
    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();

        await PoeBlazorUtils.LoadCss("MyScript.Styles.css");
    }
```

Здесь CSS загружается после первого рендера, когда доступен JS-контекст компонента. После загрузки кнопка станет зелёной с чёрным текстом и займёт 80% ширины родителя. `LoadCss` возвращает `Task`, а не объект владения стилем: автоматическое удаление CSS при уничтожении компонента здесь не обещается. Подробнее о жизненном цикле компонента можно прочитать в [статье Microsoft](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).
Нажатие кнопки записывает `TriggerValue`; горячая клавиша меняет тот же триггер. Таймер в `ChangeTrackers` заставляет компонент перечитывать состояние примерно раз в секунду, поэтому внешнее изменение видно с задержкой. Добавляйте таймер до `base.OnInitialized()`: там список отслеживания запечатывается и подписки привязываются к `Anchors` компонента. Скрытие окна само по себе не равно уничтожению компонента.
