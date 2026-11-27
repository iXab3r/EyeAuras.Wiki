---
title: 5. Механизм обновления
description: Как работает механизм обновления в EyeAuras
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:35:20.794Z
---
# Обновлять кнопку после горячей клавиши

Если триггер переключили горячей клавишей, панель должна показать новое состояние без дополнительного нажатия мышью. Подпишем компонент на изменение `TriggerValue`: он будет перерисовываться по событию, без постоянного опроса.

Нужны соседние ауры `TargetAura` с **Hotkey Is Active → Toggle** и панель с **C# Overlay**, как в [первом переключателе](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive). Панель держите активной через её собственный **Fixed Value → Is Active**. Обе ауры должны быть загружены.

1. В C# Overlay замените два файла ниже. Короткий `Script.csx` оставьте без изменений.
2. После компиляции сравните подпись на панели с состоянием триггера в `TargetAura`.
3. Переключите триггер его горячей клавишей, затем кнопкой панели. Оба действия меняют один источник, и подпись обновляется в обоих случаях.

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
| `WhenAnyValue(x => x.TriggerValue)` | Читает начальное значение и наблюдает уведомления об изменении свойства триггера. Нужен `using ReactiveUI`. |
| `ChangeTrackers.Add(...)` | Передаёт источник обновлений базовому `BlazorReactiveComponent`. Добавляйте его **до** `base.OnInitialized()`, где список запечатывается и подключается. |
| `IsActive` | При отображении читает тот же триггер; `null` показан как выключенное состояние. |
| `Refresh(...)` | Обновляет компонент через его диспетчер после записи из обработчика кнопки. Базовый компонент также обрабатывает сигналы `ChangeTrackers`. |

Здесь не нужен вручную написанный `Subscribe` и отдельная зеркальная переменная. Подпиской владеет базовый компонент через свои `Anchors`; при уничтожении компонента она освобождается. Скрытие окна не означает уничтожение: наблюдение может продолжаться, пока компонент жив. Не переносите эту подписку в короткий `using` в `Script.csx` — это другой срок жизни.

В примере используются уведомления уже существующего триггера. Он не требует автоматического преобразования свойств произвольного Razor-класса или `.csx`. Как и раньше, изменение триггера не отменяет остальные условия активности ауры.

<details>
<summary>Когда у источника нет уведомлений</summary>

Старый пример обновлял панель раз в секунду. Такой опрос можно оставить для источника, который нельзя наблюдать по событию: вместо строки `ChangeTrackers.Add(trigger.WhenAnyValue(...))` используйте этот фрагмент внутри `OnInitialized`, до вызова базового метода:

```csharp
ChangeTrackers.Add(System.Reactive.Linq.Observable.Timer(
    System.DateTimeOffset.Now, System.TimeSpan.FromSeconds(1)));
```

Это периодическая перерисовка, а не событие изменения триггера; внешнее изменение будет видно с задержкой. Не добавляйте оба механизма без необходимости. [Несколько переключателей](/ru/scripting/blazor-windows/multiple-toggles) показывают этот вариант для общей панели.

</details>
