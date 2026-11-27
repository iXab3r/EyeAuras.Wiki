---
title: 5. Механизм обновления
description: Как обновлять панель, когда триггер меняется снаружи
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:35:20.794Z
---
# Обновлять кнопку после горячей клавиши

Если триггер переключили горячей клавишей, панель должна показать новое состояние сама, без нажатия мышью. Подпишем компонент на изменение `TriggerValue`: он будет перерисовываться по событию, без постоянного опроса.

Нужны соседние ауры: `TargetAura` с **Hotkey Is Active → Toggle** и панель с **C# Overlay**, как в [первом переключателе](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive). Панель держите активной через её собственный **Fixed Value → Is Active**. Обе ауры должны быть загружены.

1. В C# Overlay замените два файла кодом ниже. Короткий `Script.csx` не трогайте.
2. После компиляции сравните подпись на панели с состоянием триггера в `TargetAura`.
3. Переключите триггер горячей клавишей, затем кнопкой панели. Оба действия меняют один и тот же триггер, и подпись обновляется в обоих случаях.

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
using ReactiveUI;
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
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
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

![Внешнее переключение и обновление панели в прежнем примере](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_W7LNmgAsPK.gif)

| Механизм | Что он даёт |
| --- | --- |
| `WhenAnyValue(x => x.TriggerValue)` | Читает начальное значение и следит за уведомлениями об изменении свойства триггера. Нужен `using ReactiveUI`. |
| `ChangeTrackers.Add(...)` | Передаёт источник обновлений базовому `BlazorReactiveComponent`. Добавляйте его **до** `base.OnInitialized()`: там список запечатывается и подключается. |
| `IsActive` | При отображении читает тот же триггер. `null` показан как выключенное состояние. |
| `Refresh(...)` | Обновляет компонент через его диспетчер после записи из обработчика кнопки. Сигналы `ChangeTrackers` базовый компонент тоже обрабатывает. |

Писать `Subscribe` вручную и заводить зеркальную переменную не нужно. Подпиской владеет базовый компонент через свои `Anchors` и освобождает её, когда компонент уничтожается. Не переносите эту подписку в короткий `using` в `Script.csx` — у него другой срок жизни.

<details>
<summary>Когда у источника нет уведомлений</summary>

Старый пример обновлял панель раз в секунду. Такой опрос годится для источника, за которым нельзя наблюдать по событию. Вместо строки `ChangeTrackers.Add(trigger.WhenAnyValue(...))` вставьте этот фрагмент в `OnInitialized`, до вызова базового метода:

```csharp
ChangeTrackers.Add(System.Reactive.Linq.Observable.Timer(
    System.DateTimeOffset.Now, System.TimeSpan.FromSeconds(1)));
```

Это перерисовка по таймеру, а не событие изменения триггера, поэтому внешнее изменение видно с задержкой. Этот вариант для общей панели показан в [нескольких переключателях](/ru/scripting/blazor-windows/multiple-toggles).

</details>
