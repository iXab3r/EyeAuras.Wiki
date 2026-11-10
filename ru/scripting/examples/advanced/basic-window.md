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

Пусть скрипт создаёт модель счётчика, показывает её в окне и после закрытия выводит итог в журнал. Так данные принадлежат вызывающему коду, а Razor отвечает за их отображение и обработку кнопки.

Нужен **C# Script** в настольном EyeAuras с Blazor/WebView2. Это проект для хоста EyeAuras, а не самостоятельное приложение WPF. `GetService`, `Log` и `cancellationToken` ниже доступны в `Script.csx`; обычная модель их не получает.

1. Создайте собственную тестовую ауру, добавьте **C# Script** в **On Enter** и откройте редактор. Для первого опыта запускайте действие вручную через **Run**.
2. Через **New file → C# Class** создайте `CounterViewModel.cs`, через **New file → Component** — `MainWindow.razor`. Здесь используется однофайловый компонент без второй части `.cs`; если вы выбрали шаблон с ней, удалите прежний счётчик из этой части.
3. Запишите три файла ниже. Namespace `WindowDemo` должен совпадать в модели, Razor и `using` скрипта.

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

4. Нажмите **Run**. Откроется окно **Базовое окно EyeAuras** с заголовком **Мой счётчик**. Нажмите кнопку несколько раз и закройте окно: в журнал попадёт итоговое число.
5. Повторите Run: создаются новая модель и окно, счёт снова начинается с нуля. **Stop** отменяет ожидание диалога; затем выход из явного блока освобождает окно.

Снимки показывают прежний вариант того же оконного примера; названия файлов и подписи в нём отличаются:

![Проект окна и Razor-компонент](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_XRahnHfM6ayTo7lA.png)
![Окно со счётчиком](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_n2fqzy1i8MZi1OqM.png)

| Часть | Кто ей управляет |
| --- | --- |
| `CounterViewModel` | Создана скриптом и передана в `DataContext`; после закрытия её данные ещё доступны вызывающему коду. Это не сохранение между Run. |
| `IBlazorWindow` | Отдельное окно, полученное в скриптовом контейнере и освобождаемое через `using` внутри явного блока. Настройщик хоста подключает контейнер и файлы проекта. |
| `ViewType` | Указывает тип уже скомпилированного Razor-компонента. |
| `ShowDialog(cancellationToken)` | Показывает окно и ждёт закрытия или отмены. Очистка следует после этого ожидания. |
| `Width` / `Height` | Размеры нативного оконного механизма WPF, не размер DOM-элемента или клиентской области другого процесса. |
| `Refresh(...)` | Обновляет этот `BlazorReactiveComponent` после изменения модели в обработчике. |

Модель — обычный класс без автоматических уведомлений. Сценарий обновляет её из обработчика компонента и явно вызывает `Refresh`; изменение той же модели из другого потока само по себе не подключает перерисовку. Если нужны подписки, закрепляйте их за владельцем и освобождайте с ним.

Чтобы окно показывало изменения собственной ауры, возьмите механизм наблюдения из [реактивного переключателя](/ru/scripting/blazor-windows/reactive-toggle): компонент подписывается на уведомления триггера и владеет подпиской. Сохраните здесь модель и срок жизни окна, которыми управляет вызывающий скрипт; изменение внешнего значения само по себе не обновляет обычную модель счётчика.

<details>
<summary>Другие способы показа и работа в IDE</summary>

Для обычного диалога есть более высокий уровень — [CreateWindow с передачей модели](/ru/scripting/blazor-windows/getting-started). Прямое разрешение `IBlazorWindow` оставлено здесь для настройки `ViewType` и `DataContext` вручную.

`Show()` только показывает окно и сразу возвращается. Его нельзя просто поставить вместо `ShowDialog` в данном блоке: блок сразу завершится и освободит окно. Для немодального сценария сначала создают ожидание `WhenClosed` с токеном, затем показывают окно и ожидают завершения перед очисткой; полный вариант описан в [оконном контракте](/ru/scripting/api/IBlazorWindow).

Для больших компонентов можно разделить Razor и C# на две согласованные части; для IDE — [экспортировать проект](/ru/scripting/ide-integration). Подсветка и подсказки зависят от редактора и версии, а экспорт не заменяет запуск в хосте.

Сохранён [исторический готовый пример](https://eu.eyeauras.net/share/S20250227193905C9v8tD3LlBPa). [Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) и [карта окон](/ru/scripting/api/windows-subsystems/blazor-windows) помогают выбрать контракт своей версии.

</details>
