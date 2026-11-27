---
title: 3. Базовые элементы
description: Простой счётчик на Razor. Где хранится число и какой код выполняется при нажатии.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T01:13:28.765Z
---
# Изменить текст и кнопку своего оверлея

Сделаем панель, которая считает нажатия на кнопку. На этом примере видно, где хранится число, что рисует Razor и какой код выполняется при нажатии.

Нужен свой **C# Overlay**, созданный по [вводной статье](/ru/scripting/blazor-windows/1-intro). Его аура должна быть активной и загруженной. В редакторе найдите `Script.csx`, `UserOverlay.cs` и `UserOverlay.razor`.

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

4. Дождитесь, пока проект скомпилируется в редакторе. Нажмите **Прибавить один** в оверлее: число сменится с `0` на `1`, затем на `2`.

`public partial class` делает компонент доступным для оконного механизма и объединяет две его части. Namespace `BlazorDemo` здесь задан явно **в обоих файлах**. Если оставляете namespace из шаблона, он должен совпадать и в `@namespace`, и в C#, иначе получатся два разных класса. Прежние поля и методы счётчика рядом с новым кодом не оставляйте.

| Файл или элемент | Что происходит |
| --- | --- |
| `Script.csx` | Выполняет начальную подготовку проекта. Его `Log` относится к контексту скрипта. Точка входа должна завершиться, иначе C# Overlay не закончит подготовку показа. |
| `UserOverlay.cs` | Вторая часть того же `partial` класса. Хранит `count` и обработчик. |
| `UserOverlay.razor` | Выводит текущее число. `@onclick` вызывает `Increment` при нажатии. |
| `Refresh("counter clicked")` | Просит базовый `BlazorReactiveComponent` обновить отображение на его диспетчере. |
| `btn btn-primary` | Оформление кнопки из стилей, которые подключает оконный механизм. |

Число принадлежит экземпляру компонента, а не переменной ауры. Если компонент уничтожен и создан заново, оно снова равно нулю.

## Где доступны сервисы и данные

В Razor и в обычном классе нет глобальных `AuraTree`, `Variables`, `GetService` и `cancellationToken` из `Script.csx`. Сервис компонент запрашивает через `[Inject]`, а нужные данные ему передают явно. У базового компонента есть свой `Log` — это журнал компонента, а не переменная скрипта.

<details>
<summary>Тот же счётчик в одном Razor-файле</summary>

В маленьком компоненте C# можно оставить в `@code`. Тогда замените `UserOverlay.cs` на пустую вторую часть, чтобы `count` и `Increment` не были объявлены дважды:

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

</details>

Дальше можно заменить счётчик [переключателем своей ауры](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).
