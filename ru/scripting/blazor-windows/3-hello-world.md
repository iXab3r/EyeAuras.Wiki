---
title: 3. Базовые элементы
description: Основные базовые элементы и их назначение.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T01:13:28.765Z
---
# Изменить текст и кнопку своего оверлея

Сделаем панель, которая считает нажатия на кнопку. На этом небольшом примере видно, где хранится число, что рисует Razor и какой код выполняется при нажатии.

Нужен собственный **C# Overlay**, созданный по [вводной статье](/ru/scripting/blazor-windows/1-intro). Оставьте его ауру активной и загруженной. В редакторе найдите `Script.csx`, `UserOverlay.cs` и `UserOverlay.razor`.

![Три файла в редакторе](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_uPjkmxmv2r.png)

## Заменить файлы

1. В `Script.csx` оставьте короткую точку входа:

```csharp
Log.Debug("Подготовка панели завершена");
```

2. Полностью замените `UserOverlay.cs`:

```csharp
using System.Threading.Tasks;
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    private int count;

    private async Task Increment()
    {
        count++;
        await Refresh("counter clicked");
    }
}
```

3. Полностью замените `UserOverlay.razor`:

```razor
@namespace BlazorDemo
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h1>Счётчик</h1>
<p>Нажатий: @count</p>
<button class="btn btn-primary" @onclick="Increment">Прибавить один</button>
```

4. Дождитесь успешной компиляции проекта в редакторе. Нажмите **Прибавить один** в оверлее: число увеличится с `0` до `1`, затем до `2`.

`public partial class` делает компонент доступным для оконного механизма и объединяет его две части. Namespace `BlazorDemo` здесь задан явно **в обоих файлах**. Если оставляете namespace из шаблона, сохраните его и в `@namespace`, и в C#; иначе это будут разные классы. Не оставляйте прежние поля и методы счётчика рядом с заменой.

| Файл или элемент | Что происходит |
| --- | --- |
| `Script.csx` | Выполняет начальную подготовку проекта. Его `Log` относится к контексту скрипта. Эта точка входа должна завершиться, чтобы C# Overlay закончил подготовку показа. |
| `UserOverlay.cs` | Вторая часть того же `partial` класса: хранит `count` и обработчик. |
| `UserOverlay.razor` | Выводит текущее число. `@onclick` вызывает `Increment` при нажатии. |
| `Refresh("counter clicked")` | Просит базовый `BlazorReactiveComponent` обновить отображение на его диспетчере. |
| `btn btn-primary` | Применяет оформление кнопки из стилей, подключённых оконным механизмом. |

Число принадлежит экземпляру компонента, а не переменной ауры. После уничтожения и нового создания компонента оно снова равно нулю. Скрытие окна не обязательно уничтожает экземпляр.

## Где доступны сервисы и данные

В Razor и обычном классе нет глобальных `AuraTree`, `Variables`, `GetService` или `cancellationToken` из `Script.csx`. Для компонента сервис запрашивают через `[Inject]`, а нужные данные передают явно. У базового компонента есть собственный `Log`; это журнал компонента, а не автоматически переданная переменная скрипта.

Пример не запускает фоновых задач и не создаёт подписок. Для подписок в следующих статьях используется срок жизни компонента, а не бесконечный цикл в `Script.csx`.

<details>
<summary>Тот же счётчик в одном Razor-файле</summary>

Для маленького компонента C# можно оставить в `@code`. В таком случае замените `UserOverlay.cs` на пустую вторую часть, чтобы не объявить `count` и `Increment` дважды:

```csharp
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
}
```

А `UserOverlay.razor` — на:

```razor
@namespace BlazorDemo
@using System.Threading.Tasks
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h1>Счётчик</h1>
<p>Нажатий: @count</p>
<button class="btn btn-primary" @onclick="Increment">Прибавить один</button>

@code {
    private int count;
    private async Task Increment()
    {
        count++;
        await Refresh("counter clicked");
    }
}
```

Это альтернативное расположение того же кода. Не добавляйте его одновременно с первым обработчиком.

</details>

Дальше можно заменить счётчик [переключателем своей ауры](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).
