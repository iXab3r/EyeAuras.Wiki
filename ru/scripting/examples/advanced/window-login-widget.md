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

Создайте в одном проекте `C# Script` два файла — `Script.csx` и `MainWindow.razor` с содержимым ниже. Пространство имён `PhantomPixel` должно совпадать в Razor и `using` скрипта. `GetService`, `IBlazorWindow` и базовый компонент предоставляет хост EyeAuras; это не самостоятельное приложение WPF или обычный C# helper.

`Login Widget` — это быстрый и удобный способ вызвать форму входа из собственного интерфейса.

С его помощью пользователь может авторизоваться, не выводя главное окно EyeAuras на передний план.

![Login Widget](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

## Пример

> Готовый пример можно импортировать отсюда: https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo
{.is-info}

1. Создайте ауру со скриптом.
2. Скопируйте код ниже и запустите его.
3. В новом окне должен появиться `LoginWidget` с кнопкой `Login` либо именем пользователя.

**Script.csx**
```csharp
using PhantomPixel;

using var window = GetService<IBlazorWindow>();
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

`LoginWidget` получает `ILicenseAccessor` и `ILoginPopupDisplayer` из контейнера приложения. Нажатие вызывает popup входа; успешная авторизация зависит от служб приложения и внешнего сервиса. Виджет не выдаёт лицензию или sublicence lease и не доказывает доступность платного пака. В произвольном Blazor-хосте этих регистраций может не быть.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Окна Blazor](/ru/scripting/api/windows-subsystems/blazor-windows) · [IBlazorWindow](/ru/scripting/api/IBlazorWindow)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
