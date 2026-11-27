---
title: 10. Подключение CSS-файла — LoadCss
description: Как подключить CSS-файл с помощью LoadCss
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:22:32.324Z
---
# Подключить CSS после появления компонента

Иногда файл оформления нужно подключить из C#, когда компонент уже появился в браузерной части. Для этого есть `IJsPoeBlazorUtils.LoadCss`. Подключим оформление собственной кнопки после первой отрисовки.

Нужны две загруженные ауры в одной папке: `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и отдельная панель с **C# Overlay** и **Fixed Value → Is Active**. Назначьте триггеру свободную горячую клавишу; действия для этого опыта не нужны. Путь `./TargetAura` должен указывать на вашу ауру с одним таким триггером. Подготовка самой кнопки разобрана в [предыдущем примере](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

1. В C# Overlay создайте **New file → CSS → Styles** и сохраните CSS ниже.
2. Получите полное имя файла. В `UserOverlay.cs` замените `MyScript.Styles.css` этим именем.

В полном имени ресурса участвует namespace **проекта**, а не только `@namespace` компонента. Например, `Styles.css` может получить имя `MyScript.Styles.css`, а `Theme/Styles.css` — `MyScript.Theme.Styles.css`. Не подставляйте `BlazorDemo` только потому, что так называется класс в примере.

Чтобы получить фактическое имя, оставьте в `Script.csx` этот законченный короткий код и дождитесь подготовки проекта:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Скопируйте полное имя своего `Styles.css` из журнала в указанную ниже строку. `Script` здесь — тип верхнеуровневого скрипта; такой глобальный контекст не появляется в обычном классе или Razor. Файловый механизм окна раздаёт ресурсы проекта в WebView2. Полное имя устраняет догадки с короткими путями; общий `IScriptFileProvider` может быть составным, поэтому приводить его к `ScriptEmbeddedResourceFileProvider` не нужно.

3. Замените обе части `UserOverlay` следующими файлами. Namespace совпадает; `HeadContent` в этом варианте не нужен.

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

    [Inject]
    public PoeShared.Blazor.Services.IJsPoeBlazorUtils BlazorUtils { get; set; }

    private IHotkeyIsActiveTrigger trigger;
    private bool IsActive => trigger.TriggerValue ?? false;

    protected override void OnInitialized()
    {
        trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
        ChangeTrackers.Add(trigger.WhenAnyValue(x => x.TriggerValue));
        base.OnInitialized();
    }

    protected override async Task OnAfterFirstRenderAsync()
    {
        await base.OnAfterFirstRenderAsync();
        await BlazorUtils.LoadCss("MyScript.Styles.css");
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

<div class="demo-panel">
    <ToggleButton IsChecked="@IsActive" IsCheckedChanged="SetActive"
                  Class="btn custom-button">
        Триггер: @(IsActive ? "включён" : "выключен")
    </ToggleButton>
</div>
```

## Styles.css

```css
.demo-panel .custom-button {
    background: lime;
    color: black;
    width: 80%;
}
```

4. После компиляции и первой отрисовки кнопка получит зелёный фон, чёрный текст и ширину 80% панели. До загрузки CSS она может кратко показываться со стандартным оформлением.

![Оформление после загрузки CSS в прежнем примере](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Механизм | Как использовать |
| --- | --- |
| `[Inject] IJsPoeBlazorUtils` | Получает сервис браузерных операций из контейнера окна. Компонент не владеет внедрённым сервисом и не освобождает его. |
| `OnAfterFirstRenderAsync` | Вызов после первой отрисовки, когда доступен JS-контекст. Все асинхронные операции ожидаются. |
| `LoadCss(string cssPath)` | Добавляет ссылку на CSS через браузерную часть. Возвращает `Task`, а не объект для последующего удаления стиля. |
| Полное имя файла | Путь к ресурсу своего проекта, а не произвольный путь Windows. |
| `.demo-panel .custom-button` | Правило для своей панели; подключённый CSS действует в документе окна. |

`[Inject]` предоставляет компоненту сервис дерева; это не глобальное имя из `Script.csx`. Кнопка читает и меняет реальный `TriggerValue`, а `null` показывает как выключенное. `WhenAnyValue` обновляет её и после горячей клавиши. Источник добавлен до `base.OnInitialized()`; подписку освобождает компонент при уничтожении, а не при простом скрытии окна. Итоговая активность ауры также зависит от остальных её условий. Подробности и вариант с периодическим обновлением — в [механизме обновления](/ru/scripting/blazor-windows/reactive-toggle).

Тот же ожидаемый вызов можно перенести в обработчик кнопки, если оформление нужно позже. Уничтожение компонента не удаляет автоматически CSS, добавленный через `LoadCss`. Для декларативного подключения вместе с разметкой подходит [HeadContent](/ru/scripting/blazor-windows/toggles-styling-cssfile). Разница между этапами компонента описана в [документации Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-9.0).

<details>
<summary>Повторная загрузка и изменение файла</summary>

Загрузчик запоминает путь со статусом `loading`, `loaded` или `failed`. Повторный вызов для того же пути сразу завершается: он не начинает новую загрузку, не ждёт уже начатую и не подтверждает, что прежняя попытка была успешной. Поэтому не используйте повторный `LoadCss` как проверку изменения файла или восстановление после ошибки. Для чистого первого опыта используйте новое окно с правильно указанным ресурсом.

</details>
