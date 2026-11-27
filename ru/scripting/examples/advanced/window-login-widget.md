---
title: Окно с виджетом входа
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---
# Добавить LoginWidget в своё окно

LoginWidget — готовая кнопка входа EyeAuras. Положите её в Razor-компонент своего окна. Она показывает Login или имя пользователя и открывает обычную форму входа. Чтобы проверить пример, входить не нужно — достаточно увидеть кнопку.

Пример работает только в проекте **C# Script** внутри обычного EyeAuras, где уже зарегистрированы службы входа.

## Открыть окно с кнопкой

1. Создайте ауру с **C# Script** и два файла: **Script.csx** и **MainWindow.razor**. Пространство имён PhantomPixel в Razor и в using скрипта должно совпадать.
2. Замените содержимое файлов кодом ниже и нажмите **Run** в редакторе скрипта.
3. Откроется отдельное окно с заголовком Using login Widget и кнопкой Login или именем доступного пользователя.
4. Закройте окно или нажмите **Stop** в редакторе. ShowDialog перестанет ждать, а выход из блока using освободит окно.

**Script.csx**

```csharp
using PhantomPixel;
using PoeShared.Blazor.Wpf;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
}
```

**MainWindow.razor**

```razor
@namespace PhantomPixel
@using PoeShared.Blazor
@using EyeAuras.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center">Using login Widget</h3>
<LoginWidget/>

@code {
    
}
```

| Часть | Откуда берёт данные и кто ей владеет |
| --- | --- |
| GetService и cancellationToken | Есть только в верхнем уровне Script.csx. В обычном классе или в Razor этих имён нет. |
| IBlazorWindow | Берётся из контейнера скрипта. using держит окно, пока не завершится ShowDialog. Окно показывает MainWindow как компонент. |
| ILicenseAccessor | Его передают в LoginWidget службы приложения. Если лицензия действительна и Username не пустой, виджет показывает имя, иначе — Login. |
| ILoginPopupDisplayer | Тоже передаётся в виджет и открывает обычную форму входа через OpenPopupCommand. Токена и пароля в самом компоненте нет. |
| Обновление имени | Виджет следит за Username через ChangeTrackers базового компонента. Свои бессрочные подписки в примере не нужны. |

Если пользователь нажмёт Login, запустится обычный вход его версии EyeAuras. Он может открыть системный браузер. Закрытый popup ещё не значит, что вход отменён: за его состояние отвечают службы приложения. Токен в ShowDialog управляет ожиданием окна скрипта.

Popup создаётся штатным механизмом и сам переходит на UI-поток. Не переносите нативный ShowDialog в Task.Run из обработчика Razor. Для своего файлового диалога берите UI-обёртки приложения.

![LoginWidget в прежней форме](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

[Исходная публикация примера](https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo) — дополнительный материал. Подробнее: [хосты скриптов](/ru/scripting/api/core/app-runtime-contexts), [Blazor-окна](/ru/scripting/api/windows-subsystems/blazor-windows) и [IBlazorWindow](/ru/scripting/api/IBlazorWindow).
