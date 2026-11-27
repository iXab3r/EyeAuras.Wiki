---
title: 4. Создание переключателя
description: 
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:24:53.840Z
---
# Кнопка для своей ауры

Кнопка на панели может менять тот же триггер, что и горячая клавиша. Сделаем такую кнопку для тестовой ауры `TargetAura`: нажатие меняет состояние триггера и подпись под кнопкой.

## Подготовить две ауры

1. В одной папке создайте `TargetAura` и отдельную ауру для панели. В `TargetAura` добавьте **Hotkey Is Active**, назначьте свободную горячую клавишу и выберите режим **Toggle**. Действия не нужны: здесь достаточно наблюдать за состоянием.
2. В ауру панели добавьте **C# Overlay** и **Fixed Value → Is Active**, чтобы панель была видна независимо от `TargetAura`. Обе ауры оставьте загруженными.
3. В C# Overlay замените `UserOverlay.cs` и `UserOverlay.razor` кодом ниже. `Script.csx` оставьте коротким, без ожидания и циклов, как в [примере счётчика](/ru/scripting/blazor-windows/3-hello-world).

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; set; }

    private IHotkeyIsActiveTrigger trigger;
    private bool IsActive => trigger.TriggerValue ?? false;

    protected override void OnInitialized()
    {
        trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
        base.OnInitialized();
    }

    private async Task SetActive(bool value)
    {
        trigger.TriggerValue = value;
        await Refresh("toggle clicked");
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3>Управление TargetAura</h3>
<ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
              Class="btn btn-secondary">
    Переключить триггер
</ToggleButton>
<p>Триггер: @(IsActive ? "включён" : "выключен")</p>
```

После компиляции нажмите **Переключить триггер**. Кнопка и подпись покажут новое значение, а в редакторе изменится состояние Hotkey Is Active у `TargetAura`.

![Прежняя демонстрация кнопки и состояния целевой ауры](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

| Часть настройки | Значение в этом примере |
| --- | --- |
| Путь `./TargetAura` | Соседняя аура относительно контекста панели. Если дерево устроено иначе, замените путь. Аура должна существовать, берётся первый подходящий триггер. Если его нет, будет исключение. |
| `[Inject] IAuraTreeScriptingApi` | Сервис дерева, который компонент получает от своего контейнера. Это не глобальная переменная `AuraTree` из `Script.csx`. |
| `TriggerValue` | Значение именно Hotkey Is Active, в которое можно писать. `null` эта кнопка показывает как выключенное состояние. |
| `IsChecked` / `IsCheckedChanged` | Первое передаёт кнопке текущее значение, второе получает новое значение после нажатия. |
| Общий namespace | `BlazorDemo` должен совпадать в обеих частях `UserOverlay`. |

Компонент читает начальное состояние из триггера и не хранит свою копию. Обработчик записывает новое значение и вызывает `Refresh`. Подписки на внешние изменения здесь нет: после горячей клавиши панель может показывать старое состояние до следующего обновления. Наблюдение добавляется на [следующем шаге](/ru/scripting/blazor-windows/reactive-toggle).

Запись меняет триггер, а не включает всю ауру: её активность зависит и от остальных условий. Писать в `TriggerValue` можно не у каждого вида триггера, а общее `IsActive` служит для чтения состояния. Как подключается сервис — во [внедрении зависимостей](/ru/scripting/dependency-injection).
