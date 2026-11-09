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

Кнопка на панели может менять тот же триггер, которым управляет горячая клавиша. Сделаем её для собственной тестовой ауры `TargetAura`: нажатие изменит состояние триггера и подпись под кнопкой.

## Подготовить две ауры

1. В одной папке создайте `TargetAura` и отдельную ауру для панели. В `TargetAura` добавьте **Hotkey Is Active**, назначьте свободную горячую клавишу и выберите режим **Toggle**. Не добавляйте действий: для этого опыта достаточно наблюдать состояние.
2. В ауру панели добавьте **C# Overlay** и **Fixed Value → Is Active**, чтобы панель оставалась видимой независимо от `TargetAura`. Обе ауры оставьте загруженными.
3. В C# Overlay замените `UserOverlay.cs` и `UserOverlay.razor` кодом ниже. `Script.csx` оставьте коротким, без ожидания или цикла, как в [примере счётчика](/ru/scripting/blazor-windows/3-hello-world).

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

После компиляции нажмите **Переключить триггер**. Кнопка и подпись должны отразить новое значение; в редакторе изменится состояние Hotkey Is Active у `TargetAura`.

![Прежняя демонстрация кнопки и состояния целевой ауры](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

| Часть настройки | Значение в этом примере |
| --- | --- |
| Путь `./TargetAura` | Соседняя аура относительно контекста панели. При другой структуре дерева замените путь. Поиск требует существующую ауру и берёт первый подходящий триггер; отсутствие вызывает исключение. |
| `[Inject] IAuraTreeScriptingApi` | Сервис дерева, предоставленный компоненту его контейнером. Это не глобальная переменная `AuraTree` из `Script.csx`. |
| `TriggerValue` | Доступное для записи значение именно Hotkey Is Active. `null` в этой кнопке отображается как выключенное состояние. |
| `IsChecked` / `IsCheckedChanged` | Первое передаёт текущее значение кнопке, второе получает новое значение от её нажатия. |
| Общий namespace | `BlazorDemo` должен совпадать в обеих частях `UserOverlay`. |

Компонент читает начальное состояние из триггера, а не хранит вторую независимую копию. Обработчик записывает новое значение и вызывает `Refresh`. Здесь нет подписки на внешние изменения: после горячей клавиши интерфейс может оставаться прежним до следующего обновления. [Следующий шаг](/ru/scripting/blazor-windows/reactive-toggle) добавляет такое наблюдение.

Запись меняет триггер, а не принудительно включает всю ауру: итоговая активность зависит и от остальных её условий. `TriggerValue` доступен для записи не у каждого вида триггера; общее `IsActive` служит для чтения состояния. Для деталей подключения сервиса см. [внедрение зависимостей](/ru/scripting/dependency-injection).
