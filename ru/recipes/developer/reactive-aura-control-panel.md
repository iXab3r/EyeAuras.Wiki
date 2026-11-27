---
title: "Сделать оформленную панель своего триггера"
description: "Панель на Razor показывает значение триггера Hotkey Is Active, переключает его кнопкой и оформляется CSS-файлом проекта."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Сделать оформленную панель своего триггера

Панель показывает значение настоящего триггера. Кнопка его меняет. Если значение поменяла горячая клавиша, панель тоже обновится — через уведомления свойства.

Нужен настольный EyeAuras с сервисами Blazor/WebView2 для скриптов. Подготовьте отдельную папку с двумя загруженными аурами. Первая — `RecipeSwitch` с **одним Hotkey Is Active** в режиме **Toggle Trigger state on Click**. Вторая — `RecipePanel` с **Actions → On Enter → C# Script**. Выберите незанятую горячую клавишу, подавление оставьте выключенным, действий в `RecipeSwitch` не добавляйте. Не кладите эти ауры под условие, которое их выгружает.

1. В редакторе скрипта `RecipePanel` выберите **New file → Component** и назовите компонент `MainWindow`. Оставьте только один Razor-файл с кодом ниже. Если шаблон создал code-behind с дублирующим счётчиком, уберите его.
2. Через **New file → Component** создайте `_Imports.razor` в корне проекта и замените его содержимое импортами ниже. Через **New file → CSS** создайте файл и переименуйте его в `wwwroot/panel.css`. Целиком замените эти файлы и **Script.csx** кодом ниже. CSS-ресурс с таким логическим путём должен быть один.
3. Дождитесь компиляции и нажмите **Run** у действия. Путь `./RecipeSwitch` находит соседнюю ауру в той же папке. У неё должен быть ровно один подходящий триггер.
4. Посмотрите на **Trigger value** и нажмите **Toggle trigger**. Значение `False`/`True`, рамка и фон должны поменяться вместе. Теперь нажмите свою горячую клавишу: панель следит за тем же свойством и обновится без опроса.
5. Закройте панель или нажмите **Stop**. Вместе с окном уничтожится компонент и его подписка на изменения. Следующий Run прочитает текущее значение триггера: открытие панели его не сбрасывает.

## Script.csx

```csharp
using System;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using PoeShared.Blazor.Wpf;
using RecipePanel;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.Title = "Own trigger panel";
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
@using AntDesign
@using Microsoft.AspNetCore.Components
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@using ReactiveUI
@using EyeAuras.Scripting.Api
@using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive
```

## MainWindow.razor

```razor
@namespace RecipePanel
@inherits BlazorReactiveComponent
@inject IAuraTreeScriptingApi Tree

<HeadContent>
    <link rel="stylesheet" href="wwwroot/panel.css" />
</HeadContent>
<section class="@panelClass.ToString()">
    <h2>RecipeSwitch</h2>
    <p>Trigger value: @(trigger.TriggerValue?.ToString() ?? "Unknown")</p>
    <button class="btn btn-primary" @onclick="Toggle">Toggle trigger</button>
</section>

@code {
    private IHotkeyIsActiveTrigger trigger;
    private readonly ClassMapper panelClass = new ClassMapper();

    protected override void OnInitialized()
    {
        trigger = Tree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./RecipeSwitch");
        panelClass.Add("recipe-panel")
            .If("is-on", () => trigger.TriggerValue == true)
            .If("is-off", () => trigger.TriggerValue != true);
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
        base.OnInitialized();
    }

    private async Task Toggle()
    {
        trigger.TriggerValue = !(trigger.TriggerValue ?? false);
        await Refresh("panel toggle");
    }
}
```

## wwwroot/panel.css

```css
.recipe-panel {
    padding: 16px;
    border: 3px solid;
    border-radius: 8px;
}
.recipe-panel.is-on { border-color: #21864a; background: #e4f6eb; color: #14251a; }
.recipe-panel.is-off { border-color: #9e5353; background: #f8eaea; color: #331818; }
```


| Часть | За что отвечает |
| --- | --- |
| `@inject IAuraTreeScriptingApi Tree` | Получает сервис дерева из контекста скрипта через DI компонента. |
| `ChangeTrackers.Add(...)` до `base.OnInitialized()` | Подписывается на уведомления существующего триггера, пока список ещё не запечатан. Подпиской владеет базовый компонент. |
| `Refresh("panel toggle")` | После записи из кнопки ждёт перерисовку через диспетчер компонента. |
| Один сохранённый `ClassMapper` | Хранит постоянные условия выбора `is-on`/`is-off` по тому же значению триггера. |
| `HeadContent` и `wwwroot/panel.css` | Подключают CSS проекта через файловый сервис окна. Правила явно ограничены `.recipe-panel`: автоматической CSS-изоляции нет. |

Для `null` панель показывает `Unknown` и оформление выключенного состояния. Это значение триггера, а не итоговая активность ауры: остальные условия по-прежнему действуют. Скрыть живое окно — не значит его освободить.

Кто владеет подпиской — в [Обновлении компонента](/ru/scripting/blazor-windows/reactive-toggle). Про внешний вид — [варианты оформления](/ru/scripting/blazor-windows/toggle-styling) и [CSS проекта](/ru/scripting/blazor-windows/toggles-styling-cssfile). Если CSS не применился, сначала проверьте путь ресурса и файловый сервис, а не код триггера.
