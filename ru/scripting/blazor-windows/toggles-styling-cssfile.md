---
title: 9. Подключение CSS-файла через HeadContent
description: Как подключить CSS-файл через HeadContent
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:12:56.395Z
---
# Вынести оформление кнопки в CSS-файл

Если правила оформления мешают читать Razor, перенесите их в `Styles.css`. Подключим файл через `HeadContent`: панель останется той же, а цвет и ширину кнопки будет задавать отдельный ресурс проекта.

Нужны две загруженные ауры в одной папке: `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и отдельная панель с **C# Overlay** и **Fixed Value → Is Active**. Назначьте триггеру свободную горячую клавишу, действия не нужны. Путь `./TargetAura` должен вести к вашей ауре с одним таким триггером. Как сделать саму кнопку — в [предыдущем примере](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

1. В редакторе своего C# Overlay выберите **New file → CSS** и задайте имя `Styles`. Получится `Styles.css`.

![Добавление CSS-файла в прежнем редакторе](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

2. Замените содержимое CSS кодом ниже. В шаблоне задан жёлтый фон для `body, html` — для кнопки это правило не нужно.
3. Узнайте полное имя ресурса и вставьте его вместо `MyScript.Styles.css` в `UserOverlay.razor`.

В полное имя ресурса входит namespace **проекта**, а не только `@namespace` компонента. Например, `Styles.css` может называться `MyScript.Styles.css`, а `Theme/Styles.css` — `MyScript.Theme.Styles.css`. Не подставляйте `BlazorDemo` только потому, что так называется класс в примере.

Чтобы узнать настоящее имя, оставьте в `Script.csx` этот короткий код и дождитесь подготовки проекта:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Скопируйте полное имя своего `Styles.css` из журнала в строку, указанную ниже. `Script` здесь — тип верхнеуровневого скрипта, в обычном классе или Razor такого глобального контекста нет.

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
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<HeadContent>
    <link href="MyScript.Styles.css" rel="stylesheet" />
</HeadContent>

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

4. Дождитесь компиляции с правильным полным именем файла. Кнопка должна стать зелёной, с чёрной подписью и шириной 80% панели. Нажатие и горячая клавиша по-прежнему переключают триггер.

![Результат подключения CSS в прежнем примере](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Часть | Что делает |
| --- | --- |
| `Styles.css` | Хранит правила. Просто добавить файл мало: к документу он ещё не подключён. |
| `HeadContent` | Передаёт содержимое в `head` через `HeadOutlet`, который регистрирует оконный механизм EyeAuras. |
| `link` с `rel="stylesheet"` | Даёт браузеру путь к таблице стилей. Найти встроенный ресурс — отдельный шаг. |
| `MyScript.Styles.css` | Образец полного manifest-имени. Замените его настоящим именем своего файла. Вложенные папки тоже входят в имя. |
| `.demo-panel .custom-button` | Ограничивает правило своей панелью. Автоматической изоляции от остальных компонентов документа у файла нет. |

Кнопка читает и меняет настоящий `TriggerValue`, а `null` показывает как выключенное. Благодаря `WhenAnyValue` она обновляется и после горячей клавиши. Подробности и вариант с обновлением по таймеру — в [механизме обновления](/ru/scripting/blazor-windows/reactive-toggle).

Содержимым `HeadContent` управляет Blazor вместе с компонентом. Если `HeadContent` одновременно используют несколько компонентов, согласуйте подключение в их общем владельце.

<details>
<summary>Посмотреть подключение в браузерной части</summary>

В C# Overlay откройте инструменты разработчика клавишей **F12**. В `head` будет ссылка на ваш файл рядом с ресурсами хоста.

Если ссылка есть, а цвет прежний, проверьте, что ресурс загружается по полному имени и что CSS-селектор совпадает.

[HeadContent в Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0), [оконный BlazorContentControl](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/BlazorContentControl.cs).

</details>

Если момент подключения нужно выбирать из C#, используйте [LoadCss](/ru/scripting/blazor-windows/toggles-styling-css-load).
