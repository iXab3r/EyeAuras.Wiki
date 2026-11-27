---
title: 6. Несколько переключателей
description: Как собрать несколько переключателей на одной панели
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:52:06.974Z
---
# Три переключателя на одной панели

Соберём на одной панели кнопки для трёх аур. Каждая кнопка читает и меняет свой настоящий триггер. Копии состояния и три пары одинаковых свойств не нужны.

1. В одной папке создайте `TargetAura 1`, `TargetAura 2`, `TargetAura 3`. В каждую добавьте **Hotkey Is Active** в режиме **Toggle** со своей свободной горячей клавишей. Оставьте ауры загруженными, действия не нужны.
2. В той же папке создайте ауру панели с **C# Overlay** и **Fixed Value → Is Active**. Её видимость не должна зависеть от трёх триггеров.
3. Замените `UserOverlay.cs` и `UserOverlay.razor` кодом ниже. `Script.csx` оставьте короткой точкой входа без ожидания.

## UserOverlay.cs

```csharp
using System;
using System.Threading.Tasks;
using System.Reactive.Linq;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; set; }

    private ToggleItem[] items = Array.Empty<ToggleItem>();

    protected override void OnInitialized()
    {
        items = new[]
        {
            new ToggleItem("Триггер 1", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1")),
            new ToggleItem("Триггер 2", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2")),
            new ToggleItem("Триггер 3", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3")),
        };
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }

    private async Task SetActive(ToggleItem item, bool value)
    {
        item.Trigger.TriggerValue = value;
        await Refresh("group toggle clicked");
    }

    private sealed record ToggleItem(string Label, IHotkeyIsActiveTrigger Trigger)
    {
        public bool IsActive => Trigger.TriggerValue ?? false;
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3>Мои триггеры</h3>
<div class="d-flex gap-1 alert alert-info">
    @foreach (var item in items)
    {
        <ToggleButton @key="item" IsChecked="@item.IsActive"
                      IsCheckedChanged="value => SetActive(item, value)">
            @item.Label: @(item.IsActive ? "включён" : "выключен")
        </ToggleButton>
    }
</div>
```

4. После компиляции нажмите вторую кнопку: меняется только Hotkey Is Active у `TargetAura 2`. Переключите другой триггер горячей клавишей — его кнопка покажет это примерно в течение секунды.

![Три кнопки для трёх аур в прежнем примере](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

| Что можно изменить | Как это устроено |
| --- | --- |
| Подписи и пути в `items` | Одна строка связывает подпись с найденным триггером. Пути отсчитываются от контекста панели. Если нет ауры или нужного триггера, поиск выдаст ошибку. |
| `ToggleItem.IsActive` | Читает текущий `TriggerValue`, `null` показывает как выключенное. Модель хранит ссылку на триггер, а не копию его значения. |
| `SetActive(item, value)` | Записывает значение только в выбранный триггер и обновляет компонент. |
| `Observable.Timer(..., TimeSpan.FromSeconds(1))` | Раз в секунду обновляет всю панель, чтобы были видны изменения от горячих клавиш. Это опрос, а не подписка на отдельное свойство. |
| `d-flex gap-1` | Ставит кнопки в строку с промежутками. `alert alert-info` оформляет общую область. |

Таймер добавлен до `base.OnInitialized()`. Базовый компонент подключает его через `ChangeTrackers` и отписывается, когда компонент уничтожается. Второй таймер в `Script.csx` не создавайте.

Чтобы панель обновлялась по событию, а не раз в секунду, используйте [наблюдение за TriggerValue](/ru/scripting/blazor-windows/reactive-toggle) для каждого элемента списка.

Цвета и варианты кнопок описаны в [документации Bootstrap](https://getbootstrap.com/docs/5.3/components/buttons/). [Следующий пример оформления](/ru/scripting/blazor-windows/toggle-styling) меняет цвет, содержимое и видимость кнопок.
