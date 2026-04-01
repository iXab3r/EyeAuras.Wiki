---
title: 3. Базовые элементы
description: Основные базовые элементы и их назначение.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T01:13:28.765Z
---
# Из чего состоит оверлей

Когда вы добавляете новый оверлей, EyeAuras автоматически создает несколько файлов. Каждый из них важен для работы программы.

![Header](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_uPjkmxmv2r.png)

## Script.csx

Это точка входа. Этот скрипт запускается каждый раз, когда программа **создает** новый оверлей (не при его показе или скрытии).

В файле может не быть ничего, кроме примера по умолчанию, но при желании здесь удобно инициализировать данные, читать информацию и выполнять общую подготовку. То же самое можно делать и в коде окна/компонента, но иногда полезно иметь единую точку входа.

```csharp
Log.Debug("This script is entry point for Overlay");
```

---

## UserOverlay.cs

```csharp
public partial class UserOverlay : BlazorReactiveComponent {
    private int count = 0;

    private void IncrementCount()
    {
        count++;
    }
}
```

Это файл **code-behind**. Большинство Razor-компонентов состоят из двух частей — `*.razor` и `*.cs`. В части Razor обычно находится разметка Razor/HTML/CSS, а в файле `*.cs` — методы, поля и свойства, доступные из разметки.

> Примечание: вы *можете* писать C# прямо внутри `*.razor` и не использовать `*.cs`, но из-за технических ограничений **EyeAuras** сейчас показывает IntelliSense только в `*.cs`-файлах, поэтому рекомендуется использовать оба файла.
{.is-info}

Разберем код по частям:

```csharp
public partial class UserOverlay : BlazorReactiveComponent
```

Это объявление класса. Чтобы EyeAuras смог его найти, класс должен быть `public`. Поскольку у него есть вторая часть (`*.razor`), он должен быть `partial`, то есть класс разделен между несколькими файлами. Наконец, `: BlazorReactiveComponent` задает базовый класс — к нему мы еще вернемся.

```csharp
private int count = 0;
```

Здесь мы объявляем поле, в котором хранится количество нажатий кнопки.

> Примечание: значение этого поля сохраняется на протяжении всей жизни оверлея. Если аура выгружается или оверлей уничтожается, значение сбрасывается.

```csharp
private void IncrementCount()
{
    count++;
}
```

Этот метод просто увеличивает счетчик, чтобы мы могли отслеживать клики.

---

## UserOverlay.razor

```html
@inherits BlazorReactiveComponent

<h3 class="text-center">Interactive Counter</h3>

<div class="text-center mt-4">
    <button @onclick="IncrementCount" class="btn btn-primary btn-lg">
        Click Me
    </button>
</div>

<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@count</strong> times!
</p>
```

Это вторая часть компонента, которая описывает, как он должен отображаться. Посмотрим, что здесь есть:

```html
@inherits BlazorReactiveComponent
```

Эта строка говорит Blazor использовать `BlazorReactiveComponent` (предоставляемый **EyeAuras**) в качестве базового класса. Это необязательно, но настоятельно рекомендуется, если вам нужен доступ к дополнительным возможностям.

```html
<h3 class="text-center">Interactive Counter</h3>
```

Просто заголовок по центру.

```html
<div class="text-center mt-4">
    <button @onclick="IncrementCount" class="btn btn-primary btn-lg">
        Click Me
    </button>
</div>
```

Самое интересное здесь — `@onclick="IncrementCount"`, это привязка обработчика клика. Каждый клик увеличивает `count` на 1.

```html
<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@count</strong> times!
</p>
```

И финальная часть: отображение текущего значения `count` — той самой переменной, которую мы увеличиваем при нажатии кнопки.

---

В итоге получается простая форма с кнопкой и обновляющимся значением. Буквально за 20 строк мы создали рабочую и вполне симпатичную мини-программу. Поэкспериментируйте с цветами, добавьте другие значения и используйте этот оверлей как тестовую площадку. Продолжение следует!