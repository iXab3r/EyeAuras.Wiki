---
title: 10. Подключение CSS-файла — LoadCss
description: Как подключить CSS-файл из C# через LoadCss
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---
# Подключить CSS после появления компонента

Иногда файл оформления нужно подключить из C#, когда компонент уже появился в браузерной части. Для этого есть `IJsPoeBlazorUtils.LoadCss`. Подключим так оформление кнопки после первой отрисовки.

Нужны две загруженные ауры в одной папке: `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и отдельная панель с **C# Overlay** и **Fixed Value → Is Active**. Назначьте триггеру свободную горячую клавишу, действия не нужны. Путь `./TargetAura` должен вести к вашей ауре с одним таким триггером. Как сделать саму кнопку — в [предыдущем примере](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

1. В C# Overlay создайте **New file → CSS → Styles** и сохраните в нём CSS ниже.
2. Узнайте полное имя файла. В `UserOverlay.cs` замените `MyScript.Styles.css` этим именем.

В полное имя ресурса входит namespace **проекта**, а не только `@namespace` компонента. Например, `Styles.css` может называться `MyScript.Styles.css`, а `Theme/Styles.css` — `MyScript.Theme.Styles.css`. Не подставляйте `BlazorDemo` только потому, что так называется класс в примере.

Чтобы узнать настоящее имя, оставьте в `Script.csx` этот короткий код и дождитесь подготовки проекта:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Скопируйте полное имя своего `Styles.css` из журнала в строку, указанную ниже. `Script` здесь — тип верхнеуровневого скрипта, в обычном классе или Razor такого глобального контекста нет.

3. Замените обе части `UserOverlay` файлами ниже. Namespace в них совпадает, `HeadContent` в этом варианте не нужен.

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using ReactiveUI;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; set; }

    [Inject]
    public PoeShared.Blazor.Services.IJsPoeBlazorUtils BlazorUtils { get; set; }

    private IHotkeyIsActiveTrigger trigger;
    private bool IsActive => trigger.TriggerValue ?? false;

    protected override void OnInitialized()
    {
        trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
        base.OnInitialized();
    }

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        await BlazorUtils.LoadCss("MyScript.Styles.css");
    }

    private async Task SetActive(bool value)
    {
        trigger.TriggerValue = value;
        await Refresh("styled toggle clicked");
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<div class="demo-panel">
    <ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
                  Class="btn custom-button">
        Триггер: @(IsActive ? "включён" : "выключен")
    </ToggleButton>
</div>
```

## Styles.css

```css
.demo-panel .custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

4. После компиляции и первой отрисовки кнопка станет зелёной, с чёрным текстом и шириной 80% панели. Пока CSS не загрузился, она может на мгновение показаться со стандартным оформлением.

![Оформление после загрузки CSS в прежнем примере](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Механизм | Как использовать |
| --- | --- |
| `[Inject] IJsPoeBlazorUtils` | Получает сервис браузерных операций из контейнера окна. Компонент этим сервисом не владеет и не освобождает его. |
| `OnAfterFirstRenderAsync` | Вызывается после первой отрисовки, когда доступен JS-контекст. Все асинхронные операции ожидаются. |
| `LoadCss(string cssPath)` | Добавляет ссылку на CSS через браузерную часть. Возвращает `Task`, а не объект, через который стиль можно потом удалить. |
| Полное имя файла | Путь к ресурсу своего проекта, а не произвольный путь в Windows. |
| `.demo-panel .custom-button` | Правило для своей панели. Подключённый CSS действует в документе окна. |

Кнопка читает и меняет настоящий `TriggerValue`, а `null` показывает как выключенное. Благодаря `WhenAnyValue` она обновляется и после горячей клавиши. Подробности и вариант с обновлением по таймеру — в [механизме обновления](/ru/scripting/blazor-windows/reactive-toggle).

Тот же вызов с `await` можно перенести в обработчик кнопки, если оформление нужно позже. Когда компонент уничтожается, CSS, добавленный через `LoadCss`, сам не удаляется. Чтобы подключить стиль прямо в разметке, подойдёт [HeadContent](/ru/scripting/blazor-windows/toggles-styling-cssfile). Этапы жизни компонента описаны в [документации Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).

<details>
<summary>Повторная загрузка и изменение файла</summary>

Загрузчик запоминает путь со статусом `loading`, `loaded` или `failed`. Повторный вызов для того же пути сразу завершается: он не начинает новую загрузку, не ждёт уже начатую и не подтверждает, что прошлая попытка удалась. Поэтому повторный `LoadCss` не годится, чтобы проверить изменение файла или восстановиться после ошибки. Для чистой проверки используйте новое окно с правильно указанным ресурсом.

</details>
