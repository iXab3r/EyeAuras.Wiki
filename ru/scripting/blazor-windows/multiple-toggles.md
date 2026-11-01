---
title: 6. Несколько переключателей
description: Настройка и использование нескольких переключателей.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:52:06.974Z
---
# Управление аурой через интерфейс

Код уже работает, хотя и не идеально. При нажатии кнопки триггер и аура переключаются корректно. Но если активировать триггер **горячей клавишей**, интерфейс сам по себе не обновится — ему нужен сигнал. Здесь используем то же простое решение: обновлять интерфейс **раз в секунду**. Это не самый оптимальный вариант, но для нашего небольшого UI его вполне достаточно.

В одной папке создайте ауру с **C# Overlay v3** и ауры `TargetAura 1`, `TargetAura 2`, `TargetAura 3`. В каждую целевую ауру добавьте `HotkeyIsActive` и настройте горячую клавишу в режиме переключения. Оставьте целевые ауры загруженными. Пути `./TargetAura 1` и остальные в примере ищутся относительно контекста оверлея; при другой структуре дерева замените их. Если подходящих триггеров несколько, выбирается первый.

Замените содержимое `UserOverlay.cs` и `UserOverlay.razor` в этом оверлее кодом ниже. Это две части одного `public partial` класса в одном пространстве имён. `AuraTree` получает компонент через `[Inject]`; глобальные переменные из `Script.csx` в него автоматически не передаются.

## UserOverlay.cs
```csharp
using System;
using System.Reactive.Linq;
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public bool Trigger1IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue = value;
    }

    public bool Trigger2IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2").TriggerValue = value;
    }

    public bool Trigger3IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3").TriggerValue = value;
    }

    protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
}
```

## UserOverlay.razor
```html
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">Toggle Multiple Triggers</h3>

<div class="text-center mt-4 mx-2 d-flex gap-1 alert alert-info">
    <ToggleButton @bind-IsChecked="@Trigger1IsActive">
        Trigger <b>1</b>
    </ToggleButton>
    <ToggleButton @bind-IsChecked="@Trigger2IsActive">
        Trigger <b>2</b>
    </ToggleButton>
    <ToggleButton @bind-IsChecked="@Trigger3IsActive">
        Trigger <b>3</b>
    </ToggleButton>
</div>
```

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

---

## Разбор

## UserOverlay.cs
```csharp
    public bool Trigger1IsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1").TriggerValue = value;
    }
```

Для удобства мы объявляем отдельные свойства для каждой ауры. Логика та же, что и раньше, но вместо того чтобы отдельно искать триггер и отдельно получать его значение, мы делаем это сразу в одном месте. `GetTriggerByPath` гарантирует, что триггер будет найден (или выбросит исключение), поэтому имя и наличие триггера нужно проверить до запуска.

## UserOverlay.razor
```html
<div class="text-center mt-4 mx-2 d-flex gap-1 alert alert-info">
    <ToggleButton @bind-IsChecked="@Trigger1IsActive">
        Trigger <b>1</b>
    </ToggleButton>
    ...
</div>
```

Основные классы у родительского `<div>`:

- `d-flex` — выстраивает элементы в одну строку
- `gap-1` — задаёт небольшой отступ между ними (`gap-2`, `gap-3` и т. д. тоже доступны). Эти классы предоставляет [Bootstrap](https://getbootstrap.com/)
- `alert alert-info` — оборачивает кнопки в цветной блок, чтобы они были заметнее

Сами кнопки изменились только по имени переменной и небольшим стилевым правкам. Больше вариантов оформления кнопок можно посмотреть [здесь](https://getbootstrap.com/docs/5.3/components/buttons/). Настройку стилей разберём дальше.
Нажатие кнопки записывает `TriggerValue`; горячая клавиша меняет тот же триггер. Таймер в `ChangeTrackers` заставляет компонент перечитывать состояние примерно раз в секунду, поэтому внешнее изменение видно с задержкой. Добавляйте таймер до `base.OnInitialized()`: там список отслеживания запечатывается и подписки привязываются к `Anchors` компонента. Скрытие окна само по себе не равно уничтожению компонента.
