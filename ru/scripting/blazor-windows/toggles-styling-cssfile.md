---
title: 9. Подключение CSS-файла через HeadContent
description: Как подключить CSS-файл с помощью HeadContent.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T16:12:56.395Z
---
# Вынести оформление кнопки в CSS-файл

Если правила оформления мешают читать Razor, перенесите их в `Styles.css`. Подключим файл через `HeadContent`: панель останется той же, а цвет и ширина кнопки будут задаваться отдельным ресурсом проекта.

Нужны две загруженные ауры в одной папке: `TargetAura` с **Hotkey Is Active → Toggle Trigger state on Click** и отдельная панель с **C# Overlay** и **Fixed Value → Is Active**. Назначьте триггеру свободную горячую клавишу; действия для этого опыта не нужны. Путь `./TargetAura` должен указывать на вашу ауру с одним таким триггером. Подготовка самой кнопки разобрана в [предыдущем примере](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

1. В редакторе своего C# Overlay выберите **New file → CSS**, имя `Styles`. Получится `Styles.css`.

![Добавление CSS-файла в прежнем редакторе](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_mzNnQuvluB.png)

2. Замените содержимое CSS на приведённое ниже. Шаблон первоначально задаёт жёлтый фон для `body, html`; для своей кнопки это правило не нужно.
3. Получите полное имя ресурса и вставьте его вместо `MyScript.Styles.css` в `UserOverlay.razor`.

В полном имени ресурса участвует namespace **проекта**, а не только `@namespace` компонента. Например, `Styles.css` может получить имя `MyScript.Styles.css`, а `Theme/Styles.css` — `MyScript.Theme.Styles.css`. Не подставляйте `BlazorDemo` только потому, что так называется класс в примере.

Чтобы получить фактическое имя, оставьте в `Script.csx` этот законченный короткий код и дождитесь подготовки проекта:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

Скопируйте полное имя своего `Styles.css` из журнала в указанную ниже строку. `Script` здесь — тип верхнеуровневого скрипта; такой глобальный контекст не появляется в обычном классе или Razor. Файловый механизм окна раздаёт ресурсы проекта в WebView2. Полное имя устраняет догадки с короткими путями; общий `IScriptFileProvider` может быть составным, поэтому приводить его к `ScriptEmbeddedResourceFileProvider` не нужно.

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

4. Дождитесь компиляции с правильным полным именем файла. Кнопка должна стать зелёной, с чёрной подписью и шириной 80% панели. Нажатие и горячая клавиша продолжают переключать триггер.

![Результат подключения CSS в прежнем примере](https://s3.eyeauras.net/media/2025/05/OTFy9w6Fgm.png)

| Часть | Что делает |
| --- | --- |
| `Styles.css` | Хранит правила; само добавление файла ещё не подключает его к документу. |
| `HeadContent` | Передаёт содержимое в `head` через `HeadOutlet`, который зарегистрирован оконным механизмом EyeAuras. |
| `link` с `rel="stylesheet"` | Даёт браузеру путь к таблице стилей. Это отдельный шаг от нахождения встроенного ресурса. |
| `MyScript.Styles.css` | Образец полного manifest-имени. Замените фактическим именем своего файла; вложенные папки также входят в имя. |
| `.demo-panel .custom-button` | Ограничивает правило своей панелью. Файл не получает автоматическую изоляцию от остальных компонентов документа. |

`[Inject]` предоставляет компоненту сервис дерева; это не глобальное имя из `Script.csx`. Кнопка читает и меняет реальный `TriggerValue`, а `null` показывает как выключенное. `WhenAnyValue` обновляет её и после горячей клавиши. Источник добавлен до `base.OnInitialized()`; подписку освобождает компонент при уничтожении, а не при простом скрытии окна. Итоговая активность ауры также зависит от остальных её условий. Подробности и вариант с периодическим обновлением — в [механизме обновления](/ru/scripting/blazor-windows/reactive-toggle).

Содержимым `HeadContent` управляет Blazor вместе с компонентом. Не используйте этот способ как механизм переключения глобальной темы. Если несколько компонентов одновременно управляют `HeadContent`, согласуйте подключение на уровне их общего владельца. Порядок и специфичность CSS-правил по-прежнему влияют на итоговый вид.

<details>
<summary>Посмотреть подключение в браузерной части</summary>

В C# Overlay откройте инструменты разработчика клавишей **F12**. В `head` будет ссылка на собственный файл рядом с ресурсами хоста. Перечень системных CSS зависит от версии; добавлять в свой компонент копию всех системных ссылок не требуется.

Если ссылка есть, а цвет прежний, проверьте загрузку ресурса по полному имени и совпадение CSS-селектора. Наличие ссылки само по себе не означает успешную загрузку.

[HeadContent в Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/control-head-content?view=aspnetcore-9.0), [оконный BlazorContentControl](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Blazor.Wpf/BlazorContentControl.cs).

</details>

Если момент подключения нужно выбрать из C#, используйте [LoadCss](/ru/scripting/blazor-windows/toggles-styling-css-load).
