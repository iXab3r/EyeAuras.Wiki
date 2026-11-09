---
title: 6. Несколько переключателей
description: Настройка и использование нескольких переключателей.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:52:06.974Z
---
# Три переключателя на одной панели

Соберём кнопки для трёх собственных аур в одном месте. Каждая кнопка читает свой реальный триггер и меняет его; отдельные копии состояния и три пары одинаковых свойств не нужны.

1. В одной папке создайте `TargetAura 1`, `TargetAura 2`, `TargetAura 3`. В каждую добавьте **Hotkey Is Active** в режиме **Toggle** со своей свободной горячей клавишей. Оставьте их загруженными, без действий для этого опыта.
2. В той же папке создайте ауру панели с **C# Overlay** и **Fixed Value → Is Active**. Её видимость не должна зависеть от трёх переключаемых триггеров.
3. Замените `UserOverlay.cs` и `UserOverlay.razor` ниже. `Script.csx` оставьте короткой точкой входа без ожидания.

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

4. После компиляции нажмите вторую кнопку: меняется только Hotkey Is Active у `TargetAura 2`. Переключите другой триггер горячей клавишей: его кнопка отразит изменение примерно в течение секунды.

![Три кнопки для трёх аур в прежнем примере](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

| Что можно изменить | Как это устроено |
| --- | --- |
| Подписи и пути в `items` | Одна строка связывает подпись с найденным триггером. Пути относительны контексту панели; при отсутствии ауры или нужного триггера поиск выдаёт ошибку. |
| `ToggleItem.IsActive` | Читает актуальный `TriggerValue`, `null` показывает как выключенное. Модель хранит ссылку на триггер, а не вторую изменяемую копию его значения. |
| `SetActive(item, value)` | Записывает значение только в выбранный триггер и обновляет компонент. |
| `Observable.Timer(..., TimeSpan.FromSeconds(1))` | Периодически обновляет общую панель, чтобы видеть изменения от горячих клавиш. Это опрос, а не подписка на отдельное свойство. |
| `d-flex gap-1` | Размещает кнопки в строку с промежутками; `alert alert-info` оформляет общую область. |

Таймер добавлен до `base.OnInitialized()`. Базовый компонент подключает его через `ChangeTrackers` и освобождает подписку при уничтожении компонента. Пока окно просто скрыто, компонент может продолжать жить и обновляться. Не создавайте второй таймер в `Script.csx`.

Для обновления по событию вместо секундного опроса используйте [наблюдение за TriggerValue](/ru/scripting/blazor-windows/reactive-toggle) для каждого элемента списка. Состояние всей ауры по-прежнему зависит от остальных условий, а не только от этой кнопки.

Назначение цветов и вариантов кнопок приведено в [документации Bootstrap](https://getbootstrap.com/docs/5.3/components/buttons/); [следующий пример оформления](/ru/scripting/blazor-windows/toggle-styling) меняет цвет, содержимое и видимость кнопок.
