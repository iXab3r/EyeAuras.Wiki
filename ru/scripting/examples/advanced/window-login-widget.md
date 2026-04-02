---
title: Окно с виджетом входа
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---
# Login Widget

`Login Widget` — это быстрый и удобный способ вызвать форму входа из собственного интерфейса.

С его помощью пользователь может авторизоваться, не выводя главное окно EyeAuras на передний план.

![Login Widget](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

## Пример

> Готовый пример можно импортировать отсюда: https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo
{.is-info}

1. Создайте ауру со скриптом.
2. Скопируйте код ниже и запустите его.
3. Должно появиться новое окно с кнопкой, по которой можно нажать.

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
@using EyeAuras.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center">Using login Widget</h3>
<LoginWidget/>

@code {
    
}
```