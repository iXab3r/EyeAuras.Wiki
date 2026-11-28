---
title: Базовое окно
description: Базовое окно.
published: true
date: 2025-07-16T12:58:02.149Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:39:18.852Z
---
# Открыть окно со своей моделью данных

Скрипт создаёт модель счётчика, показывает её в окне, а после закрытия пишет итог в журнал. Данные остаются у скрипта, а Razor только показывает их и обрабатывает кнопку.

Нужен **C# Script** в настольном EyeAuras с Blazor/WebView2. `GetService`, `Log` и `cancellationToken` доступны только в `Script.csx`, у обычной модели их нет.

1. Создайте тестовую ауру, добавьте **C# Script** в **On Enter** и откройте редактор. Для первого раза запускайте действие вручную кнопкой **Run**.
2. Через **New file → C# Class** создайте `CounterViewModel.cs`, через **New file → Component** — `MainWindow.razor`. В примере компонент состоит из одного файла, без второй части `.cs`. Если ваш шаблон её создал, удалите из неё прежний счётчик.
3. Вставьте код в три файла ниже. Namespace `WindowDemo` должен быть одинаковым в модели, в Razor и в `using` скрипта.

## Script.csx

```csharp
using WindowDemo;
using PoeShared.Blazor.Wpf;

{
    var model = new CounterViewModel { Title = "Мой счётчик" };
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.DataContext = model;
    window.Title = "Базовое окно EyeAuras";
    window.Width = 480;
    window.Height = 260;
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
    Log.Info($"Нажатий после закрытия: {model.Count}");
}
```

## CounterViewModel.cs

```csharp
namespace WindowDemo;

public sealed class CounterViewModel
{
    public string Title { get; set; }
    public int Count { get; set; }
}
```

## MainWindow.razor

```razor
@namespace WindowDemo
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent<CounterViewModel>

<h3>@DataContext.Title</h3>
<button class="btn btn-primary" @onclick="Increment">Прибавить один</button>
<p>Нажатий: @DataContext.Count</p>

@code {
    private async Task Increment()
    {
        DataContext.Count++;
        await Refresh("model count changed");
    }
}
```

4. Нажмите **Run**. Откроется окно **Базовое окно EyeAuras** с заголовком **Мой счётчик**. Нажмите кнопку несколько раз и закройте окно — в журнале появится итоговое число.
5. Нажмите Run ещё раз: создадутся новая модель и новое окно, счёт начнётся с нуля. **Stop** отменяет ожидание диалога, после чего скрипт выходит из явного блока и окно освобождается.

![Проект окна и Razor-компонент](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_XRahnHfM6ayTo7lA.png)
![Окно со счётчиком](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_n2fqzy1i8MZi1OqM.png)

| Часть | Кто ей управляет |
| --- | --- |
| `CounterViewModel` | Её создаёт скрипт и передаёт в `DataContext`. После закрытия окна данные всё ещё доступны скрипту. Между запусками Run они не сохраняются. |
| `IBlazorWindow` | Отдельное окно. Скрипт получает его из своего контейнера и освобождает через `using` внутри явного блока. |
| `ViewType` | Тип уже скомпилированного Razor-компонента, который нужно показать. |
| `ShowDialog(cancellationToken)` | Показывает окно и ждёт, пока его закроют или придёт отмена. Очистка идёт после этого. |
| `Width` / `Height` | Размеры нативного WPF-окна. |
| `Refresh(...)` | Перерисовывает этот `BlazorReactiveComponent` после того, как обработчик изменил модель. |

Модель — обычный класс, сама она об изменениях не уведомляет. Обработчик компонента меняет её и явно вызывает `Refresh`. Если изменить ту же модель из другого потока, окно само не перерисуется. Если нужны подписки, привязывайте их к владельцу и освобождайте вместе с ним.

Чтобы окно показывало изменения вашей ауры, возьмите наблюдение из [реактивного переключателя](/ru/scripting/blazor-windows/reactive-toggle): там компонент подписывается на уведомления триггера и сам владеет подпиской. Модель и время жизни окна оставьте как здесь — ими управляет скрипт.

<details>
<summary>Другие способы показа и работа в IDE</summary>

Для обычного диалога есть способ проще — [CreateWindow с передачей модели](/ru/scripting/blazor-windows/getting-started). Здесь `IBlazorWindow` берётся напрямую, чтобы вручную задать `ViewType` и `DataContext`.

`Show()` только показывает окно и сразу возвращается. Просто заменить им `ShowDialog` в этом блоке нельзя: блок тут же завершится и освободит окно. Для немодального окна сначала создают ожидание `WhenClosed` с токеном, потом показывают окно и ждут завершения перед очисткой. Полный вариант — в [описании IBlazorWindow](/ru/scripting/api/IBlazorWindow).

Большой компонент можно разделить на две согласованные части — Razor и C#. Для работы в IDE проект можно [экспортировать](/ru/scripting/ide-integration).

Есть [старый готовый пример](https://eu.eyeauras.net/share/S20250227193905C9v8tD3LlBPa). Выбрать подходящий API для своей версии помогут [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) и [карта окон](/ru/scripting/api/windows-subsystems/blazor-windows).

</details>
