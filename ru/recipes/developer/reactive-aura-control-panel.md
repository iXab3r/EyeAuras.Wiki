---
title: "Сделать оформленную панель своего триггера"
description: "Наблюдайте загруженный Hotkey Is Active, переключайте его из Razor и оформляйте текущее значение CSS-файлом проекта."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Сделать оформленную панель своего триггера

Панель показывает значение настоящего триггера. Кнопка меняет его, а уведомления свойства обновляют отображение и после настроенной горячей клавиши.

Нужен настольный EyeAuras с сервисами Blazor/WebView2 для скрипта. Подготовьте отдельную папку с двумя загруженными аурами: `RecipeSwitch` с **одним Hotkey Is Active** в режиме **Toggle Trigger state on Click** и `RecipePanel` с **Actions → On Enter → C# Script**. Выберите незанятую горячую клавишу, оставьте подавление выключенным, действия `RecipeSwitch` — пустыми. Не помещайте эти ауры под условие, выгружающее их.

1. В редакторе скрипта `RecipePanel` добавьте **New file → Component**, имя `MainWindow`. Оставьте только реализацию одного Razor-файла ниже; уберите дублирующий сгенерированный счётчик в code-behind, если шаблон создал такой файл.
2. Через **New file → Component** создайте `_Imports.razor` в корне проекта и замените сгенерированное содержимое импортами ниже. Создайте **New file → CSS** и переименуйте файл в `wwwroot/panel.css`. Полностью замените эти файлы и **Script.csx** приведённым содержимым. Оставьте один CSS-ресурс с этим логическим путём.
3. Дождитесь компиляции и нажмите **Run** действия. `./RecipeSwitch` находит соседнюю ауру в этой папке; у неё должен быть единственный подходящий триггер.
4. Посмотрите **Trigger value**, нажмите **Toggle trigger**. `False`/`True`, рамка и фон должны измениться вместе. Переключите настроенную горячую клавишу: наблюдение того же свойства обновит панель без опроса.
5. Закройте панель или нажмите **Stop**. Освобождение окна уничтожит компонент и его подписку на изменения. Следующий Run прочитает текущее значение триггера; открытие панели его не сбрасывает.

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
| `@inject IAuraTreeScriptingApi Tree` | Получает сервис дерева контекста скрипта через DI компонента; это не глобальное имя точки входа. |
| `ChangeTrackers.Add(...)` до `base.OnInitialized()` | Регистрирует уведомления существующего триггера до запечатывания списка. Полученной подпиской владеет базовый компонент. |
| `Refresh("panel toggle")` | Ожидает перерисовку через диспетчер компонента после записи из кнопки. |
| Один сохранённый `ClassMapper` | Удерживает стабильные условия выбора `is-on`/`is-off` по тому же значению триггера. |
| `HeadContent` и `wwwroot/panel.css` | Подключают CSS проекта через файловый сервис окна. Правила явно ограничены `.recipe-panel`, автоматической CSS-изоляции нет. |

Для `null` показано `Unknown` с оформлением выключенного состояния. Это значение триггера, не гарантия итоговой активности ауры: остальные условия продолжают действовать. Программа использует уведомления существующего триггера и не рассчитывает на Fody-преобразование динамически компилируемого класса. Скрытие живого окна не равно освобождению.

[Обновление компонента](/ru/scripting/blazor-windows/reactive-toggle) объясняет владение подпиской; [варианты оформления](/ru/scripting/blazor-windows/toggle-styling) и [CSS проекта](/ru/scripting/blazor-windows/toggles-styling-cssfile) — внешний вид. Если CSS не появился, сначала проверьте путь ресурса и соответствующий файловый сервис, а не код триггера.
