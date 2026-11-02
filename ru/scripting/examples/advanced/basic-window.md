---
title: Базовое окно
description: Базовое окно.
published: true
date: 2025-07-16T12:58:02.149Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:39:18.852Z
---
# Окно Blazor

Создайте в одном проекте `C# Script` два файла — `Script.csx` и `MainWindow.razor` с содержимым ниже. Пространство имён `PhantomPixel` должно совпадать в Razor и `using` скрипта. `GetService`, `IBlazorWindow` и базовый компонент предоставляет хост EyeAuras; это не самостоятельное приложение WPF или обычный C# helper.

`IBlazorWindow` открывает нативное окно с Razor-компонентом внутри EyeAuras. Операции окна проходят через инфраструктуру UI-хоста; это не означает потокобезопасность любого состояния компонента.

Подсветка синтаксиса в Razor-файлах пока местами сыровата, поэтому для всего, что сложнее `Hello, world`, лучше использовать компонент с code-behind. Тогда в `.cs` у вас будет полноценная подсветка.

И, конечно, вы по-прежнему можете экспортировать/импортировать проект и работать в Rider или Visual Studio с нормальной подсветкой синтаксиса, в том числе в Razor-файлах.
 
![Blazor Window](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_XRahnHfM6ayTo7lA.png)
![Working](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_n2fqzy1i8MZi1OqM.png)

## Пример

> Готовый пример можно импортировать отсюда: https://eu.eyeauras.net/share/S20250227193905C9v8tD3LlBPa
{.is-info}

1. Создайте ауру со скриптом.
2. Скопируйте код, вставьте его и запустите — должно появиться новое окно с кликабельной кнопкой.

**Script.csx**
```csharp
using PhantomPixel;
using PoeShared.Blazor.Wpf;

using var window = GetService<IBlazorWindow>();
window.ViewType = typeof(MainWindow);
window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
window.ShowDialog(cancellationToken);
```

**MainWindow.razor**
```razor
@namespace PhantomPixel
@using PoeShared.Blazor
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

@code {
    private int count = 0;

    private void IncrementCount()
    {
        count++;
        Refresh(nameof(IncrementCount));
    }
}
```

Нажатие `Click Me` увеличивает число и запрашивает `Refresh(nameof(IncrementCount))`.
`ShowDialog(cancellationToken)` ждёт закрытия окна или Stop; `using` освобождает
его после ожидания. В реализации WPF отмена обрабатывается внутри `ShowDialog`,
поэтому наружный `OperationCanceledException` не обязателен. UI-события
компонента не дают права обращаться к произвольным WPF-объектам из рабочего потока.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Окна Blazor](/ru/scripting/api/windows-subsystems/blazor-windows) · [IBlazorWindow](/ru/scripting/api/IBlazorWindow)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
