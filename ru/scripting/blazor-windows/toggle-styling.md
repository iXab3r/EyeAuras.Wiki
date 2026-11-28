---
title: 7. Настройка переключателей
description: Как показать состояние переключателя цветом, значком и дополнительной кнопкой
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T15:23:20.489Z
---
# Показать состояние цветом, подписью и дополнительной кнопкой

На панели настроек должно быть сразу видно, что включено. Сделаем четыре переключателя: первый меняет цвет, второй — значок и текст, третий показывает кнопку четвёртого. Все они работают с теми же триггерами, что и горячие клавиши.

1. Подготовьте соседние ауры `TargetAura 1`…`TargetAura 4`, в каждой — **Hotkey Is Active → Toggle** со своей свободной клавишей. Оставьте ауры загруженными. Действия не нужны.
2. Создайте отдельную ауру панели с **C# Overlay** и **Fixed Value → Is Active**.
3. Замените `UserOverlay.cs` и `UserOverlay.razor` кодом ниже. `Script.csx` оставьте коротким, без циклов и ожидания.

## UserOverlay.cs

```csharp
using System;
using System.Threading.Tasks;
using ReactiveUI;
using AntDesign;
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

    private readonly ClassMapper firstButtonClass = new ClassMapper();

    protected override void OnInitialized()
    {
        items = new[]
        {
            new ToggleItem("Триггер 1", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 1")),
            new ToggleItem("Триггер 2", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 2")),
            new ToggleItem("Триггер 3", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 3")),
            new ToggleItem("Триггер 4", AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura 4")),
        };
        firstButtonClass.Add("btn")
            .If("btn-success", () => items[0].IsActive)
            .If("btn-outline-danger", () => !items[0].IsActive);
        foreach (var item in items)
        {
            ChangeTrackers.Add(item.Trigger.WhenAnyValue(x => x.TriggerValue));
        }
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

<h3>Настройки панели</h3>
<div class="d-flex gap-1 flex-column alert alert-info">
    <ToggleButton IsChecked="@items[0].IsActive"
                  IsCheckedChanged="value => SetActive(items[0], value)"
                  Class="@firstButtonClass.ToString()">
        Триггер 1: @(items[0].IsActive ? "включён" : "выключен")
    </ToggleButton>

    <ToggleButton IsChecked="@items[1].IsActive"
                  IsCheckedChanged="value => SetActive(items[1], value)">
        @if (items[1].IsActive)
        {
            <i class="fa-solid fa-toggle-on"></i>
            <strong>Триггер 2 включён</strong>
        }
        else
        {
            <i class="fa-solid fa-toggle-off"></i>
            <span>Триггер 2 выключен</span>
        }
    </ToggleButton>

    <div class="d-flex gap-1 align-self-center">
        <ToggleButton IsChecked="@items[2].IsActive"
                      IsCheckedChanged="value => SetActive(items[2], value)">
            Показать триггер 4
        </ToggleButton>
        @if (items[2].IsActive)
        {
            <span class="vr"></span>
            <ToggleButton IsChecked="@items[3].IsActive"
                          IsCheckedChanged="value => SetActive(items[3], value)">
                Триггер 4
            </ToggleButton>
        }
    </div>
</div>
```

4. После компиляции включите первый триггер кнопкой: красный контур сменится зелёной заливкой. Вторая кнопка меняет значок и подпись. Третья показывает четвёртую кнопку, повторное нажатие её скрывает.
5. Переключите первый или второй триггер горячей клавишей. Оформление тоже обновится, потому что компонент наблюдает за `TriggerValue`.

![Варианты оформления в прежнем примере](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_BY6C30fWpS.gif)

## Где задаётся оформление

| Приём | Что меняет |
| --- | --- |
| `Class` первой кнопки | `ClassMapper` создаётся один раз. При отображении его условия выбирают `btn-success` или `btn-outline-danger` по текущему состоянию триггера. |
| `ChildContent` второй кнопки | Блок `@if` меняет содержимое кнопки: значок и текст. Нажатие по-прежнему обрабатывает один `ToggleButton`. |
| `@if (items[2].IsActive)` | Добавляет четвёртую кнопку в разметку или убирает её. `TriggerValue` четвёртого триггера при скрытии не сбрасывается. |
| `d-flex gap-1 flex-column` | Располагает элементы столбцом с промежутками. |
| `btn`, `btn-success`, `btn-outline-danger`, `alert` | Готовые классы Bootstrap, доступные в окне EyeAuras. Они описаны в [документации кнопок](https://getbootstrap.com/docs/5.3/components/buttons/). |
| `fa-solid fa-toggle-on` / `fa-toggle-off` | Значки из оформления, подключённого окном. Текст рядом нужен, чтобы состояние было понятно не только по цвету или значку. |

Если нужны свои цвета и размеры, которых нет в готовых классах, начните со [встроенного CSS](/ru/scripting/blazor-windows/toggles-styling-inline). Когда общих правил для нескольких элементов станет много, [вынесите их в CSS-файл проекта](/ru/scripting/blazor-windows/toggles-styling-cssfile).

Источники добавлены в `ChangeTrackers` до `base.OnInitialized()`. Подпиской владеет базовый компонент и освобождает её при уничтожении.

<details>
<summary>Условия вместо изменения класса</summary>

Если разметка двух состояний сильно различается, выберите разные ветви `@if`, как у значка второй кнопки. Дублировать целую кнопку ради одного цвета не нужно.

[Вариант с таймером](/ru/scripting/blazor-windows/multiple-toggles) остаётся для источников без уведомлений.

</details>
