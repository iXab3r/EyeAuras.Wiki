---
title: С чего начать?
description: Краткое руководство для начала работы.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-11-04T00:26:45.232Z
---
# Открыть своё окно из C# Script

Небольшой диалог настроек можно открывать на время одного запуска скрипта. Создадим окно с переданным заголовком и счётчиком: оно появится по **Run**, а при закрытии окна или остановке запуска его ресурсы будут освобождены.

Для панели, видимостью которой постоянно управляет аура, проще [C# Overlay](/ru/scripting/blazor-windows/1-intro). Здесь используем **C# Script**, чтобы скрипт явно создавал окно и владел им.

| Способ | Когда подходит |
| --- | --- |
| C# Overlay | Индикатор или панель, показываемая по активности ауры. |
| C# Script + `CreateWindow<T>` | Диалог, открываемый отдельным запуском; скрипт задаёт его компонент и начальные данные. |

## Создать проект окна

1. Создайте собственную тестовую ауру и добавьте **C# Script** в **On Enter**. Для первого опыта запускайте действие вручную через **Run**, чтобы не открывать несколько окон повторными активациями.

![Действие On Enter в прежнем редакторе](https://s3.eyeauras.net/media/2024/11/EyeAuras_xCVTs8bdg1Y7ZU8T.png)

2. В редакторе проекта выберите **New file → Component(with code-behind)**, имя `UserComponent`. Он создаёт `.razor` и `.cs`. На старом снимке шаблон назывался **Razor Component**.

![Добавление компонента в прежнем редакторе](https://s3.eyeauras.net/media/2024/11/EyeAuras_I6MYDieptaZe5a8u.png)

3. Создайте обычный C# файл `WindowModel.cs`. Замените содержимое всех четырёх файлов приведёнными ниже вариантами. Namespace `BlazorDemo` должен совпадать в модели и обеих частях компонента; `Script.csx` подключает его через `using`.

### Script.csx

```csharp
using BlazorDemo;
using EyeAuras.Shared.Scripting;

{
    using var window = GetService<IDialogWindowUnstableScriptingApi>()
        .CreateWindow<UserComponent>(new WindowModel { Title = "Моё окно" });

    window.Title = "Пробный диалог";
    window.Width = 480;
    window.Height = 260;
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
}
```

### WindowModel.cs

```csharp
namespace BlazorDemo;

public sealed class WindowModel
{
    public string Title { get; set; } = "Настройки";
}
```

### UserComponent.cs

```csharp
using System.Threading.Tasks;
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserComponent : BlazorReactiveComponent<WindowModel>
{
    private int count;

    private async Task Increment()
    {
        count++;
        await Refresh("dialog counter clicked");
    }
}
```

### UserComponent.razor

```razor
@namespace BlazorDemo
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent<WindowModel>

<h2>@DataContext.Title</h2>
<button class="btn btn-primary" @onclick="Increment">Прибавить один</button>
<p>Нажатий: @count</p>
```

4. Дождитесь успешной компиляции и нажмите **Run**. В центре экрана должно открыться окно **Пробный диалог**, внутри — заголовок **Моё окно** и кнопка счётчика.
5. Нажмите кнопку, затем закройте диалог. Запуск завершится. При новом Run число снова начнётся с нуля. **Stop** отменяет ожидание окна через `cancellationToken` и освобождает окно.

Старый снимок показывает этот же путь создания окна; текст и оформление относятся к прежнему примеру:

![Окно, созданное действием C# Script](https://s3.eyeauras.net/media/2024/11/EyeAuras_fmFnsjgMCW8P6Z4b.png)

## Что связывает файлы

| Часть | Назначение |
| --- | --- |
| `GetService<IDialogWindowUnstableScriptingApi>()` | Получает оконный сервис в контексте `Script.csx`. `Unstable` — часть имени контракта, который может меняться между версиями. |
| `CreateWindow<UserComponent>(model)` | Создаёт окно с указанным компонентом и передаёт объект модели как `DataContext`. |
| `BlazorReactiveComponent<WindowModel>` | Даёт компоненту типизированный `DataContext`. Это явно переданный объект, а не доступ к локальным переменным скрипта. |
| `ShowDialog(cancellationToken)` | Показывает окно и удерживает запуск до закрытия или отмены. |
| `using var window` | Освобождает окно при выходе из явного блока после закрытия диалога или отмены ожидания. Сервис также привязывает созданное окно к своему сроку жизни; это не бесхозное окно после Stop. |

`WindowModel` здесь содержит только начальные данные. Изменение её обычного свойства извне не подключает автоматическую перерисовку. Для живых данных нужен механизм наблюдения, как в [примере с триггером](/ru/scripting/blazor-windows/reactive-toggle). В классе и Razor нет глобальных `GetService`, `AuraTree`, `Variables` или `cancellationToken` скрипта.

<details>
<summary>Если нужна постоянно видимая панель</summary>

Добавьте C# Overlay вместо действия, оставьте его ауру активной и редактируйте `UserOverlay`, как в [начале серии](/ru/scripting/blazor-windows/1-intro). Старые иллюстрации показывают место добавления и результат стандартного шаблона:

![Добавление C# Overlay](https://s3.eyeauras.net/media/2024/11/msedge_zVrveCuFgBbtBB68.png)
![Стандартный компонент в прежнем оверлее](https://s3.eyeauras.net/media/2024/11/Code_MJvkplH0Iiqmm9SV.png)

На таком механизме строятся и более плотные панели состояния:

![Пример панели с несколькими элементами](https://i.imgur.com/iaKm2Br.png)
![Пример панели переключателей](http://files.eyesquad.net/screenshots/31-10-2024/1YWZKXCaFhEh7SNnSx8YMWjAf.png)

В отличие от приведённого выше диалога, для оверлея не нужно вызывать `ShowDialog` в его `Script.csx`: окном управляет сам C# Overlay.

</details>

[Оконный API](/ru/scripting/api/IDialogWindowUnstableScriptingApi) и [карта Blazor](/ru/scripting/api/core/blazor) описывают дальнейшие варианты работы с окном.
