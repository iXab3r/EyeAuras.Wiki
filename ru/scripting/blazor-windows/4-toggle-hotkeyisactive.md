---
title: 4. Создание переключателя
description: 
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:24:53.840Z
---
# Управление аурой через UI

Разберём типичную задачу: нужно разместить на экране кнопку, которая будет включать и выключать определённую функциональность.

## Вариант через триггер HotkeyIsActive

Стандартный способ:

- создайте ауру
- добавьте триггер `HotkeyIsActive`
- назначьте горячую клавишу

Готово: при нажатии хоткея состояние ауры будет переключаться.

## Вариант через C# Overlay

Можно сделать и отдельную кнопку в интерфейсе. Для этого создадим ещё один overlay и нарисуем кнопку там.

## UserOverlay.cs

```csharp
public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public IHotkeyIsActiveTrigger Trigger
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
    }

    public bool TriggerIsActive
    {
        get => Trigger.TriggerValue ?? false;
        set => Trigger.TriggerValue = value;
    }
}
```

## UserOverlay.razor

```csharp
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">Toggle Trigger</h3>

<div class="text-center mt-4">
    <ToggleButton
              @bind-IsChecked="@TriggerIsActive"
              Class="btn btn-secondary">
       Trigger is Active
    </ToggleButton>
</div>

<p class="text-center mt-3 alert alert-info" style="font-size: 1.5rem;">
    @if (TriggerIsActive){
        <span class="shadow-1">Trigger is currently active</span>
    } else {
        <span class="text-warning shadow-1">Trigger is currently not active</span>
    }
</p>
```

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

---

# Разбор

Теперь посмотрим, как это работает подробнее.

## UserOverlay.cs

```csharp
 [Inject]
 public IAuraTreeScriptingApi AuraTree { get; init; }
```

EyeAuras активно использует Dependency Injection. Подробнее об этом можно прочитать [здесь](/ru/scripting/dependency-injection). Если коротко, этот механизм даёт доступ к разным частям программы. В данном случае мы запрашиваем доступ к дереву аур. EyeAuras сама гарантирует, что при запуске скрипта оно будет доступно. Поскольку мы собираемся менять состояние ауры, нам нужен именно доступ к дереву аур.

```csharp
public IDefaultTrigger Trigger
{
   get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
}
```

Это свойство ищет ауру с именем `TargetAura`, расположенную в той же папке (`./`), и получает из неё триггер типа `IHotkeyIsActiveTrigger`. Правила путей здесь такие же, как в файловой системе: `./` — текущая папка, `..` — родительская и т. д. Поддерживаются и прямые, и обратные слэши. Если аура или триггер не найдены, EyeAuras выбросит исключение.

```csharp
  public bool TriggerIsActive
    {
        get => Trigger.TriggerValue ?? false;
        set => Trigger.TriggerValue = value;
    }
```

Здесь мы читаем и задаём состояние триггера.

- `get` находит триггер и читает его текущее значение
- `set` записывает новое значение

> Не у всех триггеров `TriggerValue` доступен для записи, но у **всех** триггеров есть `IsActive`, чтобы **читать** их состояние. Это полезно, например, для триггеров вроде ImageSearch/MLSearch, если нужно проверить, нашли ли они что-нибудь.

## UserOverlay.razor

```html
@using PoeShared.Blazor.Controls
```

`ToggleButton` — это компонент, который отображает кнопку с двумя состояниями (ON/OFF). Он находится в пространстве имён `PoeShared.Blazor.Controls`, поэтому для доступа к нему мы добавляем `@using PoeShared.Blazor.Controls`.

```html
<ToggleButton
              @bind-IsChecked="@TriggerIsActive"
              Class="btn btn-secondary">
   Trigger is Active
</ToggleButton>
```

Здесь мы просим Blazor отрисовать `ToggleButton`. Ключевая часть — `@bind-IsChecked="@TriggerIsActive"`, она связывает состояние кнопки с нашим свойством. Во время рендера берётся значение `TriggerIsActive`, а при нажатии новое значение записывается обратно.

```html
@if (TriggerIsActive){
   <span class="shadow-1">Trigger is currently active</span>
} else {
   <span class="text-warning shadow-1">Trigger is currently not active</span>
}
```

Этот блок показывает разный текст в зависимости от того, активен триггер или нет. Обратите внимание: при нажатии на кнопку текст тоже обновляется.