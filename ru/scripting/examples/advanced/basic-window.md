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

Все окна в EyeAuras, которыми управляет пользователь, работают на внутреннем фреймворке BlazorWindows.  
Их легко создавать, они потокобезопасны и полностью поддерживают Blazor, объединяя лучшее из двух миров: нативной и веб-разработки.

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
var window = GetService<IBlazorWindow>();
window.ViewType = typeof(MainWindow);
window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
window.ShowDialog();
```

**MainWindow.razor**
```csharp
@namespace PhantomPixel
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
    }
}
```