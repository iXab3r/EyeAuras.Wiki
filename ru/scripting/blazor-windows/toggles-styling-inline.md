---
title: 8. Добавление CSS — inline
description: Как добавить встроенный CSS прямо в документ
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T15:48:02.521Z
---
# Изменить цвет своей кнопки прямо в компоненте

Сделаем переключатель заметнее: зелёная кнопка с чёрным текстом займёт 80% ширины своей панели. CSS меняет оформление; включение триггера по-прежнему выполняет C#.

Нужны две загруженные ауры в одной папке: `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и отдельная панель с **C# Overlay** и **Fixed Value → Is Active**. Назначьте триггеру свободную горячую клавишу; действия для этого опыта не нужны. Путь `./TargetAura` должен указывать на вашу ауру с одним таким триггером. Подготовка самой кнопки разобрана в [предыдущем примере](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

1. В C# Overlay полностью замените `UserOverlay.cs` и `UserOverlay.razor` приведённым кодом. Namespace `BlazorDemo` должен совпадать в обоих файлах. Старые одноимённые поля и методы удалите вместе с заменой.
2. `Script.csx` оставьте короткой точкой входа без ожидания, например `Log.Debug("Панель готова");`.

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

<style>
.demo-panel .custom-button {
    background: lime;
    color: black;
    width: 80%;
}
</style>

<div class="demo-panel">
    <ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
                  Class="btn custom-button">
        Триггер: @(IsActive ? "включён" : "выключен")
    </ToggleButton>
</div>
```

3. После компиляции найдите зелёную кнопку и нажмите её. Подпись и триггер меняют состояние; цвет остаётся заданным CSS. Горячая клавиша меняет тот же триггер.

![Зелёная кнопка в прежнем примере](https://s3.eyeauras.net/media/2025/05/3UAeooHWHD.png)

| Приём | Где действует |
| --- | --- |
| `background: lime`, `color: black` | Зелёный фон и чёрный текст подходящей кнопки. |
| `width: 80%` | Ширина относительно её родительской области, а не экрана. |
| `.demo-panel .custom-button` | Селектор для кнопки внутри своей панели. Он не перекрашивает все кнопки окна. |
| Элемент `style` в Razor | Правила находятся в разметке компонента, но действуют в документе WebView. Это не автоматическая изоляция CSS по компоненту. |
| Параметр `Style` у `ToggleButton` | Отдельный способ задать значения непосредственно на его видимой кнопке. Это отличается от объявления селектора в `style`. |
| `btn` | Базовое оформление [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/), подключённое окном. Набор доступных классов зависит от ресурсов хоста. |

`[Inject]` предоставляет компоненту сервис дерева; это не глобальное имя из `Script.csx`. Кнопка читает и меняет реальный `TriggerValue`, а `null` показывает как выключенное. `WhenAnyValue` обновляет её и после горячей клавиши. Источник добавлен до `base.OnInitialized()`; подписку освобождает компонент при уничтожении, а не при простом скрытии окна. Итоговая активность ауры также зависит от остальных её условий. Подробности и вариант с периодическим обновлением — в [механизме обновления](/ru/scripting/blazor-windows/reactive-toggle).

<details>
<summary>Задать значения без CSS-селектора</summary>

В том же компоненте можно заменить только `ToggleButton` на этот фрагмент и удалить элемент `style`. Условия и обработчик остаются в `UserOverlay.cs`:

```razor
<ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
              Style="background: lime; color: black; width: 80%;">
    Триггер: @(IsActive ? "включён" : "выключен")
</ToggleButton>
```

Для нескольких кнопок удобнее общий класс: он позволяет изменить правило в одном месте. Разметка отдельно задаёт расположение, как в прежней панели с рядом переключателей:

![Ряд переключателей в прежнем примере](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

</details>

<details>
<summary>Градиент и подсветка при наведении</summary>

Вместо простого правила внутри `style` можно поставить следующий вариант. Он сохраняет тот же селектор, добавляет градиент и движущуюся подсветку при наведении:

```css
.demo-panel .custom-button {
    background: linear-gradient(90deg, red, darkred);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 0.3rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background 0.3s ease;
}

.demo-panel .custom-button::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1));
    transition: left 0.6s ease-in-out;
    z-index: 1;
}

.demo-panel .custom-button:hover::before {
    left: 100%;
}

.demo-panel .custom-button > * {
    position: relative;
    z-index: 2;
}
```

![Градиентная кнопка в прежней демонстрации](https://s3.eyeauras.net/media/2025/05/J0g2tAOpQa.gif)

</details>

Когда правил станет больше, их можно [вынести в CSS-файл](/ru/scripting/blazor-windows/toggles-styling-cssfile).
